function Bitmap(size)
{
	var result = {}
	for(var i=0; i<size; i++)
		result[i] = true;
	return result
}



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