function oldBrowser()
{
	$('#clicky').html('Your browser is not modern enough to serve as a host. :(<br /><br />(Try Chrome or Firefox!)');
}

function onopen()
{
	$('#clicky').html("<br /><br /><br /><br />Click here to choose files");
	$('#fileslist').html('Awaiting file list..');
}

function log(level, msg)
{
	switch(level)
	{
		case 'warning':
			msg = '<span style="color: red;">' + msg + '</span>'
			break
	}

	msg += '<br/>'

	$('#log').append(msg);
}

function info(msg)
{
	log('info', msg);
}

function warning(msg)
{
	log('warning', msg);
}

$(document).ready(function()
{
	document.getElementById('files').addEventListener('change', function(event)
	{
		files_change(event.target.files); // FileList object
    }, false);
})

function _button_host()
{
	var bold = document.createElement("B");
		bold.appendChild(document.createTextNode("Sharing!"));

	return bold
}

function _button_peer(file)
{
    var div = document.createElement("DIV");
    	div.id = file.name

	div.transfer = function()
	{
	    var transfer = document.createElement("A");
	    	transfer.href = ""
	    	transfer.onclick = function()
	    	{
		    	transfer_begin(file);
		    	return false;
	    	}
			transfer.appendChild(document.createTextNode("Transfer"));

		while(div.firstChild)
			div.removeChild(div.firstChild);
		div.appendChild(transfer);
	}
	
	div.progressbar = function()
	{
		var progress = document.createTextNode("0%")

		while(div.firstChild)
			div.removeChild(div.firstChild);
		div.appendChild(progress);
	}
	
	div.downloaded = function()
	{
		// Show file as downloaded
		while(div.firstChild)
			div.removeChild(div.firstChild);
		div.appendChild(document.createTextNode("Downloaded!"));
	}

    // Show if file have been downloaded previously or if we can transfer it
    if(file.downloaded)
        div.downloaded()
    else
    	div.transfer()

    return div
}

function encode64(input)
{
	var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZ" + "abcdefghijklmnopqrstuvwxyz" + "0123456789" + "+/=";

	var output = "";
    var chr1, chr2, chr3 = "";
    var enc1, enc2, enc3, enc4 = "";
    var i = 0;

    do
    {
    	chr1 = input.charCodeAt(i++);
        chr2 = input.charCodeAt(i++);
        chr3 = input.charCodeAt(i++);

        enc1 = chr1 >> 2;
        enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
        enc4 = chr3 & 63;

        if(isNaN(chr2))
            enc3 = enc4 = 64;
        else if(isNaN(chr3))
            enc4 = 64;

        output = output +
            keyStr.charAt(enc1) +
            keyStr.charAt(enc2) +
            keyStr.charAt(enc3) +
            keyStr.charAt(enc4);
        chr1 = chr2 = chr3 = "";
    	enc1 = enc2 = enc3 = enc4 = "";
	} while(i < input.length);

	return output;
}

function _ui_updatefiles(area, button, files)
{
	var filestable = document.createElement('TABLE');
		filestable.id = "filestable"
		filestable.cellspacing = 0
		filestable.summary = ""

	var tr = document.createElement('TR');
	filestable.appendChild(tr);

	var th = document.createElement('TH');
		th.scope = "col"
		th.abbr = "Filename"
		th.class = "nobg"
		th.width = "60%"
		th.appendChild(document.createTextNode("Filename"));
	tr.appendChild(th);

	var th = document.createElement('TH');
		th.scope = "col"
		th.abbr = "Size"
		th.class = "nobg"
		th.width = "20%"
		th.appendChild(document.createTextNode("Size"));
	tr.appendChild(th);

	var th = document.createElement('TH');
		th.scope = "col"
		th.abbr = "Status"
		th.class = "nobg"
		th.width = "20%"
		th.appendChild(document.createTextNode("Action"));
	tr.appendChild(th);

	// Remove old table and add new empty one
	while(area.firstChild)
		area.removeChild(area.firstChild);
  	area.appendChild(filestable)

	for(var filename in files)
		if(files.hasOwnProperty(filename))
		{
            var file = files[filename]

			var tr = document.createElement('TR');
			filestable.appendChild(tr)

			var th = document.createElement('TH');
				th.scope = "row"
				th.class = "spec"
				th.appendChild(document.createTextNode(file.name));
			tr.appendChild(th)

			var td = document.createElement('TD');
				td.appendChild(document.createTextNode(file.size));
			tr.appendChild(td)

			var td = document.createElement('TD');
				td.class = "end"
				td.appendChild(button(file));
			tr.appendChild(td)
		}
}

function ui_updatefiles_host(files)
{
    _ui_updatefiles(document.getElementById('clicky'), _button_host, files)
}

function ui_updatefiles_peer(files)
{
    _ui_updatefiles(document.getElementById('fileslist'), _button_peer, files)
}

function ui_filedownloading(filename, value, total)
{
    var div = $("#" + filename)

    if(total != undefined)
        div.total = total;

	div.html(Math.floor(value/div.total * 100) + '%');
}

function ui_filedownloaded(filename)
{
	document.getElementById(filename).downloaded();

	info("Transfer finished!");
}

function ui_peerstate(msg)
{
	$('#peer').html(msg);
}
