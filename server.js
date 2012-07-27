// Requirements
var express = require('express')
  , jqtpl   = require("jqtpl");

app = express.createServer()

require("./connect_websockets.js");


// App Stuff
app.use('/public', express.static(__dirname + '/public'));
app.listen(8000);
app.set("view engine", "html");
app.set("view options", {layout: false});
app.register(".html", jqtpl.express);

app.get('/', function(req, res)
{
  res.redirect('/' + randomString());
});

app.get('/:hash', function(req, res)
{
  res.render(__dirname + '/public/index', {domain: 'localhost:8888'});
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
