function convertToJSON() {
  const fileInput = document.getElementById('fileInput');
  const output = document.getElementById('output');

  const file = fileInput.files[0];
  const reader = new FileReader();

  reader.onload = function(e) {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    output.innerHTML = '<pre>' + JSON.stringify(jsonData, null, 2) + '</pre>';
  };

  reader.readAsArrayBuffer(file);
}
