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
	        Conn_init('wss://localhost:8001', host, function(connection)
	        {
	            // Get websocket room
		        if(!window.location.hash)
			        window.location.hash = '#'+randomString()

		        connection.emit('joiner', window.location.hash.substring(1));	

                // Add connection methods to host
	            Host_onconnect(connection, host, db)
	        })
	    })
	})
})
