// ==UserScript==
// @id             iitc-plugin-ingressplanner
// @name           IITC plugin: Ingress Planner
// @category       misc
// @version        2.@@DATETIMEVERSION@@
// @namespace      https://github.com/jonatkins/ingress-intel-total-conversion
// @updateURL      @@UPDATEURL@@
// @downloadURL    @@DOWNLOADURL@@
// @description    Data source for Ingress Planner.
// @include        https://www.ingress.com/intel*
// @include        http://www.ingress.com/intel*
// @match          https://www.ingress.com/intel*
// @match          http://www.ingress.com/intel*
// @grant          none
// ==/UserScript==

function wrapper() {
  // in case IITC is not available yet, define the base plugin object
  if (typeof window.plugin !== "function") {
    window.plugin = function() {
    };
  }

  // base context for plugin

  window.plugin.ingressplanner = function() {};

    var self = window.plugin.ingressplanner;

    self.version = '2.@@PLUGINBUILD@@';

    self.ihOrigin = '*';

    self.playerInfoSent = false;

    self.lastUpdate = null;

    self.sendMessage = function(type,data) {

        var request = {"ingess-planner":{type:type}};

        if (typeof data !='undefined')
        {
            request["ingess-planner"].data = data;
        }

        if (
            (!window.plugin.ingressplanner.playerInfoSent)
            && window.PLAYER
        )
        {
            request["ingess-planner"].player = window.PLAYER;
            window.plugin.ingressplanner.playerInfoSent = true;
        }

        if (
            typeof window.plugin.ingressplanner.about != 'undefined' && !!window.plugin.ingressplanner.about.debug
        )
        {
            console.debug("%c" + window.plugin.ingressplanner.about.productname + " message sent by IITC plugin: '"+type+"'", 'background: #bb0; ');
        }

        parent.postMessage(request,window.plugin.ingressplanner.ihOrigin);

    };

    self.switchToSite = function() {
        window.plugin.ingressplanner.sendMessage('switchToSite');
    };

    
    self.receiveMessage = function(request,origin) {

        var type = request.type;
        var data = null;

        if (typeof request.data != 'undefined')
        {
            data = request.data;
            if (typeof data.about != 'undefined')
            {
                window.plugin.ingressplanner.about = data.about;
            }
        }

        if (
            typeof window.plugin.ingressplanner.about != 'undefined' && !!window.plugin.ingressplanner.about.debug
        )
        {
            console.debug("%c" + window.plugin.ingressplanner.about.productname + " message received by IITC plugin: '"+type+"'", 'background: #bb0; ');
        }


        switch (type)
        {

            // received Pong, so IITC is running inside Ingress Planner
            case "pong":

                // Douglas Crockford: make it possible to encode cyclical structures and dags in JSON
                // https://github.com/douglascrockford/JSON-js

                if (typeof JSON.decycle !== 'function') {
                    JSON.decycle = function decycle(object) {
                        'use strict';

                // Make a deep copy of an object or array, assuring that there is at most
                // one instance of each object or array in the resulting structure. The
                // duplicate references (which might be forming cycles) are replaced with
                // an object of the form
                //      {$ref: PATH}
                // where the PATH is a JSONPath string that locates the first occurance.
                // So,
                //      var a = [];
                //      a[0] = a;
                //      return JSON.stringify(JSON.decycle(a));
                // produces the string '[{"$ref":"$"}]'.

                // JSONPath is used to locate the unique object. $ indicates the top level of
                // the object or array. [NUMBER] or [STRING] indicates a child member or
                // property.

                        var objects = [],   // Keep a reference to each unique object or array
                            paths = [];     // Keep the path to each unique object or array

                        return (function derez(value, path) {

                // The derez recurses through the object, producing the deep copy.

                            var i,          // The loop counter
                                name,       // Property name
                                nu;         // The new object or array

                // typeof null === 'object', so go on if this value is really an object but not
                // one of the weird builtin objects.

                            if (typeof value === 'object' && value !== null &&
                                    !(value instanceof Boolean) &&
                                    !(value instanceof Date) &&
                                    !(value instanceof Number) &&
                                    !(value instanceof RegExp) &&
                                    !(value instanceof String)) {

                // If the value is an object or array, look to see if we have already
                // encountered it. If so, return a $ref/path object. This is a hard way,
                // linear search that will get slower as the number of unique objects grows.

                                for (i = 0; i < objects.length; i += 1) {
                                    if (objects[i] === value) {
                                        return {$ref: paths[i]};
                                    }
                                }

                // Otherwise, accumulate the unique value and its path.

                                objects.push(value);
                                paths.push(path);

                // If it is an array, replicate the array.

                                if (Object.prototype.toString.apply(value) === '[object Array]') {
                                    nu = [];
                                    for (i = 0; i < value.length; i += 1) {
                                        nu[i] = derez(value[i], path + '[' + i + ']');
                                    }
                                } else {

                // If it is an object, replicate the object.

                                    nu = {};
                                    for (name in value) {
                                        if (Object.prototype.hasOwnProperty.call(value, name)) {
                                            nu[name] = derez(value[name],
                                                    path + '[' + JSON.stringify(name) + ']');
                                        }
                                    }
                                }
                                return nu;
                            }
                            return value;
                        }(object, '$'));
                    };
                }

                // check for companion plugins

                var missing_req = $.map(data.neededPlugins, function(plugin, index) {
                    if (window.plugin[plugin.objectName] === undefined) {
                        return plugin.name;
                    }
                    return null;
                });;

               
                if (missing_req.length)
                {
                    var last = missing_req.pop();
                    var text = window.plugin.ingressplanner.about.productname +' requires the following missing plugin';

                    if (missing_req.length)
                    {
                      text += 's: "' + [missing_req.join('", "'),last].join('" and "') + '"';
                    }
                    else
                    {
                      text += ': "' + last + '"';
                    }

                    alert(text);
                    return;
                }

// legacy hooks (v1)
                // nedded to access localstorage (injected hook generates an error when trying to access it from eval()'d code)
                window.addHook('pluginDrawTools', window.plugin.ingressplanner.updateDrawing);

                // yet to be converted to v2
                window.addHook('pluginKeysUpdateKey', window.plugin.ingressplanner.onUpdateKey);

// WebApp injected hooks (v2)
                $.each(window.VALID_HOOKS, function(hookIDX,hookName) {


                    if (typeof data.hooks[hookName] != 'undefined')
                    {
                        if (data.hooks[hookName] !== false)
                        {

                            var dataProvider = null;

                            if (typeof data.hooks[hookName] == 'string')
                            {
                                dataProvider = data.hooks[hookName];
                            }

                            window.addHook(hookName, function(payload) {

                                if (dataProvider)
                                {
                                    var payload=eval(dataProvider);
                                }

                                window.plugin.ingressplanner.sendMessage('runHook',{
                                    'hookName': hookName,
                                    'data': payload,
                                })
                            });

                        }
                        delete data.hooks[hookName];
                    }

                });

                if (data.hooks.length)
                {
                    var hookNames = Object.keys(data.hooks).join(', ');
                    console.error("%c" + window.plugin.ingressplanner.about.productname + " missing hooks: " + hookNames, 'background: #bb0; ');
                    alert(
                        'Something changhed in IITC or some of its plugins. ' 
                        + window.plugin.ingressplanner.about.productname
                        + ' could possibly nolonger work correctly, please check the G+ group!'
                        + "\n(missing hooks: "
                        + hookNames
                        + ')'
                    );
                }

                // add controls to toolbox
                $('#toolbox')
                    .append('<a onclick="window.plugin.ingressplanner.switchToSite();return false;">go to '+window.plugin.ingressplanner.about.productname+' Steps Tab</a>')
                ;
                
                // store Ingress Planner origin, used by sendMessage
                window.plugin.ingressplanner.ihOrigin = origin;

                // draw last data from IH
                window.plugin.ingressplanner.updateDrawingFromIH(data.drawing);

                break;

            case 'update-keys':
                var addCount = data.keys-(plugin.keys.keys[data.guid] || 0);
                window.plugin.keys.addKey(addCount, data.guid);
                break;

            case 'update-drawing':
                window.plugin.ingressplanner.updateDrawingFromIH(data.drawing);
                break;

            case 'center-drawing':
                    var ltngs = [];
                    $.each(JSON.parse(localStorage['plugin-draw-tools-layer']), function(index, item) {
                         if (typeof item.latLng != 'undefined')
                         {
                            ltngs.push([item.latLng.lat,item.latLng.lng]);
                         }

                         if (typeof item.latLngs != 'undefined')
                         {
                            $.each(item.latLngs, function(index2, latLngItem) {
                                 ltngs.push([latLngItem.lat,latLngItem.lng]);
                            });
                         }
                    });
                    if (ltngs.length)
                    {
                        map.fitBounds(ltngs);
                    }
                    break;

            case 'pan':

                if (typeof data.ll != 'undefined')
                {
                    map.panTo(data.ll);
                }

                if (typeof data.zoom != 'undefined')
                {
                    map.setZoom(data.zoom);
                }

                if (typeof data.portalguid != 'undefined')
                {
                    window.renderPortalDetails(data.portalguid);
                }

                break;

        }
    };

    self.updateDrawingFromIH = function(drawing) {

        if (drawing)
        {
            if (typeof drawing == 'string')
            {
                drawing = JSON.parse(drawing);
            }
        }
        else
        {
            drawing = [];
        }
        window.plugin.ingressplanner.updatingFromPlanner = true;

        window.plugin.drawTools.drawnItems.clearLayers();
        window.plugin.drawTools.import(drawing);
        window.plugin.drawTools.save();

        window.plugin.ingressplanner.updatingFromPlanner = false;

    };

    self.updateDrawing = function() {

        if (!!window.plugin.ingressplanner.updatingFromPlanner)
        {
            return;
        }

        //force immediate saving of drawing into localstorage
        window.plugin.drawTools.save();
        window.plugin.ingressplanner.sendMessage('update-drawing',localStorage['plugin-draw-tools-layer']);

    };


    self.onUpdateKey = function(data) {
         window.plugin.ingressplanner.sendMessage('update-keys',data);
    };


    self.setup = function init() {
    
        // add cross-domain message listener
        window.addEventListener('message', function(e) {
            if (typeof e.data['ingess-planner'] != 'undefined')
            {
                window.plugin.ingressplanner.receiveMessage(e.data['ingess-planner'],e.origin);
            }
        });
        
        // fire a ping when plugin is ready
        window.plugin.ingressplanner.sendMessage('ping',{version:window.plugin.ingressplanner.version});

        // delete self to ensure init can't be run again
        delete self.init;
    };

    // IITC plugin setup
    if (window.iitcLoaded && typeof self.setup === "function") {
        self.setup();
    } else if (window.bootPlugins) {
        window.bootPlugins.push(self.setup);
    } else {
        window.bootPlugins = [self.setup];
    }
}

// inject plugin into page
var script = document.createElement("script");
script.appendChild(document.createTextNode("(" + wrapper + ")();"));
(document.body || document.head || document.documentElement)
    .appendChild(script);

// PLUGIN END //////////////////////////////////////////////////////////