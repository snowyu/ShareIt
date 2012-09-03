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
            ui_update_fileslist_sharedpoints(sharedpoints)

            // [To-Do] Start hashing new files on the shared points
        })

        ui_ready_fileschange(function(sharedpoints)
        {
            // Loop through the FileList and add sharedpoints to list.
            for(var i = 0, sp; sp = sharedpoints[i]; i++)
                db.sharepoints_add(sp)

            // [To-Do] Start hashing of files in a new worker

            db.sharepoints_getAll(null, ui_update_fileslist_sharedpoints)
        })

        // Load websocket connection after IndexedDB is ready
        Protocol_init(io.connect('wss://localhost:8001', {secure: true}),
        function(protocol)
        {
	        // Init host
		    Host_init(function(host)
		    {
                // Add connection methods to host
                Host_onconnect(db, protocol, host)

                var ui = UI_setHost(host)

                db.sharepoints_getAll(null, function(filelist)
                {
                    ui.update_fileslist_sharing(filelist)

//                    // Restard downloads
//                    for(var i = 0, file; file = filelist[i]; i++)
//                        if(file.bitmap)
//                            protocol.emit('transfer.query', file.name,
//                                                            getRandom(file.bitmap))
                })
	        })

            UI_setProtocol(protocol)
	    })
	})
})