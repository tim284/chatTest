function addEvent(event){
    source.events.push(  event);
    $('#calendar').fullCalendar('refetchEvents' );
}
function setEvents(events){
    if(events==null)
        return;
    $('#calendar').fullCalendar('removeEventSource', source);
    source.events = [];
    $('#calendar').fullCalendar('addEventSource', source);
    for(var i = 0; i<events.length;i++) {
        if(events[i]==null)
            continue;
        var app = events[i];
        if("conflict" in app){
            app.backgroundColor = "red";
        }
        source.events.push(events[i]);
        if(app.id==currentID) {
            //setComments(app.comments);
            setEventToForm(app);
        }
    }
        $('#calendar').fullCalendar('addEventSource', source);
        //invalidateEvents();

}
function getCurrentDateString() {
    var date = new Date();
    var month = (date.getMonth()+1)<10?"0"+(date.getMonth()+1):(date.getMonth()+1);
    var day = date.getDate()<10?"0"+date.getDate():date.getDate();
    var hour = date.getHours()<10?"0"+date.getHours():date.getHours();
    var min = date.getMinutes()<10?"0"+date.getMinutes():date.getMinutes();
    var sec = date.getSeconds()<10?"0"+date.getSeconds():date.getSeconds();
    return date.getFullYear()+ "." + month + "." + day + ", " + hour + ":" + min + ":" + sec;

}
function getCurrentDateFormat() {
    var date = new Date();
    var month = (date.getMonth()+1)<10?"0"+(date.getMonth()+1):(date.getMonth()+1);
    var day = date.getDate()<10?"0"+date.getDate():date.getDate();
    var hour = date.getHours()<10?"0"+date.getHours():date.getHours();
    var min = date.getMinutes()<10?"0"+date.getMinutes():date.getMinutes();
    var sec = date.getSeconds()<10?"0"+date.getSeconds():date.getSeconds();
    return date.getFullYear()+ "-" + month + "-" + day + "T" + hour + ":" + min + ":" + sec;

}
function serverRequest(requestUrl,value, success){
    xhr = new XMLHttpRequest();
    var url = requestUrl;
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            var json = JSON.parse(xhr.responseText);
            success(json);
        }
    };
    var data = JSON.stringify(value);
    xhr.send(data);
}

function addNewParticipant() {
    consoleAdd("send AddNewParticipant Request");
    var val = document.getElementById("newParticipant").value;
    if(val=="")
        consoleAdd("Participant name cannot be empty!");
    else
    {
        serverRequest("/api/addParticipant",{name:val}, function (json) {
            consoleAdd("addNewParticipant: " + json.result);
            getUpdates();
        })
    }
    $('#newParticipant').val("");

}

function editAppointment(){
    consoleAdd("Current ID for editing: " + currentID);
    var newApp = getAppointmentFromForm();
    newApp.id = currentID;
    serverRequest("/api/editAppointment", {id:currentID, app:newApp,calendar:currentCalendar, comment:getCurrentDateString() + ": edited by " + currentParticipant}, function (json) {
        consoleAdd("editAppointment: " + json.result);
        clearForm();
        getUpdates()
    })
}
function removeAppointment(){
    consoleAdd("Current ID for deleting: " + currentID);
    serverRequest("/api/removeAppointment", {id: currentID}, function (json) {
        consoleAdd("removeAppointment: " + json.result);
        clearForm();
        getUpdates();
    })
}
function addAppointment() {
    if(currentParticipant=="" || (typeof currentParticipant == "undefined") || $('#iname').val()=="") {
        alert("Calendar name and title should be filled out!");
        return;
    }
    var app = getAppointmentFromForm();
    app.comments = [getCurrentDateString() + ": created by " + currentParticipant];
    //addEvent(res);
    serverRequest("/api/addAppointment", {participant:currentParticipant,
    calendar:currentCalendar,appointment:app}, function (json) {
        consoleAdd("addAppointment: " + json.result);
        clearForm();
        getUpdates();
        currentID = "";
    })
}
function addComment() {
    var val = document.getElementById("iCommentInput").value;
    $('#iCommentInput').val("");
    if(val=="") {
        consoleAdd("Comment cannot be empty!");
    }
    else {
        consoleAdd("New Comment: " + val);
    }
    serverRequest("/api/addComment", {id:currentID,comment: getCurrentDateString() + ", "+currentParticipant + ": " + val}, function (json) {
        consoleAdd("addComment: " + json.result);
        getUpdates();
    })
}
function solveAppointment() {
    consoleAdd("Solving conflict as 'editNewAppointment' with " + currentID);
    var app = getAppointmentFromChooseForm();
    app.id = currentID;
    serverRequest("/api/editAppointment", {id:currentID, app:app}, function (json) {
        consoleAdd("editAppointment: " + json.result);
        showInput();
        clearForm();
        getUpdates();
    })
}
function getUpdates() { // funktioniert
    consoleAdd("update request");
    serverRequest("/api/update",{participant:currentParticipant,calendar: currentCalendar}, function (json) {
        setParticipants(json.participants);
        setEvents(json.apps);
    });
}

function consoleAdd(text) {
    $('#console').val($('#console').val() + "\n" + text);
}
function getConflict() {
    consoleAdd("RequestConflictingData");
    serverRequest("/api/requestConflictingAppointment", {calendar:currentCalendar, participant:currentParticipant}, function (json) {
            setEvents(json.apps);
    })
}