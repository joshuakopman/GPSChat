var express = require('express');
var app = express();
var path = require('path');
var SocketManager = require('./managers/SocketManager');
var Events = require('./constants/Events');
var ClientEvents = require('./constants/ClientEvents');
var rooms = [];

app.use(express.static(path.join(__dirname, 'public')));
app.disable('etag');

var server = app.listen(3000, function() {
    console.log("server started on port 3000");
});

app.get('/', function(req, res){
  res.sendfile('index.html');
});

app.get('/events', function(req, res){
  res.send(Events);
});

app.get('/clientevents', function(req, res){
  res.send(ClientEvents);
});

var io = require('socket.io').listen(server);

io.sockets.on('connection', function (newSocket){
	new SocketManager(io,newSocket,rooms).onConnection();
});