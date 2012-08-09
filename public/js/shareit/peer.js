function Bitmap(size)
{
	var result = {}
	for(var i=0; i<size; i++)
		result[i] = true;
	return result
}


function transfer_send_chunk(filename, chunk, data)
{
	db.sharepoints_get(filename, function(file)
	{
		alert("transfer.send_chunk '"+filename+"' = "+JSON.stringify(file))
		delete file.bitmap[chunk]

        // Create new "fake" file
	    var blob = new Blob([file, data], {"type": file.type})
	        blob.name = file.name
	        blob.lastModifiedDate = file.lastModifiedDate
        	blob.bitmap = Bitmap(chunks)

        db.sharepoints_put(blob, function()
        {
		    if(blob.bitmap.keys())
		    {
			    ui_filedownloading(filename, chunk);
	
			    // Demand more data
			    socket.emit('transfer.query_chunk', filename, chunk+1);
		    }
		    else
		    {
			    // Auto-save downloaded file
			    _savetodisk(blob)
	
			    ui_filedownloaded(filename);
		    }
        })
	})
})

function transfer_begin(file)
{
    // Calc number of necesary chunks to download
	var chunks = file.size/chunksize;
	if(chunks % 1 != 0)
		chunks = Math.floor(chunks) + 1;

	ui_filedownloading(file.name, 0, chunks)

    // Create new "fake" file
	var blob = new Blob([''], {"type": file.type})
	    blob.name = file.name
	    blob.lastModifiedDate = file.lastModifiedDate
    	blob.bitmap = Bitmap(chunks)

	alert("transfer_begin '"+blob.name+"' = "+JSON.stringify(blob))

    // Insert new "fake" file inside IndexedDB
	db.sharepoints_add(blob,
	function()
	{
		// Demand data from the begining of the file
	//	alert('transfer_begin: '+file+" "+file.name)
		socket.emit('transfer.query_chunk', file.name, 0);
	},
	function(errorCode)
	{
		alert("transfer_begin errorCode: "+errorCode)
	})
}

function _savetodisk(file)
{
	// Auto-save downloaded file
    var save = document.createElement("A");
    	save.href = "data:" + file.type + ";base64," + encode64(file)
		save.download = file.name	// This force to download with a filename instead of navigate

	var evt = document.createEvent('MouseEvents');
		evt.initMouseEvent('click', true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);

	save.dispatchEvent(evt);

	// Set file as fully downloaded and saved on disk
	delete file.bitmap
}