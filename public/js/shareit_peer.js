var downfiles = {}

CACHE = 0
SAVED = 1

socket.on('files.list', function(data)
{
	ui_updatefiles_peer(JSON.parse(data))

	info('files.list: '+Object.keys(JSON.parse(data)));
});

socket.on('transfer.send_chunk', function(filename, chunk, data)
{
	var file = downfiles[filename];
	file_append(filename, data)

	if(file.chunks == chunk)
	{
		// Auto-save downloaded file
		savetodisk(file)

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
	file_create(file.name)

	// Demand data from the begining of the file
	socket.emit('transfer.query_chunk', file.name, 0);
}

function savetodisk(file)
{
	// Auto-save downloaded file
    var save = document.createElement("A");
    	save.href = file_url(file.name)
		save.download = file.name	// This force to download with a filename instead of navigate

	var evt = document.createEvent('MouseEvents');
		evt.initMouseEvent('click', true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);

	save.dispatchEvent(evt);

	// Delete cache file
	file_delete(file.name)

	downfiles[file.name].ubication = SAVED
}