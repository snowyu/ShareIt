function Conn_init()
{
	var socket = io.connect('http://localhost:8000')

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
		socket.on('peer.connected',       peer_connected)
		socket.on('peer.disconnected',    peer_disconnected)
		socket.on('transfer.query_chunk', transfer_query_chunk(filename, chunk))
		
		// Peer
		socket.on('files.list', function(data)
		{
			files_list(JSON.parse(data))
		});
		socket.on('transfer.send_chunk', function(filename, chunk, data)
		{
			transfer_send_chunk(filename, parseInt(chunk), data)
		})

		onopen();
	
		socket.emit('joiner', $.url().segment(1));	
	})
}