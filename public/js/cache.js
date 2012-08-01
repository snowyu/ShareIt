// Note: The file system has been prefixed as of Google Chrome 12:
window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;

var root

window.requestFileSystem(PERSISTENT, 1*1024*1024*1024,
function(fileSystem)
{
	root = fileSystem.root
},
errorHandler)

function file_create(filename)
{
	root.getFile(filename, {create: true, exclusive: true})
}

function file_append(filename, data)
{
	root.getFile(filename, {create: false},
	function(fileEntry)
	{
   		fileEntry.createWriter(function(fileWriter)
   		{
			fileWriter.seek(fileWriter.length); // Start write position at EOF.

		    // Create a new Blob and write it to log.txt.
    		var bb = new BlobBuilder(); // Note: window.WebKitBlobBuilder in Chrome 12.
    		bb.append(data);
    		fileWriter.write(bb.getBlob());
	   	},
	   	errorHandler)
	},
	errorHandler)
}

function file_delete(filename)
{
	root.getFile(filename, {create: false},
	function(fileEntry)
	{
		fileEntry.remove(function()
		{
			console.log('File removed.');
		},
		errorHandler);
	},
	errorHandler)
}

function file_url(filename)
{
	var url

	root.getFile(filename, {create: false},
	function(fileEntry)
	{
		url = fileEntry.toURL()
 		},
 		errorHandler)

	return url
}

function errorHandler(err)
{
	var msg = 'An error occured: ';

	switch(err.code)
	{ 
   		case FileError.NOT_FOUND_ERR: 
   			msg += 'File or directory not found'; 
   		break;

	    case FileError.NOT_READABLE_ERR: 
   			msg += 'File or directory not readable'; 
		break;

	    case FileError.PATH_EXISTS_ERR: 
   			msg += 'File or directory already exists'; 
		break;

	    case FileError.TYPE_MISMATCH_ERR: 
   			msg += 'Invalid filetype'; 
   		break;

	    default:
   			msg += 'Unknown Error'; 
	};

	console.log(msg);
}