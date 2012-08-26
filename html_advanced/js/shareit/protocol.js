function Conn_init(ws_url, host, onconnect, onsuccess, onerror)
{
	var connection = io.connect(ws_url, {secure: true})
		connection.on('connect', function()
		{
			if(onconnect)
				onconnect(connection);

			// Files list

            // Files list request
            connection.fileslist_request = function(socketId)
            {
                connection.emit('fileslist.request', socketId);
            }

            // Files list update
            connection.on('fileslist.update', function(socketId, data)
            {
                host.fileslist_update(socketId, JSON.parse(data))
            })
            connection.fileslist_update = function(socketId, files_send)
            {
                connection.emit('fileslist.update', socketId, JSON.stringify(files_send));
            }

			// Transfer

            // Transfer query
            connection.on('transfer.query', host.transfer_query)
            connection.transfer_query = function(socketId, filename, chunk)
            {
                connection.emit('transfer.query', socketId, filename, chunk);
            }

            // Transfer send
			connection.on('transfer.send', function(socketId, filename, chunk, data)
			{
				host.transfer_send(socketId, filename, parseInt(chunk), data)
			})
            connection.transfer_send = function(socketId, filename, chunk, data)
            {
                connection.emit('transfer.send', socketId, filename, chunk, data);
            }

			if(onsuccess)
				onsuccess(connection);
		})
}