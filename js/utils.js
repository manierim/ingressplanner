/*
	utilities module
*/

ingressplanner.utils = new (function() {

// private vars & functions

	R = 6371000; // gives d in metres

	// named colors

	var colorsByHex = {

		"#A24AC3": "DrawTools #1",
		"#514AC3": "DrawTools #2",
		"#4AA8C3": "DrawTools #3",
		"#51C34A": "DrawTools #4",
		"#C1C34A": "DrawTools #5",
		"#C38A4A": "DrawTools #6",
		"#C34A4A": "DrawTools #7",
		"#C34A6F": "DrawTools #8",
		"#000000": "Black",
		"#666666": "DrawTools #10",
		"#BBBBBB": "DrawTools #11",
		"#FFFFFF": "White",

/*
		"#F0F8FF": "AliceBlue",
		"#FAEBD7": "AntiqueWhite",
		"#00FFFF": "Cyan",
		"#7FFFD4": "Aquamarine",
		"#F0FFFF": "Azure",
		"#F5F5DC": "Beige",
		"#FFE4C4": "Bisque",
		"#FFEBCD": "BlanchedAlmond",
		"#0000FF": "Blue",
		"#8A2BE2": "BlueViolet",
		"#A52A2A": "Brown",
		"#DEB887": "BurlyWood",
		"#5F9EA0": "CadetBlue",
		"#7FFF00": "Chartreuse",
		"#D2691E": "Chocolate",
		"#FF7F50": "Coral",
		"#6495ED": "CornflowerBlue",
		"#FFF8DC": "Cornsilk",
		"#DC143C": "Crimson",
		"#00008B": "DarkBlue",
		"#008B8B": "DarkCyan",
		"#B8860B": "DarkGoldenRod",
		"#A9A9A9": "DarkGray",
		"#006400": "DarkGreen",
		"#BDB76B": "DarkKhaki",
		"#8B008B": "DarkMagenta",
		"#556B2F": "DarkOliveGreen",
		"#FF8C00": "DarkOrange",
		"#9932CC": "DarkOrchid",
		"#8B0000": "DarkRed",
		"#E9967A": "DarkSalmon",
		"#8FBC8F": "DarkSeaGreen",
		"#483D8B": "DarkSlateBlue",
		"#2F4F4F": "DarkSlateGray",
		"#00CED1": "DarkTurquoise",
		"#9400D3": "DarkViolet",
		"#FF1493": "DeepPink",
		"#00BFFF": "DeepSkyBlue",
		"#696969": "DimGray",
		"#1E90FF": "DodgerBlue",
		"#B22222": "FireBrick",
		"#FFFAF0": "FloralWhite",
		"#228B22": "ForestGreen",
		"#FF00FF": "Magenta",
		"#DCDCDC": "Gainsboro",
		"#F8F8FF": "GhostWhite",
		"#FFD700": "Gold",
		"#DAA520": "GoldenRod",
		"#808080": "Gray",
		"#008000": "Green",
		"#ADFF2F": "GreenYellow",
		"#F0FFF0": "HoneyDew",
		"#FF69B4": "HotPink",
		"#CD5C5C": "IndianRed",
		"#4B0082": "Indigo",
		"#FFFFF0": "Ivory",
		"#F0E68C": "Khaki",
		"#E6E6FA": "Lavender",
		"#FFF0F5": "LavenderBlush",
		"#7CFC00": "LawnGreen",
		"#FFFACD": "LemonChiffon",
		"#ADD8E6": "LightBlue",
		"#F08080": "LightCoral",
		"#E0FFFF": "LightCyan",
		"#FAFAD2": "LightGoldenRodYellow",
		"#D3D3D3": "LightGray",
		"#90EE90": "LightGreen",
		"#FFB6C1": "LightPink",
		"#FFA07A": "LightSalmon",
		"#20B2AA": "LightSeaGreen",
		"#87CEFA": "LightSkyBlue",
		"#778899": "LightSlateGray",
		"#B0C4DE": "LightSteelBlue",
		"#FFFFE0": "LightYellow",
		"#00FF00": "Lime",
		"#32CD32": "LimeGreen",
		"#FAF0E6": "Linen",
		"#800000": "Maroon",
		"#66CDAA": "MediumAquaMarine",
		"#0000CD": "MediumBlue",
		"#BA55D3": "MediumOrchid",
		"#9370DB": "MediumPurple",
		"#3CB371": "MediumSeaGreen",
		"#7B68EE": "MediumSlateBlue",
		"#00FA9A": "MediumSpringGreen",
		"#48D1CC": "MediumTurquoise",
		"#C71585": "MediumVioletRed",
		"#191970": "MidnightBlue",
		"#F5FFFA": "MintCream",
		"#FFE4E1": "MistyRose",
		"#FFE4B5": "Moccasin",
		"#FFDEAD": "NavajoWhite",
		"#000080": "Navy",
		"#FDF5E6": "OldLace",
		"#808000": "Olive",
		"#6B8E23": "OliveDrab",
		"#FFA500": "Orange",
		"#FF4500": "OrangeRed",
		"#DA70D6": "Orchid",
		"#EEE8AA": "PaleGoldenRod",
		"#98FB98": "PaleGreen",
		"#AFEEEE": "PaleTurquoise",
		"#DB7093": "PaleVioletRed",
		"#FFEFD5": "PapayaWhip",
		"#FFDAB9": "PeachPuff",
		"#CD853F": "Peru",
		"#FFC0CB": "Pink",
		"#DDA0DD": "Plum",
		"#B0E0E6": "PowderBlue",
		"#800080": "Purple",
		"#663399": "RebeccaPurple",
		"#FF0000": "Red",
		"#BC8F8F": "RosyBrown",
		"#4169E1": "RoyalBlue",
		"#8B4513": "SaddleBrown",
		"#FA8072": "Salmon",
		"#F4A460": "SandyBrown",
		"#2E8B57": "SeaGreen",
		"#FFF5EE": "SeaShell",
		"#A0522D": "Sienna",
		"#C0C0C0": "Silver",
		"#87CEEB": "SkyBlue",
		"#6A5ACD": "SlateBlue",
		"#708090": "SlateGray",
		"#FFFAFA": "Snow",
		"#00FF7F": "SpringGreen",
		"#4682B4": "SteelBlue",
		"#D2B48C": "Tan",
		"#008080": "Teal",
		"#D8BFD8": "Thistle",
		"#FF6347": "Tomato",
		"#40E0D0": "Turquoise",
		"#EE82EE": "Violet",
		"#F5DEB3": "Wheat",
		"#F5F5F5": "WhiteSmoke",
		"#FFFF00": "Yellow",
		"#9ACD32": "YellowGreen"
*/
	}

	var colorsByName = {};

	$.each(colorsByHex, function(hex, name) {
		 colorsByName[name] = hex;
	});

	// cache calculated geodesic lines
	var GeodesicLines = {};

	// class to hold the pre-calculated maths for a geodesic line
	GeodesicLine = function(start,end) 
	{

	    var d2r = Math.PI/180.0;
	    var r2d = 180.0/Math.PI;

	    // maths based on http://williams.best.vwh.net/avform.htm#Int

	    if (start.lng == end.lng) {
	        throw 'Error: cannot calculate latitude for meridians';
	    }

	    // only the variables needed to calculate a latitude for a given longitude are stored in 'this'
	    this.lat1 = start.lat * d2r;
	    this.lat2 = end.lat * d2r;
	    this.lng1 = start.lng * d2r;
	    this.lng2 = end.lng * d2r;

	    var dLng = this.lng1-this.lng2;

	    var sinLat1 = Math.sin(this.lat1);
	    var sinLat2 = Math.sin(this.lat2);
	    var cosLat1 = Math.cos(this.lat1);
	    var cosLat2 = Math.cos(this.lat2);

	    this.sinLat1CosLat2 = sinLat1*cosLat2;
	    this.sinLat2CosLat1 = sinLat2*cosLat1;

	    this.cosLat1CosLat2SinDLng = cosLat1*cosLat2*Math.sin(dLng);
	}

	GeodesicLine.prototype.isMeridian = function() 
	{
	    return this.lng1 == this.lng2;
	}

	GeodesicLine.prototype.latAtLng = function(lng) 
	{
	    lng = lng * Math.PI / 180; //to radians

	    var lat;
	    // if we're testing the start/end point, return that directly rather than calculating
	    // 1. this may be fractionally faster, no complex maths
	    // 2. there's odd rounding issues that occur on some browsers (noticed on IITC MObile) for very short links - this may help
	    if (lng == this.lng1) {
	        lat = this.lat1;
	    } 
	    else if (lng == this.lng2) 
	    {
	        lat = this.lat2;
	    } 
	    else 
	    {
	        lat = Math.atan ( (this.sinLat1CosLat2*Math.sin(lng-this.lng2) - this.sinLat2CosLat1*Math.sin(lng-this.lng1)) / this.cosLat1CosLat2SinDLng);
	    }
	    return lat * 180 / Math.PI; // return value in degrees
	}


// exposed methods
	return {

		// return the Name of the color given its hex if it exists
		colorName: function(hex)
		{
			hex = hex.toUpperCase();

			if (typeof colorsByHex[hex] != 'undefined')
			{
				return colorsByHex[hex];
			}
		},

		// return the Hex of the color given its Name if it exists
		colorHex: function(name)
		{

			if (typeof colorsByName[name] != 'undefined')
			{
				return colorsByName[name];
			}
		},

		colors: function()
		{
			return Object.keys(colorsByHex);
		},

		// get a "lat,lng" string from a latLng object or from a collection of them "lat,lng-lat,lng[...]"
		llstring:function(latLng,sort)
		{
		    if (typeof latLng.lat != 'undefined' && typeof latLng.lng != 'undefined')
		    {
		        return latLng.lat + ',' + latLng.lng;
		    }
		    else
		    {
		        latLng = $.map(latLng, function(point) {
		            return ingressplanner.utils.llstring(point);
		        });

		        if (typeof sort == 'undefined' || sort)
		        {
		            latLng.sort();
		        }

		        return latLng.join('|');
		        
		    }
		        
		},

		// reverse of the previous: recreate a latLng object (simple or complete) from a string
		llobject: function(latLng, simple)
		{

		    if (typeof simple == 'undefined')
		    {
		        simple = true;
		    }

		    latLng = latLng.split('|');

		    if (latLng.length>1)
		    {
		        return $.map(latLng, function(item) {
		            return ingressplanner.utils.llobject(item, simple);
		        });
		    }
		    else
		    {
		        latLng = latLng[0].split(',');

		        var obj = {
		            lat: latLng[0],
		            lng: latLng[1],
		        };

		        if (!simple)
		        {
		            obj.equals = function (obj) { // (LatLng) -> Boolean
		                if (!obj) { return false; }

		                var margin = Math.max(
		                        Math.abs(this.lat - obj.lat),
		                        Math.abs(this.lng - obj.lng));

		                return margin <= 1e-9;
		            };
		        }
		        return obj;
		    }

		},

		// make a swallow copy of a portal data (mainly to de-reference from the original portal object)
		clonePortalData: function(portal)
		{

		    var clone = {};

		    $.each([
		    	// from IITC
		        'guid',
		        'title',
		        'resCount',
		        'keys',
		        'image',
		        // calculated-originated in Ingress Planner
		        'llstring',
		        'timestamp',
		        'teamDECODED',
		        'linksOut',
		        'linksIn',
		        'keysUsed',
		        'keysFarmed',
		    ], function(index, key) {
		         if (typeof portal[key] != 'undefined')
		         {
		            clone[key] = portal[key];
		         }
		    });

		    return clone;

		},

		toRad: function(x) {
		    return parseFloat(x) * Math.PI / 180;
		},

		// https://github.com/substack/point-in-polygon
		portalInPolygon: function(portal,LatLngsObjectsArray)
		{
			var portalCoords = portal.split(',');

		    var x = portalCoords[0], y = portalCoords[1];
		    
		    var inside = false;
		    for (var i = 0, j = LatLngsObjectsArray.length - 1; i < LatLngsObjectsArray.length; j = i++) {
		        var xi = LatLngsObjectsArray[i]['lat'], yi = LatLngsObjectsArray[i]['lng'];
		        var xj = LatLngsObjectsArray[j]['lat'], yj = LatLngsObjectsArray[j]['lng'];
		        
		        var intersect = ((yi > y) != (yj > y))
		            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
		        if (intersect) inside = !inside;
		    }

		    return inside;
		},

		// based on http://stackoverflow.com/questions/2049582/how-to-determine-a-point-in-a-triangle
		portalInField: function(portal,field)
		{

		    var v = [];

		    var onEdge = false;

		    $.each(field.split('|'), function(index, val) {
		        if (portal==val)
		        {
		            onEdge = true;
		        }
		        v[index] = val.split(',');
		    });

		    if (onEdge)
		    {
		        return false;
		    }

		    portal = portal.split(',');

		    this.sign = function (p1,p2,p3) 
		    {
		        //     (p1.x  - p3.x)  * (p2.y -  p3.y) -  (p2.x -  p3.x) *  (p1.y -  p3.y)
		        return (p1[0] - p3[0]) * (p2[1] - p3[1]) - (p2[0] - p3[0]) * (p1[1] - p3[1]);
		    };

		    var b1 = (this.sign(portal, v[0], v[1]) < 0);
		    var b2 = (this.sign(portal, v[1], v[2]) < 0);
		    var b3 = (this.sign(portal, v[2], v[0]) < 0);

		    return ((b1 == b2) && (b2 == b3));
		},

		distance: function(hash1,hash2)
		{
			var p1 = hash1.split(',');
			var p2 = hash2.split(',');
            // Spherical Law of Cosines - from http://www.movable-type.co.uk/scripts/latlong.html
            var φ1 = ingressplanner.utils.toRad(p2[0]), 
            	φ2 = ingressplanner.utils.toRad(p1[0]), 
            	Δλ = ingressplanner.utils.toRad(p1[1]-p2[1]);

            return Math.acos( Math.sin(φ1)*Math.sin(φ2) + Math.cos(φ1)*Math.cos(φ2) * Math.cos(Δλ) ) * R;
		},

		intersect: function(link1Hash,link2Hash) 
		{

		    var portals = link1Hash.split('|');
		    var a0 = ingressplanner.utils.llobject(portals[0],false);
		    var a1 = ingressplanner.utils.llobject(portals[1],false);

		    var portals = link2Hash.split('|');
		    var b0 = ingressplanner.utils.llobject(portals[0],false);
		    var b1 = ingressplanner.utils.llobject(portals[1],false);

		    // based on the formula at http://williams.best.vwh.net/avform.htm#Int

		    // method:
		    // check to ensure no line segment is zero length - if so, cannot cross
		    // check to see if either of the lines start/end at the same point. if so, then they cannot cross
		    // check to see if the line segments overlap in longitude. if not, no crossing
		    // if overlap, clip each line to the overlapping longitudes, then see if latitudes cross 

		    // anti-meridian handling. this code will not sensibly handle a case where one point is
		    // close to -180 degrees and the other +180 degrees. unwrap coordinates in this case, so one point
		    // is beyond +-180 degrees. this is already true in IITC
		    // FIXME? if the two lines have been 'unwrapped' differently - one positive, one negative - it will fail

		    // zero length line tests
		    if (a0.equals(a1)) return false;
		    if (b0.equals(b1)) return false;

		    // lines have a common point
		    if (a0.equals(b0) || a0.equals(b1)) return false;
		    if (a1.equals(b0) || a1.equals(b1)) return false;


		    // check for 'horizontal' overlap in lngitude
		    if (Math.min(a0.lng,a1.lng) > Math.max(b0.lng,b1.lng)) return false;
		    if (Math.max(a0.lng,a1.lng) < Math.min(b0.lng,b1.lng)) return false;


		    // ok, our two lines have some horizontal overlap in longitude
		    // 1. calculate the overlapping min/max longitude
		    // 2. calculate each line latitude at each point
		    // 3. if latitudes change place between overlapping range, the lines cross

		    // calculate the longitude of the overlapping region
		    var leftLng = Math.max( Math.min(a0.lng,a1.lng), Math.min(b0.lng,b1.lng) );
		    var rightLng = Math.min( Math.max(a0.lng,a1.lng), Math.max(b0.lng,b1.lng) );

		    // calculate the latitudes for each line at left + right longitudes
		    // NOTE: need a special case for meridians - as GeodesicLine.latAtLng method is invalid in that case
		    var aLeftLat, aRightLat;
		    if (a0.lng == a1.lng) 
		    {
		        // 'left' and 'right' now become 'top' and 'bottom' (in some order) - which is fine for the below intersection code
		        aLeftLat = a0.lat;
		        aRightLat = a1.lat;
		    } 
		    else 
		    {
		        if (typeof GeodesicLines[link1Hash] == 'undefined')
		        {
		            GeodesicLines[link1Hash] = new GeodesicLine(a0,a1);
		        }
		        var aGeo = GeodesicLines[link1Hash];
		        aLeftLat = aGeo.latAtLng(leftLng);
		        aRightLat = aGeo.latAtLng(rightLng);
		    }

		    var bLeftLat, bRightLat;
		    if (b0.lng == b1.lng) 
		    {
		        // 'left' and 'right' now become 'top' and 'bottom' (in some order) - which is fine for the below intersection code
		        bLeftLat = b0.lat;
		        bRightLat = b1.lat;
		    } 
		    else 
		    {

		        if (typeof GeodesicLines[link2Hash] == 'undefined')
		        {
		            GeodesicLines[link2Hash] = new GeodesicLine(b0,b1);
		        }
		        var bGeo = GeodesicLines[link2Hash];
		        bLeftLat = bGeo.latAtLng(leftLng);
		        bRightLat = bGeo.latAtLng(rightLng);
		    }

		    // if both a are less or greater than both b, then lines do not cross

		    if (aLeftLat < bLeftLat && aRightLat < bRightLat) return false;
		    if (aLeftLat > bLeftLat && aRightLat > bRightLat) return false;

		    // latitudes cross between left and right - so geodesic lines cross
		    return true;
		},

		// Multiline Function String - Nate Ferrero - Public Domain
		// http://stackoverflow.com/a/14496573

		heredoc: function(f) {
		    return f.toString().match(/\/\*\s*([\s\S]*?)\s*\*\//m)[1];
		},

	};

})