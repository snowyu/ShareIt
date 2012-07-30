var files = {};

//read the requested bytes
if(typeof FileReader == "undefined")
	oldBrowser();
else
{
	var reader = new FileReader();

	socket.on('transfer.query_chunk', function(filename, chunk)
	{
		var file = files[filename];
	
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
	
		var slice;
		if(file.webkitSlice)
			slice = file.webkitSlice(start, stop + 1);
		else if(file.mozSlice)
			slice = file.mozSlice(start, stop + 1);
		else
			alert("It won't work in your browser. Please use Chrome or Firefox.");

		if(slice != undefined)
			reader.readAsBinaryString(slice);
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

function files_change(filelist)
{
	files = {};

	// Loop through the FileList and append files to list.
	for(var i = 0, file; file = filelist[i]; i++)
		if(!files.hasOwnProperty(file))
			files[file.name] = file;
//			files[file.name] = [file.name, file.size, file.type, file];

	send_files_list()

	ui_updatefiles_host(files)
}

function send_files_list()
{
	socket.emit('files.list', JSON.stringify(files));
}