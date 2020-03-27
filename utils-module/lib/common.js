function mapRecords(records, idMap, fields) {
    result = [fields];
    records.forEach((record) => {
      sail = record['_rawJson']['fields'];
  
      byBoatSails = sail['ByBoatSails'];
      if (!(byBoatSails === undefined)) {
        sail['ByBoatSails'] = byBoatSails.map(s => { return idMap[s]; });
      }
  
      byIndividualSails = sail['ByIndividualSails'];
      if (!(byIndividualSails === undefined)) {
        sail['ByIndividualSails'] = byIndividualSails.map(s => { return idMap[s]; });
      }
  
      arr = [];
      fields.forEach((field) => {
        var val = sail[field];
        arr.push(Array.isArray(val) ? val.toString().replace(/,/g, '\n') : val);
      });
      result.push(arr);
  
    });
    return result;
  }

  exports.mapRecords = mapRecords;