function randomString()
{
	var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghijklmnopqrstuvwxyz";
	var string_length = 8;

	var randomstring = '';
	for(var i=0; i<string_length; i++)
	{
		var rnum = Math.floor(Math.random() * chars.length);
		randomstring += chars.substring(rnum,rnum+1);
	}

	return randomstring;
}

window.addEventListener("load", function()
{
	DB_init(function(db)
	{
	    Host_init(db, function(host)
	    {
	        // Load websocket connection after IndexedDB is ready
	        Conn_init('wss://localhost:8001', host,
	        function(connection)
	        {
                // Add connection methods to host
	            Host_onconnect(connection, host, db)
	        },
	        function(connection)
	        {
	            // Get websocket room
		        if(!window.location.hash)
			        window.location.hash = '#'+randomString()

		        connection.joiner(window.location.hash.substring(1));	

				function _updatefiles(filelist)
				{
					if(host._send_files_list)
						host._send_files_list(filelist)
					else
						console.warn("'host._send_files_list' is not available");
			
					ui_updatefiles_host(filelist)
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

		                // Demand data from the begining of the file
		                connection.transfer_query_chunk(key, random_chunk(file.bitmap))
	                },
	                function(errorCode)
	                {
		                console.error("Transfer begin: '"+file.name+"' is already in database.")
	                })
                })
	        })
	    })
	})
})
