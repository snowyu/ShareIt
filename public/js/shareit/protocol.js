function Conn_init(ws_url, host, onsuccess)
{
	var connection = io.connect(ws_url)

	connection.on('connect', function(data)
	{
		// Common
		connection.on('warning', function(data)
		{
			warning(data);
		});
	
		connection.on('info', function(data)
		{
			info(data);
		});

		connection.on('peer.connected',       host.peer_connected)
		connection.on('peer.disconnected',    host.peer_disconnected)

		// Host
		connection.on('transfer.query_chunk', function(filename, chunk)
		{
			var func = host.transfer_query_chunk
			if(func != undefined)
				func(filename, chunk);
			else
				console.warn("'host.transfer_query_chunk' is not available");
		})

		// Peer
		connection.on('files.list', function(data)
		{
			host.files_list(JSON.parse(data))
		});
		connection.on('transfer.send_chunk', function(filename, chunk, data)
		{
			var func = host.transfer_send_chunk
			if(func != undefined)
				func(filename, parseInt(chunk), data)
			else
				console.warn("'host.transfer_send_chunk' is not available");
		})
	
		connection.emit('joiner', $.url().segment(1));	

		if(onsuccess)
			onsuccess(connection);
	})
}