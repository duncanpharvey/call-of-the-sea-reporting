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

module.exports = {
  mapFromAirtableToGoogle: mapFromAirtableToGoogle
};