var downfiles = {}

CACHE = 0
SAVED = 1

Blob = Blob || BlobBuilder

var filer = new Filer()
	filer.init({persistent: true, size: 1 * 1024 * 1024 * 1024});

socket.on('files.list', function(data)
{
	ui_updatefiles_peer(JSON.parse(data))

	info('files.list: '+Object.keys(JSON.parse(data)));
});

socket.on('transfer.send_chunk', function(filename, chunk, data)
{
	var byteArray = new Uint8Array(data.length);
    for(var i = 0; i < data.length; i++)
	    byteArray[i] = data.charCodeAt(i) & 0xff;

	filer.write(filename, {data:new Blob([byteArray.buffer]), append:true},
	function(fileEntry, fileWriter)
	{
		var file = downfiles[filename];
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
})

function transfer_begin(file)
{
	ui_filedownloading(file.name, 0)

	var chunks = file.size/chunksize;
	if(chunks % 1 != 0)
		chunks = Math.floor(chunks) + 1;

	downfiles[file.name] = {chunk:0, chunks:chunks, ubication:CACHE}
	filer.create(file.name, true,
	function(fileEntry)
	{
		// Demand data from the begining of the file
		socket.emit('transfer.query_chunk', file.name, 0);
	},
	function(e)
	{
		console.log('Error' + e.name);
		console.log("File '" + file.name + "' exists.");
	})
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
	filer.open(filename,
	function(file)
	{
		downfiles[filename].ubication = SAVED

		files_add(file, filename)
	},
	function(e)
	{
		console.log('Error' + e.name);
		console.log("File '" + filename + "' exists.");
	})
}