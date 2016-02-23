/*
    ingressplanner is the main mediator
*/

ingressplanner = new (function() {

// private vars & functions

    // store logging check result
    var loggingEnabled = null;
    // console grouping flag
    var loggingGrouped = false;

    // store current user configuration
    var cfg = null;

    // default plan options
    var defaultPlanOptions = {
        HLPlanning: false,
        showDoneLinks: false,
        fullresosOnTouchedPortals: true,
        planKeyFarming: true,
        keyFarmLimit: 2,
        textualPlanAddLinks: true,
        textualPlanAddLinksMinDistance: 100,
        textualPlanAddLinksType: 'gmap',
        drawingExportMarkers: true,
        drawingExportRanges: true,
    };

    // store current player team
    var playerTeam = null;
    // store current player opponent team
    var opponentTeam = null;

    // store last mapDataRefreshStart data
    var lastMapDataRefreshStartPayload = null;

    // store current agent data
    var agentLoggableData = null;

    // store last plans list
    var plans = [];

    // store last updated plan
    var lastPlan = null;

    // convert IITC drawing array of objects to a plan
    function IITCtoPlan(data, polygonsAsRanges, callback, currPlan)
    {

        var _origData = data;
        if (typeof data == 'string')
        {
            data = JSON.parse(data);
        }

        var rangesMap = {};
        var reversesMap = {};

        if (typeof currPlan != undefined && currPlan)
        {
            if (typeof currPlan.ranges != 'undefined')
            {
                $.each(currPlan.ranges, function(index, range) {
                    rangesMap[range.index] = JSON.stringify({
                        type: range.type,
                        color: range.color
                    });
                });
            }

            if (typeof currPlan.steps != 'undefined')
            {
                $.each(currPlan.steps, function(index, step) {
                    if (step.type == 'reverse' && typeof step.drawingIdx != 'undefined')
                    {
                        reversesMap[step.drawingIdx] = JSON.stringify({
                            color: step.color,
                            portals: step.portals
                         });
                    }
                });
            }

        }
        else
        {
            currPlan = null;
        }

        var plan = {
            steps: [],
            ranges: []
        };

        var dropDuplicates = [];

        $.each(data, function(index, item) {

            var drawing = item;
            drawing.index = index;

            switch (item.type)
            {
                case 'marker':

                    var adding = {
                        color: drawing.color,
                        portals: ingressplanner.utils.llstring(item.latLng)
                    };

                    var type = 'portal';

                    if (typeof reversesMap[index]!= 'undefined')
                    {
                        if (JSON.stringify(adding)==reversesMap[index])
                        {
                            type = 'reverse';
                        }
                    }

                    adding.type = type;
                    plan.steps.push(adding);
                    break;

                case 'circle':
                    if (drawing.radius==0)
                    {
                        break;
                    }

                case 'polygon':

                    var exisiting = false;

                    if (typeof rangesMap[index]!= 'undefined')
                    {
                        var test = JSON.stringify({
                            type: drawing.type,
                            color: drawing.color
                        });
                        exisiting = (test == rangesMap[index]);
                    }

                    if ((!exisiting) && item.type == 'polygon' && polygonsAsRanges === null)
                    {
                        bootbox.dialog({
                          message: 'Import polygons as ranges?',
                          title: 'New Polygon(s) detected',
                          buttons: {
                            yes: {
                              label: "Yes, import polygons as ranges",
                              className: "btn-success",
                              callback: function() {
                                IITCtoPlan(_origData,true,callback,currPlan);
                              }
                            },
                            no: {
                              label: "No, import polygons as links",
                              className: "btn-danger",
                              callback: function() {
                                IITCtoPlan(_origData,false,callback,currPlan);
                              }
                            }
                          }
                        });
                        return 2;
                    }
                    
                    if (exisiting || item.type == 'circle' || polygonsAsRanges)
                    {
                        plan.ranges.push(drawing);
                        break;
                    }

                case 'polyline':

                    var origin = ingressplanner.utils.llstring(item.latLngs.shift());
                    var first = origin;
                    var target = item.latLngs.shift();

                    if (target)
                    {
                        target = ingressplanner.utils.llstring(target);
                    }

                    while (target)
                    {

                        if (origin!=target)
                        {

                            var llorder = [origin,target].sort().join('|');
                            if (dropDuplicates.indexOf(llorder) != -1)
                            {
                                ingressplanner.log('duplicate of',llorder,'dropped');
                            }
                            else
                            {
                                dropDuplicates.push(llorder);

                                plan.steps.push({
                                    type: 'link',
                                    portals: origin+'|'+target,
                                    color: drawing.color
                                });
                            }

                            origin = target;
                        }

                        target = item.latLngs.shift();

                        if (target)
                        {
                            target = ingressplanner.utils.llstring(target);
                        }
                        else if ((!target) && item.type=='polygon')
                        {
                            target = first;
                            first = null;
                        }
                    }
                    break;

                default:
                    ingressplanner.warn('unmanaged drawing elemt type',item.type);
                    break;
            };

        });
        callback(plan);
    }

    function importPlanJson(planJson,planName)
    {
        bootbox.prompt({
          title: "Name of the imported Plan?",
          value: planName,
          callback: function(name) {
            if (name !== null) 
            {
                ingressplanner.gdrive.new(name,JSON.parse(planJson));
            }
          }
        });

    }

    // wrapper to converter for previous versiones plan formats
    function planConvertFrom(from,data,callback)
    {
        var plan = false;
        switch (from)
        {
            case "2":
                plan = data;
                break;

            case "1":
                IITCtoPlan(data,false,callback);
                break;

            default:
                var msg = 'Confert from v' + from + ' not implemented';
                bootbox.alert(msg);
                ingressplanner.error(msg);
                break;
        }

        callback(plan);
    }

    // manage agent data & opt-in stroageretrieval from server
    function senddata(agentdata,firstcheck)
    {
        $.ajax({
            url: 'agent.php',
            type: 'POST',
            dataType: 'json',
            data: agentdata,
        })
        .done(function(agentdata) {

            if (agentdata['opt-in']=='false')
            {
                agentdata['opt-in'] = false;
            }
            else if(agentdata['opt-in']=='true')
            {
                agentdata['opt-in'] = true;
            }

            if (firstcheck && agentdata['opt-in']===null)
            {
                bootbox.dialog({
                  message: "Can " + about.productname + " use your agent name, team and level for its PUBLIC usage statistics?",
                  title: "Usage statistics",
                  buttons: {
                    yes: {
                      label: "Yes",
                      className: "btn-success",
                      callback: function() {
                        agentdata['opt-in'] = true;
                        senddata(agentdata,false);
                      }
                    },
                    no: {
                      label: "No",
                      className: "btn-danger",
                      callback: function() {
                        agentdata['opt-in'] = false;
                        senddata(agentdata,false);
                      }
                    }
                  }
                });
            }

            if (!firstcheck)
            {
                if (agentdata['opt-in'])
                {
                    bootbox.alert(about.productname + " will proudly show you one of its users!\nThank you!");
                }
                else
                {
                    bootbox.alert(about.productname + " will NOT SHOW or use your agent details in any case.\nThank you!");
                }
                
            }
            agentLoggableData = agentdata;
            ingressplanner.ui.agentLoggableData(agentLoggableData);
        });
    }

    // utility function to manage player data received by IITC
    function setPlayerData(playerdata)
    {
        playerdata.team = ingressplanner.gameworld.normalizeTeamName(playerdata.team,'player');
        playerTeam = playerdata.team;

        if (playerTeam=='ENLIGHTENED')
        {
            opponentTeam = 'RESISTANCE';
        }
        else if (playerTeam=='RESISTANCE')
        {
            opponentTeam = 'ENLIGHTENED';
        }
        else
        {
            ingressplanner.error('Unknow player team',playerTeam);
        }

        senddata(playerdata,true);

    }

    // main handler for all events fired by modules
    function trigger(module,event,payload) {

//      ingressplanner.debug(module,event,payload);
        
        switch (module)
        {
            case 'iitc':

                switch (event)
                {
                    case 'switchToSite':
                        ingressplanner.ui.gotab('stepsTab');
                        break;

                    case 'runHook':
                        switch(payload.hookName)
                        {
                            case 'mapDataRefreshStart':
                                lastMapDataRefreshStartPayload = payload.data;
                                ingressplanner.ui.mapUpdating(true);
                                break;

                            case 'mapDataRefreshEnd':
                                ingressplanner.ui.mapUpdating(false);
                                if (ingressplanner.gameworld.update(payload.data,lastMapDataRefreshStartPayload) && lastPlan)
                                {
                                    loadAndAnalyzePlan(lastPlan,false);
                                }
                                break;

                            case 'pluginKeysUpdateKey':
                                ingressplanner.gameworld.updateKeys(payload.data);
                                if (lastPlan.options.planKeyFarming)
                                {
                                    loadAndAnalyzePlan(lastPlan,false);
                                }

                                break;


                        }
                        break;

                    case 'update-drawing':

                        if (payload)
                        {
                            IITCtoPlan(
                                payload,
                                null,
                                function(parsed) {
                                    lastPlan.steps = parsed.steps;
                                    lastPlan.ranges = parsed.ranges;
                                    loadAndAnalyzePlan(lastPlan,true);
                                },
                                lastPlan
                            );
                        }
                        break;

                    case 'ping':
                        if (
                            about.pluginVersion != '2.@@PLUGINBUILD@@'
                            &&
                            (
                                payload.version != about.pluginVersion
                            )
                        )
                        {
                            bootbox.alert(
                                'Please update the ' + 
                                about.productname + 
                                ' plugin.\nA new browser window will be opened pointing to the updated script, confirm "reinstall"!' +
                                '\nVersion installed: ' + payload.version + ', available version: ' + about.pluginVersion + 
                                '\n*** REMMBER TO REFRESH THIS PAGE AFTER UPDATING THE PLUGIN !!!'
                            ,function() {
                                window.open('files/ingressplanner.user.js');
                            });
                        }

                        ingressplanner.ui.iitcSentPing();
                        ingressplanner.iitc.sendMessage('pong', {
                            about:  about,
                            neededPlugins: $.map(about.requiredPlugins, function(pluginData, name) 
                                {
                                    return {
                                        objectName: pluginData.objectName,
                                        name: name
                                    };
                                }),

                            hooks: {
                            // required
                                'pluginKeysUpdateKey': true,
                                'mapDataRefreshStart': true,
                                'mapDataRefreshEnd': ingressplanner.gameworld.dataProvider(),
                            }
                        });
                    
                        break;

                    default:
                        ingressplanner.error('unmanaged iitc EVENT',event,payload);
                        break;
                }

                break;

            case 'plan':
                switch (event)
                {
                    default:
                        ingressplanner.error('unmanaged plan EVENT',event,payload);
                        break;
                }
                break;

            case 'ui':
                switch (event)
                {

                    case 'exportPlan':
                        $('#jsonDownload').remove();
                        var blob = new Blob([JSON.stringify(lastPlan)], {'type':'text/plain'});
                        var pom = $('<a>').attr({
                            id:         'jsonDownload',
                            href:       window.URL.createObjectURL(blob),
                            download:   cfg.currentPlan + '-IPPlan.txt'
                        });
                        pom[0].click();
                        break;

                    case 'exportPlanDrawing':
                        $('#jsonDownload').remove();
                        var blob = new Blob([JSON.stringify(ingressplanner.plan.iitcDrawing(lastPlan,true))], {'type':'text/plain'});
                        var pom = $('<a>').attr({
                            id:         'jsonDownload',
                            href:       window.URL.createObjectURL(blob),
                            download:   cfg.currentPlan + '-IITCDrawTools.txt'
                        });
                        pom[0].click();
                        break;

                    case 'swapportals':

                        var changed = false;

                        $.each(payload.planIdx, function(index, planIdx) {

                             var portals = lastPlan.steps[planIdx].portals.split('|');

                             $.each(portals, function(portalIdx, portal) {
                                 if (portal==payload.from)
                                 {
                                    changed = true;
                                    portals[portalIdx] = payload.to;
                                 }
                             });

                             lastPlan.steps[planIdx].portals = portals.join('|');

                        });

                        if (changed)
                        {
                            loadAndAnalyzePlan(lastPlan,true);
                        }

                        break;

                    case 'importIngraph':
                        ingressplanner.tools.inGraphImport(
                            payload.file,

                            function(newsteps) {

                                if (payload.type=='replace')
                                {
                                    lastPlan.steps = [];
                                }

                                $.each(newsteps, function() {
                                     var step = {
                                        'type': 'link',
                                        'color': payload.color,
                                        'portals': this
                                     };

                                     if (payload.type=='prepend')
                                     {
                                        lastPlan.steps.unshift(step);
                                     }
                                     else
                                     {
                                        lastPlan.steps.push(step);
                                     }
                                });

                                loadAndAnalyzePlan(lastPlan,true);
                            }
                        );
                        break;

                    case 'exportIngraph':

                        switch (payload.source)
                        {
                            case 'ranges':
                                ingressplanner.ui.showiGStatus(true);
                                ingressplanner.gameworld.portalsInRanges(
                                    decodeRangesSelection(payload.values),

                                    // progressCallBack
                                    function(done,total)
                                    {
                                        ingressplanner.ui.statusBars('iGportalsInRangeStatus',done,total);
                                    },

                                    // doneCallBack
                                    function(portals) {
                                        ingressplanner.ui.showiGStatus(false);
                                        ingressplanner.tools.inGraphExport(
                                            $.map(portals, function(portal) {
                                                return portal.llstring;
                                            })
                                            ,cfg.currentPlan);
                                    }
                                    
                                );
                                break;

                            case 'plan':
                                ingressplanner.tools.inGraphExport(payload.values,cfg.currentPlan);
                                break;

                            default:
                                ingressplanner.error('unmanaged ingraph source type',payload.source,payload.values);
                                break;
                        }
                        break;

                    case 'tools-multilayer':

                        ingressplanner.ui.showMlStatus();

                        ingressplanner.gameworld.portalsInRanges(

                            decodeRangesSelection(payload.ranges),

                            // progressCallBack
                            function(done,total)
                            {
                                ingressplanner.ui.statusBars('mlPortalsInRangeStatus',done,total);
                            },

                            // doneCallBack
                            function(targets) 
                            {

                                ingressplanner.tools.multilayer(
                                    lastPlan,
                                    payload.baseLink,
                                    targets,
                                    // portalsBlockedProgressCallBack
                                    function(done,total)
                                    {
                                        ingressplanner.ui.statusBars('mlPortalsBlocked',done,total);
                                    },
                                    // portalsSortingProgressCallBack
                                    function(done,total)
                                    {
                                        ingressplanner.ui.statusBars('mlPortalsSorting',done,total);
                                    },
                                    // sequencesBuildingProgressCallBack
                                    function(done,total)
                                    {
                                        ingressplanner.ui.statusBars('mlSequencesBuilding',done,total);
                                    },
                                    // doneCallback
                                    function(result, notice)
                                    {
                                        ingressplanner.ui.showMlResults(result,notice);
                                    }

                                );
                        
                            }
                        );
                        break;

                    case 'keyQtyChanghe':

                        var portalGUID = ingressplanner.gameworld.portalGUIDByllstring(payload.portal);

                        if (portalGUID)
                        {
                            ingressplanner.iitc.sendMessage('update-keys',{guid:portalGUID,keys:payload.newQty});
                        }
                        break;

                    case 'changeItemColor':
                        switch (payload.target.target[0])
                        {
                            case 'planIDX':
                                lastPlan.steps[payload.target.target[1]].color = payload.newHex;
                                loadAndAnalyzePlan(lastPlan,true);
                                break;

                            default:
                                ingressplanner.error('unmanaged UI changeItemColor target',payload.target.target[0]);
                                break;
                        }
                        break;

                    case 'useReverse':
                        var changed = false;
                        if (payload.cancel && lastPlan.steps[payload.planidx].type == 'reverse')
                        {
                            lastPlan.steps[payload.planidx].type = 'portal';
                            changed = true;
                        }
                        else if ((!payload.cancel) && lastPlan.steps[payload.planidx].type == 'portal')
                        {
                            lastPlan.steps[payload.planidx].type = 'reverse';
                            changed = true;
                        }

                        if (changed)
                        {
                            loadAndAnalyzePlan(lastPlan,true);
                        }
                        break;

                    case 'addMlSequence':

                        var lastMlVertex = null;

                        $.each(payload.targets, function(index, vertex) {

                            // first anchor
                            lastPlan.steps.push({
                                type: 'link',
                                color: payload.color,
                                portals: [vertex,payload.baselink[0]].join('|')
                            });

                            // second anchor
                            lastPlan.steps.push({
                                type: 'link',
                                color: payload.color,
                                portals: [vertex,payload.baselink[1]].join('|')
                            });

                            // jet link
                            if (lastMlVertex)
                            {
                                lastPlan.steps.push({
                                    type: 'link',
                                    color: payload.color,
                                    portals: [vertex,lastMlVertex].join('|')
                                });
                            }

                            lastMlVertex = vertex;
                        });
                        loadAndAnalyzePlan(lastPlan,true);

                    case 'clearMlResults':
                        ingressplanner.ui.clearMlResults();
                        break;

                    case 'invertlink':
                        payload = {'planIdx': [payload]};

                    case 'invertlinks':

                        var changed = false;

                        $.each(payload.planIdx, function(index, planIdx) {
                            var portals = lastPlan.steps[planIdx].portals.split('|');
                            if (portals.length==2)
                            {
                                changed = true;
                                lastPlan.steps[planIdx].portals = portals.reverse().join('|');
                            }
                        });

                        if (changed)
                        {
                            loadAndAnalyzePlan(lastPlan,true);
                        }
                        break;

                    case 'moveItem':

                        if (payload.moveBefore=='end')
                        {
                            payload.moveBefore = lastPlan.steps.length;
                        }

                    case 'deleteItems':

                        var toMove = [];
                        var before = [];
                        var after = [];
                        var removed = [];

                        var confirmPrompt = false;

                        $.each(lastPlan.steps, function(planIdx, step) {

                             if (payload.planIdx.indexOf(String(planIdx))==-1)
                             {
                                if (typeof payload.moveBefore == 'undefined' || planIdx<payload.moveBefore)
                                {
                                    before.push(step);
                                }
                                else
                                {
                                    after.push(step);
                                }
                             }
                             else if(typeof payload.moveBefore != 'undefined')
                             {
                                toMove.push(step);
                             }
                             else
                             {
                                removed.push(step);
                             }
                        });

                        if (removed.length)
                        {
                            if (removed.length == 1 && removed[0].type == 'link')
                            {
                                confirmPrompt = 'Are you sure you want to delete the link?';
                            }
                            else if(removed.length > 1)
                            {
                                confirmPrompt = 'Are you sure you want to delete ' + removed.length + ' item(s)?';
                            }
                        }

                        if (confirmPrompt)
                        {
                            bootbox.confirm(confirmPrompt, function(result) {
                                if (result)
                                {
                                    lastPlan.steps = before.concat(toMove,after);
                                    loadAndAnalyzePlan(lastPlan,true);
                                }
                            });
                        }
                        else
                        {
                            lastPlan.steps = before.concat(toMove,after);
                            loadAndAnalyzePlan(lastPlan,true);
                        }
                        break;

                    case 'addMarkerBefore':

                        var color = lastPlan.steps[payload.planIdx].color;
                        var type = 'portal';
                        var reverse = false;

                        if (typeof payload.reverse != 'undefined')
                        {
                            reverse = payload.reverse;
                        }

                        if (reverse)
                        {
                            type = 'reverse';
                        }

                        var steps = 
                            lastPlan.steps.slice(0, payload.planIdx)
                            .concat(
                                {
                                    type: type,
                                    portals: payload.portal,
                                    color: color
                                },
                                lastPlan.steps.slice(payload.planIdx)
                            )
                        ;
                        lastPlan.steps = steps;
                        loadAndAnalyzePlan(lastPlan,true);
                        break;

                    case 'click-portalLink':
                        var request = {
                            ll: payload.split(','),
                            zoom: 15
                        };

                        var portalGUID = ingressplanner.gameworld.portalGUIDByllstring(payload);

                        if (portalGUID)
                        {
                            request.portalguid = portalGUID;
                        }

                        ingressplanner.iitc.sendMessage('pan',request);
                        ingressplanner.ui.gotab('ictTab');

                        break;

                    case 'switchPrivacyOpt':
                        agentLoggableData['opt-in'] = !agentLoggableData['opt-in'];
                        senddata(agentLoggableData,false);
                        break;

                    case 'planOptionChange':
                        planOptionSet(payload.option,payload.newValue);
                        break;

                    case 'gdriveLogin':
                        ingressplanner.gdrive.init();
                        break;

                    case 'loadPlan':
                        if (ingressplanner.getCurrentPlan()!=payload)
                        {
                            ingressplanner.gdrive.load(payload);
                        }
                        else
                        {
                            ingressplanner.ui.drawPlansList(plans);
                        }
                        break;

                    case 'importPlanText':
                        bootbox.prompt('Paste the JSON text of the plan', function(text) {                
                          if (text) {                                             
                            importPlanJson(text,'');
                          }
                        });
                        break;

                    case 'importPlan':

                        var reader = new FileReader();

                        reader.onload = function(e) {

                            var origPlanName = null;

                            var suffPos = payload.file.name.indexOf('-IPPlan.txt');

                            if (suffPos!=-1)
                            {
                                origPlanName = payload.file.name.substr(0,suffPos);
                            }

                            importPlanJson(reader.result,origPlanName);

                        }
                        reader.readAsText(payload.file);

                        break;

                    case 'newPlan':
                        payload = {
                            name: payload,
                            from: null
                        };
                    case 'copyPlan':
                        ingressplanner.gdrive.new(payload.name,payload.from);
                        break;

                    case 'deletePlan':
                        if (ingressplanner.getCurrentPlan()!=payload)
                        {
                            bootbox.confirm('Are you sure you want to delete plan "'+payload+'"?', function(result) {
                                if (result)
                                {
                                    ingressplanner.gdrive.delete(payload);
                                }
                            }); 
                            
                        }
                        break;

                    default:
                        ingressplanner.error('unmanaged ui EVENT',event,payload);
                        break;
                }
                break;

            case 'gdrive':

                switch (event)
                {

                    case 'cfg-loaded':

                        if (!cfg)
                        {
                            cfg = payload;
                            ingressplanner.gdrive.load(ingressplanner.getCurrentPlan());
                        }
                        break;

                    case 'updatePlansList':
                        plans = payload.plans;
                        ingressplanner.ui.drawPlansList(plans);
                        break;

                    case 'loaded-plan':

                        var plan = payload.planData;
                        if (typeof plan.result != 'undefined')
                        {
                            plan = plan.result;
                        }
                        var version = payload.version;
                        var name = payload.planName;

                        function v2manage(plan)
                        {
                            if (typeof plan.format == 'undefined')
                            {
                            // 1.0 (undefined): first "bugged" format with step.portals joined with '-'

                                $.each(plan.steps, function(planidx, step) {

                                    var pos = step.portals.indexOf('-');
                                    if (pos!=-1)
                                    {
                                        if (pos==0)
                                        {
                                            pos = step.portals.slice(1).indexOf('-') +1;
                                        }
                                        plan.steps[planidx].portals = [
                                            step.portals.slice(0,pos),
                                            step.portals.slice(pos+1)
                                        ].join('|');

                                    }
                                });
                            }

                            // 1.1: step.portals now joined with '|'
                            plan.format = '1.1';

                            ingressplanner.ui.gotab('ictTab');

                            if (!cfg)
                            {
                                cfg = {};
                            }
                            cfg.currentPlan = name;
                            ingressplanner.gdrive.saveCfg(cfg);
                            ingressplanner.ui.drawPlansList(plans);

                            if (typeof plan.options=='undefined')
                            {
                                plan.options = defaultPlanOptions;
                            }
                            else
                            {
                                $.each(Object.keys(defaultPlanOptions), function(index, option) {
                                     if (typeof plan.options[option] == 'undefined')
                                     {
                                        plan.options[option] = defaultPlanOptions[option];
                                     }
                                });
                            }
                            // property name chenged from cfg to options during development, dev plans might have plan.cfg...
                            delete plan.cfg;

                            // legacy plan properties removal
                            delete plan.Portals;
                            delete plan.colors;
                            delete plan.result;

                            // flag and remove bad steps and legacy steps properties
                            plan.steps = $.map(plan.steps, function(step,planIDX) {
                                var stepPortals = step.portals.split('|');
                                if (stepPortals.length==2 && stepPortals[0]==stepPortals[1])
                                {
                                    // this is an undetected error, a link with same origin and detsination
                                    ingressplanner.warn('Step',planIDX,'is a "false" link and will be removed',step);
                                    return null;
                                }
                                delete step.actionType;
                                delete step.analysis;
                                delete step.sequenceIdx;
                                return step;
                            });

                            loadAndAnalyzePlan(plan,true,false);

                            ingressplanner.iitc.sendMessage('center-drawing');
                        }

                        if (version!="2")
                        {
                            planConvertFrom(version,plan,function(plan){

                                if (plan===false)
                                {
                                    ingressplanner.ui.drawPlansList(plans);
                                }
                                else
                                {
                                    plan.format = '1.1';
                                    v2manage(plan);
                                }

                            });

                        }
                        else
                        {
                            v2manage(plan);
                        }
                        break;

                    case 'newstatus':
                        switch (payload)
                        {
                            case 'auth-error':
                            case 'loggingin':
                            case 'loggedin':
                            case 'downloading':
                            case 'uploading':
                            case 'idle':
                                ingressplanner.ui.gdriveStatus(payload);
                                break;

                            default:
                                ingressplanner.error('unmanaged gdrive newstatus',payload);
                                break;

                        }
                        break;

                    default:
                        ingressplanner.error('unmanaged gdrive EVENT',event,payload);
                        break;
                }
                break;

            default:
                ingressplanner.error('unmanaged MODULE',module,event,payload);
                break;
        }
    };

    // IITC events handler (wrapper to main handler)
    function iitcEventHandler(event, data, playerdata)
    {

        if (typeof playerdata != 'undefined' && playerdata)
        {
            setPlayerData(playerdata);
        }

        trigger('iitc',event,data);
    }

    // plan events handler (wrapper to main handler)
    function planEventHandler(event, data)
    {
        trigger('plan',event,data);
    }

    // UI events handler (wrapper to main handler)
    function uiEventHandler(event, data)
    {
        trigger('ui',event,data);
    }

    // gdrive events handler (wrapper to main handler)
    function gdriveEventHandler(event, data)
    {
        trigger('gdrive',event,data);
    };

    // utlity for console output if in debug mode and console object available
    function consoleout(type,args)
    {
        if (loggingEnabled === null)
        {
            loggingEnabled = (typeof console == 'object');
        }

        if (
            loggingEnabled 
            && typeof console[type] == 'function'
            && (
                type == 'error' ||
                type == 'warn' ||
                about.debug
            )
        )
        {
            args = Array.prototype.slice.call(args);
            if (!loggingGrouped)
            {
                args.unshift('* '+ about.productname);
            }
            console[type].apply(console,args);
        }
    };

    function planOptionSet(option,value)
    {
        lastPlan.options[option] = value;
        loadAndAnalyzePlan(lastPlan,true);
    }

    // utility function to load perform plan analysis, invoked by the main event handler
    function loadAndAnalyzePlan(plan,changed,saveChanges)
    {
        if (typeof saveChanges == 'undefined')
        {
            saveChanges = changed;
        }

        lastPlan = plan;
        if (changed)
        {
            ingressplanner.iitc.sendMessage('update-drawing',{drawing:ingressplanner.plan.iitcDrawing(lastPlan)});
        }

        if (saveChanges)
        {
            ingressplanner.gdrive.savePlan(cfg.currentPlan,lastPlan);
        }

        ingressplanner.ui.planAnalyzing();

//      ingressplanner.group('plan.analyze');

        var analysis = ingressplanner.plan.analyze(lastPlan, playerTeam, opponentTeam);

//      ingressplanner.groupEnd();

        ingressplanner.ui.refreshPlan(lastPlan,playerTeam,analysis);

    };

    function decodeRangesSelection(ranges)
    {
        return $.map(ranges, function(range) {
            range = range.split('|');
            switch (range[0])
            {
                case 'range':
                    return lastPlan.ranges[range[1]];
                    break;

                case 'field':
                    return {type:'field',llstring:range[1]};
                    break;

                default:
                    ingressplanner.error('Unmanaged range type',range[0]);
                    break;
            }
        });
    }


// exposed methods

    return {

        // invoked when DOM ready
        init: function()
        {
            ingressplanner.iitc.init(iitcEventHandler);
            ingressplanner.plan.init(planEventHandler);
            ingressplanner.ui.init(uiEventHandler);
        },

        // invoked when gdriveclient loaded (via onload=ingressplanner.gdriveClientLoad query parameter in layout.php)
        gdriveClientLoad: function()
        {
            window.setTimeout(ingressplanner.gdrive.init(gdriveEventHandler),1);
        },

        // general App log & warn
        group: function(title)
        {
            if (!loggingGrouped)
            {
                consoleout('group',arguments);
                loggingGrouped = true;
            }

        },
        groupEnd: function(title)
        {
            if (loggingGrouped)
            {
                consoleout('groupEnd',arguments);
                loggingGrouped = false;
            }
        },
        log: function() {
            consoleout('log',arguments);
        },
        debug: function() {
            consoleout('debug',arguments);
        },
        warn: function() {
            consoleout('warn',arguments);
        },
        error: function() {
            consoleout('error',arguments);
            throw arguments[0];
        },

        //return the current active plan name
        getCurrentPlan: function()
        {
            if (cfg && typeof cfg.currentPlan != 'undefined')
            {
                return cfg.currentPlan
            }
            else
            {
                return null;
            }
        },

    }

});

gdriveClientLoad = ingressplanner.gdriveClientLoad;

$(function  () {
    ingressplanner.init();
});
