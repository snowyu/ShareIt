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
	        var args = JSON.parse(message)

	        var eventName = args[0]

	//        if(eventName == 'sessionId')
	//        {
	//            socket.id = args[1]
	//            host.set_uid(args[1])
	//            return
	//        }

	        var args = args.slice(1)

	        switch(eventName)
	        {
	            // Files list query
	            case 'fileslist.query':
	                host.fileslist_query.apply(host, args)
	                break

	            case 'fileslist.query.error':
	                host.fileslist_query_error.apply(host, args)
	                break

	            // Files list update
	            case 'fileslist.send':
	                host.fileslist_send.apply(host, args)
	                break

	//            case 'fileslist.send.error':
	//                host.fileslist_send_error.apply(host, args)
	//                break

	            // Transfer query
	            case 'transfer.query':
	                host.transfer_query.apply(host, args)
	                break

	//            case 'transfer.query.error':
	//                host.transfer_query_error.apply(host, args)
	//                break

	            // Transfer send
	            case 'transfer.send':
	                host.transfer_send.apply(host, args)
	                break
	//            case 'transfer.send.error':
	//                host.transfer_send_error.apply(host, args)
	//                break
	        }
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