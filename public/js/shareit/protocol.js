function Conn_init(ws_url, host, onsuccess)
{
	var socket = io.connect(ws_url)

	socket.on('connect', function(data)
	{
		// Common
		socket.on('warning', function(data)
		{
			warning(data);
		});
	
		socket.on('info', function(data)
		{
			info(data);
		});
	
		// Host
		socket.on('peer.connected',       host.peer_connected)
		socket.on('peer.disconnected',    host.peer_disconnected)
		socket.on('transfer.query_chunk', function(filename, chunk)
		{
			var func = host.transfer_query_chunk
			if(func != undefined)
				func(filename, chunk))
		}

		// Peer
		socket.on('files.list', function(data)
		{
			files_list(JSON.parse(data))
		});
		socket.on('transfer.send_chunk', function(filename, chunk, data)
		{
			transfer_send_chunk(filename, parseInt(chunk), data)
		})
	
		socket.emit('joiner', $.url().segment(1));	

		if(onsuccess)
			onsuccess();
	})
}