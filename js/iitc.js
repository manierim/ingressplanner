/*
	IITC module
*/

ingressplanner.iitc = new (function() {

// private vars & functions

	var eventHandler = null;

	var messagingTarget = $('#ictFrame')[0].contentWindow;

	var okToSend = false;

	var queue = {
		incoming: [],
		outgoing: []
	}

	function _sendMessage(type,data)
	{

		if (okToSend || type=='pong')
		{
	        var request = {"ingess-planner":{type:type}};

	        if (typeof data !='undefined')
	        {
	            request["ingess-planner"].data = data;
	        }

	        messagingTarget.postMessage(request,"https://www.ingress.com");
	        if (about.debug)
	        {
	        	if (about.debug)
	        	{
	            	console.debug("%c"+about.productname+" message sent by webapp: '"+type+"'",'background: #e7e; ');
	        	}
	        }

		}
		else
		{
			queue.outgoing.push([type,data]);
			ingressplanner.warn('Queued OUTGOING message',type,data);
		}

	}

	function _receiveMessage(type,data,player)
	{
		if (about.debug)
		{
			console.debug("%c"+about.productname+" message received by webapp: '"+type+"'",'background: #e7e; ');
		}

		if ((!okToSend) && type=='ping')
		{
			
			okToSend = true;

			while (messageArray = queue.outgoing.shift())
			{
				 ingressplanner.warn('Sending queued OUTGOING message',messageArray[0],messageArray[1]);
				 _sendMessage(messageArray[0],messageArray[1]);
			};

		};

		if (eventHandler)
		{
			eventHandler(type,data,player);
		}
		else
		{
			queue.incoming.push([type,data,player]);
			ingressplanner.warn('Queued ICONMING message',type,data,player);
		}
	}

	window.addEventListener(
		'message', 
		function(e) {

		    if (
		        typeof e.data['ingess-planner'] != 'undefined'
		        && typeof e.data['ingess-planner'].type != 'undefined'
		    )
		    {
		        if (typeof e.data['ingess-planner'].data == 'undefined')
		        {
		            e.data['ingess-planner'].data = null;
		        }

		        if (typeof e.data['ingess-planner'].player == 'undefined')
		        {
		            e.data['ingess-planner'].player = null;
		        }
		        _receiveMessage(e.data['ingess-planner'].type,e.data['ingess-planner'].data,e.data['ingess-planner'].player);
		    }

		},
		$("#ictFrame").attr('src')
	);

// exposed methods
	return {

		init: function (iitcEventHandler)
		{
			eventHandler = iitcEventHandler;

			while (messageArray=queue.incoming.shift())
			{
				 ingressplanner.warn('processing queued INCOMING message',messageArray[0],messageArray[1],messageArray[2]);
				 eventHandler(messageArray[0],messageArray[1],messageArray[2]);
			}

		},

		sendMessage: function(type,data)
		{
			_sendMessage(type,data);
		}

	}

})