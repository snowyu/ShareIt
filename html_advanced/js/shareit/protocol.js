function Conn_init(ws_url, host, onconnect, onsuccess, onerror)
{
    var socket = io.connect(ws_url, {secure: true})
        socket.on('connect', function()
//    var socket = new WebSocket(ws_url)
//        socket.onopen = function()
        {
	        socket.emit = function()
	        {
	            var args = Array.prototype.slice.call(arguments, 0);

	            socket.send(JSON.stringify(args), function(error)
	            {
	                if(error)
	                    console.warning(error);
	            });
	        }

	        // Files list
	        socket.fileslist_query = function(socketId)
	        {
	            socket.emit('fileslist.query', socketId);
	        }
	        socket.fileslist_send = function(socketId, fileslist)
	        {
	            socket.emit('fileslist.send', socketId, fileslist);
	        }

	        // Transfer
	        socket.transfer_query = function(socketId, filename, chunk)
	        {
	            socket.emit('transfer.query', socketId, filename, chunk);
	        }
	        socket.transfer_send = function(socketId, filename, chunk, data)
	        {
	            socket.emit('transfer.send', socketId, filename, chunk, data);
	        }

            if(onconnect)
                onconnect(socket);

            socket.on('message', function(event)
//            socket.onmessage = function(event)
            {
                console.debug("socket.onmessage = "+event.data)
                var args = JSON.parse(event.data)

                var eventName = args[0]

                if(eventName == 'sessionId')
                {
                    socket.id = args[1]
                    host.set_uid(args[1])
                    return
                }

                var args = args.slice(1)

                switch(eventName)
                {
                    // Files list query
                    case 'fileslist.query':
                        host.fileslist_query.apply(host, args)
                        break;

                    case 'fileslist.query.error':
                        host.fileslist_query_error.apply(host, args)
                        break;

                    // Files list update
                    case 'fileslist.send':
                        host.fileslist_send.apply(host, args)
                        break;

                    case 'fileslist.send.error':
                        host.fileslist_send_error.apply(host, args)
                        break;

                    // Transfer query
                    case 'transfer.query':
                        host.transfer_query.apply(host, args)
                        break;

                    case 'transfer.query.error':
                        host.transfer_query_error.apply(host, args)
                        break;

                    // Transfer send
                    case 'transfer.send':
                        host.transfer_send.apply(host, args)
                        break;

                    case 'transfer.send.error':
                        host.transfer_send_error.apply(host, args)
                }
            })

            if(onsuccess)
                onsuccess(socket);
        })
}