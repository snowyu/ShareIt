Blob.slice = Blob.slice || Blob.webkitSlice || Blob.mozSlice
if(Blob.slice != undefined)
	alert("It won't work in your browser. Please use Chrome or Firefox.");

// Filereader support (be able to host files from the filesystem)
if(typeof FileReader == "undefined")
	oldBrowser();


var chunksize = 65536


function Bitmap(size)
{
	var result = {}
	for(var i=0; i<size; i++)
		result[i] = true;
	return result
}


DB_init(function(db)
{
	var host = {}

	// Common

	host.peer_connected = function(data)
	{
		ui_peerstate("Peer connected!");

		if(host._send_files_list)
			db.sharepoints_getAll(null, host._send_files_list)
		else
			console.warn("'host._send_files_list' is not available");
	}
	
	host.peer_disconnected = function(data)
	{
		ui_peerstate("Peer disconnected.");
	}

	// Peer

	host.files_list = function(files)
	{
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
	}

	function _savetodisk(file)
	{
		// Auto-save downloaded file
	    var save = document.createElement("A");
	    	save.href = window.URL.createObjectURL(file.blob)
			save.download = file.name	// This force to download with a filename instead of navigate
	
		var evt = document.createEvent('MouseEvents');
			evt.initMouseEvent('click', true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
	
		save.dispatchEvent(evt);

		window.URL.revokeObjectURL(save.href)

		// Set file as fully downloaded and saved on disk
		delete file.bitmap
	}

	function _updatefiles(filelist)
	{
		if(host._send_files_list)
			host._send_files_list(filelist)
		else
			console.warn("'host._send_files_list' is not available");

		ui_updatefiles_host(filelist)
	}

	// Load websocket connection after IndexedDB is ready
	Conn_init('http://localhost:8000', host, function(connection)
	{
		// Host
	
		// Filereader support (be able to host files from the filesystem)
		if(typeof FileReader != "undefined")
			host.transfer_query_chunk = function(filename, chunk)
			{
				var reader = new FileReader();
					reader.onerror = function(evt)
					{
						console.error("host.transfer_query_chunk("+filename+", "+chunk+") = '"+evt.target.result+"'")
					}
					reader.onload = function(evt)
					{
//						console.debug("host.transfer_query_chunk("+filename+", "+chunk+") = '"+evt.target.result+"'")
						connection.emit('transfer.send_chunk', filename, chunk, evt.target.result);
					}
	
				var start = chunk * chunksize;
				var stop  = start + chunksize;

				db.sharepoints_get(filename, function(file)
				{
					var filesize = parseInt(file.size);
					if(stop > filesize)
						stop = filesize;
	
					reader.readAsBinaryString(file.slice(start, stop));
				})
			}

		// Peer

		host.transfer_send_chunk = function(filename, chunk, data)
		{
			db.sharepoints_get(filename, function(file)
			{
				console.debug("[host.transfer_send_chunk] '"+filename+"' = "+JSON.stringify(file))
				delete file.bitmap[chunk]
		
		        // Update blob
		        var blob = file.blob
			    file.blob = new Blob([blob, data], {"type": blob.type})
		
		        db.sharepoints_put(file, function()
		        {
				    if(Object.keys(file.bitmap).length)
				    {
					    ui_filedownloading(file.name, chunk);
			
					    // Demand more data
					    connection.emit('transfer.query_chunk', file.name, chunk+1);
				    }
				    else
				    {
					    // Auto-save downloaded file
					    _savetodisk(file)
			
					    ui_filedownloaded(file.name);
				    }
		        })
			})
		}

		host._send_files_list = function(filelist)
		{
			var files_send = []
		
			for(var i = 0, file; file = filelist[i]; i++)
				files_send.push({"name": file.name, "size": file.size, "type": file.type});
		
			connection.emit('files.list', JSON.stringify(files_send));
		}

		db.sharepoints_getAll(null, _updatefiles)

		onopen()

		ui_ready_fileschange(function(filelist)
		{
			// Loop through the FileList and append files to list.
			for(var i = 0, file; file = filelist[i]; i++)
				db.sharepoints_add(file)

			//if(host._send_files_list)
			//	host._send_files_list(filelist)	// Send just new files
			//else
			//	console.warn("'host._send_files_list' is not available");

			db.sharepoints_getAll(null, _updatefiles)
		})

		ui_ready_transferbegin(function(file)
		{
		    // Calc number of necesary chunks to download
			var chunks = file.size/chunksize;
			if(chunks % 1 != 0)
				chunks = Math.floor(chunks) + 1;
		
			ui_filedownloading(file.name, 0, chunks)
		
		    // Add a blob container and a bitmap to our file stub
			file.blob = new Blob([''], {"type": file.type})
		    file.bitmap = Bitmap(chunks)

		    // Insert new "file" inside IndexedDB
			db.sharepoints_add(file,
			function(key)
			{
				console.log("Transfer begin: '"+key+"' = "+JSON.stringify(file))

				db.sharepoints_get(key, function(object)
				{
					console.debug(JSON.stringify(object))
				})

				// Demand data from the begining of the file
				connection.emit('transfer.query_chunk', key, 0);
			},
			function(errorCode)
			{
				console.error("Transfer begin: '"+blob.name+"' is already in database.")
			})
		})
	})
})