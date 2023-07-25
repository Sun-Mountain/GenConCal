"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var EventData = require('../assets/events/rawEvents.json');
var getFirstKey = function (object) {
    var keyList = Object.keys(object);
    return keyList[0];
};
var getKeyByValue = function (object, value) {
    var foundKey = Object.keys(object).find(function (key) { return object[key] === value; });
    return foundKey;
};
var getTime = function (time) {
    var hours = time.getHours();
    var minutes = time.getMinutes();
    var sHours = hours.toString();
    var sMinutes = minutes.toString();
    if (hours < 10)
        sHours = "0" + sHours;
    if (minutes < 10)
        sMinutes = "0" + sMinutes;
    return "".concat(sHours, ":").concat(sMinutes);
};
var trueOrFalse = function (value) {
    if (value === 'Yes') {
        return true;
    }
    return false;
};
var cleanData = function (_a) {
    var keyList = _a.keyList, eventList = _a.eventList;
    var data = {
        eventData: [],
        filteredEvents: {
            ageRequirement: {},
            cost: {},
            duration: {},
            endDates: {},
            endTimes: {},
            eventTypes: {},
            experienceType: {},
            gameSystems: {},
            groups: {},
            locations: {},
            materialsRequired: [],
            noTickets: [],
            startDates: {},
            startTimes: {},
            tournaments: []
        }
    };
    // Event Times
    var startDateTimeKey = "".concat(getKeyByValue(keyList, "Start Date & Time"));
    var endDateTimeKey = "".concat(getKeyByValue(keyList, "End Date & Time"));
    // Event Info
    var ageRequirementKey = "".concat(getKeyByValue(keyList, "Age Required"));
    var contactKey = "".concat(getKeyByValue(keyList, "Email"));
    var costKey = "".concat(getKeyByValue(keyList, "Cost $"));
    var durationKey = "".concat(getKeyByValue(keyList, "Duration"));
    var descriptionShortKey = "".concat(getKeyByValue(keyList, "Short Description"));
    var descriptionLongKey = "".concat(getKeyByValue(keyList, "Long Description"));
    var eventTypeKey = "".concat(getKeyByValue(keyList, "Event Type"));
    var expKey = "".concat(getKeyByValue(keyList, "Experience Required"));
    var gameIdKey = "".concat(getKeyByValue(keyList, "Game ID"));
    var gameSystemKey = "".concat(getKeyByValue(keyList, "Game System"));
    var gmNamesKey = "".concat(getKeyByValue(keyList, "GM Names"));
    var groupKey = "".concat(getKeyByValue(keyList, "Group"));
    var locationKey = "".concat(getKeyByValue(keyList, "Location"));
    var materialsKey = "".concat(getKeyByValue(keyList, "Materials Required Details"));
    var playersMinKey = "".concat(getKeyByValue(keyList, "Minimum Players"));
    var playersMaxKey = "".concat(getKeyByValue(keyList, "Maximum Players"));
    var tableNumKey = "".concat(getKeyByValue(keyList, "Table Number"));
    var ticketCountKey = "".concat(getKeyByValue(keyList, "Tickets Available"));
    var titleKey = "".concat(getKeyByValue(keyList, "Title"));
    var tournamentKey = "".concat(getKeyByValue(keyList, "Tournament?"));
    var roomKey = "".concat(getKeyByValue(keyList, "Room Name"));
    var roundKey = "".concat(getKeyByValue(keyList, "Round Number"));
    var roundTotalKey = "".concat(getKeyByValue(keyList, "Total Rounds"));
    var websiteKey = "".concat(getKeyByValue(keyList, "Website"));
    eventList.map(function (event, index) {
        var newEvent = {
            id: 0,
            ageRequirement: '',
            conflicts: [],
            contact: '',
            cost: 0,
            descriptionShort: '',
            descriptionLong: '',
            duration: 0,
            endDate: '',
            endTime: '',
            eventType: '',
            experienceType: '',
            gameId: '',
            gameSystem: '',
            gmNames: '',
            group: '',
            location: '',
            materials: '',
            playersMin: 0,
            playersMax: 0,
            startDate: '',
            startTime: '',
            tableNum: 0,
            ticketsAvailable: 0,
            title: '',
            tournament: false,
            room: '',
            round: 0,
            roundTotal: 0,
            website: ''
        };
        var rawStart = new Date(event[startDateTimeKey]), rawEnd = new Date(event[endDateTimeKey]), eventStartDate = rawStart.toLocaleDateString(), eventStartTime = getTime(rawStart), eventEndDate = rawEnd.toLocaleDateString(), eventEndTime = getTime(rawEnd), ageReq = event[ageRequirementKey], contact = event[contactKey], cost = Number(event[costKey]), duration = Number(event[durationKey]), descriptionShort = event[descriptionShortKey], descriptionLong = "".concat(event[descriptionLongKey]), eventType = event[eventTypeKey], experienceReq = event[expKey], gameId = event[gameIdKey], gameSystem = event[gameSystemKey], gmNames = event[gmNamesKey], group = event[groupKey], location = event[locationKey], materials = event[materialsKey], playersMin = Number(event[playersMinKey]), playersMax = Number(event[playersMaxKey]), tableNum = Number(event[tableNumKey]), ticketsAvailable = Number(event[ticketCountKey]), title = event[titleKey], tournament = trueOrFalse(event[tournamentKey]), room = event[roomKey], round = Number(event[roundKey]), roundTotal = Number(event[roundTotalKey]), website = event[websiteKey];
        var newId = index - 1;
        newEvent.id = newId;
        // Event start and end dates and times
        if (!data.filteredEvents.endDates[eventEndDate]) {
            data.filteredEvents.endDates[eventEndDate] = [];
        }
        ;
        data.filteredEvents.endDates[eventEndDate].push(newId);
        newEvent.endDate = eventEndDate;
        if (!data.filteredEvents.endTimes[eventEndTime]) {
            data.filteredEvents.endTimes[eventEndTime] = [];
        }
        ;
        data.filteredEvents.endTimes[eventEndTime].push(newId);
        newEvent.endTime = eventEndTime;
        if (!data.filteredEvents.startDates[eventStartDate]) {
            data.filteredEvents.startDates[eventStartDate] = [];
        }
        ;
        data.filteredEvents.startDates[eventStartDate].push(newId);
        newEvent.startDate = eventStartDate;
        if (!data.filteredEvents.startTimes[eventStartTime]) {
            data.filteredEvents.startTimes[eventStartTime] = [];
        }
        ;
        data.filteredEvents.startTimes[eventStartTime].push(newId);
        newEvent.startTime = eventStartTime;
        // Age Requirement
        if (!data.filteredEvents.ageRequirement[ageReq]) {
            data.filteredEvents.ageRequirement[ageReq] = [];
        }
        data.filteredEvents.ageRequirement[ageReq].push(newId);
        newEvent.ageRequirement = ageReq;
        // Contact
        if (contact) {
            newEvent.contact = contact;
        }
        if (website) {
            newEvent.website = website;
        }
        // Cost
        if (!data.filteredEvents.cost[cost]) {
            data.filteredEvents.cost[cost] = [];
        }
        data.filteredEvents.cost[cost].push(newId);
        newEvent.cost = cost;
        // Duration
        if (duration) {
            if (!data.filteredEvents.duration[duration]) {
                data.filteredEvents.duration[duration] = [];
            }
            data.filteredEvents.duration[duration].push(newId);
        }
        newEvent.duration = duration;
        // Descriptions
        newEvent.descriptionShort = descriptionShort;
        newEvent.descriptionLong = descriptionLong;
        // Event Type
        if (!data.filteredEvents.eventTypes[eventType]) {
            data.filteredEvents.eventTypes[eventType] = [];
        }
        data.filteredEvents.eventTypes[eventType].push(newId);
        newEvent.eventType = eventType;
        // Experience Type
        if (!data.filteredEvents.experienceType[experienceReq]) {
            data.filteredEvents.experienceType[experienceReq] = [];
        }
        data.filteredEvents.experienceType[experienceReq].push(newId);
        newEvent.experienceType = experienceReq;
        // Game Id
        newEvent.gameId = gameId;
        // Game System
        if (gameSystem) {
            var gameSystemLabel = gameSystem;
            gameSystemLabel = gameSystem.toString().replace(/:/g, '');
            // gameSystemLabel = gameSystemLabel.toUpperCase();
            if (!data.filteredEvents.gameSystems[gameSystemLabel]) {
                data.filteredEvents.gameSystems[gameSystemLabel] = [];
            }
            data.filteredEvents.gameSystems[gameSystemLabel].push(newId);
            newEvent.gameSystem = gameSystem;
        }
        // GM Names
        if (gmNames) {
            newEvent.gmNames = gmNames;
        }
        // Group
        if (group) {
            if (!data.filteredEvents.groups[group]) {
                data.filteredEvents.groups[group] = [];
            }
            data.filteredEvents.groups[group].push(newId);
            newEvent.group = group;
        }
        // Location
        if (location) {
            if (!data.filteredEvents.locations[location.toUpperCase()]) {
                data.filteredEvents.locations[location.toUpperCase()] = [];
            }
            data.filteredEvents.locations[location.toUpperCase()].push(newId);
            newEvent.location = location;
        }
        // Materials Required
        if (materials) {
            data.filteredEvents.materialsRequired.push(newId);
            newEvent.materials = materials;
        }
        // Player Numbers
        if (playersMin) {
            newEvent.playersMin = playersMin;
        }
        if (playersMax) {
            newEvent.playersMax = playersMax;
        }
        // Room and Table
        if (tableNum) {
            newEvent.tableNum = tableNum;
        }
        if (room) {
            newEvent.room = room;
        }
        // Tickets
        if (!ticketsAvailable) {
            data.filteredEvents.noTickets.push(newId);
        }
        newEvent.ticketsAvailable = ticketsAvailable;
        // Title
        newEvent.title = title;
        // Tournament 
        if (tournament) {
            data.filteredEvents.tournaments.push(newId);
        }
        newEvent.tournament = tournament;
        // Rounds
        if (round) {
            newEvent.round = round;
        }
        if (roundTotal) {
            newEvent.roundTotal = roundTotal;
        }
        data.eventData.push(newEvent);
    });
    return data;
};
var parseData = function () {
    var rawData = EventData;
    // Values of first Key
    var firstKey = getFirstKey(rawData);
    var rawJsonValues = rawData[firstKey];
    // Get labels
    var keyRow = getFirstKey(rawJsonValues);
    var labelKey = rawJsonValues[keyRow];
    labelKey.freeze;
    // Remove label level
    delete rawJsonValues[keyRow];
    // Events list
    var rawEventsList = rawJsonValues;
    var cleanedData = cleanData({ keyList: labelKey, eventList: rawEventsList });
    return JSON.stringify(cleanedData);
};
exports.default = console.log(parseData());
