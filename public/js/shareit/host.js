Blob.slice = Blob.slice || Blob.webkitSlice || Blob.mozSlice
if(Blob.slice != undefined)
	alert("It won't work in your browser. Please use Chrome or Firefox.");

// Filereader support (be able to host files from the filesystem)
if(typeof FileReader == "undefined")
	oldBrowser();
else
{
	var reader = new FileReader();

	socket.on('transfer.query_chunk', function(filename, chunk)
	{
		db.sharepoints_get(filename, function(file)
		{
			var start = chunk * chunksize;
			var stop = parseInt(file.size) - 1;
			if(stop > start + chunksize - 1)
				stop = start + chunksize - 1;
		
			// If we use onloadend, we need to check the readyState.
			reader.onloadend = function(evt)
			{
				if(evt.target.readyState == FileReader.DONE)
				{
					// DONE == 2
					var data = evt.target.result;
					socket.emit('transfer.send_chunk', filename, chunk, data);
				}
			};
		
			reader.readAsBinaryString(file.slice(start, stop + 1));
		})
	})
}

socket.on('peer.connected', function(data)
{
	ui_peerstate("Peer connected!");

	db.sharepoints_getAll(function(filelist)
	{
		send_files_list(filelist)
	})
})

socket.on('peer.disconnected', function(data)
{
	ui_peerstate("Peer disconnected.");
})

function db_ready(db)
{
	db.sharepoints_getAll(function(filelist)
	{
		send_files_list(filelist)
	
		ui_updatefiles_host(filelist)
	})
}

var db = DB(db_ready)

function files_change(filelist)
{
	// Loop through the FileList and append files to list.
	for(var i = 0, file; file = filelist[i]; i++)
		db.sharepoints_add(file)

	update_files_list(filelist)
}

function files_add(filelist, file)
{
	db.sharepoints_add(file)

	update_files_list(filelist)
}

function update_files_list(filelist)
{
	send_files_list(filelist)
	ui_updatefiles_host(filelist)
}

function send_files_list(filelist)
{
	var files_send = []

	for(var i = 0, file; file = filelist[i]; i++)
		files_send.push({"lastModifiedDate": file.lastModifiedDate, "name": file.name,
						 "size": file.size, "type": file.type});

	socket.emit('files.list', JSON.stringify(files_send));
}