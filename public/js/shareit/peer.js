var cache = {}

CACHE = 0
SAVED = 1

function Bitmap(size)
{
	var result = {}
	for(var i=0; i<size; i++)
		result[i] = true;
	return result
}

socket.on('files.list', function(data)
{
	var files = JSON.parse(data)

	// Check if we have already any of the files
	// It's stupid to try to download it... and also give errors
	db.sharepoints_getAll(null, function(filelist)
	{
		for(var i=0, file; file = files[i]; i++)
			for(var j=0, file_hosted; file_hosted = filelist[j]; j++)
				if(file.name == file_hosted.name)
				{
					file.downloaded = true;
					break;
				}

		ui_updatefiles_peer(files)
	})
});

socket.on('transfer.send_chunk', function(filename, chunk, data)
{
	chunk = parseInt(chunk)

	db.sharepoints_get(filename, function(file)
	{
		cache[filename] += data;
		alert("transfer.send_chunk '"+filename+"' = "+JSON.stringify(file))
		delete file.bitmap[chunk]
	
		if(file.bitmap.keys())
		{
			ui_filedownloading(filename, chunk);
	
			// Demand more data
			socket.emit('transfer.query_chunk', filename, chunk+1);
		}
		else
		{
			// Auto-save downloaded file
			savetodisk(file, filename)
	
			ui_filedownloaded(filename);
		}
	})
})

function transfer_begin(file)
{
	var chunks = file.size/chunksize;
	if(chunks % 1 != 0)
		chunks = Math.floor(chunks) + 1;

	ui_filedownloading(file.name, 0, chunks)

	file.bitmap = Bitmap(chunks)
	alert("transfer_begin '"+file.name+"' = "+JSON.stringify(file))
	db.sharepoints_add(file,
	function()
	{
		cache[file.name] = ''
	
		// Demand data from the begining of the file
	//	alert('transfer_begin: '+file+" "+file.name)
		socket.emit('transfer.query_chunk', file.name, 0);
	},
	function(errorCode)
	{
		alert("transfer_begin errorCode: "+errorCode)
	})
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
	delete file.bitmap
	delete cache[filename]
}