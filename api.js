//dependecies
var express = require('express');
var router = express.Router();
var wrapper = require('./wrapper.js');
var users = [];
// dummy data
function Appointment(name, startdate, Description){
    this.Name = name;
    this.Startdate = startdate;
    this.Description = Description;
    return this;
}
//Routes


router.post("/update", function (req,res) {
    var value = req.body;
    wrapper.getUpdates(value.participant, value.calendar, res);
})

router.post("/addAppointment", function (req, res) {
    var value = req.body;
    console.log("Servertime: " + value.appointment.start);
    wrapper.addAppointment(value.participant,value.calendar,value.appointment,res);
})
router.post("/addParticipant", function (req, res) {
    var value = req.body;
    wrapper.addParticipant(value.name, res);
})
router.post("/removeAppointment", function (req, res) {
    var value = req.body;
    wrapper.removeAppointment(value.id,res);
})
router.post("/editAppointment", function (req, res) {
    var value = req.body;
    wrapper.editAppointment(value.id,value.app,value.calendar,value.comment,res);
})
router.post("/addComment", function (req, res) {
    var value = req.body;
    wrapper.addComment(value.id, value.comment, res);
})
router.post("/requestConflictingAppointment", function (req, res) {
    var value = req.body;
    wrapper.getUpdates_conflict(value.participant, value.calendar, res);
})
//return router
module.exports = router;
