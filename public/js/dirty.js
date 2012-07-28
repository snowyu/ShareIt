$(document).ready(function()
{
	filth = ["\"My God, That\'s Filthy!\"", 
		 	 "\"You Dirty Bastards!\"", 
		     "\"Sheer And Utter Filth!\"", 
		     "\"What a Shame!\"", 
		     ];
	$('#subheader').html('<i>' + filth[Math.floor(Math.random()*filth.length)] + '</i>');
});

$(document).ready(function()
{
    $('#shareurl').html('<b>http://localhost:8000/' + $.url().segment(1) + '</b>');
});

//read the requested bytes
var reader;
var canHost = true;
if(typeof FileReader !== "undefined")
	reader = new FileReader();
else
{
	$('#clicky').html('<br /><br />Your browser is not modern enough to serve as a host. :( <br /><br />(Try Chrome or Firefox!)');
	canHost = false;
}

function handleFileSelect(evt)
{
	var viles = evt.target.files; // FileList object
	files = {};

	// Loop through the FileList and append files to list.
	for(var i = 0, f; f = viles[i]; i++)
		if(!files.hasOwnProperty(f))
			files[f.name] = [f.name, f.size, f.type, f];

	socket.emit('listfiles', JSON.stringify(files));

    $('#fileslist').show();
	$('#clicky').html('');
	$('#clicky').hide();
	$('#fileslist').html('');
	$('#fileslist').html(function(i,v)
	{
  		return '<table id="filestable" cellspacing="0" summary=""><tr><th scope="col" abbr="Filename" class="nobg" width="60%">Filename</th><th scope="col" abbr="Status" width="20%" >Size</th> <th scope="col" abbr="Size"width="20%" >Action</th></tr>' + v;
	});

	for(var file in files)
		if(files.hasOwnProperty(file))
			$('#filestable').append('<tr><th scope="row" class="spec">' + files[file][0] + '</th><td>' + files[file][1] + '</td><td class="end"><b>Sharing!</b></td></tr>');
};

$(document).ready(function()
{
	document.getElementById('files').addEventListener('change', handleFileSelect, false);
});