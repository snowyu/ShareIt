Blob.slice = Blob.slice || Blob.webkitSlice || Blob.mozSlice
if(Blob.slice != undefined)
	alert("It won't work in your browser. Please use Chrome or Firefox.");

// Filereader support (be able to host files from the filesystem)
if(typeof FileReader == "undefined")
{
	oldBrowser();

	function transfer_query_chunk(filename, chunk){}
}
else
{
	var reader = new FileReader();

	function transfer_query_chunk(filename, chunk)
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

function peer_connected(data)
{
	ui_peerstate("Peer connected!");

	db.sharepoints_getAll(null, _send_files_list)
}

function peer_disconnected(data)
{
	ui_peerstate("Peer disconnected.");
}


var db;
DB(function(result)
{
	db = result

	db.sharepoints_getAll(null, _updatefiles)

	// Load websocket connection after IndexedDB is ready
	Conn_init('http://localhost:8000', onopen)
})

function files_change(filelist)
{
	// Loop through the FileList and append files to list.
	for(var i = 0, file; file = filelist[i]; i++)
		db.sharepoints_add(file)

//	_send_files_list(filelist)	// Send just new files

	db.sharepoints_getAll(null, _updatefiles)
}

function _updatefiles(filelist)
{
	_send_files_list(filelist)
	ui_updatefiles_host(filelist)
}

function _send_files_list(filelist)
{
	var files_send = []

	for(var i = 0, file; file = filelist[i]; i++)
		files_send.push({"lastModifiedDate": file.lastModifiedDate, "name": file.name,
						 "size": file.size, "type": file.type});

	socket.emit('files.list', JSON.stringify(files_send));
}