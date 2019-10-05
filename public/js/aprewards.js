
ingressplanner.aprewards = new (function() {

// private vars & functions
	
	var aprewards = {

		'dropped-field': 			[ 750,	'Field Destroyed'],
		'dropped-link': 			[ 187,	'Link Destroyed'],
		'dropped-reso': 			[  75,	'Resonator Destroyed'],
		'capture-portal': 			[ 500,	'Portal Captured'],
		'deploy-resonator': 		[ 125,	'Resonator Deployed'],
		'deploy-last-resonator': 	[ 250,	'Last reso Deployed'],
		'created-field': 			[1250,	'Field Created'],
		'created-link': 			[ 313,	'Link Created'],

	}

	function getAp(action)
	{
		if (typeof aprewards[action] != 'undefined')
		{
			return aprewards[action][0];
		}
		else
		{
			ingressplanner.error('AP Reward request for unknown action',action);
		}
	};

	function getDescription(action)
	{
		if (typeof aprewards[action] != 'undefined')
		{
			return aprewards[action][1];
		}
		else
		{
			ingressplanner.error('AP Reward request for unknown action',action);
		}
	};

// exposed methods

	return {
		getApRewardsObject: function(action,qty)
		{
			return {
				type: 	action,
				description: getDescription(action),
				value: 	getAp(action),
				qty: 	qty,
			}
		},
	}
});