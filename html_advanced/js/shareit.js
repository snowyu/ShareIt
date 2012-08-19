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
    // Init user interface
    UI_init()

    // Init database
	DB_init(function(db)
	{
        // Get shared points and init them
        db.sharepoints_getAll(null, function(sharedpoints)
        {
            ui_update_sharedpoints(sharedpoints)

            // [To-Do] Start hashing new files on the shared points
        })

        // Init host
	    Host_init(db, function(host)
	    {
            // Get websocket room
	        if(!window.location.hash)
		        window.location.hash = '#'+randomString()

	        var room = window.location.hash.substring(1)

	        // Load websocket connection after IndexedDB is ready
	        Conn_init('wss://localhost:8001', room, host,
	        function(connection)
	        {
                // Add connection methods to host
	            Host_onconnect(connection, host, db)
	        },
	        function(connection)
	        {
				function _updatefiles(filelist)
				{
					host._send_files_list(filelist)
			
					ui_updatefiles_host(filelist)
				}

                db.sharepoints_getAll(null, function(filelist)
                {
                    _updatefiles(filelist)

                    // Restard downloads
	                for(var i = 0, file; file = filelist[i]; i++)
                        if(file.bitmap)
                            connection.transfer_query_chunk(file.name,
                                                            random_chunk(file.bitmap))
                })

                ui_onopen()

                ui_ready_fileschange(function(sharedpoints)
                {
	                // Loop through the FileList and add sharedpoints to list.
	                for(var i = 0, sp; sp = sharedpoints[i]; i++)
		                db.sharepoints_add(sp)

	                // [To-Do] Start hashing of files in a new worker

	                db.sharepoints_getAll(null, ui_update_sharedpoints)
                })

                ui_ready_transferbegin(function(file)
                {
                    host._transferbegin(file, function(chunks)
	                {
    	                ui_filedownloading(file.name, 0, chunks)
	                })
                })
	        },
	        function(type)
	        {
		        switch(type)
		        {
			        case 'room full':
				        console.warn("This connection is full. Please try later.");
		        }
	        })
	    })
	})
})
