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
			connection.on('files.list', function(socketId, data)
			{
				host.files_list(socketId, JSON.parse(data))
			})
			connection.on('transfer.send_chunk', function(socketId, filename, chunk, data)
			{
				host.transfer_send_chunk(socketId, filename, parseInt(chunk), data)
			})

			connection.files_list = function(socketId, files_send)
			{
				connection.emit('files.list', socketId, JSON.stringify(files_send));
			}
			connection.transfer_query_chunk = function(socketId, filename, chunk)
	        {
			    connection.emit('transfer.query_chunk', socketId, filename, chunk);
			}

			if(onsuccess)
				onsuccess(connection);
		})
}