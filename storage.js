var express = require('express')
var app = express()
var conf = require('./config.json');

var count = 0;
var mysql      = require('mysql');
var connection = mysql.createConnection({
    host     : 'sql11.freemysqlhosting.net',
    user     : 'sql11154940',
    password : 'uTNGJpHrT9',
    database : 'sql11154940'
});


connection.connect(function(err){
    if(!err) {
        console.log("Database is connected ... nn");
    } else {
        console.log("Error connecting database ... nn");
    }
});


var date = new Date();
var ident = "server_" + date.getFullYear()+ "." + (date.getMonth()+1) + "." + date.getDate() + "T" + date.getHours() + ":" + date.getMinutes() +
    ":" + date.getSeconds() + ":" + date.getMilliseconds();
var count = 0;

exports.readAllUserAppos = function(user,calendar,callback){ //all aIds of an user,calender tuple;
    connection.query('SELECT aID from UserApps WHERE Name=? AND Calendar=?',[user,calendar], function (error, results, fields) {
        if (error) console.log(error);
        console.log("UserApps read");
        var erg = [];
        for(var item in results) {
            erg.push(results[item].aID);
        }
        callback(erg);
    });
};
exports.readAllAppointments = function(callback){ // all aId-Appointment tuples
    connection.query('SELECT * from Appointments', function (error, results, fields) {
        if (error) console.log(error);
        console.log("all appos read");
        var erg = {};
        for(var item in results) {
            var col = results[item];
            var key = col.aID;
            erg[key] = {
                id: key,
                title: col.Title,
                description: col.Description,
                start: col.Start,
                end: col.End,
                allDay: col.AllDay,
                priority: col.Priority,
                participants: []
            }
        }
        connection.query('SELECT * from UserApps ua', function (error, results, fields) {
            if (error) console.log(error);
            for(var i in results){
                var key = results[i].aID;
                if((erg[key]) != undefined) (erg[key]).participants.push(results[i].Name);
            }
            callback(erg);
        });

    });
}
exports.readAllParticipants = function(callback){ // all participants
    var erg = [];
    connection.query('SELECT * from Participants', function (error, results, fields) {
        if (error) console.log(error);
        console.log('The solution is: ', results); // result[0] 0 "Name="Franzi", result[1] "Name="Franzi"
        for(var item in results) {
            console.log(item + ": " + results[item].Name);
            erg.push(results[item].Name);
        }
        callback(erg);
    });
};
exports.addParticipant = function(participant,callback){
    connection.query('INSERT INTO Participants (Name) VALUES (?)',[participant], function (error, results, fields) {
        if (error) console.log(error);
        console.log(participant + " inserted");
        callback();
    });
}
exports.writeNewAppointment = function(participant,calendar,app,callback){
    var id = getNewId();
    app.id = id;

    connection.query('INSERT INTO Appointments (aID,Title,Start,End,AllDay,Priority,Description) VALUES (?,?,?,?,?,?,?)',[id,app.title,app.start,app.end,app.allDay,app.priority,app.description], function (error, results, fields) {
        if (error) console.log(error);
        console.log("app wrote");
    });
    /* working version with 1. Solution for AppMap
    antidote.update(AppMap.multiValueRegister(id).set(app))
        .then(_=>{console.log("App " + app.toString() + " wrote with id " + id + " in AppMap");

        })
        .catch(err=>console.log("Failed to write app" + app.toString() + " with id " + id + " in AppMap",err));

    var userApps;
    */
    var participants = app.participants;
    for(var p in participants){
        connection.query('INSERT INTO UserApps (Name,Calendar,aID) VALUES (?,?,?)',[participants[p],calendar,id], function (error, results, fields) {
            if (error) console.log(error);
            console.log("app wrote");
        });
    }
    callback();
}
exports.updateAppointment = function(aId, app,calendar,comment,res,callback) {
    var participants = app.participants;
    connection.query('Update Appointments Set Title=?, Start=?, End=?, AllDay=?, Priority=?, Description=? WHERE aID=?',[app.title,app.start,app.end,app.allDay,app.priority,app.description,aId], function (error, results, fields) {
        if (error) console.log(error);
        console.log("app updated");
    });
    var userSet = [];
    connection.query('SELECT * from Participants', function (error, results, fields) {
        if (error) console.log(error);
        for(var item in results) {
            userSet.push(results[item].Name);
        }
        for(var user in userSet) {
            var isContained = false;
            for (var p in participants) {
                if (userSet[user] == participants[p])
                    isContained = true;
            }
            if (isContained) {
                connection.query('INSERT INTO UserApps (Name,Calendar,aID) VALUES (?,?,?) ' +
                    'WHERE NOT EXISTS (SELECT * FROM UserApps WHERE Name=? AND Calendar=? AND aID=?)', [userSet[user], calendar, aId,userSet[user], calendar, aId], function (error, results, fields) {
                    console.log("userApp " + userSet[user] + ", " + calendar + ", " + aId + " added");
                });
            }
            else
            {
                connection.query('DELETE from UserApps Where aID=? AND Calendar=? AND Name=?',[aId, calendar,userSet[user]], function (error, results, fields) {
                    console.log("userApp " + userSet[user] + ", " + calendar + ", " + aId + " removed");
                });
            }
        }
        callback(aId);
    });
}
exports.writeComment = function(aId,comment){
    //return antidote.update(AppMap.map(aId).set("comments").add(comment));
}
exports.deleteAppointment = function(aId,callback){
    connection.query('DELETE FROM Appointments WHERE aID=?',[aId], function (error, results, fields) {
        if (error) console.log(error);
        console.log("app deleted");
        callback(aId);
    });
}


function getNewId(){
    count++;
    console.log("New ID generated: " + ident + "_" + count);
    return ident + "_" + count;
}
