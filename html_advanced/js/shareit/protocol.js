function Conn_init(ws_url, host, onconnect, onsuccess, onerror)
{
	var connection = io.connect(ws_url, {secure: true})
		connection.on('connect', function()
		{
			if(onconnect)
				onconnect(connection);

			// Host
			connection.on('transfer.query_chunk', host.transfer_query_chunk)

			connection.transfer_send_chunk = function(socketId, filename, chunk, data)
			{
				connection.emit('transfer.send_chunk', socketId, filename, chunk, data);
			}

			// Peer
			connection.on('fileslist.update', function(socketId, data)
			{
				host.fileslist_update(socketId, JSON.parse(data))
			})
			connection.on('transfer.send_chunk', function(socketId, filename, chunk, data)
			{
				host.transfer_send_chunk(socketId, filename, parseInt(chunk), data)
			})

            connection.fileslist_update = function(socketId, files_send)
            {
                connection.emit('fileslist.update', socketId, JSON.stringify(files_send));
            }
            connection.fileslist_request = function(socketId)
            {
                connection.emit('fileslist.request', socketId);
            }
			connection.transfer_query_chunk = function(socketId, filename, chunk)
	        {
			    connection.emit('transfer.query_chunk', socketId, filename, chunk);
			}

			if(onsuccess)
				onsuccess(connection);
		})
}