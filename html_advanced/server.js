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

    socket.on('fileslist.request', function(socketId)
    {
        var soc = io.sockets[socketId]
        if(soc)
            soc.emit('fileslist.request', socket.id);
        else
            soc.emit('fileslist.request.error', socket.id);
    });

    socket.on('fileslist.update', function(socketId, data)
    {
        var soc = io.sockets[socketId]
        if(soc != undefined)
            soc.emit('fileslist.update', socket.id, data);
    });

	socket.on('transfer.query_chunk', function(socketId, filename, chunk)
	{
        var soc = io.sockets[socketId]
		if(soc != undefined)
			soc.emit('transfer.query_chunk', socket.id, filename, chunk);
	});

	socket.on('transfer.send_chunk', function(socketId, filename, chunk, data)
	{
        var soc = io.sockets[socketId]
		if(soc != undefined)
			soc.emit('transfer.send_chunk', socket.id, filename, chunk, data);
	});
})