/*
	gameworld module
*/

ingressplanner.gameworld = new (function() {

	// private vars & functions

	var portals =  {};
	var portalsByllstring = {};

	var links = {};
	var linksByPortalLLstring = {};

	var fields = {};
	var fieldsByPortalLLstring = {};

	function teamName(fromiitc,what)
	{
	    var internal = fromiitc;

	    switch (fromiitc)
	    {
	        case 'E':
	        case 'ENLIGHTENED':
	            internal = 'ENLIGHTENED';
	            break;

	        case 'R':
	        case 'RESISTANCE':
	            internal = 'RESISTANCE';
	            break;

	        case 'N':
	        case 'NEUTRAL':
	            internal = 'NEUTRAL';
	            break;

	        default:
	        	ingress.error('unknown '+what+' team "'+fromiitc+'"');
	            break;
	    }

	    return internal;

	};

	function loadData(data,lastMapDataRefreshStartPayload)
	{
		var updateMap = false;

		if (typeof data.links != 'undefined')
		{
			$.each(data.links, function(linkIDX, link) {
				if (addLink(link))
				{
					updateMap = true;
				}
			});
			
		}

		if (typeof data.fields != 'undefined')
		{
			$.each(data.fields, function(fieldIDX, field) {
				if (addField(field))
				{
					updateMap = true;
				}
			});
		}

		if (typeof data.portals != 'undefined')
		{
			var updateBounds = null;
			if (typeof lastMapDataRefreshStartPayload != 'undefined')
			{
				updateBounds = L.bounds(
					L.point(
						lastMapDataRefreshStartPayload.bounds._northEast.lat,
						lastMapDataRefreshStartPayload.bounds._northEast.lng
					),
					L.point(
						lastMapDataRefreshStartPayload.bounds._southWest.lat,
						lastMapDataRefreshStartPayload.bounds._southWest.lng
					)
				);
			}

			$.each(data.portals, function(portalIDX,portal) {
				if (addPortal(portal,updateBounds))
				{
					updateMap = true;
				}
			});
		}

		return updateMap;
	};

	function addLink(link)
	{
		var updated = false;

		link.teamDECODED = teamName(link.team,'link');
		link.llstring = ingressplanner.utils.llstring(link._latlngsinit,true);

		if (typeof links[link.guid] == 'undefined')
		{
			updated = true;

			links[link.guid] = link;

			$.each(link.llstring.split('|'), function(index, portalLLstring) {

				if (typeof linksByPortalLLstring[portalLLstring] == 'undefined')
				{
					linksByPortalLLstring[portalLLstring] = [];
				}

				if (linksByPortalLLstring[portalLLstring].indexOf(link.guid)==-1)
				{
					linksByPortalLLstring[portalLLstring].push(link.guid);
				}
					
			});

		}

		return updated;

	};

	function addField(field)
	{

		var updated = false;

		if (typeof fields[field.guid] == 'undefined')
		{
			updated = true;

			field.teamDECODED = teamName(field.team,'field');
			field.llstring = ingressplanner.utils.llstring(field._latlngsinit,true);
			fields[field.guid] = field;

			$.each(field.llstring.split('|'), function(index, portalLLstring) {

				if (typeof fieldsByPortalLLstring[portalLLstring] == 'undefined')
				{
					fieldsByPortalLLstring[portalLLstring] = [];
				}

				if (fieldsByPortalLLstring[portalLLstring].indexOf(field.guid)==-1)
				{
					fieldsByPortalLLstring[portalLLstring].push(field.guid);
				}

			});
		}

		return updated;

	};

	function addPortal(portal, updateBounds)
	{

		var updated = false;

		// "fake portals" have partial portal, links and fields data
		var fake = (typeof portal.title == 'undefined');

		portal.teamDECODED = teamName(portal.team,'portal');
		portal.llstring = ingressplanner.utils.llstring(portal.latlng);

		if (typeof portals[portal.guid] != 'undefined')
		{
			$.each(Object.keys(portal), function(index, propertyName) {

				switch (propertyName)
				{
					case 'title':
					case 'llstring':
					case 'teamDECODED':
					case 'resCount':
					case 'keys':
						if (
							typeof portal[propertyName] != 'undefined'
							&& (
								typeof portals[portal.guid][propertyName] == 'undefined'
								|| portals[portal.guid][propertyName] != portal[propertyName]
							)
						)
						{
							updated = true;
						}
						break;

				}

				if (
					typeof portal[propertyName] == 'undefined'
				 	&& typeof portals[portal.guid][propertyName] != 'undefined'
				)
				{
				 	portal[propertyName] = portals[portal.guid][propertyName];
				}
			});
		}
		else
		{
			updated = true;
		}

		portals[portal.guid] = portal;
		portalsByllstring[portal.llstring] = portal.guid;

		var portal_links = [];

		$.each(['in','out'], function(dummyIDX1, direction) {
			$.each(portal.links[direction], function(dummyIDX2, linkguid) {
				portal_links.push(linkguid);
			});
		});

		// can we assume links & fields listed are complete?
		var canDelete = true;

		if (fake)
		{
			// it's a fake portal
			if (updateBounds && (!updateBounds.contains(L.point(
				portal.latlng.lat,
				portal.latlng.lng
			))))
			{
				// and it's outside the map bounds, links & fields listed could not be complete
				canDelete = false;
			}

		}

		if (typeof linksByPortalLLstring[portal.llstring] != 'undefined')
		{

			$.each(linksByPortalLLstring[portal.llstring], function(index, linkguid) {
				 if (portal_links.indexOf(linkguid)==-1 && typeof links[linkguid] != 'undefined')
				 {
				 	if (canDelete)
				 	{
				 		updated = true;
					 	delete links[linkguid];
					}
					else
					{
						portal_links.push(linkguid);
					}
				 }
			});

			if (!updated)
			{
				updated = linksByPortalLLstring[portal.llstring].length != portal_links.length;
			}

			if (!updated)
			{
				$.each(portal_links, function(index, linkguid) {
					 if (linksByPortalLLstring[portal.llstring].indexOf(linkguid)==-1)
					 {
						updated = true;
						return false;
					 }
				});
			}

		}
		else if (portal_links.length)
		{
			updated = true;
		}

		linksByPortalLLstring[portal.llstring] = portal_links;

		if (typeof fieldsByPortalLLstring[portal.llstring] != 'undefined')
		{
			$.each(fieldsByPortalLLstring[portal.llstring], function(index, fieldguid) {
				 if (portal.fields.indexOf(fieldguid)==-1 && typeof fields[fieldguid] != 'undefined')
				 {
				 	if (canDelete)
				 	{
				 		updated = true;
					 	delete fields[fieldguid];
				 	}
				 	else
				 	{
						portal.fields.push(fieldguid);
				 	}
				 }
			});

			if (!updated)
			{
				updated = fieldsByPortalLLstring[portal.llstring].length != portal.fields.length;
			}

			if (!updated)
			{
				$.each(portal.fields, function(index, fieldguid) {
					 if (fieldsByPortalLLstring[portal.llstring].indexOf(fieldguid)==-1)
					 {
						updated = true;
						return false;
					 }
				});
			}

		}
		else if (portal.fields.length)
		{
			updated = true;
		}

		fieldsByPortalLLstring[portal.guid] = portal.fields;

		return updated;

	};

	if(typeof(Storage) !== "undefined") 
	{
		var gwCache = sessionStorage.getItem('gameworld');
    	if (gwCache)
    	{
    		gwCache = JSON.parse(gwCache);
    		loadData(gwCache);
    	}

	}
	else
	{
	    ingressplanner.warn('No HTML5 Web Storage available');
	};

	return {

		Now: function()
		{
			return {
				links: links,
				fields: fields,
			}
		},

		portalGUIDByllstring: function(llstring)
		{
			if (
                typeof portalsByllstring[llstring] != 'undefined'
            )
			{
				return portalsByllstring[llstring];
			}
			return false;
		},

		getPortalByllstring: function(llstring)
		{
			var guid = ingressplanner.gameworld.portalGUIDByllstring(llstring);
			if (guid)
			{
				return portals[guid];
			}
			return false;
		},

		portalsInRanges: function(ranges, progressCallBack,doneCallBack)
		{
			var inRanges = {};

			var guids = Object.keys(portals);
			var total = guids.length;

			var portalIdx = 0;
	    	progressCallBack(portalIdx,total);

	    	(function checkLoop() {

	    		var guid = guids[portalIdx];
	    		var portal = portals[guid];

				if (typeof inRanges[guid] == 'undefined')
				{
					$.each(ranges, function(index, range) {

						switch(range.type)
						{
							case 'circle':
								var target = portal.llstring.split(',');
		                        // Spherical Law of Cosines - from http://www.movable-type.co.uk/scripts/latlong.html
		                        var φ1 = ingressplanner.utils.toRad(range.latLng.lat), 
		                        	φ2 = ingressplanner.utils.toRad(target[0]), 
		                        	Δλ = ingressplanner.utils.toRad(target[1]-range.latLng.lng), 
		                        	R = 6371000; // gives d in metres

		                        distance = ingressplanner.utils.distance(portal.llstring,[range.latLng.lat,range.latLng.lng].join(','));

		                        if (distance <= range.radius)
		                        {
		                        	inRanges[guid] = portal;
		                        	return true;
		                        }
								break;

							case 'polygon':
								if (ingressplanner.utils.portalInPolygon(portal.llstring,range.latLngs))
								{
		                        	inRanges[guid] = portal;
		                        	return true;
								}
								break;


							default:
								ingressplanner.error('portalsInRanges() unmanaged range type',range);
								break;
						}
					});				 

				}

	    		portalIdx++;
	    		progressCallBack(portalIdx,total);

	    		if (portalIdx < total)
	    		{
	    			setTimeout(checkLoop, 0);
	    		}
	    		else
	    		{
	    			doneCallBack(
	    				$.map(inRanges, function(portal) {
							return portal;
						})
					)
	    		}

	    	})();

		},

		hashToNames: function(hash)
		{
			if (typeof hash == 'string')
			{
				hash = hash.split('|');
			}
		    return $.map(hash, function(item, index) {
		        var name = item;
		        if (
		            typeof portalsByllstring[item] != 'undefined'
		            && typeof portals[portalsByllstring[item]] != 'undefined'
		            && typeof portals[portalsByllstring[item]].title != 'undefined'
		        )
		        {
		            name = portals[portalsByllstring[item]].title;
		        }
		        return name;
		    }).join('-');
		},

		normalizeTeamName: function(fromiitc,what)
		{
			return teamName(fromiitc,what);
		},

		updateKeys: function(data)
		{

	        if (typeof portals[data.guid] != 'undefined')
	        {
	            portals[data.guid].keys = data.count;
	        }

		},

		update: function(data,lastMapDataRefreshStartPayload)
		{

			var updateMap = loadData(data,lastMapDataRefreshStartPayload);

			if (updateMap && typeof(Storage) !== "undefined") 
			{

				sessionStorage.setItem('gameworld',JSON.stringify({
					portals: portals,
					links: links,
					fields: fields,
				}));
			}

			return updateMap;
		},

		dataProvider: function() {
			return ingressplanner.utils.heredoc(function(){/*
({
    links: $.map(window.links,function(link,guid) {
        return {
            team:           link.options.data.team,
            _latlngsinit:   link._latlngsinit,
            guid:           guid
        };
    }),

    fields: $.map(window.fields, function(field,guid) {
        return {
            team:           field.options.data.team,
            _latlngsinit:   field._latlngsinit,
            guid:           guid,
            points:         field.options.data.points,
        };
    }),

    portals: $.map(window.portals,function (val,i) { 
    	return {
            latlng:     val._latlng,
            guid:       val.options.guid,
            title:      val.options.data.title,
            team:       val.options.data.team,
            level:      val.options.data.level,
            health:     val.options.data.health,
            resCount:   val.options.data.resCount,
            fields:     window.getPortalFields(val.options.guid),
            links:      window.getPortalLinks(val.options.guid),
            keys:       plugin.keys.keys[val.options.guid] || 0,
            image:      val.options.data.image
    	}; 
    })
})
*/})
		}

	}
})
