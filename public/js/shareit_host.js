var files = {};

//read the requested bytes
if(typeof FileReader == "undefined")
	oldBrowser();
else
{
	var reader = new FileReader();

	socket.on('transfer.begin', function(file, chunk)
	{
		if(chunk == 0)
			info_transfer_begin();
	
		var fileholder= files[file];
		var fileo= fileholder[3]; //ugly
	
		start = chunk * chunksize;
	
		stop = parseInt(fileholder[1]) - 1;
		if(stop > start + chunksize - 1)
			stop = start + chunksize - 1;
	
		// If we use onloadend, we need to check the readyState.
		reader.onloadend = function(evt)
		{
			if(evt.target.readyState == FileReader.DONE)
			{
				// DONE == 2
				var data = evt.target.result;
				socket.emit('transfer.data', data, file, chunk);
			}
		};
	
		var slice;
		if(fileo.webkitSlice)
			slice = fileo.webkitSlice(start, stop + 1);
		else if(fileo.mozSlice)
			slice = fileo.mozSlice(start, stop + 1);
		else
			alert("It won't work in your browser. Please use Chrome or Firefox.");

		if(slice != undefined)
			reader.readAsBinaryString(slice);
	})
}

function files_change(filelist)
{
	files = {};

	// Loop through the FileList and append files to list.
	for(var i = 0, f; f = filelist[i]; i++)
		if(!files.hasOwnProperty(f))
			files[f.name] = [f.name, f.size, f.type, f];

	socket.emit('listfiles', JSON.stringify(files));

	ui_updatefiles_host(files)
}