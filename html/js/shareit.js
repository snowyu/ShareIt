window.addEventListener("load", function()
{
	DB_init(function(db)
	{
	    Host_init(db, function(host)
	    {
	        // Load websocket connection after IndexedDB is ready
	        Conn_init('wss://localhost:8001', host, function(connection)
	        {
	            Host_onconnect(connection, host, db)
	        })
	    })
	})
})
