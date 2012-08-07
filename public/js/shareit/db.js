window.indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB;
window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.mozIDBTransaction || window.msIDBTransaction;

function upgradedb(db)
{
    // Create an objectStore to hold information about the share points.
    var sharepoints = db.createObjectStore("sharepoints", { keyPath: "path" });

    // Create an objectStore to hold information about the shared files. We're
    // going to use "hash" as our key path because it's guaranteed to be unique.
    var files = db.createObjectStore("files", { keyPath: "hash" });

    alert("upgradedb");
}

function DB(onsuccess)
{
	var result = {}

	var db;

	result.sharepoints_add = function(path)
	{
	    var transaction = db.transaction("sharepoints", IDBTransaction.READ_WRITE);
	    var sharepoints = transaction.objectStore("sharepoints");
	
	    // [To-Do] Check current sharepoints and update files on duplicates
	
	    var request = sharepoints.add({"path": path});
	        request.onsuccess = function(event)
	        {
	            // event.target.result == customerData[i].ssn
	        };
	}

	result.sharepoints_get = function()
	{
	    var sharepoints = db.transaction("sharepoints").objectStore("sharepoints");
	 
	    var result = [];
	
	    sharepoints.openCursor().onsuccess = function(event)
	    {
	        var cursor = event.target.result;
	        if(cursor)
	        {
	            result.push(cursor.value);
	            cursor.continue();
	        }
	        else
	            return result;
		};
	}

	var request = indexedDB.open("ShareIt");
	    request.onerror = function(event)
	    {
	        alert("Why didn't you allow my web app to use IndexedDB?!");
	    };
	    request.onsuccess = function(event)
	    {
	        db = request.result;
	
	        // Hack for old versions of Chrome/Chromium
	        var v = 1;
	        if(v != db.version)
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