var socket = io.connect('http://localhost:8000')

var chunksize = 65536

socket.on('connect', function(data)
{
	socket.on('warning', function(data)
	{
		warning(data);
	});

	socket.on('info', function(data)
	{
		info(data);
	});

	onopen();

	socket.emit('joiner', $.url().segment(1));	
})