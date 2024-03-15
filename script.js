function convertToJSON() {
  const fileInput = document.getElementById('fileInput');
  const output = document.getElementById('output');
  const convertButton = document.getElementById('convertButton');

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
    } else if (extension === 'csv') {
      jsonData = csvJSON(e.target.result);
    }

    output.innerHTML = '<pre>' + JSON.stringify(jsonData, null, 2) + '</pre>';
    enableButtons(); // Enable buttons after conversion
  };

  reader.readAsBinaryString(file);
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

function enableButtons() {
  const downloadButton = document.getElementById('downloadButton');
  const copyButton = document.getElementById('copyButton');

  downloadButton.removeAttribute('disabled');
  copyButton.removeAttribute('disabled');
}

function downloadJSON() {
  const jsonData = document.getElementById('output').innerText;
  const fileInput = document.getElementById('fileInput');

  // Get the name of the uploaded file
  const fileName = fileInput.files[0].name.replace(/\.[^/.]+$/, ""); // Remove extension

  const blob = new Blob([jsonData], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `${fileName}.json`; // Set the filename
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function copyToClipboard() {
  const jsonData = document.getElementById('output').innerText;
  navigator.clipboard.writeText(jsonData);
}
