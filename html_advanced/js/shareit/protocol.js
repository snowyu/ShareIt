function Protocol_init(transport, host, onconnect, onsuccess)
{
    function onopen()
    {
	    var protocol = {}

	    // EventTarget interface
	    protocol._events = {};

	    protocol.addEventListener = function(type, listener)
	    {
	      protocol._events[type] = host._events[type] || [];
	      protocol._events[type].push(listener);
	    };

	    protocol.dispatchEvent = function(type)
	    {
	      var events = protocol._events[type];
	      if(!events)
	        return;

	      var args = Array.prototype.slice.call(arguments, 1);

	      for(var i = 0, len = events.length; i < len; i++)
	        events[i].apply(null, args);
	    };

	    protocol.removeEventListener = function(type, listener)
	    {
	      var events = protocol._events[type];
	      if(!events)
	        return;

	      events.splice(events.indexOf(listener), 1)

	      if(!events.length)
	        delete host._events[type]
	    };

	    protocol.emit = function()
	    {
	        var args = Array.prototype.slice.call(arguments, 0);

	        transport.send(JSON.stringify(args), function(error)
	        {
	            if(error)
	                console.warning(error);
	        });
	    }

	    if(onconnect)
	        onconnect(protocol);

	    // Message received
	    function onmessage(message)
	    {
	        console.log("protocol.onmessage = '"+message+"'")

            protocol.dispatchEvent(protocol, JSON.parse(message))
	    }

	    // Detect how to add the EventListener (mainly for Socket.io since don't
	    // follow the W3C WebSocket/DataChannel API)
	    if(transport.on)
	        transport.on('message', onmessage);
	    else
	        transport.onmessage = onmessage;

	    if(onsuccess)
	        onsuccess(protocol);
    })

    // Detect how to add the EventListener (mainly for Socket.io since don't
    // follow the W3C WebSocket/DataChannel API)
    if(transport.on)
        transport.on('connect', onopen);
    else
        transport.onopen = onopen;
}