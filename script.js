function convertToJSON() {
  const fileInput = document.getElementById('fileInput');
  const output = document.getElementById('output');

  if (!fileInput.files || fileInput.files.length === 0) {
    output.innerHTML = '<div class="error">Please choose a file first.</div>';
    return;
  }

  const file = fileInput.files[0];
  const reader = new FileReader();

  reader.onload = function(e) {
    const extension = getFileExtension(file.name);
    let jsonData;

    if (extension === 'xlsx' || extension === 'xls') {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      // Convert array of arrays to array of objects
      const headers = jsonData[0];
      jsonData = jsonData.slice(1).map(row => {
        const obj = {};
        headers.forEach((header, index) => {
          obj[header] = row[index];
        });
        return obj;
      });
    } else if (extension === 'csv') {
      const csv = e.target.result;
      if (csv) {
        jsonData = csvJSON(csv);
      } else {
        output.innerHTML = '<div class="error">Failed to read the CSV file.</div>';
        return;
      }
    }

    output.innerHTML = '<pre>' + JSON.stringify(jsonData, null, 2) + '</pre>';
    enableButtons(); // Enable buttons after conversion
  };

  if (file) {
    if (file.type === 'text/csv') {
      reader.readAsText(file); // Read as text for CSV files
    } else {
      reader.readAsArrayBuffer(file); // Read as array buffer for other file types
    }
  }
}


function getFileExtension(fileName) {
  return fileName.split('.').pop().toLowerCase();
}

function csvJSON(csv) {
  const lines = csv.split('\n');
  const result = [];
  const headers = lines[0].split(',').map(header => header.trim()); // Trim headers

  for (let i = 1; i < lines.length; i++) {
    const obj = {};
    const currentLine = lines[i].split(',');

    for (let j = 0; j < headers.length; j++) {
      // Trim each field to remove leading and trailing whitespace
      obj[headers[j]] = currentLine[j].trim();
    }

    result.push(obj);
  }

  return result;
}
