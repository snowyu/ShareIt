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

    // Message received
    socket.on('message', function(message)
//    socket.onmessage = function(message)
    {
        console.log("socket.onmessage = '"+message+"'")
        var args = JSON.parse(message)

        var eventName = args[0]
        var socketId  = args[1]

        var soc = io.sockets.sockets[socketId]
//        var soc = wss.sockets[socketId]
        if(soc)
        {
            args[1] = socket.id

            soc.emit.apply(soc, args);
        }
        else
        {
            socket.emit(eventName+'.error', socketId);
            console.warn(eventName+': '+socket.id+' -> '+socketId);
        }
    })
})