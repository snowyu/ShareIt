window.indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB;

function DB_init(onsuccess)
{
	var version = 2

	function upgradedb(db)
	{
	    // Create an objectStore to hold information about the share points.
	    var sharepoints = db.createObjectStore("sharepoints", { keyPath: "name" });
	
	    // Create an objectStore to hold information about the shared files. We're
	    // going to use "hash" as our key path because it's guaranteed to be unique.
	    var files = db.createObjectStore("files", { keyPath: "hash" });
	
//	    alert("upgradedb");
	}

	var request = indexedDB.open("ShareIt", version);
	    request.onerror = function(event)
	    {
	        alert("Why didn't you allow my web app to use IndexedDB?!");
	    };
	    request.onsuccess = function(event)
	    {
	        var db = request.result;
	
	        // Hack for old versions of Chrome/Chromium
	        if(version != db.version)
	        {
	            var setVrequest = db.setVersion(version);
	                setVrequest.onsuccess = function(e)
	                {
	                    upgradedb(db);
	                };
	        }

            // Compose (and return) DB wrapper
        	var result = {}

	        result.sharepoints_add = function(file, onsuccess, onerror)
	        {
	            var transaction = db.transaction("sharepoints", "readwrite");
	            var sharepoints = transaction.objectStore("sharepoints");
	
	            // [To-Do] Check current sharepoints and update files on duplicates
	
	            var request = sharepoints.add(file);
	            if(onsuccess != undefined)
	                request.onsuccess = function(event)
	                {
	                    onsuccess()
	                };
	            if(onerror != undefined)
	                request.onerror = function(event)
	                {
            	        alert("Database error: " + event.target.result);
	                    onerror(event.target.errorCode)
	                }
	        }

	        result.sharepoints_get = function(key, onsuccess)
	        {
	            var transaction = db.transaction("sharepoints");
	            var sharepoints = transaction.objectStore("sharepoints");
		        var request = sharepoints.get(key);
			        request.onerror = function(event)
			        {
				        // Handle errors!
			        };
			        request.onsuccess = function(event)
			        {
				        onsuccess(request.result);
			        };
	        }

	        result.sharepoints_getAll = function(range, onsuccess)
	        {
	            var result = [];

	            var transaction = db.transaction("sharepoints");
	            var sharepoints = transaction.objectStore("sharepoints");
		            sharepoints.openCursor(range).onsuccess = function(event)
		            {
		                var cursor = event.target.result;
		                if(cursor)
		                {
		                    result.push(cursor.value);
		                    cursor.continue();
		                }
		                else
		                    onsuccess(result);
			        };
	        }

	        result.sharepoints_put = function(file, onsuccess, onerror)
	        {
	            var transaction = db.transaction("sharepoints", "readwrite");
	            var sharepoints = transaction.objectStore("sharepoints");
	
	            // [To-Do] Check current sharepoints and update files on duplicates
	
	            var request = sharepoints.put(file);
	            if(onsuccess != undefined)
	                request.onsuccess = function(event)
	                {
	                    onsuccess()
	                };
	            if(onerror != undefined)
	                request.onerror = function(event)
	                {
            	        alert("Database error: " + event.target.result);
	                    onerror(event.target.errorCode)
	                }
	        }

			if(onsuccess)
				onsuccess(result);
	    };
	    request.onupgradeneeded = function(event)
	    {
	        upgradedb(event.target.result);
	    };
}
