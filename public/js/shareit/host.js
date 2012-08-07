Blob.slice = Blob.slice || Blob.webkitSlice || Blob.mozSlice
if(Blob.slice != undefined)
	alert("It won't work in your browser. Please use Chrome or Firefox.");

var files = {};

// Filereader support (be able to host files from the filesystem)
if(typeof FileReader == "undefined")
	oldBrowser();
else
{
	var reader = new FileReader();

	socket.on('transfer.query_chunk', function(filename, chunk)
	{
		var file = files[filename];
		alert('transfer.query_chunk: '+filename+" "+file)
	
		start = chunk * chunksize;
	
		stop = parseInt(file.size) - 1;
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
}

socket.on('peer.connected', function(data)
{
	ui_peerstate("Peer connected!");

	send_files_list()
})

socket.on('peer.disconnected', function(data)
{
	ui_peerstate("Peer disconnected.");
})

function db_ready(db)
{
	db.sharepoints_get(function(filelist)
	{
		// Loop through the FileList and append files to list.
		for(var i = 0, file; file = filelist[i]; i++)
			if(!files.hasOwnProperty(file))
			{
				alert("db_ready: "+file.name)
				files[file.name] = file;
			}

		send_files_list()
	
		ui_updatefiles_host(files)
	})
}

var db = DB(db_ready)

function files_change(filelist)
{
	// Loop through the FileList and append files to list.
	for(var i = 0, file; file = filelist[i]; i++)
		if(!files.hasOwnProperty(file))
		{
			files[file.name] = file;
			db.sharepoints_add(file.name, file)
		}

	send_files_list()

	ui_updatefiles_host(files)
}

function send_files_list()
{
	var files_send = []

	for(var filename in files)
		if(files.hasOwnProperty(filename))
		{
            var file = files[filename]

			files_send.push({"lastModifiedDate": file.lastModifiedDate, "name": file.name,
							 "size": file.size, "type": file.type});
		}

	alert('send_files_list: '+JSON.stringify(files_send))
	socket.emit('files.list', JSON.stringify(files_send));
}