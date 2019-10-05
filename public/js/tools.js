/*
	UI module
*/

ingressplanner.tools = new (function() {

// private vars & functions

// exposed methods

	return {

		multilayer: function(
			plan,
			baseLink,
			rawtargets,
			portalsBlockedProgressCallBack,
			portalsSortingProgressCallBack,
			sequencesBuildingProgressCallBack,
			doneCallback
		)
		{

			var topSequences = [];
			var topLen = 0;

			if (!rawtargets.length)
			{
				doneCallback(topSequences,'no raw targets');
				return;
			}

			var baselinkPortals = false;
			var baselinkColor = null;

			var plannedLinks = $.map(plan.steps, function(step, planIDX) {

				if (step.type == 'link')
				{
					if (planIDX==baseLink)
					{
						baselinkPortals = step.portals.split('|');
						baselinkColor = step.color;
					}
					else
					{
						return step.portals;
					}
				}
				return null;
			});

			if (!baselinkPortals)
			{
				ingressplanner.error('Multilayer: Index',baseLink,'is not a link');
			}

			baseLink = baselinkPortals.join('|');
			var targets = [];

			// raw targets filtering
			var filterIdx = 0;
			portalsBlockedProgressCallBack(filterIdx,rawtargets.length);

			(function filterLoop() {

				var isGood = rawtargets[filterIdx];

				$.each(baselinkPortals, function(index, baselinkPortal) {

				    var tested = [rawtargets[filterIdx].llstring,baselinkPortal].join('|');

				    $.each(plannedLinks, function(i,plannedLink) {
				         if (ingressplanner.utils.intersect(tested, plannedLink))
				         {
				            isGood = null;
				            return false;
				         }
				    });

				    if (!isGood)
				    {
				        return false;
				    }

				});

				if (isGood)
				{
					targets.push(rawtargets[filterIdx]);
				}

				filterIdx++;
				portalsBlockedProgressCallBack(filterIdx,rawtargets.length);

				if (filterIdx < rawtargets.length) {
			        setTimeout(filterLoop, 0);
			    }
			    else if (!targets.length)
			    {
			    	doneCallback(topSequences,'no good targets');
			    	return;
			    }
			    else
			    {
					var containedCnt = 0;
			    	// calculating contained targets for each target
			    	var sortingIdx = 0;
			    	portalsSortingProgressCallBack(sortingIdx,targets.length);
			    	(function sortingLoop() {

		                targets[sortingIdx].contained = [];

		                var field = [baseLink,targets[sortingIdx].llstring].join('|');

		                $.each(targets, function(index2, tested) {
		                    if (
		                        index2 != sortingIdx
		                        && ingressplanner.utils.portalInField(tested.llstring,field)
		                    )
		                    {
								containedCnt++;
		                        targets[sortingIdx].contained.push(tested.llstring);
		                    }
		                });

					    sortingIdx++;
		                portalsSortingProgressCallBack(sortingIdx,targets.length);

					    if (sortingIdx < targets.length) {
					        setTimeout(sortingLoop, 0);
					    }
					    else
					    {

				            // sorting from inner to outer
				            targets.sort(function(a,b) { return a.contained.length - b.contained.length; } );

				            var llstringMap = {};
				            $.each(targets, function(idx,target) {
				                llstringMap[target.llstring] = idx;
				            });

					    	// building sequences, tracking max sequence lenght
				            var sequences = {};

				            var bsCnt = 0;

				            var totalBsIterations = targets.length + containedCnt;

				            function buildSequence(llstring)
				            {
				            	bsCnt++;
				            	sequencesBuildingProgressCallBack(bsCnt,totalBsIterations);
				            	
				                if (typeof sequences[llstring] == 'undefined')
				                {
				                    sequences[llstring] = [[llstring]];

				                    $.each(targets[llstringMap[llstring]].contained, function(containedIdx, contained) {

				                        buildSequence(contained);

				                        var maxlen = 0;

				                        $.each(sequences[contained], function(seqIdx, sequence) {

				                            if (sequence.length >= maxlen)
				                            {
				                                maxlen = sequence.length;
				                                sequences[llstring].push([llstring].concat(sequence));
				                            }

				                        });


				                    });

				                    sequences[llstring].sort(function(a,b) { return b.length - a.length; } );

				                    if (sequences[llstring][0].length>topLen)
				                    {
				                        topLen = sequences[llstring][0].length;
				                    }
				                }
				            }

				            var buildSequenceIdx = 0;

							(function buildSequenceLoop() {

								buildSequence(targets[buildSequenceIdx].llstring);
							    buildSequenceIdx++;

							    if (buildSequenceIdx < targets.length) {
							        setTimeout(buildSequenceLoop, 0);
							    }
							    else
							    {
						            // filtering only the toplen sequences found

						            $.each(targets, function(index, target) {

						                $.each(sequences[target.llstring], function(sIdx, sequence) {
						                     if (sequence.length == topLen)
						                     {
						                        topSequences.push(sequence.reverse());
						                     }
						                });
						            });

						            doneCallback({
						            	baselinkPortals: baselinkPortals,
						            	baselinkColor: baselinkColor,
						            	topSequences: topSequences.reverse(),
						            	topLen: topLen,
						            	targets:targets.length
						           	});

							    }
							})();
					    }
			    	})();
			    }
			})();
		},

		inGraphImport: function(file,doneCallback)
		{

			var reader = new FileReader();

			reader.onload = function(e) {

				var txt = reader.result;
				var links = [];

				if (txt)
				{
					var legend = {};
					

					$.each(txt.split('\r\n'), function(index, line) {

						var match = line.match(/(N\d+)\[label="(.+)", pos=".+"]/);
						if (match)
						{
							legend[match[1]] = match[2];
						}
						else
						{
							var match2 = line.match(/(N\d+)\s+->\s+(N\d+)/);
							if (match2)
							{
								links.push([legend[match2[1]],legend[match2[2]]].join('|'));
							}
						}
					});
				}
				doneCallback(links);
			}
			reader.readAsText(file);
		},

		inGraphExport: function(portals,planName)
		{

			var _parsed = {};
			var t = null;
			var r = null;
			var b = null;
			var l = null;

			$.each(portals, function(index, ll) {

				if (typeof _parsed[ll] == 'undefined')
				{
					var llparts = ll.split(',');

					var llobject = {
						lat: parseFloat(llparts[0]),
						lng: parseFloat(llparts[1])
					};

					_parsed[ll] = llobject;
					if (t == null || t < llobject.lat)
					{
						t = parseFloat(llobject.lat);
					}

					if (b == null || b > llobject.lat)
					{
						b = parseFloat(llobject.lat);
					}

					if (l == null || l > llobject.lng)
					{
						l = parseFloat(llobject.lng);
					}

					if (r == null || r < llobject.lng)
					{
						r = parseFloat(llobject.lng);
					}
					return true;
				}

			});

			var txt = 'digraph PortalLinks {\n';
			var index = 0;

			var w = 800;	// px
			var h = 600;	// px

			var dw = w / (r-l); // px/deg
			var dh = h / (t-b); // px/deg

			if (dw < dh)
			{
				var dd = dw;
			}
			else
			{
				var dd = dh;
			}

			$.each(_parsed, function(ll, llobject) {

				var x = (llobject.lng-l) * dd;
				var y = h - ((llobject.lat-b) * dd);
				txt += 
					'N' 
					+ (++index) 
					+ '[label="' 
					+ ll
					+ '", pos="(' 
					+ x + "," + y 
					+ ')"]\n'
				;
			});

			txt += '}';

			var blob = new Blob([txt], {'type':'text/plain'});
		    $('<a>')
		    	.attr({
			    	id: 		'gphDownload',
			    	href: 		window.URL.createObjectURL(blob),
			    	download: 	planName + '.gph'
			    })
			    .css('display','none')
			    .appendTo('body');

		    $('#gphDownload')[0].click();
			$('#gphDownload').remove();



		}
	}
})