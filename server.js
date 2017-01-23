var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');




//Express
var app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());


app.get('/', function (req, res) {
    res.sendfile('./public/index.html');
})
app.get('/favicon.ico', function(req,res){
    console.log("favicon requested");
    res.send();
})
//Routes
app.use('/api', require('./api'));

//start server
app.listen(process.env.PORT||8081);
console.log("API is running on port " + (process.env.PORT||8081));