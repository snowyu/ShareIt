// P2P Stuff
var io = require('socket.io').listen(app)

io.set('log level', 1);
io.sockets.on('connection', function (socket)
{
	socket.on('joiner', function (data)
	{
		len = io.sockets.clients(data).length;

		if(len == undefined || len == 0)
		{
			socket.emit('host');
			socket.join(data);
			socket.isHost = true;
			socket.isPeer = false;
			socket.room = data;
		}
		else if(len == 1)
		{
			socket.emit('peer');
			socket.join(data);
			socket.isHost = false;
			socket.isPeer = true;
			socket.room = data;
			socket.hoster = io.sockets.clients(data)[0];
			io.sockets.clients(data)[0].peer = socket;

			if(socket.hoster.fileslist != undefined)
				socket.emit('fileslist', socket.hoster.fileslist);

			if(socket.hoster != undefined)
				socket.hoster.emit('peerconnected');
		}
		else
			socket.emit('warn', "This connection is full. Please try later.");

		io.sockets.in(data).emit('info', socket.id + " joined!");
	});

	socket.on('disconnect', function()
	{
        if(socket.isPeer)
            socket.hoster.emit('peerdisconnected');
	    else if(socket.isHost && socket.peer != undefined)
	   	    socket.peer.emit('hostdisconnected');
	});

	socket.on('listfiles', function (data)
	{
		if(socket.isHost)
		{
			socket.fileslist = data;
			if(socket.peer)
				socket.peer.emit('fileslist', data);
		};
	});

	socket.on('begintransfer', function (file, chunk)
	{
		if(socket.isPeer && socket.hoster != undefined)
			socket.hoster.emit('begintransfer', file, chunk);
	});

	socket.on('datatransfer', function (data, file, chunk)
	{
		if(socket.isHost && socket.peer != undefined)
			socket.peer.emit('datatransfer', data, file, chunk);
	});
});
