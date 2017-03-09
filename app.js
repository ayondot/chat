var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

var users = [];
var connections = [];

server.listen(process.env.PORT || 3000, function(){
	console.log('Server running . . .');
});

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

function updateUsernames(){
	io.emit('get users', users);
}

// Listen for a connection event
io.on('connection', function(socket){

	connections.push(socket);

	console.log('Connected: %s sockets connected', connections.length);
	
	// Display each socket's id 
	console.log('The actual socket.id is: ' + socket.id);

	// Upon connection, send a message to the socket
	socket.emit('news', 'Welcome to chat!');

	// Listen for 'send message' and send 'new message'
	socket.on('send message', function(data){
		io.emit('new message', { msg: data, user: socket.username });
	});

	// New User
	socket.on('new user', function(data, callback){
		callback(true);
		socket.username = data;
		users.push(socket.username);
		updateUsernames();
	});

	// Beta room only
	socket.on('send message2', function(data){
		io.in('beta').emit('new message', data);
	});

	socket.on('subscribe', function(data){
		socket.join(data.room);
		console.log('These are the rooms: ', socket.rooms);
	});

	// Disconnect event
	socket.on('disconnect', function(data){
		users.splice(users.indexOf(socket.username), 1);
		connections.splice(connections.indexOf(socket), 1);
		updateUsernames();
		console.log('Disconnected: %s sockets connected', connections.length);
	});
});
