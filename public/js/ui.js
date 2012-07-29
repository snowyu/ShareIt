function oldBrowser()
{
	$('#clicky').html('Your browser is not modern enough to serve as a host. :(<br /><br />(Try Chrome or Firefox!)');
}

function onopen()
{
	$('#clicky').html("<br /><br /><br /><br />Click here to choose files");
}

function impeer()
{
	$('#peer').html("You're connected as a peer!");
	$('#drop_zone').attr("onclick", function()
	{ 
	    return;
	});

	$('#files').remove();
	$('#drop_zone').css("cursor", "default");
	$('#fileslist').html('Awaiting file list..');
}

function info_begintransfer()
{
	$('#info').append("Begining Transfer...");
}

function info(data)
{
	$('#info').append(data);
}

function warn(data)
{
	$('#warnings').html(data);
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
    return '<b>Sharing!</b>'
}

function _downloadbutton_peer(fileholder)
{
    var result = '<div id="fidspan' + fid + '"></div><a href="" onclick="beginTransfer(\'' + fileholder[0] + '\', ' + fid + ', ' + fileholder[1] + '); return false;" id="fid' + fid + '">Transfer</a><a href="data:' + fileholder[2] + ';base64," target="_blank" id="fidsave' + fid + '" style="display:none">Save to disk!</a>'

	fid++

    return result
}

function _ui_updatefiles(area, downloadbutton)
{
	area.html('');
	area.html(function(i,v)
	{
   		return '<table id="filestable" cellspacing="0" summary=""><tr><th scope="col" abbr="Filename" class="nobg" width="60%">Filename</th><th scope="col" abbr="Status" width="20%" >Size</th><th scope="col" abbr="Size"width="20%" >Action</th></tr>' + v;
	});

	for(var file in files)
		if(files.hasOwnProperty(file))
		{
            var fileholder= files[file]

			$('#filestable').append(
			'<tr><th scope="row" class="spec">' + fileholder[0] + '</th><td>' + fileholder[1] + '</td><td class="end">' + downloadbutton(fileholder) + '</td></tr>');
		}
}

function ui_updatefiles_host(files)
{
    _ui_updatefiles($('#clicky'), _downloadbutton_host)
}

function ui_updatefiles_peer(files)
{
    _ui_updatefiles($('#fileslist'), _downloadbutton_peer)
}

function ui_begintransfer(fid)
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

function ui_hostdisconnected()
{
	$('#peer').html("You're disconnected!");
}
