var express = require('express')
,   app = express()
,   server = require('http').createServer(app)
,   io = require('socket.io').listen(server)
,   conf = require('./config.json');
var	fileManager = require('./filemanager.js');
const chatList = [];
var count = 0;

// Webserver
// auf den Port x schalten
fileManager.Exists("./chatlog.txt");
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
app.get('/senf', function(req,res){
	res.sendfile(__dirname + "/public/senf.html");
});

// Websocket
io.sockets.on('connection', function (socket) {
	// der Client ist verbunden
	socket.emit('chat', new Nachricht(new Date(), "", "Du bist verbunden! Gib mir dein Geld!"));
	fileManager.ReadFile("./chatlog.txt", socket);
	
	// wenn ein Benutzer einen Text senden
	socket.on('chat', function (data) {
		// so wird dieser Text an alle anderen Benutzer gesendet
		if(data.text=="") return;
		if(data.text=="chatlog clear"){
			fileManager.ClearFile("./chatlog.txt");
			//io.sockets.emit('chat', new Nachricht(new Date(),"SERVER","Bisheriger Chatverlauf vom Admin gelöscht"));
			io.sockets.emit('alert', "Bisheriger Chatverlauf vom Admin gelöscht\nSeite wird neu geladen!");
			return;
		}
		fileManager.AddLine("./chatlog.txt", (new Date()).toString() + "," + data.name + "," + data.text + "|");
		count++;
		io.sockets.emit('chat', new Nachricht(new Date(),data.name,data.text));
	});
});
function Nachricht(zeit, name,text){
	this.zeit = zeit;
	this.name = name;
	this.text = text;
}
// Portnummer in die Konsole schreiben
console.log('Der Server l�uft nun unter http://127.0.0.1:' + conf.port + '/');
