/*
	router module
*/

ingressplanner.router = new (function() {

	// private vars & functions

	var serviceDownWarning = null;
	var serviceDownAlertTimer = null;

	var router = L.Routing.osrm();

	var routes = {};
	var routeCacheCnt=0;

	if(typeof(Storage) !== "undefined") 
	{

		var routesCache = sessionStorage.getItem('routes');

    	if (routesCache)
    	{
    		$.each(JSON.parse(routesCache), function(hash, data) {

    			if (!(data instanceof Array))
    			{
    				data.coordinates = $.map(data.coordinates, function(coord) {
				 		return L.latLng(coord);
				 	});
	    			routes[hash] = data;
	    			routeCacheCnt++;
    			}
    		});
    	}

	}
	else
	{
	    ingressplanner.warn('No HTML5 Web Storage available');
	};

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
					}
					,5000
				);
			}

			router.route(
				[
					new L.Routing.Waypoint(L.latLng(fromHash.split(','))),
					new L.Routing.Waypoint(L.latLng(toHash.split(',')))
				],

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
						routes[hash] = {
							coordinates: route[0].coordinates,
							//distance for the route, in meters
							distance: route[0].summary.totalDistance,
							//estimated time for the route, in seconds
							time: route[0].summary.totalTime,
						};

						sessionStorage.setItem('routes',JSON.stringify(routes));

						while (callback = queue[hash].shift())
						{
							callback(routes[hash]);
						}
					}
				},
				null,
				{
					geometryOnly: true
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
					pl.setLatLngs(route.coordinates);
				});

			}
			else
			{
				layer.addLayer(L.polyline(routes[hash].coordinates,options));
			}

		},
	}

})
