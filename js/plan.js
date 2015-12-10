/*
	plan module
*/

ingressplanner.plan = new (function() {

// private vars & functions

	var eventHandler = null;

	// defaults (TODO: stored/move in user/plan cfg )

		// default color
		var defaultColor = '#a24ac3';

		// max linkout with 4 SBULA (8 standard + 4*8 additional)
		var maxLinkOutErr = 40;
		// max linkout without SBULA
		var maxLinkOutWarn = 8;

	function analyzePlan(plan, playerTeam, opponentTeam)
	{

		// will store the list of portal touched by the plan and their current state through the plan, indexed by llstring
		plan.Portals = {};

		plan.colors = {};

		// will store the current links & fields as the plan will drop or create them, indexed by llstring
		var worldLinks = {};
		var worldFields = {};

		// if we are not in high level planning
		if (!plan.options.HLPlanning)
		{
			// populate them with the current know situation
			var gw = ingressplanner.gameworld.Now()
			$.each(gw.links, function() {
				worldLinks[this.llstring] = this;
			});
			$.each(gw.fields, function() {
				worldFields[this.llstring] = this;
			});

		}

		// will store the links & fields dropped by the plan with a reference to the planIDX, indexed by llstring
		var droppedLinks = {};
		var droppedFields = {};

		// flag and remove bad steps
		var good = $.map(plan.steps, function(step,planIDX) {
			var stepPortals = step.portals.split('|');
			if (stepPortals.length==2 && stepPortals[0]==stepPortals[1])
			{
				// this is an undetected error, a link with same origin and detsination
				ingressplanner.warn('Step',planIDX,'is a "false" link and will be removed',step);
				return null;
			}
			return step;
		});

		plan.steps = good;
		delete good;

		// used to detect a stop to a new portal (different from previous one)
		var lastVisited = null;


		$.each(plan.steps, function(planIDX, step) {

			// convert step color information from legacy drawing object if needed
			if (typeof step.color == 'undefined')
			{
				if (typeof step.drawing != 'undefined')
				{
					if (typeof step.drawing.color != 'undefined')
					{
						step.color = step.drawing.color;
					}
					delete step.drawing;
				}
			}

			if (typeof step.color == 'undefined')
			{
				step.color = defaultColor;
			}

			if (typeof plan.colors[step.color] == 'undefined')
			{
				plan.colors[step.color] = ingressplanner.utils.colorName(step.color);

				if (!plan.colors[step.color])
				{
					plan.colors[step.color] = step.color;
				}
			}

			// array with the portal(s) llstring for the step
			var stepPortals = step.portals.split('|');

			// in case of link will have the unique llstring of it
			var llstringOrdered = stepPortals.slice(0).sort().join('|');

			// will store the analysis informatio
			plan.steps[planIDX].analysis = {

				// the state of the portals before the step 
				portalsState:[],

				// warnings that doesn't allow complete analysis or issues that might affect the plan success
				warnings: [],

				// errors that affect the plan success
				errors: [],

				// actions to perform at this step
				actions: [],

				// and we'll keep track of the key farming action indexOf in the above array
				keyFarmActionIndex: null,

				// apreward gathered by actions
				aprewards: [],

				// additional information (i.e. dropped friendly fields)
				infos: [],


			};

			//just a reference to keep typing a bit less
			var analysis = plan.steps[planIDX].analysis;

			// will be used to flag a planned link that is already been done
			var linkDone = false;
			if (step.type == 'link')
			{
				if (typeof worldLinks[llstringOrdered] != 'undefined')
				{
					if (typeof worldLinks[llstringOrdered].planned != 'undefined')
					{
						// we have an already planned step being present again in the plan?
						ingressplanner.warn('step',planIDX,ingressplanner.gameworld.hashToNames(llstringOrdered),'link already planned?');
					}

					if (worldLinks[llstringOrdered].teamDECODED == playerTeam)
					{
						// let's flag this as an already done/exisitng own faction link
						analysis['infos'].push({type:'link-done'});
						linkDone = true;
					}
				}
			}

			// state and record the actual state of the portal
			$.each(stepPortals, function(portalIDX, llstring) {

				if (typeof plan.Portals[llstring] == 'undefined')
				{
					// first occurence of this portal
					var known = ingressplanner.gameworld.getPortalByllstring(llstring);

					// do we have gameworld information?
					if (known)
					{
						// yes - we use clonePortalData do dereference the original object
						plan.Portals[llstring] = ingressplanner.utils.clonePortalData(known);
						// used for max #of outgoing links check
						plan.Portals[llstring].linksOut = known.links.out.length;

					}
					else
					{
						// no, unknown gameworld portal, lets mock it
						plan.Portals[llstring] = {
							// commodity
							llstring: llstring,
						}
					}

					// let's store the original state of the portal (used for plan portals list), dereferenced
					plan.Portals[llstring].originalState = ingressplanner.utils.clonePortalData(plan.Portals[llstring]);

					// used for key calculation
					plan.Portals[llstring].linksIn = 0;
					plan.Portals[llstring].keysUsed = 0;
					plan.Portals[llstring].keysFarmed = 0;

					// steps this portal has been visited till now
					plan.Portals[llstring].steps = [];
				}

				// let's store the portal state at the beginning of the step
				analysis.portalsState[portalIDX] = ingressplanner.utils.clonePortalData(plan.Portals[llstring]);

				// we assume that if the link is already the step will not be performed at all
				if (!linkDone)
				{
					if (portalIDX == 1)
					{
						if (step.type=='link')
						{
							// incoming link, we'll need a key (this is just for the plan portal list)
							plan.Portals[llstring].linksIn++;
						}
					}
					else 
					{

						// is a new portal being visited?
						if ((!lastVisited) || lastVisited != llstring)
						{
							// we visited this portal at this step, last visit is first element of array
							plan.Portals[llstring].steps.unshift(planIDX);
							lastVisited = llstring;
						}

						// to check if we are going to capture/reverse the portal we need to know it's faction
						if (typeof plan.Portals[llstring].teamDECODED == 'undefined')
						{
							// we don't have faction information
							if (!plan.options.HLPlanning)
							{
								analysis.errors.push({type:'no-IITC-portal-data',portalIDX:0,needed:'teamDECODED'});
							}

						}
						else
						{
							// will hold the result of the portal capture/reverse tests
							// null: no take down, false: take down with no points (using Jarvis/Ada), true: take down & gain AP
							var tdAPGain = null;

							// the plan foresse the use of a Jarvis/Ada
							if (step.type=='reverse')
							{
								if (plan.Portals[llstring].teamDECODED==playerTeam)
								{
									// the portal is own faction, so reverse it
									plan.Portals[llstring].teamDECODED = opponentTeam;
									plan.Portals[llstring].linksOut = 0;

									// will take down the portal
									tdAPGain = false;

									// UI will allow to cancel the Jarvis/Ada
									analysis.infos.push({type:'can-cancelreverse'});
								}
								else
								{
									// the portal is already enemy, no need to use the Jarvis/Ada
									step.type = 'portal';
								}
							}

							if (step.type!='reverse')
							{
								// is it enemy portal?								
								if (plan.Portals[llstring].teamDECODED!=playerTeam)
								{

									// yes, capture/take down it
									tdAPGain = true;

									// do we have resonator qty information?
									if (!typeof plan.Portals[llstring].resCount == 'undefined')
									{
										// no
										analysis.errors.push({type:'no-IITC-portal-data',portalIDX:0,needed:'resCount'});
									}
									else
									{
										// do we need to take down resos?
										if (plan.Portals[llstring].resCount>0)
										{
											// AP for destroyed resos
											analysis.aprewards.push(ingressplanner.aprewards.getApRewardsObject('dropped-reso',plan.Portals[llstring].resCount));
										}
									}

									// the porta is now neutral
									plan.Portals[llstring].resCount = 0;
									plan.Portals[llstring].linksOut = 0;

									// we flag it as own faction for comodity
									plan.Portals[llstring].teamDECODED = 'NEUTRAL';

								}
								else if (
									// is it own faction and is this a portal (not link) step?
									plan.Portals[llstring].teamDECODED == playerTeam 
									&& step.type == 'portal'
								)
								{
									// yes, UI will possibly allow to use a Jarvis/Ada
									analysis.infos.push({type:'can-reverse'});
								}
							}

							// setting - or if we are are we going to link (we'll for sure equip full resos)?
							if (plan.options.fullresosOnTouchedPortals || step.type=='link')
							{
								if (plan.Portals[llstring].teamDECODED!=playerTeam)
								{
									// we have captured it
									plan.Portals[llstring].teamDECODED = playerTeam;
									analysis.aprewards.push(ingressplanner.aprewards.getApRewardsObject('capture-portal',1));
								}

								if (!typeof plan.Portals[llstring].resCount == 'undefined')
								{
									// no
									analysis.errors.push({type:'no-IITC-portal-data',portalIDX:0,needed:'resCount'});
								}
								else
								{
									var deployed = 8-plan.Portals[llstring].resCount;

									if (deployed>0)
									{
										analysis.aprewards.push(ingressplanner.aprewards.getApRewardsObject('deploy-resonator',deployed));
										analysis.aprewards.push(ingressplanner.aprewards.getApRewardsObject('deploy-last-resonator',1));
									}
								}
								// and fully deployed resos
								plan.Portals[llstring].resCount = 8;
							}

							// need to compute gameworld takedowns?
							if (typeof tdAPGain == 'boolean')
							{
								// fields taken down
								var stepDroppedFields = $.map(worldFields,function(field,fieldLLstring) {

									if (
										(tdAPGain && field.teamDECODED != opponentTeam)
										|| ((!tdAPGain) && field.teamDECODED != playerTeam)
									)
									{
										return null;
									}

									if (fieldLLstring.split('|').indexOf(llstring)!=-1)
									{
										return fieldLLstring;
									}
									else
									{
										return null;
									}
								});

								// keep track of the fields dropped at this step and remove them from gameworld
								if (stepDroppedFields.length)
								{
									$.each(stepDroppedFields, function(index, fieldLLstring) {
										 droppedFields[fieldLLstring] = planIDX;
										 delete worldFields[fieldLLstring];
									});

									if (!tdAPGain)
									{
										analysis.infos.push({type:'dropped-fields',droppedFields:stepDroppedFields});
									}
									else
									{
										analysis.aprewards.push(ingressplanner.aprewards.getApRewardsObject('dropped-field',stepDroppedFields.length));
									}
									
								}

								// links taken down
								var stepDroppedLinks = $.map(worldLinks,function(link,linkLLstring) {

									if (linkLLstring.split('|').indexOf(llstring)!=-1)
									{
									if (
										(tdAPGain && link.teamDECODED != opponentTeam)
										|| ((!tdAPGain) && link.teamDECODED != playerTeam)
									)
									{
										return null;
									}

										return linkLLstring;
									}
									else
									{
										return null;
									}

								});

								// keep track of the links dropped at this step and remove them from gameworld
								if (stepDroppedLinks.length)
								{
									$.each(stepDroppedLinks, function(index, linkLLstring) {
										droppedLinks[linkLLstring] = planIDX;
										delete worldLinks[linkLLstring];
									});

									if (!tdAPGain)
									{
										analysis.infos.push({type:'dropped-links',droppedLinks:stepDroppedLinks});
									}
									else
									{
										analysis.aprewards.push(ingressplanner.aprewards.getApRewardsObject('dropped-link',stepDroppedLinks.length));
									}

								}

							}

						}
					}

				}

			});

			if (step.type=='link' && (!linkDone))
			{

			// origin portal checks

				// do we have linkOut gameworld information?
				if (typeof plan.Portals[stepPortals[0]].linksOut == 'undefined')
				{
					// no...
					analysis.errors.push({type:'no-IITC-portal-data',portalIDX:0,needed:'linksOut'});
				}
				else
				{
					// yes, so we track one more..
					plan.Portals[stepPortals[0]].linksOut++;

					// overall max
					if (plan.Portals[stepPortals[0]].linksOut>maxLinkOutErr)
					{
						analysis.errors.push({type:'linksOut',linksOut:plan.Portals[stepPortals[0]].linksOut,maxLinkOut:maxLinkOutErr});
					}
					// warn over standard max
					else if (plan.Portals[stepPortals[0]].linksOut>maxLinkOutWarn)
					{
						// will need to advice for SBULA usage & check mod slots
						analysis.warnings.push({type:'linksOut',linksOut:plan.Portals[stepPortals[0]].linksOut,maxLinkOut:maxLinkOutWarn});
					}
				}

			// destination portal checks

				if (!plan.options.HLPlanning)
				{

				// keys check

					// do we have keys owned information?
					if (typeof plan.Portals[stepPortals[1]].keys == 'undefined')
					{
						// no...
						analysis.errors.push({type:'no-IITC-portal-data',portalIDX:1,needed:'keys'});
					}
					else
					{
						// ok, we'll need another key
						plan.Portals[stepPortals[1]].keysUsed++;

						// do we have it?
						var available = plan.Portals[stepPortals[1]].keys + plan.Portals[stepPortals[1]].keysFarmed - plan.Portals[stepPortals[1]].keysUsed;

						// did we visist the destination before?
						if (
							typeof plan.Portals[stepPortals[1]].steps != 'undefined'
							&& plan.Portals[stepPortals[1]].steps.length
						)
						{

						// yes, we now backtrack the visits to flag how many keys are needed / to be farmed at each step

							// number of visits to the portal we have done
							var doneVisits = plan.Portals[stepPortals[1]].steps.length-1;

							// backtracking
							$.each(plan.Portals[stepPortals[1]].steps, function(remainingVisits, visitIDX) {

								// did we already flagged a key need?
								if (plan.steps[visitIDX].analysis.keyFarmActionIndex===null)
								{
									plan.steps[visitIDX].analysis.keyFarmActionIndex = plan.steps[visitIDX].analysis.actions.length;
									plan.steps[visitIDX].analysis.actions.push({

										type: 'keys',

	            						doneVisits:0,
	            						remainingVisits:0,

		            					allocated: {
		            						now: 0,
		            						after: 0
		            					},
		            					farm: {
		            						now: 0,
		            						after: 0
		            					},

									});
								}

								// just a reference to reduce clutter
								var keyFarmAction = plan.steps[visitIDX].analysis.actions[plan.steps[visitIDX].analysis.keyFarmActionIndex];

	            				// we'll track the overall number of keys allocated in all the future visits
	            				// we track the max number of remainingVisits (at successive iterations for the same portal it will go up)
	            				keyFarmAction.remainingVisits = remainingVisits;

	            				// we track how many times we had visited this portal before, so how many opportunities to check/farm allocated keys
	            				keyFarmAction.doneVisits = doneVisits;

								// we'll start with the key allocation situation
		            			if (remainingVisits==0)
		            			{
		            				// no remainingVisits, so the allocation is right now
		            				keyFarmAction['allocated'].now++;
		            			}
		            			else
		            			{
		            				// allocated in a future visit
		            				keyFarmAction['allocated'].after++;
		            			}

								if (available<0)
								{
								// the allocation is also a farm need

			            			if (remainingVisits==0)
			            			{
			            				// no remainingVisits, so we have to farm/have farmed right now
			            				keyFarmAction['farm'].now++;
			            			}
			            			else
			            			{
			            				// farm allocation is due to a future visit
			            				keyFarmAction['farm'].after++;
			            			}

									if (remainingVisits==0)
									{
										// at the end of the last visit we have to had farmed 1 more key.
										plan.steps[visitIDX].analysis.portalsState[0].keysFarmed++;

										// same apply for following occurences of the same portal, this included
										for (var nextIDX = visitIDX+1; nextIDX <= planIDX; nextIDX++) {

											$.each(plan.steps[nextIDX].analysis.portalsState, function(idx, portalsState) {
												if (portalsState.llstring == stepPortals[1])
												{
													plan.steps[nextIDX].analysis.portalsState[idx].keysFarmed++;
												}
											});
										};

									}

								}

								// decrement done visits
								doneVisits--;
									
							});

							if (available<0)
							{
								// since we had visited at least once the portal, we assume we farmed the needed key
								plan.Portals[stepPortals[1]].keysFarmed++;
								available++;
							}
						}

						// if we had no farming opportunities, we have a problem!
						if (available<0)
						{
							plan.steps[planIDX].analysis.errors.push({type:'no-keys-available',missing:-available});
						}


					}

				// ownership & resos

					// do we have faction gameworld information?
					if (typeof plan.Portals[stepPortals[1]].teamDECODED == 'undefined')
					{
						// no...
						analysis.errors.push({type:'no-IITC-portal-data',portalIDX:1,needed:'teamDECODED'});
					}
					else
					{
						// destination is not owned by the factio?
						if (plan.Portals[stepPortals[1]].teamDECODED != playerTeam)
						{

							// did we visiste the destination before?
							if (
								typeof plan.Portals[stepPortals[1]].steps != 'undefined'
								&& plan.Portals[stepPortals[1]].steps.length
							)
							{
								// we did, last time was
								var lastVisit = plan.steps[plan.Portals[stepPortals[1]].steps[0]];

								// was it non own faction at that time?
								if (lastVisit.analysis.portalsState[0].teamDECODED != playerTeam)
								{
									// yes, so we flag taht visit as a capture action
									lastVisit.analysis.actions.push({type:'capture'});
									// and we take ownership
									analysis.portalsState[1].teamDECODED = playerTeam;
									plan.Portals[stepPortals[1]].teamDECODED = playerTeam;
								}
							}
						}

						if (plan.Portals[stepPortals[1]].teamDECODED == playerTeam)
						{
							// do we have rescount gameworld information?
							if (typeof plan.Portals[stepPortals[1]].resCount == 'undefined')
							{
								// no...
								analysis.errors.push({type:'no-IITC-portal-data',portalIDX:1,needed:'resCount'});
							}
							else if (plan.Portals[stepPortals[1]].resCount < 8)
							{
								// destination is not full resos, did we visited it before?
								if (
									typeof plan.Portals[stepPortals[1]].steps != 'undefined'
									&& plan.Portals[stepPortals[1]].steps.length
								)
								{

									// we did, so we flag to make full resos at the last visit
									var lastVisit = plan.steps[plan.Portals[stepPortals[1]].steps[0]];
									lastVisit.analysis.actions.push({type:'full-resos'});

									// how many resos must we deploy for full reso at lasti visit?
									var deployed = 8-plan.Portals[stepPortals[1]].resCount;

									if (deployed==8)
									{
										// we had to captured it
										lastVisit.analysis.aprewards.push(ingressplanner.aprewards.getApRewardsObject('capture-portal',1));
									}
									// and make full resos
									lastVisit.analysis.aprewards.push(ingressplanner.aprewards.getApRewardsObject('deploy-resonator',deployed));
									lastVisit.analysis.aprewards.push(ingressplanner.aprewards.getApRewardsObject('deploy-last-resonator',1));

									analysis.portalsState[1].resCount = 8;
									plan.Portals[stepPortals[1]].resCount = 8;
								}
								else
								{
									analysis.errors.push({type:'not-full-resos', resCount: plan.Portals[stepPortals[1]].resCount});
								}
							}
						}
						else
						{
							analysis.errors.push({type:'not-own-faction'});
						}
					}

				}

				// check if the link was blocked previously taken down fields
				$.each(droppedFields, function(fieldLLstring, droppedAtStepIDX) {

					if (ingressplanner.utils.portalInField(stepPortals[0],fieldLLstring))
					{
						// flag the step where the field was took down as a "take down" step
						plan.steps[droppedAtStepIDX].analysis.actions.push({
							type: 	'take-down',
							reason: 'blocking-field',
							field: 	fieldLLstring,
							blockingIDX: planIDX
						});
					}

				});

				// is the origin inside exisiting fields?
				var blockingFields = $.map(worldFields, function(field, fieldLLstring) {
					if (
						ingressplanner.utils.portalInField(stepPortals[0],fieldLLstring) 
					)
					{
						return field;
					}
					else
					{
						return null;
					}
				});

				if (blockingFields.length)
				{
					analysis.errors.push({type:'portal-inside-fields',blockingFields:blockingFields});
				}

				// check if the link was blocked by previously taken down cross links
				$.each(droppedLinks, function(linkLLstring, droppedAtStepIDX) {

					if (ingressplanner.utils.intersect(step.portals,linkLLstring))
					{
						// flag the step where the cross link was took down as a "take down" step
						plan.steps[droppedAtStepIDX].analysis.actions.push({
							type: 	'take-down',
							reason: 'blocking-link',
							link: 	linkLLstring,
							blockingIDX: planIDX
						});
					}
				});

				// this will hold crosslinks existin in gameworld
				var crosslinks = [];

				// this will track portals linked to the new link's origins to identify new fields closed
				var destFrom = [[],[]];

				$.each(worldLinks, function(linkLLstring, link) {

					// we have a prosslink!
					if (ingressplanner.utils.intersect(step.portals,linkLLstring))
					{
						crosslinks.push(link);
					}
					if (link.teamDECODED == playerTeam)
					{
						// it is a friendly link, so we'll check if it connects to the current link
						var linkPortals = linkLLstring.split('|');
						$.each(stepPortals, function(stepPortalIDX, stepPortals) {
							 var f = linkPortals.indexOf(stepPortals);

							 if (f!=-1)
							 {
							 	 // yes, the exisiting link connect to the new link
							 	 // so we store the linked portal (the one opposite to the connected portal)
							 	 // in the array for the connected portal
								 var x = linkPortals.indexOf(stepPortals)==0?1:0;
								 destFrom[stepPortalIDX].push(linkPortals[x]);
							 }
						});

					}
				});

				// we identified some crosslinks
				if (crosslinks.length)
				{
					analysis.errors.push({type:'crosslinks',crosslinks:crosslinks});
				}

				// we have at least 1 connected portal for each of the new link origins.
				if (destFrom[0].length && destFrom[1].length)
				{
					// here we'll track the actually created fields
					var createdFields = [];
					// here we'll track the wasted fields (contained inside a field created by the same link)
					var wastedFields = [];

					$.each(destFrom[0], function(index, d1) {

						$.each(destFrom[1], function(index, d2) {

							// we have a portal that is connected to both new link' origins, i.e. a field!
							 if (d1==d2)
							 {
							 	// will track if this new field is going to be wasted
		                        var dropWasted = false;

		                        // we'll track here fields to be removed from createdFields after cycling
		                        var removeDest = [];

		                        // we'll loop thorugh the fields already created by this link
		                        $.each(createdFields, function(index, alreadycreated) {

		                        	// the edge of the potential new field is inside an already created field?
		                            if (ingressplanner.utils.portalInField(d1,[stepPortals[0],stepPortals[1],alreadycreated].join('|')))
		                            {
		                            	// it's wasted!
		                                dropWasted = true;
		                                wastedFields.push(d1);
		                            }
		                            // it's the previously created field edge inside the potential new field?
		                            else if (ingressplanner.utils.portalInField(alreadycreated,[stepPortals[0],stepPortals[1],d1].join('|')))
		                            {
		                            	// it is wasted!
		                                wastedFields.push(alreadycreated);
		                                // we'll have to remove it from createdFields when out of the .each cycle
		                                removeDest.push(alreadycreated);
		                            }
		                        });

		                        // remove fields that were inside the newly created field
		                        $.each(removeDest, function(index, alreadycreated) {
		                             createdFields.splice(createdFields.indexOf(alreadycreated),1);
		                        });

		                        // since we did not flag the new field as wasted we can add it to the list of created ones.
		                        if (!dropWasted)
		                        {
		                            createdFields.push(d1);
		                        }
		                    
							 }
						});
					});

					// AP for created resos
					analysis.aprewards.push(ingressplanner.aprewards.getApRewardsObject('created-field',createdFields.length));

					var createdFieldsLLstrings = [];
					// add the created fields to the gameworld
					$.each(createdFields, function(index, createdField) {
						createdFieldsLLstrings.push([
							worldLinks[[stepPortals[0],createdField].sort().join('|')],
							worldLinks[[stepPortals[1],createdField].sort().join('|')],
						]);
						var createdFieldLLstring = [stepPortals[0],stepPortals[1],createdField].sort().join('|');
						worldFields[createdFieldLLstring] = {llstring:createdFieldLLstring,planned:planIDX,teamDECODED:playerTeam};
					});

					var wastedFieldsLLstrings = [];
					// add the created fields to the gameworld
					$.each(wastedFields, function(index, wastedField) {
						wastedFieldsLLstrings.push([
							worldLinks[[stepPortals[0],wastedField].sort().join('|')],
							worldLinks[[stepPortals[1],wastedField].sort().join('|')],
						]);
					});

					// number of created and wasted fields
					analysis['infos'].push({
						type: 			'fields',
						createdFields: 	createdFieldsLLstrings,
						wastedFields: 	wastedFieldsLLstrings
					});

				}

				// AP for created link
				analysis.aprewards.push(ingressplanner.aprewards.getApRewardsObject('created-link',1));

				// add the created link to the gameworld
				worldLinks[llstringOrdered] = {
					llstring: llstringOrdered,
					planned: planIDX,
					teamDECODED: playerTeam
				};

			}

		});

		return plan;

	}

// exposed methods
	return {

		init: function (planEventHandler)
		{
			eventHandler = planEventHandler;
		},

		// wrapper (just to not pollute the exposed method code)
		analyze: function(plan, playerTeam, opponentTeam)
		{
			return analyzePlan(plan, playerTeam, opponentTeam);
		},

		// will parse a plan and return the IITC draw tool drawing object representing it
		iitcDrawing: function(plan)
		{

			var iitcDrawing = [];
			var color = defaultColor;

			if (typeof plan.ranges !='undefined')
			{
				$.each(plan.ranges, function(index, drawItem) {
					switch (drawItem.type)
					{
						case 'circle':
							iitcDrawing.push({
								type: 'circle',
								color: drawItem.color,
								latLng: drawItem.latLng,
								radius: drawItem.radius
							});
							break;

						case 'polygon':
							iitcDrawing.push({
								type: 'polygon',
								color: drawItem.color,
								latLngs: drawItem.latLngs
							});
							break;

					}
				})
			}

			$.each(plan.steps, function(index, item) {

			 	var drawItem = null;

				switch (item.type)
				{

					case 'portal':
					case 'reverse':
						drawItem = {
							type: 'marker',
							latLng: ingressplanner.utils.llobject(item.portals)
						};
						break;

					case 'link':
						drawItem = {
							type: 		'polyline',
							latLngs: 	ingressplanner.utils.llobject(item.portals)
						};
						break;

					default:
						if (typeof item.drawing != 'undefined')
						{
							drawItem = item.drawing;
						}
						break;

				}

				if (drawItem)
				{

				 	if (
				 		typeof item.drawing != 'undefined'
				 		&& typeof item.drawing.color != 'undefined'
				 	)

				 	{
				 		color = item.drawing.color;
				 	};

				 	if (typeof item.color != 'undefined')
				 	{
				 		color = item.color;
				 	};

					drawItem.color = color;

					plan.steps[index].drawingIdx = iitcDrawing.length;

					iitcDrawing.push(drawItem);

				}

			});

			return iitcDrawing;

		}

	}
});
