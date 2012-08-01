var downfiles = {}

CACHE = 0
SAVED = 1

var filer = new Filer()
	filer.init({persistent: true, size: 1 * 1024 * 1024 * 1024});

socket.on('files.list', function(data)
{
	ui_updatefiles_peer(JSON.parse(data))

	info('files.list: '+Object.keys(JSON.parse(data)));
});

socket.on('transfer.send_chunk', function(filename, chunk, data)
{
	var file = downfiles[filename];
	filer.write(filename, {data:data, append:true})

	if(file.chunks == chunk)
	{
		// Auto-save downloaded file
		savetodisk(filename)

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
	filer.create(file.name, true)

	// Demand data from the begining of the file
	socket.emit('transfer.query_chunk', file.name, 0);
}

function savetodisk(filename)
{
	// Auto-save downloaded file
    var save = document.createElement("A");
    	save.href = filer.pathToFilesystemURL(filename)
		save.download = filename	// This force to download with a filename instead of navigate

	var evt = document.createEvent('MouseEvents');
		evt.initMouseEvent('click', true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);

	save.dispatchEvent(evt);

	// Delete cache file
	filer.rm(filename)

	alert("'" + filename + "' = '" + save.href + "'")
	downfiles[filename].ubication = SAVED
}