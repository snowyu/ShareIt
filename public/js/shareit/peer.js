var downfiles = {}
var cache = {}

CACHE = 0
SAVED = 1

socket.on('files.list', function(data)
{
	alert('files.list: '+data)
	ui_updatefiles_peer(JSON.parse(data))

	info('files.list: '+Object.keys(JSON.parse(data)));
});

socket.on('transfer.send_chunk', function(filename, chunk, data)
{
	var file = downfiles[filename];
	alert('transfer.send_chunk: '+filename+" "+file)

	cache[filename] += data;

	if(file.chunks == chunk)
	{
		// Auto-save downloaded file
		savetodisk(file, filename)

		ui_filedownloaded(filename);
	}
	else
	{
		ui_filedownloading(filename, Math.floor(chunk/file.chunks * 100));

		// Demand more data
		socket.emit('transfer.query_chunk', filename, parseInt(chunk)+1);
	}
})

function transfer_begin(file)
{
	ui_filedownloading(file.name, 0)

	var chunks = file.size/chunksize;
	if(chunks % 1 != 0)
		chunks = Math.floor(chunks) + 1;

	downfiles[file.name] = {chunk:0, chunks:chunks, ubication:CACHE}
	cache[file.name] = ''

	// Demand data from the begining of the file
	alert('transfer_begin: '+file+" "+file.name)
	socket.emit('transfer.query_chunk', file.name, 0);
}

function savetodisk(file, filename)
{
	// Auto-save downloaded file
    var save = document.createElement("A");
    	save.href = "data:" + file.type + ";base64," + encode64(cache[filename])
		save.download = filename	// This force to download with a filename instead of navigate

	var evt = document.createEvent('MouseEvents');
		evt.initMouseEvent('click', true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);

	save.dispatchEvent(evt);

	// Delete cache
	delete cache[filename]

	downfiles[filename].ubication = SAVED
}