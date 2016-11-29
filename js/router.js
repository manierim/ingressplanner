/*
	router module
*/

ingressplanner.router = new (function() {

	// private vars & functions

	var serviceDownWarning = null;
	var serviceDownAlertTimer = null;

	var routes = {};

	if(typeof(Storage) !== "undefined") 
	{

		var routesCache = sessionStorage.getItem('routes');

    	if (routesCache)
    	{
    		routes = JSON.parse(routesCache);
    	}
	}
	else
	{
	    ingressplanner.warn('No HTML5 Web Storage available');
	}

	function decodePolyline(routeGeometry) {

        var cs = polyline.decode(routeGeometry, 6),
           result = new Array(cs.length),
			i;
        for (i = cs.length - 1; i >= 0; i--) {
            result[i] = L.latLng(cs[i]);
		}
console.debug('decodePolyline',routeGeometry,result);
		return result;

	}

	function route(fromHash,toHash,callback)
	{
        var pfrom = fromHash.split(',').reverse().join(',');
        var pto = toHash.split(',').reverse().join(',');

		$.getJSON(
            '//router.project-osrm.org/route/v1/driving/'+ encodeURI(pfrom)+';'+encodeURI(pto)+'.json',
            {
                "alternatives": false,
                "steps": false,
                "annotations": false,
                "geometries": 'polyline6',
                "overview": 'simplified',
            },
			function(data,status)
			{

				if (status == 'success' && data.code=='Ok')
				{
					var route = {
						route_geometry: data.routes[0].geometry,
						//distance for the route, in meters
						distance: data.routes[0].distance,
						//estimated time for the route, in seconds
						time: data.routes[0].duration
					};
					callback(null,route);
				}
				else
				{
                    ingressplanner.error('route error',status,data);
					callback({data},null);
				}
			}
		);
	}

	var queue = {};

	function getHash(fromHash,toHash)
	{
		return [fromHash,toHash].join('|');
	}

	function queueRequest(fromHash, toHash,callback)
	{
		var serviceDownText = 'route preview/information not available at this time';
		var hash = getHash(fromHash,toHash);

		if (typeof routes[hash]!='undefined')
		{
			callback(routes[hash]);
		}
		else
		{
			if (typeof queue[hash] == 'undefined')
			{
				queue[hash] = [];
			}

			queue[hash].push(callback);

			if ((!serviceDownWarning) && (!serviceDownAlertTimer))
			{
				serviceDownAlertTimer = setTimeout(
					function() {
						serviceDownWarning = true;
						bootbox.alert('OSRM public routing engine is down, ' + serviceDownText);
					},
                    5000
				);
			}

			route(
				fromHash,
				toHash,
				function(err,route) {

					clearTimeout(serviceDownAlertTimer);
					serviceDownAlertTimer = null;

					if (err)
					{
						if ((!serviceDownWarning))
						{
							serviceDownWarning = true;
							bootbox.alert('OSRM public routing engine error, ' + serviceDownText);
							ingressplanner.warn('OSRM public routing engine error',err,route);
						}
					}
					else
					{
						routes[hash] = route;

						sessionStorage.setItem('routes',JSON.stringify(routes));

						while (callback = queue[hash].shift())
						{
							callback(routes[hash]);
						}
					}
				}
			);
		}
	}

	return {

		getSummary: function(fromHash,toHash,callback)
		{
			var hash = getHash(fromHash,toHash);

			if (typeof routes[hash]=='undefined')
			{
				if (typeof callback != 'undefined')
				{
					queueRequest(fromHash, toHash, function(route) {
						callback({
							distance: route.distance,
							time: route.time,
						});
					});
				}
				return null;
			}
			else
			{
				return {
					distance: routes[hash].distance,
					time: routes[hash].time,
				};
			}


		},

		addRoutePoly: function(fromHash,toHash,layer,options)
		{
			var hash = getHash(fromHash,toHash);

			if (typeof routes[hash]=='undefined')
			{
				var pl = new L.polyline([L.latLng(fromHash.split(',')),L.latLng(toHash.split(','))],options);
				layer.addLayer(pl);

				queueRequest(fromHash, toHash, function(route) {
					pl.setLatLngs(decodePolyline(route.route_geometry));
				});

			}
			else
			{
				layer.addLayer(L.polyline(decodePolyline(routes[hash].route_geometry),options));
			}

		},
	};

})();