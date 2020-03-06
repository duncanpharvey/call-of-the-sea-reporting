from datetime import datetime, date
import requests
import json

eventbriteBearerToken = ""
airtableApiKey = ""

class Attendee:
    def __init__(self, BoardingDate, DisembarkingDate, Email, EventbriteAttendeeId, EventbriteOrderId, EventTitle, ParticipantName, TotalCost):
        self.BoardingDate = BoardingDate
        self.DisembarkingDate = DisembarkingDate
        self.Email = Email
        self.EventbriteAttendeeId = EventbriteAttendeeId
        self.EventbriteOrderId = EventbriteOrderId
        self.EventTitle = EventTitle
        self.ParticipantName = ParticipantName
        self.TotalCost = TotalCost
        
# eventid = 95290732145 # 2020 Master Mariners Regatta aboard brigantine Matthew Turner
# eventid = 96794201061 # Bay Exploration Friday Sunset Sail 5/22
# eventid = 97014102793 # Maritime Heritage and Bay Ecology Saturday Sailing Adventure 6/6
eventid = 95296972811 # Rotary & Call of the Sea Polio Charity Sail aboard brigantine Matthew Turner

attendeesurl = "https://www.eventbriteapi.com/v3/events/" + str(eventid) + "/attendees"
eventurl = "https://www.eventbriteapi.com/v3/events/" + str(eventid)
eventbriteheaders = {"Authorization": "Bearer " + eventbriteBearerToken, "Content-Type": "application/json"}

airtableurl = "https://api.airtable.com/v0/appJdPg4q3BR7N0zb/By%20Individual%20Sails"
airtableheaders = {"Authorization": "Bearer " + airtableApiKey, "Content-Type": "application/json"}

event = requests.get(url = eventurl, headers = eventbriteheaders).json()
attendees = requests.get(url = attendeesurl, headers = eventbriteheaders).json()['attendees']

boardingdate = event['start']['local']
disembarkingdate = event['end']['local']
eventtitle = event['name']['text']

for i in range(0, len(attendees), 10):
    chunk = attendees[i:i+10]
    data = {"records": []}
    count = 0
    for attendee in chunk:
        if attendee['cancelled']:
            continue
        count += 1
        attendee = Attendee(str(datetime.strptime(boardingdate, '%Y-%m-%dT%H:%M:%S').date()),\
                            str(datetime.strptime(disembarkingdate, '%Y-%m-%dT%H:%M:%S').date()),\
                            attendee['profile']['email'],\
                            attendee['id'],\
                            attendee['order_id'],\
                            eventtitle,\
                            attendee['profile']['name'],\
                            float(attendee['costs']['base_price']['major_value']))
        
        data["records"].append({"fields": attendee.__dict__})

    print(count)
    r = requests.post(url = airtableurl, headers = airtableheaders, data = json.dumps(data))
    print(r.text)
