var express = require('express')
,   app = express()
,   server = require('http').createServer(app)
,   io = require('socket.io').listen(server)
,   conf = require('./config.json');
const chatList = [];
var count = 0;

// Webserver
// auf den Port x schalten
server.listen(process.env.PORT||8080);

app.configure(function(){
	// statische Dateien ausliefern
	app.use(express.static(__dirname + '/public'));
});

// wenn der Pfad / aufgerufen wird
app.get('/', function (req, res) {
	// so wird die Datei index.html ausgegeben
	res.sendfile(__dirname + '/public/index.html');
});

// Websocket
io.sockets.on('connection', function (socket) {
	// der Client ist verbunden
	socket.emit('chat', { zeit: new Date(), text: 'Du bist nun mit dem Server verbunden!' });
	chatList.forEach(function(element) {
		socket.emit('chat', { zeit: element.zeit, name: element.name || 'Anonym', text: element.text });
	}, this);
	// wenn ein Benutzer einen Text senden
	socket.on('chat', function (data) {
		// so wird dieser Text an alle anderen Benutzer gesendet
		chatList[count] = {zeit: new Date(), name: data.name || 'Anonym', text: data.text}
		count++;
		io.sockets.emit('chat', { zeit: new Date(), name: data.name || 'Anonym', text: data.text });
	});
});

// Portnummer in die Konsole schreiben
console.log('Der Server l�uft nun unter http://127.0.0.1:' + conf.port + '/');
