/*
	UI module
*/

ingressplanner.ui = new (function() {

// private vars & functions

	var eventHandler = null;

    // stores the last plan, palyerteam and analysis data
    var plan = null;
    var playerTeam = null;
    var analysis = null;

    // handles preview data
    var preview = {
        // map instance
        map: null,
        // last shown step (to avoid redrawing the map)
        lastShownStep: null,
        // player marker
        playerMarker: null
    };

	var noIITCDataText = 'No IITC data!';
	var noFullResosText = 'Portal is not full resos!';
	var notOwnFactionText = 'Destination is not own faction!';
	var missingKeysText = 'You have not enough keys!';

    var noIITCDataPrepend = '<span class="noIITCData hasPopover glyphicon glyphicon-question-sign" title="No IITC data!"></span> ';
    var noFullResosPrepend = '<span class="resonators hasPopover label label-danger" title="Portal is not full resos!"></span> ';
    var linkOutCountWarnPrepend = '<div class="linkOutCountWarn hasPopover text-warning bg-warning"><span class="glyphicon glyphicon-fullscreen"></span></div>';
    var linkOutCountErrPrepend = '<div class="linkOutCountWarn hasPopover text-danger bg-danger"><span class="glyphicon glyphicon-fullscreen"></span></div>';

    var addPortalStopBtn = '<button type="button" class="addMarker btn btn-xs" aria-label="Add Portal stop"><span title="Add Portal stop" class="glyphicon glyphicon-eject" aria-hidden="true"></span></button>';
    var removeStepBtn = '<button type="button" class="removeStep btn btn-danger btn-xs" aria-label="Delete"><span title="Remove from plan" class="glyphicon glyphicon-remove" aria-hidden="true"></span></button>';
    var invertlinkBtn = '<button type="button" class="invertlink btn btn-default btn-xs" aria-label="Swap"><span title="Invert link (swap origin & destination)" class="glyphicon glyphicon-resize-horizontal" aria-hidden="true"></span></button>';
    var moveItemToolBtn = '<button type="button" class="moveItem btn btn-default btn-xs" aria-label="Move Item"><span title="Open Move items tool" class="glyphicon glyphicon-random" aria-hidden="true"></span></button>';

    var moveItemUp = '<button type="button" class="moveStep btn btn-default btn-xs" aria-label="Move Up" data-direction="up"><span title="Move this step before the previous" class="glyphicon glyphicon-arrow-up" aria-hidden="true"></span></button>'
    var moveItemDown = '<button type="button" class="moveStep btn btn-default btn-xs" aria-label="Move Down" data-direction="down"><span title="Move this step after the next" class="glyphicon glyphicon-arrow-down" aria-hidden="true"></span></button>'

	var authButton = $("#authorizeButton");
	var authDiv = $("#authDiv");

    var gdriveIcon = $('a[role="tab"][href="#gdriveTab"] span.glyphicon');
	var StepsIcon = $('a[role="tab"][href="#stepsTab"] span.glyphicon');

	var quickStart = {
		gdrive: $(".qs-gdrive"),
		noplans: $(".qs-gdrivenoplans")
	};

	var stepsTab = $("#stepsTab");

	var plansListBody = $("#plansTable tbody");
	var plansTableDiv = $("#plansTableDiv");

    var portalsListHead = $('#portals thead');
	var portalsListBody = $('#portals tbody');

    var stepsListHead = $('#steps thead');
	var stepsListBody = $('#steps tbody');

	var todoListContainer = $('#todoList');

    var exportDrwToFileButton = $("#exportDrwToFile");
    var exportPlanToFileButton = $("#exportPlanToFile");

	var noplanactivewarning = $('.noplanactivewarning');

    var moveItemBtn = $("#moveItemBtn");
    var deleteItemsBtn = $("#deleteItemsBtn");

    var invertlinksBtn = $("#invertlinksBtn");
    var swapPortalsBtn = $("#swapPortalsBtn");
	var changeColorsDiv = $("#changeColorsDiv");

	var moveItemSelect = $("#moveItemSelect");
	var moveItemBeforeSelect = $("#moveItemBeforeSelect");

	var privacyDiv = $("#privacyDiv");

	function resizeScrollable() {

    	$(".screenHeight").height( function() {

            var shown = false;
            var parentTab = $(this).closest('[role="tabpanel"]');

            if ($(this).closest('[role="tabpanel"]').length)
            {
                shown = $(this).closest('[role="tabpanel"]').hasClass('active');
            }
            else
            {
                shown = true;
            }

	        if (shown)
	        {
                var bottomOffset = $(this).attr('data-screenHeight-less');
                if (!bottomOffset)
                {
                    bottomOffset = 5;
                }
	            return $(window).height() - $(this).offset().top - bottomOffset;
	        }
	        else
	        {
	            return 0;
	        }
	    });
	}

	function unactivePlan()
	{
		plansListBody.find('tr.success').removeClass('success');
		noplanactivewarning.show();
		resizeScrollable();
	};


	$(window).resize(resizeScrollable);

	function portalTitleHTML(portal)
	{

		if (typeof portal == 'string')
		{
			var llstring = portal;
			portal = ingressplanner.gameworld.getPortalByllstring(portal);
			if (!portal)
			{
				portal = {};
			}
			portal.llstring = llstring;
		}

        var title = portal.llstring;
        var unknown = true;
        if (typeof portal.title != 'undefined')
        {
        	title = portal.title;
            unknown = false;
        }

        var team = '';

        if (portal && typeof portal.teamDECODED != 'undefined')
        {
            team = portal.teamDECODED;
        }

        return $('<a>').attr({
            class:  'team-'+team,
            href:   'https://www.ingress.com/intel?ll='+portal.llstring+'&z=17&pll='+portal.llstring,
            target: 'blank',
        })
        .append($("<portal>").data('portal',portal).toggleClass('unknown',unknown).html(title));

	}

	function portalTDHTML(portal,playerTeam)
    {

        var team = '';
        var faction = '';

		if (typeof portal == 'string')
		{
			portal = ingressplanner.gameworld.getPortalByllstring(portal);
		}

        if (typeof portal.teamDECODED != 'undefined')
        {
            team = portal.teamDECODED;
        }

        if (team !='' && playerTeam)
        {

            if (playerTeam == team)
            {
                faction = 'faction-' + playerTeam;
            }
            else
            {
                faction = 'faction-not-' + playerTeam;
            }

        }

        return $('<td>').addClass(faction).addClass('team-'+team).html(portalTitleHTML(portal));
    };

    function reduceTable()
    {

	    var last = null;

	    stepsListBody.find('tr').each(function() {

	        var tr = $(this);

	        if (tr.hasClass('auto'))
	        {
	            last = null;
	            return;
	        }

	        var ptTD = tr.find('td[data-pll]').eq(0);

	        if (ptTD.length)
	        {

	            if (last && last.data('pll') == ptTD.data('pll'))
	            {
	                var rowspan = last.prop('rowspan');
	                if (!rowspan)
	                {
	                    rowspan = 1;
	                }
	                rowspan++;

	                if (plan.options.planKeyFarming && (!last.parents('tr').hasClass('nokeyTotalTD')))
	                {
		                last.prop('rowspan',rowspan)
		                    .next().prop('rowspan',rowspan)
		                    .next().prop('rowspan',rowspan)
		                ;

		                ptTD.addClass('collapsed').hide()
		                    .next().addClass('collapsed').hide()
		                    .next().addClass('collapsed').hide()
		                ;

	                }
	                else
	                {

                        if (plan.options.planKeyFarming)
                        {
                            last.prop('rowspan',rowspan)
                                .next().prop('rowspan',rowspan)
                            ;
                            ptTD.addClass('collapsed').hide()
                                .next().addClass('collapsed').hide()
                                .next().addClass('collapsed').hide()
                            ;
                        }
                        else
                        {
                            last.prop('rowspan',rowspan);
                            ptTD.addClass('collapsed').hide();
                        }


	                }

	            }
	            else
	            {
	                last = ptTD;
	            }

	        }
	        else
	        {
	            last = null;
	        }

	    });
    };

    function sortTable($table)
    {

        var sortfield = $table.find('thead th[data-sortdir]').attr('data-sortable-sortfield');

        if (typeof sortfield == 'undefined')
        {
            sortfield = 'idx';
        }

        var sortDir = $table.find('thead th[data-sortdir]').attr('data-sortdir');

        if (typeof sortDir == 'undefined')
        {
        	sortDir = 'asc';
        }

        if (sortfield && sortDir)
        {
        	var $tbody = $table.find('tbody');
        	var $rows = $tbody.find('tr');

            $rows.sort(function(rowa, rowb) {

            	a = $(rowa).data('sorting')[sortfield];
            	b = $(rowb).data('sorting')[sortfield];

                if (a==b)
                {
                    return 0;
                }
                else if (
                	(sortDir == 'asc' && a>b)
                	|| (sortDir != 'asc' && a<b)
                )
                {
                    return 1;
                }
                else
                {
                    return -1;
                }
            });

            $rows.detach().appendTo($tbody);
        }

    };

    // this is needed to overcome Bootstrap 3 limited functionality of popover
    // 	"popover() calls after the first on same target with different selectors ignored"
    // 	https://github.com/twbs/bootstrap/issues/18268
    function popoverize($target,options)
    {
    	if ($target.data('isPopoverTarget'))
    	{
    		$target.wrapInner('<div class="bsPopoverPacthedTarget"></div>');
    		$target = $target.find('.bsPopoverPacthedTarget');

    	}

    	$target.data('isPopoverTarget',true);
    	$target.popover(options);
    }

	// invoked when steps table and/or plan portals table are refreshed
	function clearPopovers()
	{
        $('.hasPopover').popover('destroy').removeClass('hasPopover');
        $('.cp-popover-container').popover('destroy').remove();
	}

    function setJSONs()
    {
        $('#drawingJSON').html(JSON.stringify(ingressplanner.plan.iitcDrawing(plan,true)));
        $('#planJSON').html(JSON.stringify(plan));
    }

	function setPlanOptions()
	{

		$.each(plan.options, function(option, value) {

            $('select[name="'+option+'"].planoption, input[name="'+option+'"].planoption').each(function(index, el) {
                var $ctr = $(el);
                if ($ctr.attr('type')=='checkbox')
                {
                    $ctr.prop('checked', value);
                }
                else
                {
                    $ctr.val(value);
                }

            });

		});

        $("#textualPlanAddLinksParamsContainer").toggle(plan.options.textualPlanAddLinks);
        $("#keyFarmLimitContainer").toggle(plan.options.planKeyFarming);
	};

    function buildTextuals(todolines,textualInfo,summaryUpdateRebuild)
    {

        var linesToShow = todolines.slice(0);
        if (typeof summaryUpdateRebuild == 'undefined')
        {
            summaryUpdateRebuild = false;
        }

        var before = null;

        $.each(textualInfo, function(planIDX, lines) {

            if (typeof lines == 'undefined' || (!lines.length))
            {
                return true;
            }

            var llstring = plan.steps[planIDX].portals.split('|')[0];

            var line = false;

            if ((!before) || before != llstring)
            {

                var name = ingressplanner.gameworld.hashToNames(llstring);
                line = 'GO TO ' + name;

                var maplink = plan.options.textualPlanAddLinks;
                
                if (before)
                {
                    var distance = ingressplanner.utils.distance(before,llstring);
                    var time = null;

                    var summary = ingressplanner.router.getSummary(before,llstring);
                    if (summary)
                    {

                        distance = summary.distance;
                        time = [Math.ceil(summary.time/60),'\''];

                        if (time[0]>=60)
                        {
                            time.unshift(Math.floor(time[0]/60) ,'h ');
                            time[2] = time[2] % 60;
                        }

                        
                    }
                    else if (!summaryUpdateRebuild)
                    {
                        ingressplanner.router.getSummary(before, llstring, function(){
                            buildTextuals(todolines,textualInfo,true);
                        });
                    }

                    // distance limit to not show map link
                    if (maplink && distance<plan.options.textualPlanAddLinksMinDistance)
                    {
                        maplink = false;
                    }

                    distance = (Math.ceil(distance/100)/10).toFixed(1);

                    line += ' ('+distance+' km';

                    if (time)
                    {
                        line += ', '+ time.join('');
                    }
                    else
                    {
                        line += ' straight line';
                    }

                    line += ')';

                }

                if (maplink)
                {
                    var url = null;
                    switch (plan.options.textualPlanAddLinksType)
                    {
                        case 'gmap':
                            url = 'https://maps.google.com/maps?ll='+llstring+'&q='+llstring+encodeURIComponent(' ('+name+')');
                            break;

                        case 'portal':
                            url = 'https://www.ingress.com/intel?ll='+llstring+'&z=17&pll='+llstring;
                            break;
                    }

                    if (url)
                    {
                        var shortUrl = ingressplanner.shortener.getShortUrl(url);
                        if (shortUrl)
                        {
                            url = shortUrl;
                        }
                        else
                        {
                            ingressplanner.shortener.getShortUrl(url,function(){
                                buildTextuals(todolines,textualInfo,true);
                            });
                        }
                        line += ' ' + url;
                    }
                }

                before = llstring;
            }

            if (line)
            {
                linesToShow.push(line);
            }

            lines.forEach(function(line) {
                 linesToShow.push('  '+line);
            });

        });

        todoListContainer.html(linesToShow.join('\n'));

    };

    function buildPortalsTable() 
    {

    	clearPopovers();
        portalsListBody.html('');

        portalsListHead.find('[data-keyfarming]').toggle(plan.options.planKeyFarming);

        var rows = [];
        var rowIDX = 0;

        $.each(analysis.Portals, function(llstring, portal) {

            var linksIn = 0;
            if (typeof portal.linksIn != 'undefined' && portal.linksIn)
            {
                linksIn = portal.linksIn;
            }
            var keys  = 0;
            var missing = 0;

            var portalOriginalState = portal.originalState;

            var title = portalOriginalState.llstring;
            if (typeof portalOriginalState.title != 'undefined')
            {
            	title = portalOriginalState.title;
            }

            var trAttrs={
            	'data-pll': llstring
           	};

            if (typeof portalOriginalState.guid != 'undefined')
            {
                trAttrs['data-portalguid'] = portalOriginalState.guid;
            }

            var keysHTML = '';
            if (plan.options.planKeyFarming)
            {
                if (typeof portalOriginalState.keys != 'undefined')
                {
                    keys = portalOriginalState.keys;
                    missing = linksIn - keys;

                    if (missing<=0)
                    {
                        missing = 0;
                    }

                    keysHTML = $('<input>').attr({
                        type:   'number',
                        min:    0,
                        step:   1,
                        value:  keys,
                    });

                }

                if (missing==0)
                {
                    missing = '';
                }
            }

            if (linksIn==0)
            {
                linksIn = '';
            }

            var sorting  = {
                'idx':      rowIDX++,
                'title':    title.trim().toLowerCase(),
                'linksIn':  linksIn,
            };

            if (plan.options.planKeyFarming)
            {
                sorting['keys'] = keys;
                sorting['missing'] = missing;
            }

            var tr = $('<tr>')
                .attr(trAttrs)
                .data('sorting',sorting)
                .append(portalTDHTML(portalOriginalState,playerTeam))
                .append($('<td>').html(linksIn))
            ;

            if (plan.options.planKeyFarming)
            {
                tr
                    .append($('<td>').attr('role','keys').html(keysHTML))
                    .append($('<td>').html(missing))
                ;
            }

            portalsListBody.append(tr);

        });

		sortTable($('#portals'));

    };

    function getCheckBoxGroupValue($container)
    {
        return $container.find('input[type=checkbox]:checked').map(function(_, el) {
            return $(el).val();
        }).get();
    }

    function showSwapPortalsBtn()
    {
        var from = $('[data-filter=portal][data-filter-target=moveItemSelect] select').val();
        var to = $('[data-filter=portal][data-filter-target=moveItemBeforeSelect] select').val();

        swapPortalsBtn.toggle((!!from) && (!!to) && from!=to);
    }


    function enableMoveItemsBtn()
    {

        if (
            moveItemSelect.val()
            && moveItemSelect.val().length
            && moveItemBeforeSelect.val()
            && moveItemBeforeSelect.val().length
        )
        {
            moveItemBtn.removeProp('disabled');
        }
        else
        {
            moveItemBtn.prop('disabled','disabled');
        }
    }

    function refreshFilters()
    {
        var targets = buildPlancolorsFilters();

        $.each(buildActiontypeFilters(), function(index, target) {
             if (targets.indexOf(target)==-1)
             {
                targets.push(target);
             }
        });

        $.each(buildPortalFilters(), function(index, target) {
             if (targets.indexOf(target)==-1)
             {
                targets.push(target);
             }
        });

        $.each(targets, function(index, target) {
             applyFilters(target);
             $('#'+target).trigger('change');
        });
    }


    function applyFilters(target)
    {
        // the active filters and their filtering values
        var filters = {};

        // loop through all the filters targetting this same target
        $('[data-filter][data-filter-target="'+target+'"]').each(function(index, filter) {

            var $filter = $(filter);
            var filterType = $filter.attr('data-filter');

            // filtering values
            switch (filterType)
            {
                case 'color':
                case 'actiontype':
                    var values = getCheckBoxGroupValue($filter);
                    if (values.length)
                    {
                        filters[filterType] = values;
                    }
                    break;

                case 'portal':
                    var value = $filter.find('select').val();
                    if (value)
                    {
                        var subtypes = getCheckBoxGroupValue($filter);

                        if (subtypes.length == 0)
                        {
                            subtypes = ["portal0", "portal1"];
                        }

                        filters[subtypes.join('|')] = [value];
                    }
                    break;

                default:
                    ingressplanner.warn('unimplemented values collector for filter type',filterType,'target',target);
                    break;
            }
        })

        var $target = $('#'+target);

        // loop through all the target's options
        $target.find('option').each(function(index, option) {

            var $option = $(option);
            var show = true;

            $.each(filters, function(filterTypeString, values) {

                var found = 0;

                $.each(filterTypeString.split('|'), function(filterTypeidx, filterType) {

                    var attrValue = $option.attr('data-'+filterType);

                    if (attrValue && values.indexOf(attrValue) != -1)
                    {
                        found++;
                    }
                });

                if (!found)
                {
                    show = false;
                }

            });

            $option.toggle(show);
            $option.toggleClass('shown',show);

        });

        $target.find('optgroup').each(function(optgroupidx, optgroup) {
            var $optgroup = $(optgroup);
            $optgroup.toggle(!!$optgroup.find('option.shown').length);
        });

    }

    function buildPortalFilters()
    {
        var targets = [];

        $('[data-filter=portal]').each(function() {

            var $filter = $(this);

            var target = $filter.attr('data-filter-target');

            if (targets.indexOf(target)==-1)
            {
                targets.push(target);
            }

            var prevSelection = $filter.find('select').val();

            $filter.html('');

            portals = [];

            $('#'+target+' option').each(function(index, option) {

                var portal = $(option).attr('data-portal0');
                if (portal && portals.indexOf(portal)==-1)
                {
                    portals.push(portal);
                }

                var portal = $(option).attr('data-portal1');
                if (portal && portals.indexOf(portal)==-1)
                {
                    portals.push(portal);
                }
                
            });

            if (portals.length>1)
            {
                var label = $filter.attr('data-filter-label');
                if (!label)
                {
                    label = 'Filter by item portal:'
                }
                $filter.append($('<div>').addClass('small').html(label));

                portals.sort(function(a,b){

                    var aname = ingressplanner.gameworld.hashToNames(a).toLowerCase().trim();
                    var bname = ingressplanner.gameworld.hashToNames(b).toLowerCase().trim();

                    if(aname<bname)
                    {
                        return -1;
                    }

                    if(aname>bname)
                    {
                        return 1;
                    }

                    return 0;

                });

                var select = $('<select>').attr({
                    'class': 'form-control'
                });

                select.append(
                    $('<option>').attr({
                        'value': null,
                    })
                    .html('')
                );

                $.each(portals, function(portalidx, portal) {
                     select.append(
                        $('<option>').attr({
                            'value': portal,
                        })
                        .html(ingressplanner.gameworld.hashToNames(portal))
                    );
                });

                select.val(prevSelection);
                $filter
                    .append(select)
                    .append(
                        $('<div>')
                        .addClass('checkbox checkbox-inline')
                        .append($('<input>').attr({
                                type: 'checkbox',
                                value: 'portal0',
                                checked: false,
                        })
                        )
                        .append($('<label>').html('Origin'))
                    )
                    .append(
                        $('<div>')
                        .addClass('checkbox checkbox-inline')
                        .append($('<input>').attr({
                                type: 'checkbox',
                                value: 'portal1',
                                checked: false,
                        })
                        )
                        .append($('<label>').html('Destination'))
                    )

                ;

                var div = $('<div>')

            }

        });

        return targets;
    }

    function buildActiontypeFilters()
    {
        var targets = [];

        $('[data-filter=actiontype]').each(function() {

            var $filter = $(this);

            var target = $filter.attr('data-filter-target');

            if (targets.indexOf(target)==-1)
            {
                targets.push(target);
            }
            var prevSelection = getCheckBoxGroupValue($filter);

            $filter.html('');

            actions = [];

            $('#'+target+' option').each(function(index, option) {

                var actiontype = $(option).attr('data-actiontype');

                if (actiontype && actions.indexOf(actiontype)==-1)
                {
                    actions.push(actiontype);
                }
                
            });

            if (actions.length>1)
            {

                var label = $filter.attr('data-filter-label');
                if (!label)
                {
                    label = 'Filter by item type:'
                }
                $filter.append($('<div>').addClass('small').html(label));

                $.each(actions, function(index, action) {

                    $filter.append(
                        $('<div>')
                        .addClass('checkbox checkbox-inline')
                        .append($('<input>').attr({
                                type: 'checkbox',
                                value: action,
                                checked: (prevSelection.indexOf(action)!=-1)
                        })
                        )
                        .append($('<label>').attr('data-actiontype',action).append(action))

                    )
                });
            }

        });

        return targets;

    }

    function buildPlancolorsFilters()
    {

        var colors = [];
        var targets = [];

        $('[data-filter=color]').each(function() {

            var $filter = $(this);

            var target = $filter.attr('data-filter-target');

            if (targets.indexOf(target)==-1)
            {
                targets.push(target);
            }
            var prevSelection = getCheckBoxGroupValue($filter);

            $filter.html('');

            var thiscolors = [];

            $('#'+target+' option').each(function(index, option) {

                var color = $(option).attr('data-color');

                if (color && thiscolors.indexOf(color)==-1)
                {
                    thiscolors.push(color);
                    if (colors.indexOf(color)==-1)
                    {
                        colors.push(color);
                    }
                }
                
            });

            if (thiscolors.length > 1)
            {
                var label = $filter.attr('data-filter-label');
                if (!label)
                {
                    label = 'Filter by item color:'
                }
                $filter.append($('<div>').addClass('small').html(label));

                $.each(thiscolors, function(index, color) {

                    var name = color;

                    if (typeof analysis.colors[color] != 'undefined')
                    {
                        name = analysis.colors[color];
                    }

                    $filter.append(
                        $('<div>')
                        .addClass('checkbox checkbox-inline')
                        .append($('<input>').attr({
                                type: 'checkbox',
                                value: color,
                                checked: (prevSelection.indexOf(color)!=-1)
                        })
                        )
                        .append($('<label>').attr('data-color',color).append(name))

                    )
                });
            }
        });

        $('style#plancolors').remove();

        var css = '';

        $.each(colors, function(index, hex) {

            css += '[data-filter=color] .checkbox label[data-color="'+hex+'"]::before {background-color: '+hex+'; }';
            if (new tinycolor(hex).isDark())
            {
                css += '[data-filter=color] .checkbox label[data-color="'+hex+'"]::after {color: white; }';
            }
            
                            
        });
    
        if (css != '')
        {
            $('<style id="plancolors">'+css+'</style>').appendTo( "head" );
        }

        return targets;
    }

    function buildRanges()
    {
        $.each($('select[data-ranges]'), function() {
        	$this = $(this);
        	$this.data('prevSelection',$this.val());
        	$this.html('');
        });

        if (typeof plan.ranges !='undefined' && plan.ranges.length)
        {
            var types = {};

            $.each(plan.ranges, function(planIDX, range) {
                 if (typeof types[range.type] == 'undefined')
                 {
                    types[range.type] = [];
                 }
                 range.planIDX = planIDX;
                 types[range.type].push(range);
            });

            $.each(types, function(type, ranges) {

                var optgroup = null;
                switch (type)
                {
                    case 'circle':
                        optgroup = $('<optgroup>').attr('label','Circles');
                        break;

                    case 'polygon':
                        optgroup = $('<optgroup>').attr('label','Polygons');
                        break;
                }

                if (!optgroup)
                {
                    ingressplanner.error('unmanaged range type',type);
                }

                $.each(ranges, function(index, range) {

                    switch(range.type)
                    {
                        case 'circle':
                            optgroup.append(
                                $("<option>")
                                    .attr({
                                        'value': 'range|' + range.planIDX,
                                        'data-color': range.color
                                    })
                                    .html(
                                        'Radius ' + range.radius.toLocaleString() + 
                                        ' @ ' + ingressplanner.gameworld.hashToNames(ingressplanner.utils.llstring(range.latLng))
                                    )
                            );
                            break;

                        case 'polygon':
                            optgroup.append(
                                    $("<option>")
                                    .attr({
                                        'value': 'range|' + range.planIDX,
                                        'data-color': range.color
                                    })
                                    .html('Polygon # ' + range.index)
                            );
                            break;
                    }
                });

                $('select[data-ranges]').append(optgroup);

            });

        }

        $.each($('select[data-ranges]'), function(index, val) {
        	 $(this).val($(this).data('prevSelection'));
        	 $(this).trigger('change');
        });

    }

    // invoked after a plan change.
    function buildPreview(previewSequence) {

// console.group('buildPreview');

        preview.steps = [];
        preview.existinglinks = [];

        // existing links at a given steps
        // [llstring, donenow]
        var links = [];

        $.each(previewSequence, function(sequenceIdx, planIDX) {

            var step = plan.steps[planIDX];
            var stepAnalysis = analysis.steps[planIDX];

            step.sequenceIdx = sequenceIdx;

            var portals = step.portals.split('|');

// console.debug(planIDX,step);

            preview.steps[sequenceIdx] = {
                planIDX: planIDX,
                marker: portals[0].split(','),
                portals: {},
                crosslinks: {},
                droppedcrosslinks: [],
                droppedblockingfields: [],
                nolongerblockedlinks: [],
                links: links.slice(0),
                fields: [],
                wastedfields: [],
                blockingFields: {},
                blockedVertexes: [],
                farmKeys: null,
                badDestinationReasons: [],
                stops: {
                    now: portals[0],
                    past: [],
                    future: [],
                }
            };

            if (sequenceIdx>0)
            {
                $.each(preview.steps[sequenceIdx-1].fields, function(index, prevField) {
                     preview.steps[sequenceIdx].fields.push([prevField[0],false]);
                });
            }

            $.each(stepAnalysis.actions, function(actionIdx, action) {

                switch (action.type)
                {
                    case 'keys':
                        preview.steps[sequenceIdx].farmKeys = action.farm;
                        break;

                    case 'take-down':
                        switch (action.reason)
                        {
                            case 'blocking-link':
                                if (preview.steps[sequenceIdx].droppedcrosslinks.indexOf(action.link)==-1)
                                {
                                    preview.steps[sequenceIdx].droppedcrosslinks.push(action.link);
                                }

                                var nolongerblockedlink = plan.steps[action.blockingIDX].portals.split('|').sort().join('|');

                                if (preview.steps[sequenceIdx].nolongerblockedlinks.indexOf(nolongerblockedlink)==-1)
                                {
                                    preview.steps[sequenceIdx].nolongerblockedlinks.push(nolongerblockedlink);
                                }
                                break;

                            case 'blocking-field':
                                if (preview.steps[sequenceIdx].droppedblockingfields.indexOf(action.field)==-1)
                                {
                                    preview.steps[sequenceIdx].droppedblockingfields.push(action.field);
                                }
                                break;
                        }
                        break;
                }
            })

            if (step.type=='link')
            {
                preview.steps[sequenceIdx].links.push([step.portals,true]);
                links.push([step.portals,false]);

                $.each(stepAnalysis.infos, function(infoIdx, info) {
                    if (info.type=='fields')
                    {
                        $.each(['createdFields','wastedFields'], function(whichIdx, which) {

                            $.each(info[which], function(fieldIdx, field) {
                                  
                              var vertexes = step.portals.split('|');

                                // other links building the field
                                $.each(field, function(linkIdx, link) {

                                    $.each(link.llstring.split('|'), function(index, vertex) {
                                        if (vertexes.indexOf(vertex)==-1)
                                        {
                                            vertexes.push(vertex);
                                        }
                                    });

                                    if (
                                        typeof link.planned == 'undefined'
                                        && preview.existinglinks.indexOf(link.llstring) == -1
                                    )
                                    {
                                        preview.existinglinks.push(link.llstring);
                                    }
                                });

                                if (which=='wastedFields')
                                {
                                    preview.steps[sequenceIdx].wastedfields.push(vertexes);
                                }
                                else
                                {
                                    preview.steps[sequenceIdx].fields.push([vertexes,true]);
                                }

                             });
                        });
                    }
                });

            }

            var crosslinks = [];

            $.each(stepAnalysis.errors, function(errorIdx, error) {
                 
                 switch (error.type)
                 {
                    case 'crosslinks':
                        $.each(error.crosslinks, function(crosslinkidx, crosslink) {
                            crosslinks.push(crosslink);
                        });
                        break;

                    case 'portal-inside-fields':
                        $.each(error.blockingFields, function(blockingFieldidx, blockingField) {
                            preview.steps[sequenceIdx].blockingFields[blockingField.llstring] = {
                                team: blockingField.teamDECODED,
                            }
                            if (typeof blockingField.planned != 'undefined')
                            {
                                preview.steps[plan.steps[blockingField.planned].sequenceIdx].blockedVertexes.push(portals[0]);
                            }
                        });
                        break;

                    case 'not-own-faction':
                    case 'no-keys-available':
                    case 'not-full-resos':
                        preview.steps[sequenceIdx].badDestinationReasons.push(error.type);
                        break;

                 }

            });

            for (var backIdx = sequenceIdx; backIdx >= 0; backIdx--) {

                if (backIdx < sequenceIdx)
                {
                    if (backIdx == (sequenceIdx-1))
                    {
                        preview.steps[sequenceIdx].stops.past = preview.steps[backIdx].stops.past.slice(0);
                    }

                    if (preview.steps[sequenceIdx].stops.now!=preview.steps[backIdx].stops.now)
                    {
                        if (backIdx == (sequenceIdx-1))
                        {
                            preview.steps[sequenceIdx].stops.past.unshift(preview.steps[backIdx].stops.now);
                        }

                        if (
                            (!preview.steps[backIdx].stops.future.length)
                            || preview.steps[backIdx].stops.future.slice(-1)[0] != preview.steps[sequenceIdx].stops.now
                        )
                        {
                            preview.steps[backIdx].stops.future.push(preview.steps[sequenceIdx].stops.now);
                        }

                    }

                }
                    

                $.each(stepAnalysis.portalsState, function(index, portalState) {

                    if (typeof preview.steps[backIdx].portals[portalState.llstring] == 'undefined')
                    {

                        preview.steps[backIdx].portals[portalState.llstring] = {
                            coords: portalState.llstring.split(','),
                            team: portalState.teamDECODED
                        };
                    }
                });

                $.each(crosslinks, function(crosslinkidx, crosslink) {
                    if (
                        typeof preview.steps[backIdx].crosslinks[crosslink.llstring] == 'undefined'
                        || (!preview.steps[backIdx].crosslinks[crosslink.llstring].activenow)
                    )
                    {
                        preview.steps[backIdx].crosslinks[crosslink.llstring] = {activenow:(backIdx == sequenceIdx),teamDECODED:crosslink.teamDECODED};
                    }
                        
                });
             
            };

            if (sequenceIdx>0)
            {
                $.each(preview.steps[sequenceIdx-1].crosslinks, function(llstring,crosslink) {
                     if (typeof preview.steps[sequenceIdx].crosslinks[llstring] == 'undefined')
                     {
                        preview.steps[sequenceIdx].crosslinks[llstring] = {activenow:null,teamDECODED:crosslink.teamDECODED};;
                     }
                });
            }

        });

        $.each(analysis.Portals, function(llstring, portalState) {

            for (var backIdx = previewSequence.length-1; backIdx >= 0; backIdx--)
            {
                if (typeof preview.steps[backIdx].portals[portalState.llstring] == 'undefined')
                {

                    preview.steps[backIdx].portals[portalState.llstring] = {
                        coords: portalState.llstring.split(','),
                        team: portalState.teamDECODED
                    };
                }

            }

        });

        if (preview.lastShownStep)
        {
            var stepToShow = preview.lastShownStep;
            preview.lastShownStep = null;

            if (typeof preview.steps[stepToShow-1] == 'undefined')
            {
                stepToShow = preview.steps.length;
            }

            if (stepToShow)
            {
                showPreview(stepToShow);
            }
            else
            {
                $('#planPreviewModal').modal('hide');
            }
                
        }

// console.groupEnd();

    }

    // invoked when the preview modal is shown for a given step
    function showPreview(stepToShow) {

        if (!preview.lastShownStep || stepToShow!=preview.lastShownStep)
        {
            preview.lastShownStep = stepToShow;
            preview.layers.portals.clearLayers();
            preview.layers.links.clearLayers();
            preview.layers.fields.clearLayers();
            preview.layers.blockings.clearLayers();

            $('#planPreviewControls nav li.previous').toggleClass('disabled',(stepToShow==1));
            $('#planPreviewControls nav li.next').toggleClass('disabled',(stepToShow==preview.steps.length));

            $('#planPreviewControls .moveStep[data-direction=up]').toggle(!(stepToShow==1));
            $('#planPreviewControls .moveStep[data-direction=down]').toggle(!(stepToShow==preview.steps.length));

            $('#planPreviewModal .modal-header h4 small').html(stepToShow + '/' + preview.steps.length);

            var step = preview.steps[stepToShow-1];
            var planStep = plan.steps[step.planIDX];

            var stepPortals = planStep.portals.split('|');

// console.debug('showPreview step',step,'planStep',planStep);

            var title = planStep.actionType + ' <strong>' + ingressplanner.gameworld.hashToNames(stepPortals[0]) + '</strong>';

            if (planStep.type == 'link')
            {
                title += ' -> ' + ingressplanner.gameworld.hashToNames(stepPortals[1]);
            }

            $('#planPreviewModal .modal-header h4 span').html(title);

            $('#planPreviewControls').attr('data-planidx',step.planIDX);
            $('#planPreviewControls .invertlink').toggle(planStep.type == 'link');

            $parentDiv = $('#stepsTableContainer');
            $innerListItem = $('a[data-target="#planPreviewModal"][data-animstep="'+stepToShow+'"]');

            stepsListBody.find('tr td.animstep').each(function(index, el) {

                $el = $(el);
                $(el).toggleClass('success',($el.attr('animstep')==stepToShow));

            });

            $innerListItem.parents('td').addClass('success');

            if ($('#planPreviewModal').is(':visible'))
            {
                $parentDiv.scrollTop($parentDiv.scrollTop() + $innerListItem.position().top
                    - $parentDiv.height()/2 + $innerListItem.height()/2)
                ;
            }

            var playerLL = L.latLng(step.marker);

            if (step.farmKeys)
            {

                var classNames = ['player'];
                if ((step.farmKeys.now+step.farmKeys.after)>0)
                {
                    if (step.farmKeys.now>0)
                    {
                        classNames.push('farmkeysnow');
                    }
                    else
                    {
                        classNames.push('shouldfarmkeys');
                    }
                }
                preview.layers.portals.addLayer(L.circleMarker(playerLL,{
                    radius: 12,
                    className: classNames.join(' '),
                    clickable: false,
                }));
            }

            if (!preview.playerMarker)
            {
                preview.playerMarker = L.marker(
                    playerLL,
                    {
                        icon: L.icon({
                            iconUrl: 'img/player-IITC-'+playerTeam+'.png',
                            iconSize: [25,41],
                            iconAnchor: [13,41],
                            clickable: false,
                            zIndexOffset: 100
                        })
                    }
                ).addTo(preview.map)
            }
            else
            {
                preview.playerMarker.setLatLng(playerLL);
            }

            $.each(['future','past'], function(index, when) {

                var last = step.stops.now;

                for (var i = 0; i < step.stops[when].length && i < 4; i++) {
                    if (typeof step.stops[when][i] != 'undefined')
                    {
                        var next = step.stops[when][i];

                        var leg = [last,next];

                        if (when=='past')
                        {
                            leg.reverse();
                        }

                        ingressplanner.router.addRoutePoly(
                            leg[0],
                            leg[1],
                            preview.layers.portals,
                            {
                                className: 'route ' + when,
                                clickable: false,
                                weight: 4-(0.5*i),
                                opacity: 1-(0.15*i),
                            }
                        );

                        last = next;
                    }
                };

            });

            var portalPointsArray = [];

            $.each(step.portals, function(llstring, portal) {

                portalPointsArray.push(portal.coords);

                var llngObj = new L.latLng(portal.coords);

                preview.layers.portals.addLayer(
                    L.circleMarker(llngObj,{
//                        clickable: false,
                        className: ['portal',portal.team].join(' '),
                        radius: 8
                    })
                    .bindLabel(ingressplanner.gameworld.hashToNames(llstring),portal)
                );

                if (step.blockedVertexes.indexOf(llstring)!=-1)
                {
                    preview.layers.portals.addLayer(
                        L.circleMarker(llngObj,{
                            clickable: false,
                            className: 'blocked',
                            radius: 12
                        })
                        .bindLabel('This is an origin portal for following links, but it will be blocked by the created field')
                    );
                }

                if (step.badDestinationReasons.length && llstring == planStep.portals.split('|')[1])
                {

                    var reasons = $.map(step.badDestinationReasons, function(reason) {
                        switch (reason)
                        {
                            case 'no-keys-available':
                                return 'You don\'t have enough keys';

                            case 'not-own-faction':
                                return 'It is not your faction';

                            case 'not-full-resos':
                                return 'It has less than 8 resos deployed';

                            default:
                                return reason;
                        }
                    });

                    reasons = 
                        'The destination portal cannot be linked:<ul><li>'
                        + reasons.join('</li><li>')
                        + '</li></ul><br>'
                        + 'Click to add a stop to it before current step'
                    ;

                    preview.layers.portals.addLayer(
                        L.circleMarker(llngObj,{
                            className: 'baddestination',
                            radius: 12
                        })
                        .bindLabel(reasons)
                        .on('click', function(e) {
                            preview.lastShownStep++;
                            eventHandler('addMarkerBefore',{
                                planIdx: step.planIDX,
                                portal:  llstring
                            });
                        })
                    );
                }
            });

            $.each(preview.existinglinks, function(linkIdx, link) {
                var pts = link.split('|');
                var classNames = ['link',playerTeam,'existing'];

                portalPointsArray.push(pts[0].split(','));
                portalPointsArray.push(pts[1].split(','));

                preview.layers.links.addLayer(L.polyline(
                    [L.latLng(pts[0].split(',')),L.latLng(pts[1].split(','))],
                    {
                        clickable: false,
                        className: classNames.join(' '),
                    }
                ));

            });

            $.each(step.droppedcrosslinks, function(linkIdx, link) {
                var pts = link.split('|');
                var classNames = ['link','crosslink','dropped'];

                portalPointsArray.push(pts[0].split(','));
                portalPointsArray.push(pts[1].split(','));

                preview.layers.links.addLayer(
                    L.polyline(
                        [L.latLng(pts[0].split(',')),L.latLng(pts[1].split(','))],
                        {
                            clickable: false,
                            className: classNames.join(' '),
                        }
                    )
                );

            });

            $.each(step.nolongerblockedlinks, function(linkIdx, link) {
                var pts = link.split('|');
                var classNames = ['link',playerTeam,'future'];

                preview.layers.links.addLayer(L.polyline(
                    [L.latLng(pts[0].split(',')),L.latLng(pts[1].split(','))],
                    {
                        clickable: false,
                        className: classNames.join(' '),
                    }
                ));

            });

            $.each(step.links, function(linkIdx, link) {

                var pts = link[0].split('|');
                var classNames = ['link'];

                var plOptions = {
                    clickable: false
                };

                if (link[1])
                {
                    classNames.push('donenow');
                    plOptions.zIndexOffset = 100;
                }
                else
                {
                    classNames.push(playerTeam);
                }

                plOptions.className = classNames.join(' ');

                preview.layers.links.addLayer(L.polyline(
                    [L.latLng(pts[0].split(',')),L.latLng(pts[1].split(','))],
                    plOptions
                ));

            });

            $.each(['fields','wastedfields'], function(whichIdx, which) {

                $.each(step[which], function(fieldIdx, field) {

                    var classNames = ['field'];
                    var vertexes = null;

                    if (which=='fields')
                    {
                        vertexes = field[0];
                        classNames.push(playerTeam);

                        var llstring = vertexes.sort().join('|');

                        if (typeof step.blockingFields[llstring] != 'undefined')
                        {
                            classNames.push('blocking');
                            classNames.push('planned');
                            delete step.blockingFields[llstring];
                        }

                        if (field[1])
                        {
                            classNames.push('donenow');
                        }
                    }
                    else
                    {
                        vertexes = field;
                        classNames.push('wasted');
                    }

                    var layer = L.polygon(
                        [
                            L.latLng(vertexes[0].split(',')),
                            L.latLng(vertexes[1].split(',')),
                            L.latLng(vertexes[2].split(','))
                        ],
                        {
                            clickable: false,
                            className: classNames.join(' '),
                        }
                    );

                    if (which=='wastedfields')
                    {
                       layer.bindLabel('This field will not be created (wasted)');
                    }

                    preview.layers.fields.addLayer(layer);

                });

            });

            $.each(step.droppedblockingfields, function(fieldIdx, field) {

                var classNames = ['field','blocking','dropped'];
                var vertexes = field.split('|');

                portalPointsArray.push(vertexes[0].split(','));
                portalPointsArray.push(vertexes[1].split(','));
                portalPointsArray.push(vertexes[2].split(','));

                preview.layers.fields.addLayer(L.polygon(
                    [
                        L.latLng(vertexes[0].split(',')),
                        L.latLng(vertexes[1].split(',')),
                        L.latLng(vertexes[2].split(','))
                    ],
                    {
                        clickable: false,
                        className: classNames.join(' '),
                    }
                ));

            });

            var blockingPortalsMapped = {};

            $.each(step.crosslinks, function(llstring, crosslink) {

                var crosslinkVertexes = llstring.split('|');

                $.each(crosslinkVertexes, function(crosslinkVertexidx, crosslinkVertex) {
                     if (typeof blockingPortalsMapped[crosslinkVertex] == 'undefined')
                     {
                        blockingPortalsMapped[crosslinkVertex] = crosslink.teamDECODED;
                     }
                });

                var classNames = ['link','crosslink'];

                if (crosslink.activenow===false)
                {
                    classNames.push('future');
                }
                else if (crosslink.activenow===null)
                {
                    classNames.push('past');
                }

                preview.layers.blockings.addLayer(L.polyline(
                    [L.latLng(crosslinkVertexes[0].split(',')),L.latLng(crosslinkVertexes[1].split(','))],
                    {
                        clickable: false,
                        className: classNames.join(' '),
                    }
                ));
            });

            $.each(step.blockingFields, function(llstring, blockingField) {

                var classNames = ['field',blockingField.team,'blocking'];
                var vertexes = llstring.split('|');

                $.each(vertexes, function(vertexidx, vertex) {
                     if (typeof blockingPortalsMapped[vertex] == 'undefined')
                     {
                        blockingPortalsMapped[vertex] = blockingField.team;
                     }
                });

                preview.layers.blockings.addLayer(L.polygon(
                    [
                        L.latLng(vertexes[0].split(',')),
                        L.latLng(vertexes[1].split(',')),
                        L.latLng(vertexes[2].split(','))
                    ],
                    {
                        clickable: false,
                        className: classNames.join(' '),
                    }
                ));
            });

            $.each(blockingPortalsMapped, function(blockingPortal, teamDECODED) {

                var coords = blockingPortal.split(',');

                portalPointsArray.push(coords);

                preview.layers.blockings.addLayer(
                    L.circleMarker(L.latLng(coords), {
                        className: 'portal blocking ' + teamDECODED,
                        radius: 6
                    })
                    .bindLabel(ingressplanner.gameworld.hashToNames(blockingPortal) + '<br>Blocking Portal<br>Click to add a take-down stop before current step')
                    .on('click', function(e) {
                        preview.lastShownStep++;
                        eventHandler('addMarkerBefore',{
                            planIdx: step.planIDX,
                            portal:  blockingPortal,
                                reverse: true
                        });
                    }))
                ;

            });

        }

        return portalPointsArray;

    }

    function buildStepsTable()
    {

    	clearPopovers();

        var tabIcon = 'remove';

        stepsListHead.find('[data-keyfarming]').toggle(plan.options.planKeyFarming);

        stepsListBody.html('');

		$("#steps tfoot").remove();
        var totalAP = null;
        var totalCreatedFields = null;

        var textualInfo = [];

        var selectOptions = [];

        var previewSequence = [];

        var reverses = {
            count: 0,
            name:   'ADA/Jarvis',
            action: 'Reverse ',
        };

        $('select[data-planportals]').each(function() {
            $this = $(this);
            $this.data('prevSelection',$this.val());
            $this.html('');
        });

        var opposingTeam = null;

        switch (playerTeam)
        {
            case 'ENLIGHTENED':
                opposingTeam = 'RESISTANCE';
                reverses.name = 'ADA Refactor';
                reverses.action = 'ADA on it';
                break;
            case 'RESISTANCE':
                opposingTeam = 'ENLIGHTENED';
                reverses.name = 'Jarvis Virus';
                reverses.action = 'Jarvis on it';
                break;
        }

        var SBULAs = {};

        $.each(plan.steps, function(planIDX, step) {

            if (step.type == 'other')
            {
                return;
            }

            var rowClass = [];

            var doneLink = false;

            var 
                createdFields = 0,
                wastedFields = 0
            ;

            var revBtnClass = null;

            var stepAnalysis = analysis.steps[planIDX];

            $.each(stepAnalysis.infos, function(index, info) {
                switch(info.type)
                {
                    case 'link-done':
                        doneLink = true;
                        return;
                        break;

                    case 'fields':
                        createdFields = info.createdFields.length;
                        wastedFields = info.wastedFields.length;
                        break;

                    case 'can-reverse':
                        revBtnClass = 'reverse';
                        break;

                    case 'can-cancelreverse':
                        revBtnClass = 'reverse cancel';
                        break;

                    default:
                        ingressplanner.warn('UI unmanaged info "' + info.type + '"', info);
                        break;
                }
            });

            var stepPortals = step.portals.split('|');

            var APTD = $('<td>');
            var stepAP = 0;

            if (stepAnalysis.aprewards.length)
            {
                APTD.data('aprewards',stepAnalysis.aprewards).addClass('aprewards');
                $.each(stepAnalysis.aprewards, function(index, apreward) {
                     stepAP += apreward.value * apreward.qty
                });
                APTD.html(stepAP.toLocaleString());
                if (totalAP === null)
                {
                    totalAP = 0;
                }
                totalAP += stepAP;
            }

            $('select[data-planportals]').each(function() {

                $select = $(this);
                $.each(stepPortals, function(index, llstring) {
                     if ($select.find('option[value="'+llstring+'"]').length==0)
                     {
                        $select.append(
                            $('<option>')
                                .attr({
                                    'value': llstring,
                                    'data-color': step.color
                                })
                                .html(ingressplanner.gameworld.hashToNames(llstring))
                        );
                     }
                });

            });

            if (doneLink && (!plan.options.showDoneLinks))
            {
                return;
            }

            textualInfo[planIDX] = [];

            var rowActions = [];

            var type = 'Portal';
            var nothingtodo = true;

            var animStep = true;

            var fromPortal = stepAnalysis.portalsState[0];

            fromPortal.name = fromPortal.llstring;

            if (typeof fromPortal.title != 'undefined')
            {
            	fromPortal.name = fromPortal.title;
            }

            var fromPortalTD = portalTDHTML(fromPortal,playerTeam).attr('data-pll',stepPortals[0]);

            var toPortal = null;
            var toPortalTD = $('<td>');

            var prepToType = null;

            if (plan.options.planKeyFarming)
            {
                var keyNowTD = $('<td>');
                var keyTotalTD = $('<td>');
                var keyAfterTD = $('<td>');
            }

            if (step.type == 'link')
            {
            	type = 'Link';

                if (doneLink)
                {
                    type = 'Link (done)';
                }
                else
                {
                    nothingtodo = false;
                }

                toPortal = stepAnalysis.portalsState[1];
                toPortal.name = toPortal.llstring;

	            toPortalTD = portalTDHTML(toPortal,playerTeam).attr('data-pll',stepPortals[1]);
            }

            if (!doneLink)
            {

	            var todo = {
	                'take-down':    false,
	                'capture':      false,
	                'full-resos':   false,
	                'keys':   		false,
	            };

	            var tdActions = Object.keys(todo);

	            $.each(stepAnalysis.actions, function(actionIDX, action) {

	            	if (tdActions.indexOf(action.type)!=-1)
	            	{
	            		if (action.type=='keys')
	            		{
		            		todo[action.type] = action;
	            		}
	            		else
	            		{
		            		todo[action.type] = true;
	            		}
	            	}
	            	else
	            	{
	            		ingressplanner.warn('UI unmanaged action "'+action.type+'"',action);
	            	}

	            });

	            if (todo['keys'])
	            {

                    nothingtodo = false;

	            	var allocatedTotal = todo['keys']['allocated'].now+todo['keys']['allocated'].after;
	            	var farmTotal = todo['keys']['farm'].now+todo['keys']['farm'].after;

					var parts = [];

					var minmax = [];
					if (allocatedTotal!= 0 && farmTotal == allocatedTotal)
					{
						// we have no keys, everything is to be farmed
						var verb = 'Farm';

						// at least we need to farm the keys for the immediately following links
						minmax.push(todo['keys']['farm'].now);
						if (todo['keys']['farm'].after)
						{
							// since we'll need to farm more in following visits, we also might take them now
							minmax.push(allocatedTotal);
						}
					}
					else if(allocatedTotal!= 0 &&  farmTotal==0)
					{
						// we have all keys, nothing is to be farmed
						var verb = 'Check';

						// we just check we still have all the total needed keys
						minmax.push(allocatedTotal);
					}
					else
					{
						// we have some keys and some must be farmed
						var verb = 'Check/Farm';

						// we must have on our hand at least the keys for the immediately following links
						minmax.push(todo['keys']['allocated'].now);
						if (todo['keys']['allocated'].after)
						{
							// since we'll need more keys in following visits, we also might take them now
							minmax.push(allocatedTotal);
						}

						// we do know that we'll have for sure to have had farmed some quantities now
						if (todo['keys']['farm'].now>0)
						{
							parts.push(todo['keys']['farm'].now + ' farmed');
						}

					}

					parts.unshift(verb + ' ' + minmax.join('/'));

                    textualInfo[planIDX].push('KEYS: ' + parts.join(', '))

	            	var totstops = todo['keys'].doneVisits+1;
	            	if (fromPortal.keysFarmed)
	            	{
		            	var keyNow = fromPortal.keysFarmed;

		            	if (todo['keys'].doneVisits)
		            	{
		            		keyNow += ' @ total ' + totstops + ' stops'
		            	}

		            	keyNowTD.html(keyNow);

		            	if (fromPortal.keysFarmed/totstops > plan.options.keyFarmLimit)
		            	{
		            		fromPortalTD.append(addPortalStopBtn);
		            		keyNowTD
			            		.wrapInner(
			            			$('<span>')
			            			.addClass('badge badge-danger')
			            		)
		            			.addClass('warning tooMuchFarming hasPopover')
		            			.data('farm',{when:'now',qty:fromPortal.keysFarmed,stops:totstops,'limit':plan.options.keyFarmLimit})
		            		;
		            	}
	            	}

	            	if (farmTotal)
	            	{
	            		if (farmTotal == fromPortal.keysFarmed)
	            		{
	            			rowClass.push('nokeyTotalTD');
	            			keyNowTD.attr('colspan',2);
	            			keyTotalTD = null;
	            		}
	            		else
	            		{
			            	var keyTotal = farmTotal;
			            	totstops += todo['keys'].remainingVisits;

			            	if (todo['keys'].remainingVisits)
			            	{
			            		keyTotal += ' @ total ' + totstops + ' stops'
			            	}

			            	keyTotalTD.html(keyTotal);

			            	if (farmTotal/totstops > plan.options.keyFarmLimit)
			            	{
			            		fromPortalTD.append(addPortalStopBtn);
			            		keyTotalTD
				            		.wrapInner(
				            			$('<span>')
				            			.addClass('badge badge-danger')
				            		)
			            			.addClass('warning tooMuchFarming hasPopover')
			            			.data('farm',{when:'total',qty:farmTotal,stops:totstops,'limit':plan.options.keyFarmLimit})
			            		;
			            	}
	            		}
	            	}
	            }

	            if (step.type == 'reverse')
	            {
	                reverses.count++;
	                type = reverses.name;
                    nothingtodo = false;
                    textualInfo[planIDX].push(reverses.action)
	            }

            	if (type=='Portal')
            	{

                    if (todo['keys'])
                    {
                        type = 'Keys';
                        nothingtodo = false;
                    }

		            if (todo['take-down'])
		            {
		                type = 'Take Down';
                        textualInfo[planIDX].push('Take Down');
                        nothingtodo = false;
		            }

		            if (todo['capture'])
		            {
		            	type = 'Capture';
		            	var todoAction = 'Capture ';
		                
		                if (todo['full-resos'])
		                {
		                	todoAction += '& full resos ';
		                }
                        textualInfo[planIDX].push(todoAction);
                        nothingtodo = false;
		            }
		            else if (todo['full-resos'])
		            {
		            	type = 'Full resos';
                        textualInfo[planIDX].push('Full resos');
                        nothingtodo = false;
		            }

		            if (type != 'Portal')
		            {
		            	revBtnClass = null;
		            }
            	}

				delete todo;

                if (nothingtodo)
                {
                    var verb = '? Visit';

                    if (stepAP && fromPortal.teamDECODED == opposingTeam)
                    {
                        verb = 'Take Down (for AP)';
                    }
                    else if (plan.options.fullresosOnTouchedPortals && fromPortal.resCount<8)
                    {
                        if (fromPortal.teamDECODED == playerTeam)
                        {
                            verb = 'Full resos';
                        }
                        else
                        {
                            verb = 'Capture & Full resos';
                        }
                        
                    }
                    textualInfo[planIDX].push(verb);

                }

	            $.each(stepAnalysis.errors, function(index, error) {

	                switch(error.type)
	                {

	                	case 'linksOut':
	                		prepToType = $(linkOutCountErrPrepend)
	                    		.attr('title','More than '+ error.maxLinkOut +' outgoing links!')
	                    		.append($('<span>').html('&nbsp;'+error.linksOut))
	                    	;
	                        break;

	                    case 'not-full-resos':

                        	if (!toPortalTD.hasClass('danger'))
                        	{
                        		toPortalTD.addClass('danger');
                        	}
                        	toPortalTD.data('not-full-resos',true);
                        	toPortalTD.prepend($(noFullResosPrepend).html(error.resCount)).append(addPortalStopBtn);
	                    	break;


	                    case 'not-own-faction':

                        	if (!toPortalTD.hasClass('danger'))
                        	{
                        		toPortalTD.addClass('danger');
                        	}
                        	toPortalTD.data('not-own-faction',true);
                        	toPortalTD.append(addPortalStopBtn);
	                    	break;

	                    case 'no-IITC-portal-data':
	                    	var which = null;
	                        if (error.portalIDX==0)
	                        {
	                        	which = fromPortalTD;
	                        }
	                        else
	                        {
	                        	which = toPortalTD;
	                        }

	                        if (which && (!which.data('noIITCData')))
	                        {
	                        	which.data('noIITCData',true).prepend(noIITCDataPrepend);
	                        	if (!which.hasClass('danger'))
	                        	{
	                        		which.addClass('danger');
	                        	}
	                        }
	                        break;

	                    case 'portal-inside-fields':
	                        var blockingfieldsCount = error.blockingFields.length;
	                        var noun = 'fields';
	                        if (blockingfieldsCount==1)
	                        {
	                            noun = 'field';
	                        }

	                        var blockingfieldText = 'Portal is inside ' + blockingfieldsCount + ' ' + noun;

	                        fromPortalTD
	                        	.addClass('danger')
	                        	.data('blockingfieldText',blockingfieldText)
	                        	.prepend(
		                            $("<span>").attr({
		                                'class': 'occludingFields label label-danger',
		                                'title': blockingfieldText
		                            })
		                            .data('blockingfields',error.blockingFields)
		                            .data('planIDX',planIDX)
		                            .data('destPortal',stepPortals[1])
		                            .html("Δ&nbsp;&nbsp;"+blockingfieldsCount)
		                        );

	                        break;

	                    case 'crosslinks':

                            var crossTypes = [];

	                        $.each(error.crosslinks, function(crosslinkIDX, crosslink) {

	                            var origins = crosslink.llstring.split('|');
	                            var cllabel = 'unknow';
	                            var clclass = 'warning';

	                            var team = '';

	                            var nobtns = false;

	                            if (typeof crosslink.planned != 'undefined')
	                            {
	                                team = playerTeam;
	                                cllabel = 'PLANNED';
	                                clclass = 'danger ';
	                                nobtns = true;
	                            }
	                            else if (typeof crosslink.teamDECODED != 'undefined')
	                            {
	                                team = crosslink.teamDECODED;
	                                if (crosslink.teamDECODED==playerTeam)
	                                {
	                                    cllabel = 'Own faction';
	                                    clclass = 'danger team-' + playerTeam;
	                                }
	                                else
	                                {
	                                    cllabel = 'Enemy faction';
	                                }

                                    if (crossTypes.indexOf(cllabel)==-1)
                                    {
                                        crossTypes.push(cllabel);
                                    }

	                            };

	                            var clDivAddclass = ''

	                            if (!nobtns)
	                            {
	                            	clDivAddclass = 'crosslink hasPopover ';
	                            }

	                            var originsName = origins.slice(0);

	                            $.each(originsName, function(index, originName) {

	                                originsName[index] = portalTitleHTML(originName);

	                                if (!nobtns)
	                                {
	                                    originsName[index] = $(addPortalStopBtn).add(originsName[index]);
	                                }

	                            });

                                var tr = $('<tr>')
                                    .addClass('auto ' + clclass)
                                    .attr('data-planidx',planIDX)
                                    .append($('<td>').attr({'colspan':3}).append($("<div>").addClass(clDivAddclass + 'text-danger').html(cllabel + ' Crosslink!')))
                                    .append($('<td>').attr({'data-pll':origins[0]}).html(originsName[0]))
                                ;

                                if (plan.options.planKeyFarming)
                                {
                                    tr
                                        .append($('<td>'))
                                        .append($('<td>'))
                                    ;
                                }
                                tr
                                    .append($('<td>').attr({'data-pll':origins[1]}).html(originsName[1]))
                                    .append($('<td>'))
                                ;

                                if (plan.options.planKeyFarming)
                                {
                                    tr
                                        .append($('<td>'))
                                    ;
                                }

	                            stepsListBody.append(tr);
	                        });

                            if (crossTypes.length)
                            {
                               type += ' (' + crossTypes.join(' and ') + ' Crosslinks)';
                            }

	                        break;

	                    default:
	                        ingressplanner.warn('UI unmanaged error "'+error.type+'"',error);
	                        break;
	                }
	            });

            }

            var TypeText = $('<div>').append($('<span>').html(type));

            step.actionType = type;

            if (prepToType)
            {
            	TypeText.prepend(prepToType);
            }

            $.each(stepAnalysis.warnings, function(index, warning) {
                switch(warning.type)
                {
                	case 'linksOut':
                        TypeText.prepend(
                        	$(linkOutCountWarnPrepend)
                        		.attr('title','More than '+warning.maxLinkOut+' outgoing links, SBULA needed!')
                        		.append($('<span>').html('&nbsp;'+warning.linksOut))
                        );

                        var needed = Math.ceil((warning.linksOut-warning.maxLinkOut)/warning.maxLinkOut);

                        if (
                        	typeof SBULAs[stepPortals[0]] == 'undefined'
                        	|| SBULAs[stepPortals[0]].needed < needed
                        )
                        {
                        	SBULAs[stepPortals[0]] = {
                        		name: fromPortal.name,
                        		needed: needed
                        	};
                            textualInfo[planIDX].push('Check/equip o total of ' + needed + ' SBULA');
                        }
                        break;

                    default:
                        ingressplanner.warn('UI unmanaged warning "'+warning.type+'"',warning);
                        break;
                }
            });


            if (step.type == 'link')
            {
            	rowActions.push(invertlinkBtn);

                if (typeof toPortal.title != 'undefined')
                {
                	toPortal.name = toPortal.title;
                }

                if (!doneLink)
                {
                	if ((!plan.options.HLPlanning) && plan.options.planKeyFarming)
                	{
	            		// keys situation before th visit
	            		var available = 
	            			stepAnalysis.portalsState[1].keys 
	            			+ stepAnalysis.portalsState[1].keysFarmed 
	            			- stepAnalysis.portalsState[1].keysUsed 
	            			//  after the link
	            			- 1
	            		;

						keyAfterTD.html(available);
						if (available<0)
						{
							keyAfterTD.addClass('danger text-danger').wrapInner('<span class="badge badge-danger missingKeys hasPopover"></span>');
							toPortalTD.data('missing-keys',true).append(addPortalStopBtn);
						}

                	}

	                var todo = 'LINK -> ' + toPortal.name;

	                var suffix = '';

	                if (createdFields)
	                {
	                    var noun = 'fields';
	                    if (createdFields==1)
	                    {
	                        noun = 'field';
	                    }
	                    suffix += '+ ' + createdFields + ' ' + noun;
	                }

	                if (wastedFields)
	                {
	                    suffix += ' - ' + wastedFields + ' wasted';
	                }

	                if (suffix)
	                {
	                    todo += ' (' + suffix + ')';
	                }

                    textualInfo[planIDX].push(todo);
                }
            	else
            	{
                    animStep = false;
            	}

            }

            TypeText.prepend(
                $('<div>')
                    .addClass('colorbox')
                    .css('background-color', step.color)
                    .data('itemColor',{
                        hex: step.color,
                        target: ['planIDX',planIDX]
                    })
            );

            selectOptions.push(
                [
                    planIDX,
                    type,
                    stepPortals.slice(0),
                    step.type,
                    step.color
                ]
            );


            if (revBtnClass)
            {
                if (revBtnClass=="reverse")
                {
                        revBtnTxt = 'use ' + reverses.name;
                }
                else
                {
                        revBtnTxt = 'remove ' + reverses.name;
                }

                TypeText
                    .append('&nbsp;')
                    .append($("<button>").addClass(revBtnClass + ' btn btn-default btn-xs').html(revBtnTxt))
                ;
            }

            var typeTD = $('<td>').append(TypeText);

            if (createdFields || wastedFields)
            {
            	var fieldsDiv = $('<div>')
            		.addClass('fieldsDone')
            		.data(
            			'fieldsDone',
        				{
		            		createdFields: createdFields,
		            		wastedFields:  wastedFields
	            		}
	            	)
	            ;

	            if (createdFields)
	            {
	                fieldsDiv.append($('<div>')
	                    .addClass('label label-success createdFields')
	                    .html("Δ  " + createdFields))
	                ;

	                if (totalCreatedFields === null)
	                {
	                  totalCreatedFields = 0;
	                }

	                totalCreatedFields += createdFields;
	            }

	            if (wastedFields)
	            {
	            	typeTD.addClass('warning');
	                fieldsDiv
	                	.append($('<div>')
	                    .addClass('label label-warning wastedFields')
	                    .html("Δ -" + wastedFields))
	                ;
	            }

	            typeTD.append(fieldsDiv);

            }

            if (doneLink)
            {
            	rowClass.push('success');
            }

            if ((!doneLink) && tabIcon == 'remove')
            {
                tabIcon = 'ok';
            }

            if (stepAnalysis.errors.length)
            {
                tabIcon = 'warning-sign';
            }

            rowActions.push(removeStepBtn);

            rowActions.push(moveItemUp);
            rowActions.push(moveItemDown);

            rowActions.push(moveItemToolBtn);


            var tdRowActions = $('<td>');

            $.each(rowActions, function(index, toAppend) {
            	 tdRowActions.append(toAppend);
            });

            var animTDattr = {};

            if (animStep)
            {
                previewSequence.push(planIDX);
                animTDattr['data-animstep'] = previewSequence.length;
                animStep = $('<a>')
                    .attr({
                        'data-toggle': 'modal',
                        'data-target': '#planPreviewModal',
                        'data-animstep': previewSequence.length
                    })
                    .addClass('hasPopover')
                    .html(previewSequence.length)
                ;
            }

            var tr = $('<tr>')
                .attr({
                    'data-planidx': planIDX,
                    'class':        rowClass.join(' ')
                })
                .append(tdRowActions)
                .append(typeTD)
                .append($('<td>').addClass('animstep').attr(animTDattr).append(animStep))
                .append(fromPortalTD)
            ;

            if (plan.options.planKeyFarming)
            {
                tr
                    .append(keyNowTD)
                    .append(keyTotalTD)
                ;
            }

            tr.append(toPortalTD);

            if (plan.options.planKeyFarming)
            {
                tr.append(keyAfterTD);
            }

            tr.append(APTD);

            stepsListBody.append(tr);

        });

        stepsListBody.find('tr:first .moveStep[data-direction=up]').remove();
        stepsListBody.find('tr:last .moveStep[data-direction=down]').remove();

        buildPreview(previewSequence);

        var footColspan = plan.options.planKeyFarming ? 8 : 5;
        var footTableRow = $('<tr>');

        if (totalCreatedFields !== null)
        {
            footTableRow
                .append($('<td>').addClass('text-right').html('Fields:'))
                .append($('<td>').html(totalCreatedFields.toLocaleString()))
            ;

            footColspan -= 2;
        }

        if (totalAP !== null)
        {
            footTableRow
                .append($('<td>').addClass('text-right').attr({'colspan': footColspan}).html('Total-AP:'))
                .append($('<td>').html(totalAP.toLocaleString()))
            ;
        }

        if ((totalCreatedFields !== null) || (totalAP !== null))
        {
            $("#steps")
                .append($('<tfoot>').append(footTableRow))
            ;
        }

        StepsIcon.attr('class','glyphicon glyphicon-'+tabIcon);

        reduceTable();

        $('select[data-steps]').each(function() {
        	$this = $(this);
        	$this.data('prevSelection',$this.val());
        	$this.html('');
        });

        var optGroup = null;

        function addToOptGroup(target)
        {

			if (typeof target != 'undefined')
			{

                var optionAttrs = {
                    'value':target[0],
                    'data-color':target[4],
                    'data-actiontype': target[1]
                };

                $.each(target[2], function(stepPortalIdx, stepPortal) {
                     optionAttrs['data-portal'+stepPortalIdx] = stepPortal;
                });

	        	$('select[data-steps="'+target[3]+'"]').append(
	        		$("<option>")
		    	 		.attr(optionAttrs)
		    	 		.html(ingressplanner.gameworld.hashToNames(target[2]))
	        	);
			}

        	var from = null;
        	var text = null;
        	var value = null;

        	if (typeof target != 'undefined')
        	{
		    	value = target[0];
		    	text = target[1];

        		from = ingressplanner.gameworld.hashToNames(target[2].shift());

		    	if (target[2].length)
		    	{
		    		text += ' -> ' + ingressplanner.gameworld.hashToNames(target[2].shift());
		    	}

        	}

	    	if (!optGroup || optGroup.attr('label')!=from)
	    	{
	    		if (optGroup)
	    		{
	    			$('select[data-steps="all"]').append(optGroup.clone());
	    		}

	    		optGroup = null;

	    		if (from)
	    		{
	    			optGroup = $("<optgroup>").attr('label',from);
	    		}
	    			
	    	}

	    	if (text && optGroup)
	    	{

		    	optGroup.append(
		    	 	$("<option>")
		    	 		.attr(optionAttrs)
		    	 		.html(text)
		    	 );
	    	}
	    
        }

        $.each(selectOptions, function(index, target) {
        	addToOptGroup(target)
        });

        addToOptGroup();

        moveItemBeforeSelect.append(
    	 	$("<option>")
    	 		.attr({
    	 			'value': 'end',
    	 		})
    	 		.html('- move to the end -')
       	);

        $('select[data-steps], select[data-planportals]').each(function() {
        	 $(this).val($(this).data('prevSelection'));
        });

        $('select[data-steps], select[data-planportals]').trigger('change');

        var totSBULAs = 0;

        var todolines = [];

        $.each(SBULAs, function(ppLLstring, pp) {
        	totSBULAs += pp.needed;
        	todolines.unshift('* Check ' + pp.name + ' on Intel to make sure it is/can be equipped with ' + pp.needed + ' SBULA.');
        });

        if (totSBULAs>0)
        {
        	todolines.unshift('** Check SBULA inventory, a total of ' + totSBULAs + ' will need to be equipped.');
        }

        if (reverses.count)
        {
            todolines.unshift('** Check ' + reverses.name + ' inventory: ' + reverses.count + ' min.');
        }

        if (!plan.options.planKeyFarming)
        {

            var keyPortals = $.map(analysis.Portals, function(portal) {
                if (portal.linksIn)
                {
                    var title = ingressplanner.gameworld.hashToNames(portal.llstring);
                    return {
                        title: title,
                        keys:  portal.linksIn,
                        ordering: title.trim().toLowerCase()
                    };
                }
            }).sort(function(a,b){
                if (a.ordering==b.ordering)
                {
                    return 0
                }

                if (a.ordering<b.ordering)
                {
                    return -1;
                }
                else
                {
                    return 1;
                }
            });

            if (keyPortals.length)
            {
                todolines.push('** Check keys:');
                $.each(keyPortals, function(index, keyPortal) {
                     todolines.push('  ' + keyPortal.title + ': ' + keyPortal.keys);
                });
            }
        }

        buildTextuals(todolines,textualInfo);

        var swatches = Object.keys(analysis.colors);

        $.each(ingressplanner.utils.colors(), function(idx,hex) {
             if (swatches.indexOf(hex)==-1) {
                swatches.push(hex);
             }
        });

        changeColorsDiv.find('.colorbox')
            .ColorPickerSliders({
                placement: 'auto',
                title: 'Change selected items color',
                previewformat: 'hex',
                hsvpanel: true,
                sliders: false,
                swatches: swatches,
                customswatches: 'plan',
                onchange: function(container, color)
                {
                    var hex = color.tiny.toHexString();
                    changeColorsDiv.find('.colorbox')
                        .data('hex',hex)
                        .css('background-color',hex);

                    $('#changeColorsBtn').removeProp('disabled');
                }
              })
        ;

        stepsListBody.find('.colorbox').each(function(index) {

            var $this = $(this);
            var target =  $this.data('itemColor');
            var prevColor = target.hex;
            var newHex = prevColor;

            $this
                .ColorPickerSliders({
                    color: target.hex,
                    size: 'sm',
                    placement: 'auto',
                    title: 'Change item color',
                    previewformat: 'hex',
                    hsvpanel: true,
                    sliders: false,
                    swatches: swatches,
                    customswatches: 'plan',

                    onchange: function(container, color)
                    {
                        newHex = color.tiny.toHexString();
                    }

                  })
                .on('hidden.bs.popover',function() {
                    if (newHex!=prevColor)
                    {
                        prevColor = newHex;
                        eventHandler('changeItemColor',{target:target,newHex:newHex});
                    }
                })
            ;

        });
	}

// exposed methods

	return {

		init: function(mainUIEventHandler) {

			eventHandler = mainUIEventHandler;

            $('#leafletVersionSpan').html(L.version);
            $('#leafletLabelVersionSpan').html(L.labelVersion);
            preview.map = L.map('planPreviewCanvas');

            L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(preview.map);

            preview.layers = {
                portals: new L.layerGroup(),
                links: new L.layerGroup(),
                fields: new L.layerGroup(),
                blockings: new L.layerGroup(),
            };
            preview.layers.portals.addTo(preview.map);
            preview.layers.links.addTo(preview.map);
            preview.layers.fields.addTo(preview.map);
            preview.layers.blockings.addTo(preview.map);

            exportDrwToFileButton.on('click', function() {
                eventHandler('exportPlanDrawing');
                return false;
            });

            exportPlanToFileButton.on('click', function() {
                eventHandler('exportPlan');
                return false;
            });

            $("#importPlanText").on('click', function() {
                eventHandler('importPlanText');
            });

            $("#importPlanFile").on('click', function() {
                $('#importPlanFileControl').click();
            });

            $('#importPlanFileControl').on('change',function() {
                if ($(this).val())
                {
                    eventHandler('importPlan',{file:this.files[0]});
                }
            })



            $('body')

                .on('shown.bs.modal', '#planPreviewModal',function (event) {

                    resizeScrollable();
                    preview.map.invalidateSize(false);

                    preview.lastShownStep = null;

                    // https://github.com/Leaflet/Leaflet/issues/3280
                    preview.map.fitBounds(showPreview($(event.relatedTarget).data('animstep')));

                })

                .on('click','#planPreviewControls nav a',function () {

                    var $li = $(this).parents('li');
                    if (!($li.hasClass('disabled')))
                    {
                        showPreview(preview.lastShownStep + ($li.hasClass('next')?1:-1));
                    }
                })

                .on('click','#exportIngraph',function () {
                    eventHandler('exportIngraph',iGExportValues());
                })

                .on('click','#importIngraphBtn',function () {
                    $('#importIngraphControl').click();
                })

                .on('change','#importIngraphControl',function() {
                    if ($(this).val())
                    {
                        eventHandler('importIngraph',{file:this.files[0],color:$('#iGColor').val(),type:$('[name=iGimportType]').val()});
                    }
                })

                .on('change','[name="iGsource"]',function() {
                    var selectedSource = $('[name="iGsource"]:checked').val();
                    $('.iGSelection').each(function() {
                        $this = $(this);
                         $this.toggle($this.attr('data-iGsource')==selectedSource);
                    });
                    resizeScrollable();
                    iGExportEnable();
                })

                .on('click','[data-iGsource]',iGExportEnable)

                .on('click','[name=iGimportType]', function() {
                    var type = $('[name=iGimportType]').val();
                    if (type)
                    {
                        $('#importIngraphBtn').removeProp('disabled');
                    }
                    else
                    {
                        $('#importIngraphBtn').prop('disabled','disabled');
                    }
                })

                .on('click','[data-filter][data-filter-target]:not([data-filter=portal])',function () {
                    // apply to the id of the target
                    applyFilters($(this).attr('data-filter-target'));
                })

                .on('change','[data-filter=portal][data-filter-target]',function () {
                    // apply to the id of the target
                    applyFilters($(this).attr('data-filter-target'));
                })

                .on('click','select[data-singleselect] option', function(event) {
    				$this = $(this);
    				$(this).parents('select').val([$(this).attr('value')]);
    				return false;
    			})

                .on('click','.addMlSequence',function (){
                    eventHandler('addMlSequence',$(this).data());
                })

                .on('click','.clearMlResults',function (){
                    eventHandler('clearMlResults');
                })

                .on('click','.moveStep[data-direction]',function() {

                    var $this = $(this);

                    var planIdx = parseInt($this.parents('[data-planidx]').attr('data-planidx'));

                    if ($this.attr('data-direction')=='up')
                    {
                        var moveBefore = planIdx-1;
                        preview.lastShownStep--;
                    }
                    else
                    {
                        var moveBefore = planIdx+2;
                        preview.lastShownStep++;
                    }
                    eventHandler('moveItem',{moveBefore:moveBefore.toString() ,planIdx:[planIdx.toString()]});
                })
            ;

            $('#importIngraphBtn').prop('disabled','disabled');

            $('[name="iGsource"]').trigger('change');
            ingressplanner.ui.showiGStatus(false);

            $('#iGColor').ColorPickerSliders({
                color: ingressplanner.utils.colors()[0],
                previewformat: 'hex',
                hsvpanel: true,
                sliders: false,
                swatches: ingressplanner.utils.colors(),
                flat: true,
            });

			$('.sortable thead th[data-sortable-sortfield]').on('click',function () 
			{
				var $_this = $(this);
				var $table = $_this.parents('table');

			    if (
			        (!$_this.attr('data-sortdir'))
			    )
			    {
			        var dir = 'asc';
			    }
			    else if($_this.attr('data-sortdir')=='asc')
			    {
			        var dir = 'desc';
			    }
			    else
			    {
			        var dir = null;
			    }

			    $table.find('thead th[data-sortable-sortfield]').removeAttr('data-sortdir');

			    if (dir)
			    {
			        $_this.attr('data-sortdir',dir);
			    }

			    sortTable($table);
			    return false;

			});

	        portalsListBody.on('change','[role=keys] input',function () {

	        	$_this = $(this);

	        	$_this.prop('disabled', true);

	        	eventHandler('keyQtyChanghe',{
	        		portal: $_this.parents('tr').attr('data-pll'),
	        		newQty: $_this.val()
	        	});

	        });

            $("[name].planoption").change(function(event) {
                var $this = $(this);
                if ($this.attr('type')=='checkbox')
                {
                    var value = $this.is(':checked');
                }
                else
                {
                    var value = $this.val();
                }
                eventHandler('planOptionChange',{option:$this.attr('name'),newValue:value});
            });

	        $("#optionsCollapse input[name]").change(function(event) {
	        	$("#optionsCollapse").collapse('hide');
	        });

            $('#mainwrapper').on('shown.bs.tab', 'a[data-toggle="tab"]', function (e) {
                resizeScrollable();
            });

            $('[data-stepsCollapse]').on('show.bs.collapse', function (e) {
                $(this).siblings('[data-stepsCollapse]').collapse('hide');
            });

			$('[data-stepsCollapse]').on('shown.bs.collapse', function (e) {
		        resizeScrollable();
		    });

			authButton.on('click',function() {
				eventHandler('gdriveLogin');
				return false;
			});

			plansListBody

				.on('click','td[role=name]',function() {
					unactivePlan();
					eventHandler('loadPlan',$(this).parents("tr").data("planname"));
					return false;
				})

				.on('click','a[role=button].removePlan',function() {
					eventHandler('deletePlan',$(this).parents("tr").data("planname"));
					return false;
				})

				.on('click','a[role=button].copyPlan',function() {
                    var origPlanName = $(this).parents("tr").data("planname");
                    bootbox.prompt({
                      title: "Name of the new Plan?",
                      value: "copy of " + origPlanName,
                      callback: function(name) {
                        if (name !== null) 
                        {
                            unactivePlan();
                            eventHandler('copyPlan',{name:name,from:origPlanName});
                        }
                      }
                    });
				    return false;
				})

			;

			plansTableDiv.on('click','#newPlan',function() {
                bootbox.prompt({
                  title: "Name of the new Plan?",
                  callback: function(name) {
                    if (name !== null) 
                    {
                        unactivePlan();
                        eventHandler('newPlan',name);
                    }
                  }
                });
                return false;
			});

            function iGExportValues()
            {
                var selectedSource = $('[name="iGsource"]:checked').val();

                if (!selectedSource)
                {
                    return null;
                }

                var values = null,color= null;
                switch (selectedSource)
                {
                    case 'ranges':
                        values = $("#iGRanges").val();
                        color = $("#iGRanges option:checked").first().attr('data-color');
                        break;

                    case 'plan':
                        values = $("#iGPortals").val();
                        color = $("#iGPortals option:checked").first().attr('data-color');
                        break;

                    default:
                        ingressplanner.error('unmanaged ingraph source type',selectedSource);
                        break;
                }

                if (values && values.length)
                {
                    if (color)
                    {
                        $('#iGColor').trigger('colorpickersliders.updateColor',color);
                    }
                    return {source:selectedSource,values:values};
                }
                else
                {
                    return null;
                }

            }

            function iGExportEnable() {

                if (iGExportValues())
                {
                    $("#exportIngraph").removeProp('disabled');
                }
                else
                {
                    $("#exportIngraph").prop('disabled','disabled');
                }

            };

            ingressplanner.ui.clearMlResults();

			function mlSearchEnable() {

				var mlBaseLink = $("#mlBaseLink").val();
				var mlRanges = $("#mlRanges").val();

				if (
					mlBaseLink && mlBaseLink.length
					&& mlRanges && mlRanges.length
				)
				{
					$('#mlSearch').removeProp('disabled');
				}
				else
				{
					$('#mlSearch').prop('disabled','disabled');
				}

			}

			$('body').on('change','#mlBaseLink, #mlRanges', mlSearchEnable);
			$('body').on('click','#mlSearch', function() {
                var mlBaseLink = $("#mlBaseLink").val();
                var mlRanges = $("#mlRanges").val();

                if (
                    mlBaseLink && mlBaseLink.length == 1
                    && mlRanges && mlRanges.length
                )
                {
                    eventHandler('tools-multilayer',{baseLink:mlBaseLink[0],ranges:mlRanges});
                }
            });

            moveItemBtn.on('click',function () {
                eventHandler('moveItem', {
                    planIdx:        moveItemSelect.val(),
                    moveBefore:     moveItemBeforeSelect.val()[0]
                });
                return false;
            });

            invertlinksBtn.on('click',function () {

                var planIDXs = moveItemSelect.val();
                if (planIDXs.length)
                {
                    eventHandler('invertlinks', {
                        planIdx: planIDXs,
                    });
                }
                return false;
            });

            $('#changeColorsBtn')
                .prop('disabled','disabled')
                .on('click',function() {

                    var planIDXs = moveItemSelect.val();
                    var newHex = changeColorsDiv.find('.colorbox').data('hex');

                    if (planIDXs.length && newHex)
                    {
                        eventHandler('changeItemsColor',$.map(planIDXs, function(item, index) {
                            return {
                                target: {target:['planIDX',item]},
                                newHex: newHex

                            };
                        }));
                    }
            });

			deleteItemsBtn.on('click',function () {

                var planIDXs = moveItemSelect.val();
                if (planIDXs.length)
                {
                    eventHandler('deleteItems', {
                        planIdx: planIDXs,
                    });
                }
				return false;
            });

            $('[data-filter=portal][data-filter-target=moveItemSelect],[data-filter=portal][data-filter-target=moveItemBeforeSelect]').on('change', 'select', function () {
                showSwapPortalsBtn();
            })

            showSwapPortalsBtn();

            swapPortalsBtn.on('click',function () {

                var from = $('[data-filter=portal][data-filter-target=moveItemSelect] select').val();
                var to = $('[data-filter=portal][data-filter-target=moveItemBeforeSelect] select').val();

                var planIDXs = moveItemSelect.val();

                if ((!!from) && (!!to) && from!=to && planIDXs && planIDXs.length)
                {
                    eventHandler('swapportals', {
                        from: from,
                        to: to,
                        planIdx: planIDXs
                    });
                }
            })


            moveItemBeforeSelect.on('change',function() {
                enableMoveItemsBtn();
            })

            moveItemSelect.on('change',function() {

            	var options = moveItemBeforeSelect.find('option');
            	options.removeAttr('disabled');

            	var currSelect = $(this).val();

            	if (currSelect)
            	{
                    swapPortalsBtn.removeProp('disabled');
                    deleteItemsBtn.removeProp('disabled');
                    invertlinksBtn.removeProp('disabled');
                    changeColorsDiv.show();
	            	$.each(currSelect, function(index, val) {
	            		 options.filter('[value='+val+']').attr('disabled', 'disabled');
	            	});
            	}
                else
                {
                    swapPortalsBtn.prop('disabled','disabled');
                    deleteItemsBtn.prop('disabled','disabled');
                    invertlinksBtn.prop('disabled','disabled');
                    changeColorsDiv.hide();
                }
                enableMoveItemsBtn();
            });

            stepsTab

				.on('click','.addMarker',function () {
					eventHandler('addMarkerBefore',{
						planIdx: $(this).parents('[data-planidx]').attr('data-planidx'),
						portal:  $(this).parents('[data-pll]').attr('data-pll')
					});
					return false;
	            })

				.on('click','.invertlink',function () {
					eventHandler('invertlink', $(this).parents('[data-planidx]').attr('data-planidx'));
					return false;
	            })

                .on('click','.removeStep',function () {
                    eventHandler('deleteItems',{planIdx:[$(this).parents('[data-planidx]').attr('data-planidx')]});
                    return false;
                })

	        ;

	        popoverize($('#mainwrapper'),{
     			'selector': 	'portal',
     			'container': 	'body',
     			'html': 		true,
     			'placement': 	'auto bottom',
     			'trigger': 		'hover',

     			'title': 		function () {

     				var portal = $(this).data('portal');

     				if (typeof portal.guid == 'undefined')
     				{
     					return 'Location information';
     				}
     				else
     				{
     					return 'Portal information';
     				}
     			},

     			'content': 	function() {

     				var $this = $(this);

     				$this.addClass('hasPopover');

     				var portal = $this.data('portal');

     				var content = $("<div>");

     				var $TD = $this.parents('td');

     				if ($TD.length)
     				{

						if ($TD.data('noIITCData'))
						{
							content.append($('<div>').addClass('alert alert-danger').html(noIITCDataText));
						}

						if ($TD.data('blockingfieldText'))
						{
							content.append($('<div>').addClass('alert alert-danger').html($TD.data('blockingfieldText')));
						}

						if ($TD.data('not-own-faction'))
						{
							content.append($('<div>').addClass('alert alert-danger').html(notOwnFactionText));
						}

						if ($TD.data('not-full-resos'))
						{
							content.append($('<div>').addClass('alert alert-danger').html(noFullResosText));
						}
	     				
						if ($TD.data('missing-keys'))
						{
							content.append($('<div>').addClass('alert alert-danger').html(missingKeysText));
						}     					
     				}


     				var req = 'https://maps.googleapis.com/maps/api/geocode/json?latlng='+portal.llstring+'&key=';

     				var response = $.ajax(
     					'https://maps.googleapis.com/maps/api/geocode/json',
     					{
					        async: false,
	     					data: {
	     						latlng: 		portal.llstring,
	     					},
					        type: "GET",
					        dataType: 'json',
					    }
					).responseJSON;

					if (response.status=='OK')
					{
						var lines = $.map(response.results, function(result, index) {

							var lookFor = null;

							if (result.types.indexOf('street_address')!=-1)
							{
								return result.formatted_address;
							}

							if (result.types.indexOf('neighborhood')!=-1)
							{
								return result.formatted_address;
							}

							return null;

						});

						if (!lines.length)
						{
							lines.push(response.results[0].formatted_address);
						}

						content.append($('<p>').css('text-align','center').html(lines.join('<br>')));
					}
					else
					{
						ingressplanner.warn('reverse geocode refused',response.error_message);
					}

     				if (typeof portal.image != 'undefined')
     				{
     					content.append($("<img>").addClass('img-thumbnail portalImage').css('display','block').attr({
		 					src: portal.image
		 				}));
     				}

     				return content;
     			}
     		});

			stepsListBody

                .on('click','.reverse',function () {
                    eventHandler('useReverse',{planidx:$(this).parents('tr').data('planidx'),cancel:$(this).hasClass('cancel')});
                    return false;
                })

				.on('click','.moveItem',function () {
					moveItemSelect.val([$(this).parents('tr').data('planidx')]);
					moveItemSelect.trigger('change');
                    $('#toolsCollapse').collapse('show');
                    ingressplanner.ui.gotab('moveItemTab');
         		})

			;

			var popoverStepsTarget = stepsTab.find('#stepsTableContainer');

			popoverize(popoverStepsTarget,{
	 			'selector': 	'.occludingFields',
	 			'container': 	'#stepsTab',
	 			'html': 		true,
	 			'placement': 	'auto bottom',
	 			'title': 		'occluding Fields',
	 			'trigger': 		'click',
	 			'viewport': 	'#stepsTab',

	 			'content': 	function() {

	 				$(this).addClass('hasPopover');

	 				var liArray = [];
	 				var planIDX = $(this).data('planIDX');
	 				var destPortal = $(this).data('destPortal');

	 				$.each($(this).data('blockingfields'), function(index, blockingfield) {

	 					var canAddMarkerBefore = false;
	 					var canInvertlink = null;

						if (typeof blockingfield.planned != 'undefined')
						{
							var li = 'Planned @ ' + blockingfield.planned;
							canInvertlink =  true;
						}
						else
						{
							var li = blockingfield.teamDECODED
							canAddMarkerBefore = true;
						}

						var ulItem = $("<li>").append($("<strong>").html(li+":"));

						var plist = $('<ul>');

						$.each(blockingfield.llstring.split('|'), function(index, llstring) {

							var item = $('<li>').append(portalTitleHTML(llstring));

							if (canInvertlink && destPortal == llstring)
							{
								item
									.attr({
										'data-planidx': planIDX,
									})
									.append('&nbsp;')
									.append(invertlinkBtn)
								;
							}

							if (canAddMarkerBefore)
							{
								item
									.attr({
										'data-planidx': planIDX,
										'data-pll': llstring
									})
									.append('&nbsp;')
									.append(addPortalStopBtn)
								;
							}

							plist.append(item);
						});

						ulItem.append(plist);

						liArray.push(ulItem)

	 				});

	 				var ol = $("<ol>");

					$.each(liArray, function(index, li) {
						ol.append(li);
					});

					return ol;
				}
			});

			popoverize(popoverStepsTarget,{
	 			'selector': 	'.tooMuchFarming',
	 			'container': 	'#stepsTab',
	 			'html': 		true,
	 			'placement': 	'auto bottom',
	 			'title': 		'High farming rate!',
	 			'trigger': 		'hover',
	 			'viewport': 	'#stepsTab',
	 			'content': 		function() {
	 				$(this).addClass('hasPopover');

	 				var farm = $(this).data('farm');

	 				if (farm.stops>1)
	 				{
		 				if (farm.when == 'now')
		 				{
		 					var verb = 'You should now have farmed ';
		 				}
		 				else
		 				{
		 					var verb = 'You\'ll have to farm ';
		 				}
		 				var visits = ' in ' + farm.stops + ' visits';
	 				}
	 				else
	 				{
	 					var verb = 'You should now farm ';
	 					var visits = '';
	 				}

	 				return $('<div>')
	 					.addClass('alert alert-warning')
	 					.append(
	 						$('<p>')
	 							.html($('<strong>').html(verb + farm.qty + ' keys' + visits + '!'))
	 							.append('<br>')
	 							.append($('<small>').html('max allowed rate: ' + farm.limit + ' keys/visit<br>current rate ' + (farm.qty/farm.stops).toLocaleString({style: 'decimal',maximumFractionDigits:1}) ))
	 					)
	 				;

	 				 
	 			}
	 		});

			popoverize(popoverStepsTarget,{
	 			'selector': 	'.aprewards',
	 			'container': 	'#stepsTab',
	 			'template':     '<div class="popover nomaxwidth" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>',
	 			'html': 		true,
	 			'placement': 	'auto left',
	 			'title': 		'AP details',
	 			'trigger': 		'hover',
	 			'viewport': 	'#stepsTab',
	 			'content': 		function() {

		 				$(this).addClass('hasPopover');

		 				var table = $("<table>").addClass('table borderless text-center table-condensed');

		 				$.each($(this).data('aprewards'), function(index, apreward) {
		 					 table.append(
		 					 	$('<tr>')
		 					 		.append($('<td>').html(apreward.qty + ' x'))
		 					 		.append($('<td>').html(apreward.description))
		 					 		.append($('<td>').html(apreward.value))
		 					 		.append($('<td>').html('= ' + apreward.qty*apreward.value))
		 					 );
		 				});

		 				return table;

		 			}
     		});

			popoverize(popoverStepsTarget,{
	 			'selector': 	'.fieldsDone',
	 			'container': 	'#stepsTab',
	 			'html': 		true,
	 			'placement': 	'auto bottom',
	 			'title': 		'Fields closed by the link',
	 			'trigger': 		'hover',
	 			'viewport': 	'#stepsTab',
	 			'content': 		function() {

		 				$(this).addClass('hasPopover');

		 				var content = $('<p>');

		 				var fieldsDone = $(this).data('fieldsDone');

		 				if (fieldsDone.createdFields)
		 				{
		 					content.append($('<div>').addClass('alert alert-success').html(fieldsDone.createdFields + ' created'))
		 				}

		 				if (fieldsDone.wastedFields)
		 				{
		 					content.append($('<div>').addClass('alert alert-warning').html(fieldsDone.wastedFields + ' wasted'))
		 				}

		 				return content;

		 			}
     		});


            popoverize(popoverStepsTarget,{
                'selector':     '[data-target="#planPreviewModal"]',
                'container':    '#stepsTab',
                'html':         true,
                'placement':    'auto bottom',
                'title':        'Visual preview',
                'trigger':      'hover',
                'viewport':     '#stepsTab',
                'content':      'Show Visual preview of the plan at this step.'
            });

			popoverize(popoverStepsTarget,{
	 			'selector': 	'.missingKeys',
	 			'container': 	'#stepsTab',
	 			'html': 		true,
	 			'placement': 	'auto bottom',
	 			'title': 		missingKeysText,
	 			'trigger': 		'hover',
	 			'viewport': 	'#stepsTab',
	 			'content': 		'Plan a visit to it to farm them with the "add stop".'
     		});

			popoverize(popoverStepsTarget,{
	 			'selector': 	'.crosslink',
	 			'container': 	'#stepsTab',
	 			'html': 		true,
	 			'placement': 	'auto top',
	 			'title': 		'Crosslink!',
	 			'trigger': 		'hover',
	 			'viewport': 	'#stepsTab',
	 			'content': 		'The link planed below cannot be thrown until this crosslink exists.<br>Plan a visit to one of its ends with the "add stop" button to drop it!'
     		});

     		popoverize(popoverStepsTarget,{
	 			'selector': 	'.noIITCData',
	 			'container': 	'#stepsTab',
	 			'html': 		true,
	 			'placement': 	'auto bottom',
	 			'title': 		noIITCDataText,
	 			'trigger': 		'hover',
	 			'viewport': 	'#stepsTab',
	 			'content': 		'There are no available portal details from IITC.<br>Click on the portal name (or coordinates) to pan the Map to the portal so IITC can gather the needed information!'
     		});

     		popoverize(popoverStepsTarget,{
	 			'selector': 	'.resonators',
	 			'container': 	'#stepsTab',
	 			'html': 		true,
	 			'placement': 	'auto bottom',
	 			'title': 		noFullResosText,
	 			'trigger': 		'hover',
	 			'viewport': 	'#stepsTab',
	 			'content': 		'Destination portals must be equipped with all 8 resonators, you need to plan a stop to the portal to full-equip it!<br>Press the "add stop" button to add a visit to the plan'
     		});

		},

		gotab: function(tab) {
		    $('a[role="tab"][href="#'+tab+'"]').tab('show');
            resizeScrollable();
		},

		agentLoggableData: function(agentdata)
		{
			privacyDiv.html('');
			if (
				typeof agentdata['opt-in'] != undefined
				&& agentdata['opt-in'] != null
			)
			{
				var verb = '';

				if (!agentdata['opt-in'])
				{
					verb = 'NOT ';
				}

				verb = '<strong>' + verb + 'SHARE</strong>';

				privacyDiv
					.append(
						$('<div>').addClass('panel panel-primary')
						.append(
							$('<div>').addClass('container')
							.append($('<h2>').html('Your privacy settings'))
							.append($('<p>').html('You have opted to ' + verb + ' your details (agent name, team and level) in this page.<br>' )
								.append($('<a>').attr({'href':'#','id':'switchPrivacyOpt'}).html('Click to revert your decision'))
							)
						)
					)
				;

				$("#switchPrivacyOpt").on('click',function(){
					eventHandler('switchPrivacyOpt');
					return false;
				})

			}
			
		},

		iitcSentPing: function()
		{
			$(".qs-iitcplugin").addClass('done');
	        $('body').on('click','a[href^="https://www.ingress.com/intel"]',function () {

	        	if (eventHandler)
	        	{
		            eventHandler('click-portalLink',this.search.slice(1).split('&')[0].split('=')[1]);
		            return false;
	        	}
	        })

		},

		mapUpdating: function(running)
		{
			$('a[role="tab"][href="#iitcTab"]').html('IITC');
			if (running)
			{
				$('a[role="tab"][href="#iitcTab"]')
					.prepend('&nbsp;')
					.prepend(
						$('<span>').addClass('glyphicon glyphicon-hourglass')
					)
				;
			}
		},

		planAnalyzing: function()
		{
			$('a[role="tab"][href="#stepsTab"] span.glyphicon').attr('class','glyphicon glyphicon-hourglass');
		},

		drawPlansList: function(plans) {

			var active = ingressplanner.getCurrentPlan();

			if (active)
			{
				document.title =  active + ' | ' + about.productname;
				noplanactivewarning.hide();
				resizeScrollable();
			}
			else
			{
				noplanactivewarning.show();
				resizeScrollable();
				unactivePlan();
			}

			if (quickStart.noplans)
			{
				quickStart.noplans.remove();
				quickStart.noplans = null;
			}

	        plansListBody.html("");

	        $.each(plans, function(idx, data) 
	        {

	            var d = new Date(data.modified);

	            var tags = '';

	            if (data.version!='2')
	            {
	                tags = ' <span class="label label-info">v. ' + data.version + '</span>';
	            }

	            plansListBody.append(
	                $('<tr>')
	                .data('sorting',{
	                	idx: idx,
	                	name: data.name,
	                	modified: data.modified,
	                })
	                .attr({
	                    'data-planName' : data.name,
	                    'class'         : (data.name==active)?'success':''
	                })
	                .append($('<td>').addClass('text-center')
	                    .append(
	                        $('<a>').attr({
	                            'href':     '#',
	                            'role':     'button',
	                            'class':    'btn btn-xs btn-danger removePlan',
	                            'data-toggle': 'tooltip',
	                            'title':    'Remove Plan',
	                            'disabled': (data.name==active)
	                        })
	                        .append($('<span>').attr({
	                            'class'     : 'glyphicon glyphicon-remove'
	                        }))
	                    )
	                    .append(
	                        $('<a>').attr({
	                            'href':     '#',
	                            'role':     'button',
	                            'class':    'btn btn-xs btn-primary copyPlan',
	                            'data-toggle': 'tooltip',
	                            'title':    'Duplicate Plan',
	                        })
	                        .append($('<span>').attr({
	                            'class'     : 'glyphicon glyphicon-plus'
	                        }))
	                    )

	                )
	                .append($('<td>').addClass('text-center').css({'cursor':'pointer'}).attr({'role':'name'}).html(data.name+tags))
	                .append($('<td>').addClass('text-center').html(d.toLocaleDateString() + ' ' + d.toLocaleTimeString()))
	            );

	        });

	        plansTableDiv.show();
			sortTable($('#plansTableDiv'));

		},

		refreshPlan: function(_plan,_playerTeam,_analysis) {

			plan = _plan;
            playerTeam = _playerTeam;
			analysis = _analysis;

			setPlanOptions()
			buildPortalsTable();
			buildStepsTable();
            buildRanges();

            refreshFilters();
            setJSONs();

		},

		gdriveStatus: function(status) {

	        var icon = 'question-sign';

	        switch(status)
	        {
	            case 'loggingin':

	                icon = 'log-in'
	                break;

	            case 'loggedin':

	                authDiv.hide();
	                quickStart.gdrive.addClass('done');

	            case 'idle':
	                icon = 'cloud'
	                break;

	            case 'downloading':
	                icon = 'cloud-download';
	                break;

	            case 'uploading':
	                icon = 'cloud-upload';
	                break;

	        }
	        gdriveIcon.attr('class','glyphicon glyphicon-'+icon);

		},

        clearMlResults: function(result,notice)
        {

            $('#mlStatus [role="progressbar"]')
                .css('width','0%')
                .attr('aria-valuenow', 0)
            ;
            $("#mlStatus").toggle(false);
            $(".MlResults").toggle(false);
            $(".MlSelects").toggle(true);
        },

        showMlResults: function(result,notice)
        {

            $("#mlStatus").toggle(false);
            $(".MlSelects").toggle(false);
            $("#ml-targets").html('');

            var show = true;
            if (result === false)
            {
                show = false;
            }
            else if(typeof notice != 'undefined')
            {
                show = false;
                bootbox.alert(notice);
            }
            else
            {

                $("#ml-targets").html('Detected ' + result.targets + ' reachable portals in area. Max <strong>' + result.topLen + '</strong> layers with following ' + result.topSequences.length + ' sequences:<br><br>');

                $.each(result.topSequences, function(index, sequence) {

                    var li = $('<li>')
                        .append(
                            $('<a>')
                            .addClass('btn btn-primary btn-xs addMlSequence')
                            .data({targets:sequence,baselink:result.baselinkPortals,color:result.baselinkColor})
                            .html('Add to plan')
                        )
                        .append('&nbsp;')
                    ;

                    $.each(sequence, function(index2, llstring) {

                        li.append(portalTitleHTML(llstring));
                        if (index2<(sequence.length-1))
                        {
                            li.append(' > ');
                        }

                    });

                    $("#ml-targets").append(li)

                });

            }

            $(".MlResults").toggle(true);
            $("#MlResults").toggle(show);

        },

        showMlStatus: function()
        {

            $(".MlResults").toggle(false);
            $(".MlSelects").toggle(false);
            $("#mlStatus").toggle(true);

        },

        showiGStatus: function(show)
        {
            if (!show)
            {
                $('#iGportalsInRangeStatus')
                    .css('width','0%')
                    .attr('aria-valuenow', 0)
                ;
            }

            $('#iGportalsInRangeStatusContainer').toggle(show);
            $('#iGRanges').toggle(!show);
        },

        statusBars: function(progressBarID,done,total)
        {

            var progress = (done/total)*100;
            $("#"+progressBarID)
                .css('width',progress+'%')
                .attr('aria-valuenow', progress)
            ;
        }

	};
});