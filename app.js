var express = require('express');
var app = express();
var path = require('path');
var SocketController = require('./controllers/SocketController');

app.use(express.static(path.join(__dirname, 'public')));
app.disable('etag');

var server = app.listen(3000, function() {
    console.log("server started on port 3000");
});

app.get('/', function(req, res){
  res.sendfile('index.html');
});

var io = require('socket.io').listen(server);

io.sockets.on('connection', function (newSocket){
	new SocketController(io).OnConnection(newSocket);
});