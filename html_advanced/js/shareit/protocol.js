function Conn_init(ws_url, host, onconnect, onsuccess, onerror)
{
	var socket = io.connect(ws_url, {secure: true})
		socket.on('connect', function()
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

			if(onconnect)
				onconnect(socket);

			// Files list

            // Files list query
            socket.fileslist_query = function(socketId)
            {
                socket.emit('fileslist.query', socketId);
            }
            socket.on('fileslist.query', host.fileslist_query)
            socket.on('fileslist.query.error', host.fileslist_query_error)

            // Files list update
            socket.fileslist_send = function(socketId, fileslist)
            {
                socket.emit('fileslist.send', socketId, JSON.stringify(fileslist));
            }
            socket.on('fileslist.send', function(socketId, fileslist)
            {
                host.fileslist_send(socketId, JSON.parse(fileslist))
            })
//            socket.on('fileslist.send.error', host.fileslist_send_error)

			// Transfer

            // Transfer query
            socket.transfer_query = function(socketId, filename, chunk)
            {
                socket.emit('transfer.query', socketId, filename, chunk);
            }
            socket.on('transfer.query', host.transfer_query)
//            socket.on('transfer.query.error', host.transfer_query_error)

            // Transfer send
            socket.transfer_send = function(socketId, filename, chunk, data)
            {
                socket.emit('transfer.send', socketId, filename, chunk, data);
            }
            socket.on('transfer.send', function(socketId, filename, chunk, data)
            {
                host.transfer_send(socketId, filename, parseInt(chunk), data)
            })
//            socket.on('transfer.send.error', host.transfer_send_error)

			if(onsuccess)
				onsuccess(socket);
		})
}