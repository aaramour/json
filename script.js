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

function enableButtons() {
  const convertButton = document.getElementById('convertButton');
  const downloadButton = document.getElementById('downloadButton');
  const copyButton = document.getElementById('copyButton');

  convertButton.disabled = false;
  downloadButton.disabled = false;
  copyButton.disabled = false;
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
  navigator.clipboard.writeText(jsonData).then(() => {
    showAlert('JSON data copied to clipboard!');
  }, () => {
    showAlert('Failed to copy JSON data to clipboard.');
  });
}

function showAlert(message, duration = 3000) {
  const alertDiv = document.createElement('div');
  alertDiv.textContent = message;
  alertDiv.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: 10px 20px;
    background-color: #f0f0f0;
    border: 1px solid #ccc;
    border-radius: 5px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    z-index: 1000;
  `;
  document.body.appendChild(alertDiv);

  setTimeout(() => {
    alertDiv.parentNode.removeChild(alertDiv);
  }, duration);
}

// Example usage
// showAlert('This is an alert message.', 3000);
