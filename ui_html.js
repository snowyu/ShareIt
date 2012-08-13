// Requirements
var express = require('express');

// HTTP server
app = express.createServer()
app.listen(8000);

// App Stuff
app.use('/public', express.static(__dirname + '/public'));

app.get('/', function(req, res)
{
  res.sendfile(__dirname + '/public/index.html');
})