var express = require('express');
var app = express();
var path = require('path');
var SocketHandler = require('./handlers/SocketHandler');

app.use(express.static(path.join(__dirname, 'public')));
app.disable('etag');

var server = app.listen(3000, function() {
    console.log("server started on port 3000");
});

var io = require('socket.io').listen(server);

app.get('/', function(req, res){
  res.sendfile('index.html');
});

var socketHandler = new SocketHandler(io);

socketHandler.HandleSocketConnect();

