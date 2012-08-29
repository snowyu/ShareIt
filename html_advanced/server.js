// SSL Certificates
var fs = require('fs');

var options = {key:  fs.readFileSync('../certs/privatekey.pem').toString(),
			   cert: fs.readFileSync('../certs/certificate.pem').toString(),
			   ca:   [fs.readFileSync('../certs/certrequest.csr').toString()]}

// HTTP server
var server = require('https').createServer(options)
	server.listen(8001);

// P2P Stuff
var io = require('socket.io').listen(server, options)

io.set('log level', 1);
io.sockets.on('connection', function(socket)
{
    console.log("Connected socket.id: "+socket.id)

    socket._fire = function(eventName, socketId)
    {
        var soc = io.sockets.sockets[socketId]
        if(soc)
        {
            var args = Array.prototype.slice.call(arguments, 1);
            args[1] = socket.id

            soc.emit.apply(null, args);
        }
        else
        {
            socket.emit(eventName+'.error', socketId);
            console.warn(eventName+': '+socket.id+' -> '+socketId);
        }
    }

    socket.on('fileslist.query', function(socketId)
    {
        socket._fire('fileslist.query', socketId);
    });

    socket.on('fileslist.send', function(socketId, fileslist)
    {
        var soc = io.sockets.sockets[socketId]
        if(soc)
            soc.emit('fileslist.send', socket.id, fileslist);
        else
        {
            socket.emit('fileslist.send.error', socketId);
            console.warn('fileslist.send: '+socket.id+' -> '+socketId);
        }
    });

	socket.on('transfer.query', function(socketId, filename, chunk)
	{
        var soc = io.sockets.sockets[socketId]
		if(soc)
			soc.emit('transfer.query', socket.id, filename, chunk);
        else
        {
            socket.emit('transfer.query.error', socketId);
            console.warn('transfer.query: '+socket.id+' -> '+socketId);
        }
	});

	socket.on('transfer.send', function(socketId, filename, chunk, data)
	{
        var soc = io.sockets.sockets[socketId]
		if(soc)
			soc.emit('transfer.send', socket.id, filename, chunk, data);
        else
        {
            socket.emit('transfer.send.error', socketId);
            console.warn('transfer.send: '+socket.id+' -> '+socketId);
        }
	});
})