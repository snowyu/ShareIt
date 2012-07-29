var files = {};
var downfiles = {};

socket.on('fileslist', function(data)
{
	files = JSON.parse(data)

	ui_updatefiles_peer(files)
});

socket.on('transfer.data', function(data, file, chunk)
{
	f = downfiles[file];
	f.data = f.data + data;

	if(f.chunks == chunk)
		ui_filedownloaded(f);
	else
	{
		ui_filedownloading(f, chunk);

		socket.emit('transfer.begin', file, parseInt(chunk)+1);
	}
});

function transfer_begin(file, fid, size)
{
	ui_transfer_begin(fid)

	var chunks = size/chunksize;
	if(chunks % 1 != 0)
		chunks = Math.floor(chunks) + 1;

	downfiles[file] = {data:'', chunk:0, chunks:chunks, fid:fid};

	socket.emit('transfer.begin', file, 0);
}