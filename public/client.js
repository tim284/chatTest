//source field for the calendar
var source = {
    events: [],
    color: 'black',     // an option!
    textColor: 'yellow' // an option!
};
var currentParticipant = "";
var currentCalendar = "Business";
var currentID = "";

var allDayChecked = false;
$(document).ready(function(){
    initialize();
    $('#calendar').fullCalendar({
        header: {
            left: "prev,next",
            center: "",
            right: 'agendaWeek'
        },
        defaultView: "agendaWeek",
        allDaySlot: true,
        minTime: "08:00:00",
        maxTime: "19:00:00",
        height: 500,
        draggable: true,
        eventSources: [
            ],
        eventClick: function(calEvent, jsEvent, view) {
            eventClick(calEvent);
        },
        dayClick: function( date, jsEvent, view) {
            dayClick(date);
        }
    });
});
function onEnterNewParticipant(event)
{
    var code = 0;
    code = event.keyCode;
    if (code==13)
        addNewParticipant();
}
function onEnterComment(event)
{
    var code = 0;
    code = event.keyCode;
    if (code==13)
        addComment();
}
function onChangeCbCalendars(e){
    var optionSelected = $("option:selected", e);
    var valueSelected = e.value;
    currentCalendar = valueSelected;
    if(currentCalendar == "Global"){
        document.getElementById("calInfoGlobal").style.display = "inline";
        disableInput();
    }
    else {
        document.getElementById("calInfoGlobal").style.display = "none";
        enableInput();
    }
    clearForm();
    getUpdates();
}
function onChangeCbNames(e) {
    var optionSelected = $("option:selected", e);
    var valueSelected = e.value;
    currentParticipant = valueSelected;
    clearForm();
    getUpdates();
}
function handleCBClick(cb) {
    allDayChecked = cb.checked;
    if(allDayChecked)
        document.getElementById('iendDate').style.visibility = "hidden";
    else
        document.getElementById('iendDate').style.visibility = "visible";
}

function getAppointmentFromForm(){
    var name = document.getElementById('iname').value ;
    var x = document.getElementById("istartDate").value;
    var sDate = new Date(document.getElementById('istartDate').value );
    sDate.setHours(sDate.getHours()+1);
    var eDate = new Date(document.getElementById('iendDate').value );
    eDate.setHours(eDate.getHours()+1);
    var desc = $('#desc').val();
    var allday = isAllDayChecked();
    var description = document.getElementById("idesc").value;
    var priority = document.getElementById("ipriority").value;
    var res =
    {
        id: 0,
        title: name,
        start: sDate,
        end: eDate,
        allDay : allday,
        description : description,
        participants: getSelectedParticipants(),
        priority: priority
    };
    return res;
}
function clearForm() {
    currentID = "";
    document.getElementById("iallDay").checked = false;
    handleCBClick(document.getElementById("iallDay"));
    document.getElementById("istartDate").value = getCurrentDateFormat();
    document.getElementById("iendDate").value = getCurrentDateFormat();
    $('#iname').val("");
    $('#idesc').val("");
    $('#ipriority').val("");
    setComments([]);
    document.getElementById("iedit").disabled = true;
    document.getElementById("idelete").disabled = true;
    document.getElementById("iadd").disabled = true;
    document.getElementById("iCommentInput").disabled = true;
    var container = $('#iSelParticipants');
    var inputs = container.find('input');
    var id = inputs.length;
    for(var i = 1;i<=id;i++)
        document.getElementById("participant"+i).checked=false;
    showInput();

}
function setEventToForm(ev){
    currentID = ev.id;
    document.getElementById("iallDay").checked = ev.allDay;
    handleCBClick(document.getElementById("iallDay"));
    var start = new Date(ev.start);
    var end;
    if(ev.end==null) {
        end = start;
        end.setMinutes(start.getMinutes()+30);
    }
    else
        end = new Date(ev.end);
    var str1 = start.getFullYear() + "-" +
        ((start.getMonth()+1).toString().length<2? "0" + (start.getMonth()+1): (start.getMonth()+1))
        + "-" +
        (start.getDate().toString().length<2? "0" + (start.getDate()): (start.getDate()))+ "T" +
        ((start.getHours()-1).toString().length<2? "0" + (start.getHours()-1): (start.getHours()-1)) + ":" +
        (start.getMinutes().toString().length<2? "0" + start.getMinutes(): start.getMinutes()) ;
    document.getElementById('istartDate').value = str1;
    var str2 = end.getFullYear() + "-" +
        ((end.getMonth()+1).toString().length<2? "0" + (end.getMonth()+1): (end.getMonth()+1))
        + "-" +
        (end.getDate().toString().length<2? "0" + (end.getDate()): (end.getDate()))+ "T" +
        ((end.getHours()-1).toString().length<2? "0" + (end.getHours()-1): (end.getHours()-1)) + ":" +
        (end.getMinutes().toString().length<2? "0" + end.getMinutes(): end.getMinutes()) ;
    document.getElementById('iendDate').value = str2;
    $('#iname').val(ev.title);
    $('#idesc').val(ev.description);
    $('#ipriority').val(ev.priority);
    var comments = ev.comments;
    setComments(comments);
    setSelectedParticipants(ev.participants);
}

function isAllDayChecked(){
    return  allDayChecked;
}

function initialize(){
    clearForm();
    currentCalendar = "Privat";
    $('#cbcalendars').val("Privat");
}



function dayClick(date){
    var start = new Date(date);
    start.setHours(start.getHours());
    var end = new Date(date);
    end.setMinutes(end.getMinutes()+30);
    end.setHours(end.getHours());
    clearForm();
    setEventToForm({start: start, end: end, participants:[currentParticipant]});
    document.getElementById("iadd").disabled = false;
}
function eventClick(ev){
    if("conflict" in ev)
    {
        showChoose();
        setEventToChooseForm(ev.app);
        return;
    }
    setEventToForm(ev);
    document.getElementById("iadd").disabled = true;
    document.getElementById("iedit").disabled = false;
    document.getElementById("idelete").disabled = false;
    document.getElementById("iCommentInput").disabled = false;
    getUpdates();
}
function getSelectedParticipants() {
    var container = $('#iSelParticipants');
    var inputs = container.find('input');
    var id = inputs.length;
    var names = [];
    for(var i = 1;i<=id;i++){
        var x = document.getElementById("participant" +i);
        if(x.checked)
            names.push(x.value);
    }
    return names;
}
function setSelectedParticipants(participants) {
    if(participants==undefined)
        return;
    var container = $('#iSelParticipants');
    var inputs = container.find('input');
    var id = inputs.length;
    for(var i = 0;i<participants.length;i++)
        for(var j = 1;j<=id;j++){
            var x = document.getElementById("participant"+j);
            if(x.value==participants[i])
                x.checked=true;
        }
}
function addCheckbox(name) {
    var container = $('#iSelParticipants');
    var inputs = container.find('input');
    var id = inputs.length+1;
    var newItem = $('<li>');
    $('<input />', { type: 'checkbox', id: 'participant'+id, value: name }).appendTo(newItem);
    $('<label />', { 'for': 'cb'+id, text: name }).appendTo(newItem);
    newItem.appendTo(container);
}
function setParticipants(participants){
    var tmp = currentParticipant;
    var isEmpty = (currentParticipant=="" || (typeof currentParticipant == "undefined"))?true:false;
    var x = document.getElementById("cbNames");
    $('#cbNames').empty();
    x.size= 1;
    $('#iSelParticipants').empty();
    for(var i = 0; i<participants.length;i++) {
        var option1 = document.createElement("option");
        option1.text = participants[i];
        var option2 = document.createElement("option");
        option2.text = participants[i];
        x.add(option1);
    }
    for(i in participants) {
        addCheckbox(participants[i]);
    }
    if(isEmpty) {
        x.value = participants[0];
        currentParticipant = participants[0];
        if(!(currentParticipant=="" || currentParticipant==undefined))
            getUpdates();
    }
    else{
        x.value = tmp;
        currentParticipant = tmp;
    }
}
function setComments(comments) {
    if(comments == undefined)
        return;
    comments.sort();
    $('#iCommentBox').empty();
    for(i in comments) {
        $('#iCommentBox').append(
            $('<li></li>').append(
                $('<span>').text(comments[i]))
        );
    }
    // nach unten scrollen
    //$('body').scrollTop($('body')[0].scrollHeight);
}
function showInput() {
    var input = $('#appInputForm');
    var choose = $('#appChooseForm');
    choose.hide();
    input.show();
}
function showChoose() {
    var input = $('#appInputForm');
    var choose = $('#appChooseForm');
    input.hide();
    choose.show();
}

function enableInput() {
    $("#appInputForm").removeClass("disabledbutton");
}
function disableInput() {
    $("#appInputForm").addClass("disabledbutton");
}
//============================ handling for the "chooseForm"

function getAppointmentFromChooseForm(){
    var name = document.getElementById('cname').value ;
    var x = document.getElementById("cstartDate").value;
    var sDate = new Date(document.getElementById('cstartDate').value );
    sDate.setHours(sDate.getHours());
    var eDate = new Date(document.getElementById('cendDate').value );
    eDate.setHours(eDate.getHours());
    var allday = document.getElementById("cendDate").value=="true"?true:false;
    var description = document.getElementById("cdesc").value;
    var priority = document.getElementById("cpriority").value;
    var res =
        {
            id: 0,
            title: name,
            start: sDate,
            end: eDate,
            allDay : allday,
            description : description,
            participants: [],
            priority: priority
        };
    return res;
}

function setEventToChooseForm(ev){
    currentID = ev.id[0];
    /*$('#callDay').empty();
    var x = document.getElementById("callDay");
    for(var i = 0;i<ev.allDay.length;i++){
        var option1 = document.createElement("option");
        option1.text = ev.allDay[i];
        x.add(option1);
    }*/
    $('#cname').empty();
    var x = document.getElementById("cname");
    for(var i = 0;i<ev.title.length;i++){
        var option1 = document.createElement("option");
        option1.text = ev.title[i];
        x.add(option1);
    }
    $('#cdesc').empty();
    var x = document.getElementById("cdesc");
    for(var i = 0;i<ev.description.length;i++){
        var option1 = document.createElement("option");
        option1.text = ev.description[i];
        x.add(option1);
    }
    $('#cpriority').empty();
    var x = document.getElementById("cpriority");
    for(var i = 0;i<ev.priority.length;i++){
        var option1 = document.createElement("option");
        option1.text = ev.priority[i];
        x.add(option1);
    }
    $('#cstartDate').empty();
    var x = document.getElementById('cstartDate');
    var y = document.getElementById('cendDate');
    for(var i = 0;i<ev.start.length;i++) {
        var start = new Date(ev.start[i]);
        var str1 = start.getFullYear() + "-" +
            ((start.getMonth() + 1).toString().length < 2 ? "0" + (start.getMonth() + 1) : (start.getMonth() + 1))
            + "-" +
            (start.getDate().toString().length < 2 ? "0" + (start.getDate()) : (start.getDate())) + "T" +
            ((start.getHours() - 1).toString().length < 2 ? "0" + (start.getHours() - 1) : (start.getHours() - 1)) + ":" +
            (start.getMinutes().toString().length < 2 ? "0" + start.getMinutes() : start.getMinutes());
        var option1 = document.createElement("option");
        option1.text = str1;
        x.add(option1);
    }
    $('#cendDate').empty();

    for(var i = 0;i<ev.end.length;i++) {
        var end = new Date(ev.end[i]);
        var str2 = end.getFullYear() + "-" +
            ((end.getMonth()+1).toString().length<2? "0" + (end.getMonth()+1): (end.getMonth()+1))
            + "-" +
            (end.getDate().toString().length<2? "0" + (end.getDate()): (end.getDate()))+ "T" +
            ((end.getHours()-1).toString().length<2? "0" + (end.getHours()-1): (end.getHours()-1)) + ":" +
            (end.getMinutes().toString().length<2? "0" + end.getMinutes(): end.getMinutes()) ;
        var option1 = document.createElement("option");
        option1.text = str2;
        if (document.getElementById('cendDate') != null)
            y.add(option1);
    }
    for(var i = 0;i<ev.allDay.length;i++){
        var option1 = document.createElement("option");
        option1.text = ev.allDay[i];
        if(option1.text=="true")
            if (document.getElementById('cendDate') != null)
                y.add(option1);
    }
}

function test(){
  getConflict();
}
