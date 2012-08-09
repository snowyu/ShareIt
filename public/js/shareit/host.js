Blob.slice = Blob.slice || Blob.webkitSlice || Blob.mozSlice
if(Blob.slice != undefined)
	alert("It won't work in your browser. Please use Chrome or Firefox.");

// Filereader support (be able to host files from the filesystem)
if(typeof FileReader == "undefined")
	oldBrowser();


var chunksize = 65536


DB_init(function(db)
{
	var host = {}

	// Common

	host.peer_connected = function(data)
	{
		ui_peerstate("Peer connected!");
	
		db.sharepoints_getAll(null, _send_files_list)
	}
	
	host.peer_disconnected = function(data)
	{
		ui_peerstate("Peer disconnected.");
	}

	// Host

	// Filereader support (be able to host files from the filesystem)
	if(typeof FileReader != "undefined")
		host.transfer_query_chunk = function(filename, chunk)
		{
			var reader = new FileReader();
			// If we use onloadend, we need to check the readyState.
			reader.onloadend = function(evt)
			{
				if(evt.target.readyState == FileReader.DONE)
					socket.emit('transfer.send_chunk', filename, chunk, evt.target.result);
			};

			db.sharepoints_get(filename, function(file)
			{
				var start = chunk * chunksize;
				var stop = parseInt(file.size) - 1;
				if(stop > start + chunksize - 1)
					stop = start + chunksize - 1;

				reader.readAsBinaryString(file.slice(start, stop + 1));
			})
		})

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
	});


	function _send_files_list(filelist)
	{
		var files_send = []
	
		for(var i = 0, file; file = filelist[i]; i++)
			files_send.push({"lastModifiedDate": file.lastModifiedDate, "name": file.name,
							 "size": file.size, "type": file.type});
	
		socket.emit('files.list', JSON.stringify(files_send));
	}

	function _updatefiles(filelist)
	{
		_send_files_list(filelist)
		ui_updatefiles_host(filelist)
	}

	// Load websocket connection after IndexedDB is ready
	Conn_init('http://localhost:8000', host, function()
	{
		db.sharepoints_getAll(null, _updatefiles)

		onopen()

		ui_ready_fileschange(function(filelist)
		{
			// Loop through the FileList and append files to list.
			for(var i = 0, file; file = filelist[i]; i++)
				db.sharepoints_add(file)
		
		//	_send_files_list(filelist)	// Send just new files
		
			db.sharepoints_getAll(null, _updatefiles)
		})
	})
})