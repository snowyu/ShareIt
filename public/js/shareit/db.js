window.indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB;
window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.mozIDBTransaction || window.msIDBTransaction;

function DB(onsuccess)
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

	var result = {}

	var db;

	result.sharepoints_add = function(path, file)
	{
	    var transaction = db.transaction("sharepoints", IDBTransaction.READ_WRITE);
	    var sharepoints = transaction.objectStore("sharepoints");
	
	    // [To-Do] Check current sharepoints and update files on duplicates
	
	    var request = sharepoints.add(file);
	        request.onsuccess = function(event)
	        {
	            // event.target.result == customerData[i].ssn
	        };
	}

	result.sharepoints_get = function(key, onsuccess)
	{
		var sharepoints = db.transaction("sharepoints").objectStore("sharepoints");
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

	result.sharepoints_getAll = function(onsuccess)
	{
	    var result = [];

	    var sharepoints = db.transaction("sharepoints").objectStore("sharepoints");
		    sharepoints.openCursor().onsuccess = function(event)
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

	var request = indexedDB.open("ShareIt", version);
	    request.onerror = function(event)
	    {
	        alert("Why didn't you allow my web app to use IndexedDB?!");
	    };
	    request.onsuccess = function(event)
	    {
	        db = request.result;
	
	        // Hack for old versions of Chrome/Chromium
	        if(version != db.version)
	        {
	            var setVrequest = db.setVersion(v);
	                setVrequest.onsuccess = function(e)
	                {
	                    upgradedb(db);
	                };
	        }
	
			if(onsuccess)
				onsuccess(result);
	    };
	    request.onupgradeneeded = function(event)
	    {
	        db = event.target.result;
	
	        upgradedb(db);
	    };

	return result
}