const {google} = require('googleapis');

const jwtClient = new google.auth.JWT(
  process.env.google_client_email,
  null,
  process.env.google_private_key.replace(/\\n/g, '\n'),
  ['https://www.googleapis.com/auth/spreadsheets']
);

google.options({
  auth: jwtClient,
  params: {
    spreadsheetId: process.env.google_spreadsheet_id
  }
});

async function updateGoogleSheets(data) {
  const sheets = google.sheets('v4');

  var requests = [];

  requests.push({
    updateSheetProperties: {
      properties: {
        sheetId: process.env.google_sheet_id,
        gridProperties: {
          frozenColumnCount: 1,
          frozenRowCount: 1
        }
      },
      fields: 'gridProperties(frozenRowCount, frozenColumnCount)'
    }
  });
  
  await sheets.spreadsheets.batchUpdate({
    resource: {requests}
  });

  await sheets.spreadsheets.values.clear({
    range: process.env.google_sheet_name
  });

  await sheets.spreadsheets.values.update({
    valueInputOption: 'USER_ENTERED',
    resource: {values: data}, 
    range: process.env.google_sheet_name
  });
};

exports.updateGoogleSheets = updateGoogleSheets;