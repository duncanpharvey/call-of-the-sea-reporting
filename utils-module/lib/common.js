function mapFromAirtableToGoogle(records, fields) {
  result = [fields];
  records.forEach((record) => {
    arr = [];
    fields.forEach((field) => {
      var val = record[field];
      arr.push(Array.isArray(val) ? val.toString().replace(/,/g, '\n') : val);
    });
    result.push(arr);
  });
  return result;
}

function getAttendeeDifference(eventbriteAttendees, airtableAttendees) {
  var add = [];
  for (var attendeeId of Object.keys(eventbriteAttendees)) {
    var eventId = eventbriteAttendees[attendeeId];
    if (attendeeId in airtableAttendees && eventId == airtableAttendees[attendeeId].eventId) {
      delete airtableAttendees[attendeeId];
    }
    else {
      add.push({ 'attendeeId': attendeeId, 'eventId': eventId }); // adds currently handled by Zapier
    }
  }

  var cancel = Object.keys(airtableAttendees).map((attendeeId) => { return { 'id': airtableAttendees[attendeeId].id, 'fields': { 'Status': 'Cancelled', 'CancellationReason': 'Cancelled in Eventbrite, airtable record updated via script' } }; });

  return { add: add, cancel: cancel };
}

module.exports = {
  mapFromAirtableToGoogle: mapFromAirtableToGoogle,
  getAttendeeDifference: getAttendeeDifference
};