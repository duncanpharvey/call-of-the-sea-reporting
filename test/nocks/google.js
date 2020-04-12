const nock = require('nock');

function post() {
    nock('https://sheets.googleapis.com:443')
        .persist()
        .post(/.*/)
        .query(true)
        .reply(200);
}

function put() {
    nock('https://sheets.googleapis.com:443')
        .persist()
        .put(/.*/)
        .query(true)
        .reply(200);
}

function auth() {
    nock('https://www.googleapis.com:443', { "encodedQueryParams": true })
        .persist()
        .post('/oauth2/v4/token', {
            "grant_type": "urn:ietf:params:oauth:grant-type:jwt-bearer",
            "assertion": /.*/
        })
        .reply(200);
}

function freezeSheet() {
    nock('https://sheets.googleapis.com:443', { "encodedQueryParams": true })
        .post('/v4/spreadsheets/' + process.env.google_spreadsheet_id + ':batchUpdate', { "requests": [{ "updateSheetProperties": { "properties": { "sheetId": process.env.google_sheet_id, "gridProperties": { "frozenColumnCount": 1, "frozenRowCount": 1 } }, "fields": "gridProperties(frozenRowCount, frozenColumnCount)" } }] })
        .query({ "spreadsheetId": process.env.google_spreadsheet_id })
        .reply(200);
}

function clearSheet() {
    nock('https://sheets.googleapis.com:443', { "encodedQueryParams": true })
        .post('/v4/spreadsheets/' + process.env.google_spreadsheet_id + '/values/' + process.env.google_sheet_name + ':clear')
        .query({ "spreadsheetId": process.env.google_spreadsheet_id })
        .reply(200);
}

function updateSheet(request) {
    nock('https://sheets.googleapis.com:443', { "encodedQueryParams": true })
        .put('/v4/spreadsheets/' + process.env.google_spreadsheet_id + '/values/' + process.env.google_sheet_name, request)
        .query({ "spreadsheetId": process.env.google_spreadsheet_id, "valueInputOption": "USER_ENTERED" })
        .reply(200);
}

module.exports = {
    put: put,
    post: post,
    auth: auth,
    freezeSheet: freezeSheet,
    clearSheet: clearSheet,
    updateSheet: updateSheet
};