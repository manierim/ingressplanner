/*
	gdrive module
*/

ingressplanner.gdrive = new (function() {

// private vars & functions

    // the CLIENT_ID below is for production site! Generate you own CLIENT_ID for local testing!
    var CLIENT_ID = '769001034459-klcrhi25pu027tg7e4ah476403rekm5k.apps.googleusercontent.com';

    var SCOPES = 'https://www.googleapis.com/auth/drive.appfolder';

    // the gdrive FileItem where cfg is saved
    var cfgFileItem = null;

    // the current active plan name
    var currentPlan = null;

    // list of plans (directories) and their files
    var plans = {};


    // status variables
    var downloadsActive = 0;
    var uploadsActive = 0;
    var lastStatus = '';

    // callback for status changes, set in init(), used in setStatus()
	var mainEventHandler = null;

    // manage status of connection (mainly for UI feedback)
    function setStatus(status)
	{

        var activity = false;

        switch(status)
        {
            case 'download-start':
                downloadsActive++;
                activity = true;
                break;

            case 'upload-start':
                uploadsActive++;
                activity = true;
                break;

            case 'download-stop':
                downloadsActive--;
                activity = true;
                break;

            case 'upload-stop':
                uploadsActive--;
                activity = true;
                break;
        };

        if (activity)
        {
            if (downloadsActive>0)
            {
                status = 'downloading';
            }
            else if(uploadsActive>0)
            {
                status = 'uploading';
            }
            else
            {
                status = 'idle';
            }
        }

        if (status != lastStatus)
        {
            lastStatus = status;
			if (typeof mainEventHandler == 'function')
			{
				mainEventHandler('newstatus',status);
			}
        }
    
	};

    // list files in "root" folder (appData)
    function listFilesInApplicationDataFolder(callback) 
    {
        listFilesInFolder('appfolder',callback);
    };

    // create a folder in "root" folder / code mainly from google
    function insertFolderInApplicationDataFolder(name, callback) {

        var request = gapi.client.request({
            'path': '/drive/v2/files',
            'method': 'POST',
            'headers': {
              'Content-Type': 'application/json'
            },
            'body': {
                'title':      name,
                'parents':    [{'id': 'appfolder'}],
                'mimeType':   'application/vnd.google-apps.folder',
            }
        });

        if (!callback) {
            var _callback = function(folder) {
                setStatus('upload-stop');
            };
        }
        else
        {
            var _callback = function(folder) {
                setStatus('upload-stop');
                callback(folder);
            };
        }

        setStatus('upload-start');
        request.execute(_callback);

    }
    // list files in a folder / code mainly from google
    function listFilesInFolder(folderID, callback, trashed) 
    {

        var retrievePageOfFiles = function(request, result, retry) {

            setStatus('download-start');

            request.execute(function(resp) {

                setStatus('download-stop');

                if (typeof resp.error != 'undefined')
                {
                    // https://developers.google.com/drive/web/handle-errors   
                    if (
                        resp.error.code==403
                        &&
                        (
                            resp.error.data[0].reason == 'userRateLimitExceeded'
                            || resp.error.data[0].reason == 'rateLimitExceeded'
                        )
                    )
                    {
                        
                        if (typeof retry == 'undefined')
                        {
                            retry = 0;
                        }
                        if (typeof totdelay == 'undefined')
                        {
                            totdelay = 0;
                        }

                        if (retry<=4)
                        {
                            var delay = Math.pow(2, retry);

                            if (delay == 0)
                            {
                                delay = 1;
                            }

                            delay = Math.floor((delay+Math.random())*1000);
                            totdelay += delay;

                            ingressplanner.warn('retrievePageOfFiles rate-limited - retrying in',delay,'ms');
                            retry++;

                            window.setTimeout(
                                retrievePageOfFiles,
                                delay,
                                request, result, 
                                retry, totdelay
                            );

                            return;
                        }
                        else
                        {
                            ingressplanner.error('retrievePageOfFiles rate-limited - after',retry+1,'retries',totdelay,'ms');
                            return;
                        }

                    }
                    ingressplanner.error('retrievePageOfFiles error',resp.error);
                    return;
                }


                result = result.concat(resp.items);

                var nextPageToken = resp.nextPageToken;

                if (nextPageToken) {
                    request = gapi.client.drive.files.list({
                        'pageToken': nextPageToken
                    });
                    retrievePageOfFiles(request, result);
                } else {
                    callback(result);
              }

            });
        }

        var initialRequest = gapi.client.drive.files.list({
            'q'         : '\''+folderID+'\' in parents',
            'trashed'   : !!trashed
        });

        retrievePageOfFiles(initialRequest, []);
    };


    // download a file / code mainly from google
    function downloadFile(file, callback,retry,totdelay) {

        var request = gapi.client.drive.files.get({
            'alt'       : 'media',
            'fileId'    : file.id
        });

        setStatus('download-start');

        request.execute(function(resp) {

            setStatus('download-stop');

            if (typeof resp.error != 'undefined')
            {
                // https://developers.google.com/drive/web/handle-errors   
                if (
                    resp.error.code==403
                    &&
                    (
                        resp.error.data[0].reason == 'userRateLimitExceeded'
                        || resp.error.data[0].reason == 'rateLimitExceeded'
                    )
                )
                {
                    
                    if (typeof retry == 'undefined')
                    {
                        retry = 0;
                    }
                    if (typeof totdelay == 'undefined')
                    {
                        totdelay = 0;
                    }

                    if (retry<=4)
                    {
                        var delay = Math.pow(2, retry);

                        if (delay == 0)
                        {
                            delay = 1;
                        }

                        delay = Math.floor((delay+Math.random())*1000);
                        totdelay += delay;

                        ingressplanner.warn('downloadFile',file.title,'rate-limited - retrying in',delay,'ms');
                        retry++;

                        window.setTimeout(
                            downloadFile,
                            delay,
                            file, callback, retry, totdelay
                        );

                        return;
                    }
                    else
                    {
                        ingressplanner.error('downloadFile',file.title,'rate-limited - after',retry+1,'retries',totdelay,'ms');
                        return;
                    }

                }
                ingressplanner.error('downloadFile error',resp.error);
                return;
            }
            else if (callback) 
            {
                callback(resp);
            }
        });

    };

    // delete a file / code mainly from google
    function deleteFile(fileId,callback)
    {
        var request = gapi.client.drive.files.delete({ 'fileId': fileId });

        if (!callback) {
            var _callback = function() { 
                setStatus('upload-stop');
            };
        }
        else
        {
            var _callback = function() { 
                setStatus('upload-stop');
                callback();
            };

        }

        setStatus('upload-start');
        request.execute(_callback);

    };

    // save a JSON object as a file / code mainly from google
    function insertObjectasJSONFile (parents, objectName, object, callback) {

        var path = '/upload/drive/v2/files';
        var method = 'POST';

        var fileMetadata = {
            'title': objectName + '.json',
            'mimeType': 'text/plain'
        };

        if (typeof parents != 'object')
        {
            path += '/' + parents;
            method = 'PUT';
        }
        else
        {
            fileMetadata.parents = parents;
        }

        if (typeof object != 'string')
        {
            object = JSON.stringify(object);
        }

        const boundary = '-------314159265358979323846';
        const delimiter = "\r\n--" + boundary + "\r\n";
        const close_delim = "\r\n--" + boundary + "--";

        var request = gapi.client.request({
            'path': path,
            'method': method,
            'params': {'uploadType': 'multipart'},
            'headers': {
                'Content-Type': 'multipart/related; boundary="' + boundary + '"'
            },
            'body': 
                delimiter +
                'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
                JSON.stringify(fileMetadata) +
                delimiter +
                'Content-Type: text/plain\r\n' +
                '\r\n' +
                object +
                close_delim
        });

        if (!callback) {
            var _callback = function(file) { 
                setStatus('upload-stop');
            };
        }
        else
        {
            var _callback = function(file) {
                setStatus('upload-stop');
                callback(file);
            };

        }

        setStatus('upload-start');
        request.execute(_callback);

    };

    // pass loaded plan data to the mediator
    function loadedPlan(planName,version,planData)
    {

        if (typeof planData == 'undefined')
        {
            planData = [];
            version = "2";
        }

        if (typeof version == 'undefined')
        {
            version = "2";
        }

        if (typeof mainEventHandler == 'function')
        {
            mainEventHandler('loaded-plan',{planName:planName, version:version, planData:planData});
        }

    };

    // load a plan and fire loadedPlan() when done (if no callBack is defined)
    function loadPlan(planName,callBack)
    {

        if (
            (
                typeof plans[planName] != 'undefined'
                && typeof plans[planName].file != 'undefined'
            )
        )
        {

            if (typeof callBack == 'undefined')
            {
                callBack = function(v,r) {
                    loadedPlan(planName,v,r);
                };
            }

            downloadFile(plans[planName].file,function(result) {
                callBack(plans[planName].version,result);
            });
        }
    };

    function triggerPlanListupdate()
    {

        if (typeof mainEventHandler == 'function')
        {
            mainEventHandler('updatePlansList',{
                plans: $.map(plans, function(data, planName) {
                    return {
                        name: planName,
                        modified: data.file.modifiedDate,
                        version: data.version
                    };
                })
            });

        }
    };

    // read the root app dir to build the plans list, optionally read and parse cfg too
    function readPlans(readCfg,callback)
    {
        if (typeof readCfg == 'undefined')
        {
            readCfg = false;
        }

        var _reading = {};

        var cfgs = [];

        // list files in "root" dir
        listFilesInApplicationDataFolder(function(rootItems) {

            // array to keep trak of root items checked
            var doneRootItems = [];

            // called after each root item has been fully checked to carry out final actions
            var checkRootItemDone = function(rootItemIdx)
            {
                // if root is empty rootItemIdx will be undefined
                if (typeof rootItemIdx != 'undefined')
                {
                    doneRootItems.push(rootItemIdx);
                }

                // if all root items have been processed we can go ahead
                if (doneRootItems.length == rootItems.length)
                {

                    plans = _reading;

                    triggerPlanListupdate();

                    if (cfgs.length)
                    {
                        // more cfg.json files might be present due to development code mistakes, they shouldn't in production
                        if (cfgs.length>1)
                        {
                            cfgs.sort(function(a,b){
                                if (a.modifiedDate==b.modifiedDate)
                                {
                                    return 0;
                                }
                                else if (a.modifiedDate<b.modifiedDate)
                                {
                                    return 1;
                                }
                                else
                                {
                                    return -1;
                                }
                            });
                            ingressplanner.warn(cfgs.length,'cfg.json files found! Keeping only the latest @',cfgs[0].modifiedDate);
                        }

                        cfgFileItem = cfgs.shift();

                        $.each(cfgs, function(index, todelete) {
                             deleteFile(todelete.id);
                        });

                        downloadFile(cfgFileItem,function(result) {
                            if (result.result)
                            {
                                // send configurations to main mediator
                                mainEventHandler('cfg-loaded',result.result);
                            }
                        });
                    }

                    if (typeof callback == 'function')
                    {
                        callback();
                    }
                }
            }

            if (!rootItems.length)
            {
                checkRootItemDone();
            }
            else
            {
                $.each(rootItems, function(idx,rootItem) {

                    // personal configurations
                    if (rootItem.title=='cfg.json')
                    {
                        if (readCfg)
                        {
                            cfgs.push(rootItem);
                        }
                        checkRootItemDone(idx);
                    }
                    else if (rootItem.mimeType=='application/vnd.google-apps.folder')
                    {
                        // found a directory (rootItem.title is the plan name)
                        listFilesInFolder(rootItem.id, function(folderItems) {

                            if (!folderItems.length)
                            {
                                checkRootItemDone(idx);
                            }
                            else
                            {

                                var files = {'1':[],'2':[]};

                                // search through the files in plan folder

                                $.each(folderItems, function(folderItemIDX, folderItem) {

                                    switch (folderItem.title)
                                    {
                                        case 'currentDrawing.json':
                                            files['1'].push(folderItem);
                                            break;

                                        case 'plan.json':
                                            files['2'].push(folderItem);
                                            break;
                                    }

                                });

                                var version = null;

                                if (files['2'].length)
                                {
                                    version='2';

                                    var file = files['2'].shift();

                                    $.each(files['2'], function(index, val) {
                                        // delete older files, that shouldn't be there!
                                        ingressplanner.warn('delete',rootItem.title,'v2',val.modifiedDate);
                                        gapi.client.drive.files.delete({ 'fileId': val.id }).execute();
                                    });

                                    files['2'] = file;

                                }
                                else
                                {
                                    delete files['2'];
                                }

                                if (files['1'].length)
                                {
                                    if (!version)
                                    {
                                        version='1';
                                    }

                                    var file = files['1'].shift();

                                    $.each(files['1'], function(index, val) {
                                        // delete older files, that shouldn't be there!
                                        ingressplanner.warn('delete',rootItem.title,'v1',val.modifiedDate);
                                        gapi.client.drive.files.delete({ 'fileId': val.id }).execute();
                                    });

                                    files['1'] = file;

                                }
                                else
                                {
                                    delete files['1'];
                                }

                                if (version)
                                {
                                    // store informations
                                    _reading[rootItem.title] = {
                                        folderFileItem: rootItem,
                                        file: files[version],
                                        files: files,
                                        version: version
                                    };
                                }
                            }

                            checkRootItemDone(idx);

                        });
                    }
                    else
                    {
                        checkRootItemDone(idx);
                    }

                });
            }
        });
    };


    // authorize will try first time with immediate flag true (no login dialog), then false
    var immediateFailed = false;

    // perform gdrive login
    function authorize(successCallBack,failureCallBack)
    {

        setStatus('loggingin');

        gapi.auth.authorize(

            {
                'client_id':    CLIENT_ID,
                'scope':        SCOPES,
                'immediate':    (!immediateFailed)
            },

            function(authResult) {

                if (authResult && !authResult.error) {

                    setStatus('loggedin');
                    gapi.client.load('drive', 'v2',successCallBack);

                }
                else
                {
                    if (!immediateFailed)
                    {
                        immediateFailed = true;
                    }
                    setStatus('auth-error',authResult);
                    if (typeof failureCallBack == 'function' )
                    {
                        failureCallBack(authResult);
                    }
                }
            }
        );

    };

// exposed methods

	return {


        // save a plan
        savePlan: function(planName, plan) {

            insertObjectasJSONFile(plans[planName].file.id, 'plan', plan, function (result) {
                plans[planName].file = result;
                triggerPlanListupdate();
            });
        },

        // save the current personal configuration
        saveCfg: function(newCfg) {

            if (!cfgFileItem)
            {
                var parents = [{id:'appfolder'}];
            }
            else
            {
                var parents = cfgFileItem.id;
            }

            insertObjectasJSONFile(parents, 'cfg', newCfg, function(result) {
                cfgFileItem = result;

            });

        },

        // delete a plan (and reload plans list)
        delete: function(planName)
        {

            if (
                typeof plans[planName] != 'undefined'
                && typeof plans[planName].folderFileItem == 'object'
            )
            {
                deleteFile(plans[planName].folderFileItem.id,readPlans(false));
            }

        },

        // create or copy a plan (and reload plans list) and load the new plan
        new: function(planName,from)
        {

            var writenewplan = function(newPlanName,planObject)
            {

                insertFolderInApplicationDataFolder(newPlanName, function(folder){
                    insertObjectasJSONFile([{id:folder.id}], 'plan', planObject, function() {
                        readPlans(false,function(){
                            loadPlan(newPlanName);
                        });
                    });
                });
            }

            if (
                from
                && typeof from == 'string'
                && typeof plans[from] != 'undefined'
            )
            {
                loadPlan(from,function(version,result) {

                    var plan = null;

                    if (version=="2")
                    {
                        plan = result;
                    }
                    else
                    {
                        bootbox.alert('Can\'t copy an old version plan. Please touch it to convert to v2');
                        plan = false;
                        readPlans(false);
                    }

                    if (plan)
                    {
                        writenewplan(planName,plan);
                    }
                    
                });
            }
            else if (from && typeof from == 'object')
            {
                writenewplan(planName,from);
            }
            else
            {
                writenewplan(planName,{steps:[]});
            }
        },

        load: function(planName)
        {
            loadPlan(planName);
        },

        // called when gdrive client loaded, will search for cfg, plans, initial plan to load
		init: function(maingGriveEventHandler)
		{

            // mediator callback
			if (typeof maingGriveEventHandler == 'function')
			{
				mainEventHandler = maingGriveEventHandler;
			}

            authorize(
                // successCallBack
                function() {
                    readPlans(true);
                }
            );

		}

	};

});