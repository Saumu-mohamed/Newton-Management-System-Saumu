function _optionalChain(ops) {let lastAccessLHS = undefined;let value = ops[0];let i = 1;while (i < ops.length) {const op = ops[i];const fn = ops[i + 1];i += 2;if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) {return undefined;}if (op === 'access' || op === 'optionalAccess') {lastAccessLHS = value;value = fn(value);} else if (op === 'call' || op === 'optionalCall') {value = fn((...args) => value.call(lastAccessLHS, ...args));lastAccessLHS = undefined;}}return value;}import { toast } from 'sonner';
// Get nested value from object
const getValue = (obj, path) => {
  return path.split('.').reduce((acc, part) => _optionalChain([acc, 'optionalAccess', (_) => _[part]]), obj);
};
// Format value for export
const formatValue = (value) => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};
// Escape CSV value
const escapeCSV = (value) => {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
};
/**
 * Export data to CSV format
 */
export function exportToCSV({
  data,
  filename,
  columns
}) {
  try {
    if (data.length === 0) {
      toast.warning('No Data', { description: 'No data available to export' });
      return;
    }
    // Auto-generate columns if not provided
    const exportColumns = columns || Object.keys(data[0]).map((key) => ({ key, label: key }));
    // Create header row
    const headers = exportColumns.map((col) => escapeCSV(col.label)).join(',');
    // Create data rows
    const rows = data.map((row) =>
    exportColumns.map((col) => {
      const value = getValue(row, String(col.key));
      return escapeCSV(formatValue(value));
    }).join(',')
    ).join('\n');
    const csv = `${headers}\n${rows}`;
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Export Complete', {
      description: `Exported ${data.length} records to ${filename}.csv`
    });
  } catch (error) {
    toast.error('Export Failed', { description: 'Failed to export data to CSV' });
    console.error('CSV export error:', error);
  }
}
/**
 * Export data to JSON format
 */
export function exportToJSON({
  data,
  filename
}) {
  try {
    if (data.length === 0) {
      toast.warning('No Data', { description: 'No data available to export' });
      return;
    }
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = `${filename}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Export Complete', {
      description: `Exported ${data.length} records to ${filename}.json`
    });
  } catch (error) {
    toast.error('Export Failed', { description: 'Failed to export data to JSON' });
    console.error('JSON export error:', error);
  }
}
/**
 * Generate and download a PDF report
 * Uses browser print functionality for simplicity
 */
export function exportToPDF({
  data,
  filename,
  columns,
  title
}) {
  try {
    if (data.length === 0) {
      toast.warning('No Data', { description: 'No data available to export' });
      return;
    }
    const exportColumns = columns || Object.keys(data[0]).map((key) => ({ key, label: key }));
    // Create printable HTML
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title || filename}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #333; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
          th { background-color: #f4f4f4; font-weight: bold; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
          .date { color: #666; font-size: 12px; }
          .footer { margin-top: 20px; text-align: center; color: #666; font-size: 10px; }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${title || filename}</h1>
          <span class="date">Generated: ${new Date().toLocaleDateString()}</span>
        </div>
        <table>
          <thead>
            <tr>
              ${exportColumns.map((col) => `<th>${col.label}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${data.map((row) => `
              <tr>
                ${exportColumns.map((col) => `<td>${formatValue(getValue(row, String(col.key)))}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="footer">
          Total Records: ${data.length}
        </div>
      </body>
      </html>
    `;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.print();
      };
      toast.success('PDF Ready', {
        description: 'Print dialog opened. Save as PDF to download.'
      });
    } else {
      toast.error('Popup Blocked', {
        description: 'Please allow popups to generate PDF'
      });
    }
  } catch (error) {
    toast.error('Export Failed', { description: 'Failed to generate PDF' });
    console.error('PDF export error:', error);
  }
}
/**
 * Download a template file for data import
 */
export function downloadTemplate({
  filename,
  columns,
  sampleData
})
{
  try {
    const headers = columns.map((col) => escapeCSV(col.label)).join(',');
    let csv = headers;
    // Add sample data rows if provided
    if (sampleData && sampleData.length > 0) {
      const rows = sampleData.map((row) =>
      columns.map((col) => {
        const value = getValue(row, col.key);
        return escapeCSV(formatValue(value));
      }).join(',')
      ).join('\n');
      csv += '\n' + rows;
    }
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = `${filename}-template.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Template Downloaded', {
      description: `${filename}-template.csv is ready for editing`
    });
  } catch (error) {
    toast.error('Download Failed', { description: 'Failed to download template' });
    console.error('Template download error:', error);
  }
}
/**
 * Import data from a CSV file
 */
export function importFromCSV(
file,
onSuccess,
onError)
{
  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const text = _optionalChain([event, 'access', (_2) => _2.target, 'optionalAccess', (_3) => _3.result]);
      const lines = text.split('\n').filter((line) => line.trim());
      if (lines.length < 2) {
        const error = 'File must contain headers and at least one data row';
        toast.error('Import Failed', { description: error });
        _optionalChain([onError, 'optionalCall', (_4) => _4(error)]);
        return;
      }
      // Parse headers
      const headers = parseCSVLine(lines[0]);
      // Parse data rows
      const data = [];
      for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        if (values.length === headers.length) {
          const row = {};
          headers.forEach((header, idx) => {
            row[header.trim()] = _optionalChain([values, 'access', (_5) => _5[idx], 'optionalAccess', (_6) => _6.trim, 'call', (_7) => _7()]) || '';
          });
          data.push(row);
        }
      }
      toast.success('Import Complete', {
        description: `Imported ${data.length} records from ${file.name}`
      });
      onSuccess(data);
    } catch (error) {
      const errorMsg = 'Failed to parse CSV file';
      toast.error('Import Failed', { description: errorMsg });
      _optionalChain([onError, 'optionalCall', (_8) => _8(errorMsg)]);
      console.error('CSV import error:', error);
    }
  };
  reader.onerror = () => {
    const error = 'Failed to read file';
    toast.error('Import Failed', { description: error });
    _optionalChain([onError, 'optionalCall', (_9) => _9(error)]);
  };
  reader.readAsText(file);
}
// Parse a single CSV line handling quoted values
function parseCSVLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current);
  return values;
}
/**
 * Create a file input and trigger file selection
 */
export function triggerFileUpload(
accept = '.csv',
onSelect)
{
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = accept;
  input.onchange = (e) => {
    const file = _optionalChain([e.target, 'access', (_10) => _10.files, 'optionalAccess', (_11) => _11[0]]);
    if (file) {
      onSelect(file);
    }
  };
  input.click();
}