function Conn_init(ws_url, host, onconnect, onsuccess, onerror)
{
	var connection = io.connect(ws_url, {secure: true})
		connection.on('connect', function()
		{
			if(onconnect)
				onconnect(connection);

			// Files list

            // Files list query
            connection.fileslist_query = function(socketId)
            {
                connection.emit('fileslist.query', socketId);
            }
            connection.on('fileslist.query', host.fileslist_query)
            connection.on('fileslist.query.error', host.fileslist_query_error)

            // Files list update
            connection.fileslist_send = function(socketId, fileslist)
            {
                connection.emit('fileslist.send', socketId, JSON.stringify(fileslist));
            }
            connection.on('fileslist.send', function(socketId, fileslist)
            {
                host.fileslist_send(socketId, JSON.parse(fileslist))
            })
//            connection.on('fileslist.send.error', host.fileslist_send_error)

			// Transfer

            // Transfer query
            connection.transfer_query = function(socketId, filename, chunk)
            {
                connection.emit('transfer.query', socketId, filename, chunk);
            }
            connection.on('transfer.query', host.transfer_query)
//            connection.on('transfer.query.error', host.transfer_query_error)

            // Transfer send
            connection.transfer_send = function(socketId, filename, chunk, data)
            {
                connection.emit('transfer.send', socketId, filename, chunk, data);
            }
            connection.on('transfer.send', function(socketId, filename, chunk, data)
            {
                host.transfer_send(socketId, filename, parseInt(chunk), data)
            })
//            connection.on('transfer.send.error', host.transfer_send_error)

			if(onsuccess)
				onsuccess(connection);
		})
}