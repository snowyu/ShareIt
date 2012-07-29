// P2P Stuff
var io = require('socket.io').listen(app)

io.set('log level', 1);
io.sockets.on('connection', function (socket)
{
	socket.on('joiner', function(data)
	{
		len = io.sockets.clients(data).length;

		if(len == undefined || len == 0)
		{
			socket.isHost = true;

			socket.join(data);
			socket.room = data;
		}
		else if(len == 1)
		{
			socket.isHost = false;

			socket.join(data);
			socket.room = data;

			socket.hoster = io.sockets.clients(data)[0];

			if(socket.hoster != undefined)
			{
				socket.emit('peerconnected');
				socket.hoster.emit('peerconnected');

				if(socket.hoster.fileslist != undefined)
					socket.emit('fileslist', socket.hoster.fileslist);
			}

			io.sockets.clients(data)[0].peer = socket;
		}
		else
			socket.emit('warn', "This connection is full. Please try later.");

		io.sockets.in(data).emit('info', socket.id + " joined!");
	});

	socket.on('disconnect', function()
	{
		var peer;
        if(!socket.isHost)
            peer = socket.hoster;
	    else if(socket.peer != undefined)
	   	    peer = socket.peer;

		if(peer != undefined)
		   	peer.emit('peerdisconnected');
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
		if(!socket.isHost && socket.hoster != undefined)
			socket.hoster.emit('begintransfer', file, chunk);
	});

	socket.on('datatransfer', function (data, file, chunk)
	{
		if(socket.isHost && socket.peer != undefined)
			socket.peer.emit('datatransfer', data, file, chunk);
	});
});
