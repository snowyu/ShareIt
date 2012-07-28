var files = {};
var downfiles = {};

socket.on('peer', function(data)
{
	impeer();
});

socket.on('fileslist', function(data)
{
	files = JSON.parse(data)

	ui_updatefiles_peer(files)
});

socket.on('hostdisconnected', function(data)
{
	ui_hostdisconnected()
});

socket.on('datatransfer', function(data, file, chunk)
{
	f = downfiles[file];
	f.data = f.data + data;

	if(f.chunks == chunk)
		ui_filedownloaded(f);
	else
	{
		ui_filedownloading(f, chunk);

		socket.emit('begintransfer', file, parseInt(chunk)+1);
	}
});

function beginTransfer(file, fid, size)
{
	ui_begintransfer(fid)

	var chunks = size/chunksize;
	if(chunks % 1 != 0)
		chunks = Math.floor(chunks) + 1;

	downfiles[file] = {data:'', chunk:0, chunks:chunks, fid:fid};

	socket.emit('begintransfer', file, 0);
}