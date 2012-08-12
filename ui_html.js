// Requirements
var express = require('express');

// HTTP server
app = express.createServer()
app.listen(8000);

// App Stuff
app.use('/public', express.static(__dirname + '/public'));

app.get('/', function(req, res)
{
  res.redirect('/' + randomString());
});

app.get('/:hash', function(req, res)
{
  res.sendfile(__dirname + '/public/index.html');
});

// Utilities
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
