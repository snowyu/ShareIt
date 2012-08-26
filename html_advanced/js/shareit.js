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
	        // Load websocket connection after IndexedDB is ready
	        Conn_init('wss://localhost:8001', host,
	        function(connection)
	        {
                // Add connection methods to host
	            Host_onconnect(connection, host, db)
	        },
	        function(connection)
	        {
                db.sharepoints_getAll(null, function(filelist)
                {
//                  var files_send = []
//
//                  for(var i = 0, file; file = filelist[i]; i++)
//                      files_send.push({"name": file.name, "size": file.size,
//                                       "type": file.type});
//
//                  connection.fileslist_update(socketId, files_send);

                    ui_updatefiles_host(filelist)

//                    // Restard downloads
//                    for(var i = 0, file; file = filelist[i]; i++)
//                        if(file.bitmap)
//                            connection.transfer_query_chunk(file.name,
//                                                            random_chunk(file.bitmap))
                })

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

                ui_ready_connectuser(function(uid, table)
                {
                    connection.fileslist_request(uid)
                })

                ui_set_uid(connection.socket.sessionid)
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
