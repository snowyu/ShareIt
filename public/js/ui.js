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

function _downloadbutton_host()
{
	var bold = document.createElement("B");
		bold.appendChild(document.createTextNode("Sharing!"));

	return bold
}

function _downloadbutton_peer(fileholder)
{
    var div = document.createElement("DIV");

    var span = document.createElement("DIV");
    	span.id = "fidspan" + fid
	div.appendChild(span);

    var transfer = document.createElement("A");
    	transfer.href = ""
    	transfer.onclick = function()
    	{
	    	transfer_begin(fileholder[0], fid, fileholder[1]);
	    	return false;
    	}
    	transfer.id = "fid" + fid
		transfer.appendChild(document.createTextNode("Transfer"));
	div.appendChild(transfer);
    
    var save = document.createElement("A");
    	save.href = "data:" + fileholder[2] + ";base64"
    	save.target = "_blank"
    	save.onclick = function()
    	{
	    	transfer_begin(fileholder[0], fid, fileholder[1]);
	    	return false;
    	}
    	save.id = "fidsave" + fid
    	save.style = "display:none"
		save.appendChild(document.createTextNode("Save to disk!"));
	div.appendChild(save);

	fid++

    return div
}

function _ui_updatefiles(area, downloadbutton, files)
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

	for(var file in files)
		if(files.hasOwnProperty(file))
		{
            var fileholder= files[file]

			var tr = document.createElement('TR');
			filestable.appendChild(tr)

			var th = document.createElement('TH');
				th.scope = "row"
				th.class = "spec"
				th.appendChild(document.createTextNode(fileholder[0]));
			tr.appendChild(th)

			var td = document.createElement('TD');
				td.appendChild(document.createTextNode(fileholder[1]));
			tr.appendChild(td)

			var td = document.createElement('TD');
				td.class = "end"
				td.appendChild(document.createTextNode(downloadbutton(fileholder)));
			tr.appendChild(td)
		}
}

function ui_updatefiles_host(files)
{
    _ui_updatefiles(document.getElementById('clicky'), _downloadbutton_host, files)
}

function ui_updatefiles_peer(files)
{
    _ui_updatefiles(document.getElementById('fileslist'), _downloadbutton_peer, files)
}

function ui_transfer_begin(fid)
{
	var f = "#fidspan" + fid;
	$(f).html('0%');
	f = "#fid" + fid;
	$(f).hide();
}

function ui_filedownloading(f, chunk)
{
	var fspan = "#fidspan" + f.fid;
	$(fspan).html(Math.floor(chunk/f.chunks * 100) + '%');
}

function ui_filedownloaded(f)
{
	var fspan = "#fidspan" + f.fid;
	$(fspan).hide();
	$(fspan).html('');

	var fsave = "#fidsave" + f.fid;
	$(fsave).attr('href', $(fsave).attr('href') + encode64(f.data));
	$(fsave).show();

	info("Transfer finished!");
}

function ui_peerstate(msg)
{
	$('#peer').html(msg);
}