// SSL Certificates
var fs = require('fs');

var options = {key:  fs.readFileSync('certs/privatekey.pem').toString(),
			   cert: fs.readFileSync('certs/certificate.pem').toString(),
			   ca:   [fs.readFileSync('certs/certrequest.csr').toString()]}

// HTTP server
var server = require('https').createServer(options)
	server.listen(8001);

// P2P Stuff
var io = require('socket.io').listen(server, options)

io.set('log level', 1);
io.sockets.on('connection', function(socket)
{
	socket.on('joiner', function(data)
	{
		var len = io.sockets.clients(data).length;

		if(len >= 2)
			socket.emit('joiner.room_full');
		else
		{
			socket.join(data);
			socket.room = data;

			if(len == 1)
			{
				socket.peer = io.sockets.clients(data)[0];
	
				if(socket.peer != undefined)
				{
					// Set this socket as the other socket peer
					socket.peer.peer = socket;

					// Notify to both peers that we are now connected
					socket.emit('peer.connected', socket.id);
					socket.peer.emit('peer.connected', socket.id);
				}
			}
		}
	});

	socket.on('disconnect', function()
	{
        if(socket.peer != undefined)
        {
	   	    socket.peer.emit('peer.disconnected');

			socket.peer.peer = undefined;
		}
	});

	// Proxied events

	socket.on('files.list', function(data)
	{
		if(socket.peer != undefined)
			socket.peer.emit('files.list', data);
	});

	socket.on('transfer.query_chunk', function(filename, chunk)
	{
		if(socket.peer != undefined)
			socket.peer.emit('transfer.query_chunk', filename, chunk);
	});

	socket.on('transfer.send_chunk', function(filename, chunk, data)
	{
		if(socket.peer != undefined)
			socket.peer.emit('transfer.send_chunk', filename, chunk, data);
	});
});
