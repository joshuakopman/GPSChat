var express = require('express');
var app = express();
var path = require('path');
var SocketManager = require('./managers/SocketManager');
var Events = require('./constants/Events');
var ClientEvents = require('./constants/ClientEvents');
var rooms = [];
var port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.disable('etag');

var server = app.listen(port, function() {
    console.log("server started on port " + port);
});

app.get('/', function(req, res){
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/events', function(req, res){
  res.send(Events);
});

app.get('/clientevents', function(req, res){
  res.send(ClientEvents);
});

var io = require('socket.io')(server);

io.on('connection', function (newSocket){
	new SocketManager(io,newSocket,rooms).onConnection();
});
