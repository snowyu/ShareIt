function Conn_init(ws_url, host, onconnect, onsuccess)
{
	var connection = io.connect(ws_url, {secure: true})

	connection.on('connect', function(data)
	{
		if(onconnect)
			onconnect(connection);

		// Common
		connection.on('joiner.room_full', function()
		{
			warning("This connection is full. Please try later.");
		});

		connection.on('peer.connected',    host.peer_connected)
		connection.on('peer.disconnected', host.peer_disconnected)

		// Host
		connection.on('transfer.query_chunk', host.transfer_query_chunk)

		connection.transfer_send_chunk = function(filename, chunk, data)
		{
			connection.emit('transfer.send_chunk', filename, chunk, data);
		}

		// Peer
		connection.on('files.list', function(data)
		{
			host.files_list(JSON.parse(data))
		});

		connection.files_list = function(files_send)
		{
			connection.emit('files.list', JSON.stringify(files_send));
		}

		connection.on('transfer.send_chunk', function(filename, chunk, data)
		{
			host.transfer_send_chunk(filename, parseInt(chunk), data)
		})

		connection.transfer_query_chunk = function(filename, chunk)
        {
		    connection.emit('transfer.query_chunk', filename, chunk);
		}

		if(onsuccess)
			onsuccess(connection);
	})
}