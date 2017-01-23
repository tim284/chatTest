var storage = require('./storage.js');

var appDict = {};



exports.addAppointment = function(participant,calendar,app,res){
    storage.writeNewAppointment(participant,calendar,app,function (result) {
        res.send({result:result});
    });

};
exports.editAppointment = function(id,app,calendar,comment,res){
    storage.updateAppointment(id,app,calendar,comment,res,function (result) {
        res.send({result:result});
    }); //update appointment in antidote
}
exports.removeAppointment = function(id,res){
    storage.deleteAppointment(id,function (result) {
        res.send({result:result});
    });
}
exports.addComment = function(id,comment,res){
    var result = storage.writeComment(id,comment);
}
exports.getUpdates = function(participant, calendar, res){
    var updateObject = {participants : [],apps:[]};
    var isGlobal = calendar=="Global"?true:false;
    try{
    storage.readAllParticipants(function (resultPart) { // Array with all Participants
        updateObject.participants = resultPart;
        storage.readAllAppointments(function (resultAllApp) { // JSON with aID: app-structure
            console.log("allAppos: " + JSON.stringify(resultAllApp));
            storage.readAllUserAppos(participant,calendar,function (resultUserApp) {  // array with aIDs
                console.log("userAppos: " + resultUserApp);
                var apps = [];
                for(var app in resultUserApp){
                    apps.push(resultAllApp[resultUserApp[app]]);
                }
                updateObject.apps = apps;
                console.log("apps: " + apps);
                res.send(updateObject);
            });

        })

    });
    }
    catch(e){
        res.send();
    }

    /*
    if(isGlobal) {
        y = storage.readAllUserAppos(participant, "Privat");
        y2 = storage.readAllUserAppos(participant,"Business");
    }
    else
        y = storage.readAllUserAppos(participant, calendar);
    var z = storage.readAllAppointments();

    x.then(valuea=> {
            updateObject.participants = valuea;
        y.then(valueb=> {
            if(isGlobal){
                y2.then(valuec=>{
                    UserApps = valueb;
                    UserApps2 = valuec;
                })
                    .catch(err=>console.log("Error read value for UserApps2 (global calendar!",err));
            }
            else {
                UserApps = valueb;
            }
            z.then(value=> {
                if(isGlobal) {
                    AllApps = value.toJsObject();
                    if (!"length" in value.entries)
                        console.log("fehler gefunden");
                    if (value.entries.length > 0) {
                        var apps1 = compareAppsWithUserApps(AllApps, UserApps);
                        apps1 = coloringApp(apps1, "green");
                        var apps2 = compareAppsWithUserApps(AllApps, UserApps2);
                        apps2 = coloringApp(apps2, "blue");
                        updateObject.apps = apps1.concat(apps2);
                    }
                }
                else
                {
                    AllApps = value.toJsObject();
                    if (!"length" in value.entries)
                        console.log("fehler gefunden");
                    if (value.entries.length > 0) {
                        updateObject.apps = compareAppsWithUserApps(AllApps, UserApps);
                    }
                }
                console.log("update successful");
                res.send(updateObject);

            }).catch(err => {console.log("GetUpdates: Participants send back to client, readAllAppointments failed",err);res.send(updateObject);})
        }).catch(err => {console.log("GetUpdates: Participants send back to client, readAllUserAppos failed",err);res.send(updateObject);})
    }).catch(err => console.log("Wrapper.getUpdates: failed to read Updates, readAllParticipants failed",err))

*/
}
exports.addParticipant = function (participant,res) {
    storage.addParticipant(participant, function () {
        res.send({result: participant});
    });
}
/* Appointment should have this form:
 var app1 = {
 id: "server_1",
 title: "Weihnachten",
 start: new Date("2016-12-24T10:30"),
 end: new Date("2016-12-24T13:30"),
 allDay : false,
 description : "Geschenke*-*",
 participants: [],
 priority: 10
 };
 */

function compareAppsWithUserApps(apps,userapps){
    var result = [];
    if(userapps==undefined || apps==undefined)
        return result;
    for(var i =0;i<userapps.length;i++){
        var key = ((userapps[i]));
        if(key in apps) {
            var app = MapToJSON(apps[userapps[i]]);
            result.push(app);
        }
    }
    return result;
}

function MapToJSON(map) {
    if(Array.isArray(map))
        map = map[0];
    var isConflict = isConflicted(map);
    if(map.title.length>1)
        var x=3;
    var app = {
        id: map.id[0],
        title: map.title[0],
        start: map.start[0],
        end: map.end[0],
        allDay: map.allDay[0],
        description: map.description[0],
        participants: map.participants,
        priority : map.priority[0],
        comments: map.comments
    };
    if(isConflict) {
        app.conflict = true;
        app.app = map;
    }
    return app;
}

function isConflicted(app){
    var conflict = false;
    if(app.id.length>1)
        conflict = true;
    if(app.title.length>1)
        conflict = true;
    if(app.start.length>1)
        conflict = true;
    if(app.end.length>1)
        conflict = true;
    if(app.allDay.length>1)
        conflict = true;
    if(app.description.length>1)
        conflict = true;
    if(app.priority.length>1)
        conflict = true;
    return conflict;
}

function coloringApp(apps, color) {
    for(var app in apps)
        apps[app].backgroundColor = color;
    return apps;
}





exports.getUpdates_conflict = function(participant, calendar, res){
    var updateObject = {participants : [],apps:[]}
    var UserApps,UserApps2, AllApps;
    var isGlobal = calendar=="Global"?true:false;
    var y,y2;
    var x = storage.readAllParticipants();
    if(isGlobal) {
        y = storage.readAllUserAppos(participant, "Privat");
        y2 = storage.readAllUserAppos(participant,"Business");
    }
    else
        y = storage.readAllUserAppos(participant, calendar);
    var z = storage.readAllAppointments();

    x.then(valuea=> {
        updateObject.participants = valuea;
        y.then(valueb=> {
            if(isGlobal){
                y2.then(valuec=>{
                    UserApps = valueb;
                    UserApps2 = valuec;
                })
                    .catch(err=>console.log("Error read value for UserApps2 (global calendar!",err));
            }
            else {
                UserApps = valueb;
            }
            z.then(value=> {
                if(isGlobal) {
                    AllApps = value.toJsObject();
                    AllApps["dummyConflict"] = {
                        id: ["dummyConflict"],
                        title: ["titel", "conflictTiel"],
                        description: ["desc", "conflictDesc"],
                        start: [new Date("2017-01-18T10:00"), new Date("2017-01-18T10:15")],
                        end: [new Date("2017-01-18T10:30"), new Date("2017-01-18T10:45")],
                        allDay: [false,false],
                        participant:[],
                        priority: [4,5]
                    }
                    UserApps.push("dummyConflict");
                    if (!"length" in value.entries)
                        console.log("fehler gefunden");
                    if (value.entries.length > 0) {
                        var apps1 = compareAppsWithUserApps(AllApps, UserApps);
                        apps1 = coloringApp(apps1, "green");
                        var apps2 = compareAppsWithUserApps(AllApps, UserApps2);
                        apps2 = coloringApp(apps2, "blue");
                        updateObject.apps = apps1.concat(apps2);
                    }
                }
                else
                {
                    AllApps = value.toJsObject();
                    AllApps["dummyConflict"] = {
                        id: ["dummyConflict"],
                        title: ["titel", "conflictTiel"],
                        description: ["desc", "conflictDesc"],
                        start: [new Date("2017-01-18T10:00"), new Date("2017-01-18T10:15")],
                        end: [new Date("2017-01-18T10:30"), new Date("2017-01-18T10:45")],
                        allDay: [false,false],
                        participant:[],
                        priority: [4,5]
                    }
                    UserApps.push("dummyConflict");
                    if (!"length" in value.entries)
                        console.log("fehler gefunden");
                    if (value.entries.length > 0) {
                        updateObject.apps = compareAppsWithUserApps(AllApps, UserApps);
                    }
                }
                console.log("update successful");
                res.send(updateObject);

            }).catch(err => {console.log("GetUpdates: Participants send back to client, readAllAppointments failed",err);res.send(updateObject);})
        }).catch(err => {console.log("GetUpdates: Participants send back to client, readAllUserAppos failed",err);res.send(updateObject);})
    }).catch(err => console.log("Wrapper.getUpdates: failed to read Updates, readAllParticipants failed",err))


}