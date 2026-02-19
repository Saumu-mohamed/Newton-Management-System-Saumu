/**
 * Print utilities for generating formatted print previews
 */
const defaultStyles = {
  pageTitle: 'University Management System',
  primaryColor: '#1e40af'
};
/**
 * Generate base print HTML wrapper
 */
function generatePrintWrapper(content, title, styles = {}) {
  const mergedStyles = { ...defaultStyles, ...styles };
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          padding: 20px; 
          color: #333;
          line-height: 1.6;
        }
        .print-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 3px solid ${mergedStyles.primaryColor};
          padding-bottom: 15px;
          margin-bottom: 20px;
        }
        .print-header h1 {
          color: ${mergedStyles.primaryColor};
          font-size: 24px;
        }
        .print-header .institution {
          text-align: right;
          font-size: 12px;
          color: #666;
        }
        .document-title {
          text-align: center;
          font-size: 20px;
          font-weight: bold;
          margin: 20px 0;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-bottom: 20px;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 8px;
        }
        .info-item { font-size: 13px; }
        .info-item .label { color: #666; font-weight: 500; }
        .info-item .value { color: #333; font-weight: 600; }
        table { 
          width: 100%; 
          border-collapse: collapse; 
          margin: 15px 0;
          font-size: 13px;
        }
        th, td { 
          border: 1px solid #ddd; 
          padding: 10px 12px; 
          text-align: left; 
        }
        th { 
          background-color: ${mergedStyles.primaryColor}; 
          color: white;
          font-weight: 600;
          text-transform: uppercase;
          font-size: 11px;
          letter-spacing: 0.5px;
        }
        tr:nth-child(even) { background-color: #f9fafb; }
        .total-row { 
          font-weight: bold; 
          background-color: #e5e7eb !important;
        }
        .amount { text-align: right; font-family: monospace; }
        .status-badge {
          display: inline-block;
          padding: 3px 10px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
        }
        .status-completed { background: #d1fae5; color: #065f46; }
        .status-pending { background: #fef3c7; color: #92400e; }
        .status-failed { background: #fee2e2; color: #991b1b; }
        .footer {
          margin-top: 30px;
          padding-top: 15px;
          border-top: 2px solid #e5e7eb;
          font-size: 11px;
          color: #666;
          text-align: center;
        }
        .signature-section {
          display: flex;
          justify-content: space-between;
          margin-top: 50px;
          padding-top: 20px;
        }
        .signature-box {
          text-align: center;
          width: 200px;
        }
        .signature-line {
          border-top: 1px solid #333;
          margin-top: 40px;
          padding-top: 5px;
          font-size: 12px;
        }
        .watermark {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-45deg);
          font-size: 100px;
          color: rgba(0,0,0,0.03);
          z-index: -1;
          font-weight: bold;
        }
        .grade-summary {
          background: linear-gradient(135deg, ${mergedStyles.primaryColor}15, ${mergedStyles.primaryColor}05);
          padding: 20px;
          border-radius: 10px;
          margin: 20px 0;
        }
        .grade-summary h3 { color: ${mergedStyles.primaryColor}; margin-bottom: 10px; }
        .receipt-box {
          border: 2px solid ${mergedStyles.primaryColor};
          padding: 20px;
          border-radius: 10px;
          margin: 20px 0;
        }
        @media print {
          body { padding: 0; }
          .no-print { display: none; }
          @page { margin: 1cm; }
        }
      </style>
    </head>
    <body>
      <div class="watermark">${mergedStyles.pageTitle}</div>
      ${content}
      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 250);
        }
      </script>
    </body>
    </html>
  `;
}
/**
 * Print a payment receipt
 */
export function printReceipt(data) {
  const content = `
    <div class="print-header">
      <h1>University Management System</h1>
      <div class="institution">
        <strong>OFFICIAL RECEIPT</strong><br>
        P.O. Box 12345<br>
        Nairobi, Kenya
      </div>
    </div>
    <div class="document-title">Payment Receipt</div>
    <div class="receipt-box">
      <div class="info-grid">
        <div class="info-item">
          <span class="label">Receipt No:</span>
          <span class="value">${data.receiptNumber}</span>
        </div>
        <div class="info-item">
          <span class="label">Date:</span>
          <span class="value">${data.date}</span>
        </div>
        <div class="info-item">
          <span class="label">Student Name:</span>
          <span class="value">${data.studentName}</span>
        </div>
        <div class="info-item">
          <span class="label">Student ID:</span>
          <span class="value">${data.studentId}</span>
        </div>
        ${data.program ? `
        <div class="info-item">
          <span class="label">Program:</span>
          <span class="value">${data.program}</span>
        </div>
        ` : ''}
        <div class="info-item">
          <span class="label">Payment Method:</span>
          <span class="value">${data.paymentMethod}</span>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th>Reference</th>
            <th class="amount">Amount (KES)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${data.description || 'Tuition Fee Payment'}</td>
            <td>${data.reference}</td>
            <td class="amount">${data.amount.toLocaleString()}</td>
          </tr>
          <tr class="total-row">
            <td colspan="2"><strong>Total Paid</strong></td>
            <td class="amount"><strong>KES ${data.amount.toLocaleString()}</strong></td>
          </tr>
          ${data.balance !== undefined ? `
          <tr>
            <td colspan="2">Balance Due</td>
            <td class="amount">KES ${data.balance.toLocaleString()}</td>
          </tr>
          ` : ''}
        </tbody>
      </table>
    </div>
    <div class="signature-section">
      <div class="signature-box">
        <div class="signature-line">Received By</div>
      </div>
      <div class="signature-box">
        <div class="signature-line">Date & Stamp</div>
      </div>
    </div>
    <div class="footer">
      <p>This is a computer-generated receipt. For inquiries, contact finance@university.edu</p>
      <p>Generated on: ${new Date().toLocaleString()}</p>
    </div>
  `;
  openPrintWindow(generatePrintWrapper(content, `Receipt - ${data.receiptNumber}`));
}
/**
 * Print a student transcript
 */
export function printTranscript(data) {
  const semesterRows = data.semesters.map((semester) => `
    <tr class="total-row">
      <td colspan="5"><strong>${semester.name}</strong></td>
    </tr>
    ${semester.courses.map((course) => `
      <tr>
        <td>${course.code}</td>
        <td>${course.name}</td>
        <td class="amount">${course.credits}</td>
        <td style="text-align: center;">${course.grade}</td>
        <td class="amount">${course.points.toFixed(2)}</td>
      </tr>
    `).join('')}
    <tr style="background: #f0f9ff;">
      <td colspan="3"></td>
      <td style="text-align: center;"><strong>Semester GPA:</strong></td>
      <td class="amount"><strong>${semester.gpa.toFixed(2)}</strong></td>
    </tr>
  `).join('');
  const content = `
    <div class="print-header">
      <h1>University Management System</h1>
      <div class="institution">
        <strong>OFFICIAL ACADEMIC TRANSCRIPT</strong><br>
        Office of the Registrar<br>
        P.O. Box 12345, Nairobi, Kenya
      </div>
    </div>
    <div class="document-title">Academic Transcript</div>
    <div class="info-grid">
      <div class="info-item">
        <span class="label">Student Name:</span>
        <span class="value">${data.studentName}</span>
      </div>
      <div class="info-item">
        <span class="label">Student ID:</span>
        <span class="value">${data.studentId}</span>
      </div>
      <div class="info-item">
        <span class="label">Program:</span>
        <span class="value">${data.program}</span>
      </div>
      <div class="info-item">
        <span class="label">Faculty:</span>
        <span class="value">${data.faculty}</span>
      </div>
      <div class="info-item">
        <span class="label">Date of Admission:</span>
        <span class="value">${data.dateOfAdmission}</span>
      </div>
      <div class="info-item">
        <span class="label">Status:</span>
        <span class="value">
          <span class="status-badge ${data.status === 'Graduated' ? 'status-completed' : 'status-pending'}">
            ${data.status}
          </span>
        </span>
      </div>
    </div>
    <table>
      <thead>
        <tr>
          <th>Course Code</th>
          <th>Course Title</th>
          <th class="amount">Credits</th>
          <th style="text-align: center;">Grade</th>
          <th class="amount">Points</th>
        </tr>
      </thead>
      <tbody>
        ${semesterRows}
      </tbody>
    </table>
    <div class="grade-summary">
      <h3>Academic Summary</h3>
      <div class="info-grid" style="background: transparent; padding: 0;">
        <div class="info-item">
          <span class="label">Total Credits Earned:</span>
          <span class="value">${data.totalCredits}</span>
        </div>
        <div class="info-item">
          <span class="label">Cumulative GPA:</span>
          <span class="value" style="font-size: 18px; color: #1e40af;">${data.cgpa.toFixed(2)}</span>
        </div>
      </div>
    </div>
    <div class="signature-section">
      <div class="signature-box">
        <div class="signature-line">Registrar</div>
      </div>
      <div class="signature-box">
        <div class="signature-line">Official Stamp</div>
      </div>
      <div class="signature-box">
        <div class="signature-line">Date of Issue</div>
      </div>
    </div>
    <div class="footer">
      <p><strong>Grading Scale:</strong> A (70-100) = 4.0 | B (60-69) = 3.0 | C (50-59) = 2.0 | D (40-49) = 1.0 | F (0-39) = 0.0</p>
      <p>This transcript is official only with the university seal and registrar's signature.</p>
      <p>Generated on: ${new Date().toLocaleString()}</p>
    </div>
  `;
  openPrintWindow(generatePrintWrapper(content, `Transcript - ${data.studentId}`));
}
/**
 * Print a fee statement
 */
export function printFeeStatement(data) {
  const totalFees = data.feeItems.reduce((sum, item) => sum + item.amount, 0);
  const totalPaid = data.feeItems.reduce((sum, item) => sum + item.paid, 0);
  const balance = totalFees - totalPaid;
  const content = `
    <div class="print-header">
      <h1>University Management System</h1>
      <div class="institution">
        <strong>STUDENT FEE STATEMENT</strong><br>
        Finance Department<br>
        P.O. Box 12345, Nairobi, Kenya
      </div>
    </div>
    <div class="document-title">Fee Statement</div>
    <div class="info-grid">
      <div class="info-item">
        <span class="label">Student Name:</span>
        <span class="value">${data.studentName}</span>
      </div>
      <div class="info-item">
        <span class="label">Student ID:</span>
        <span class="value">${data.studentId}</span>
      </div>
      ${data.program ? `
      <div class="info-item">
        <span class="label">Program:</span>
        <span class="value">${data.program}</span>
      </div>
      ` : ''}
      <div class="info-item">
        <span class="label">Academic Year:</span>
        <span class="value">${data.academicYear}</span>
      </div>
    </div>
    <h3 style="margin: 20px 0 10px; color: #1e40af;">Fee Breakdown</h3>
    <table>
      <thead>
        <tr>
          <th>Fee Item</th>
          <th class="amount">Amount (KES)</th>
          <th class="amount">Paid (KES)</th>
          <th class="amount">Balance (KES)</th>
        </tr>
      </thead>
      <tbody>
        ${data.feeItems.map((item) => `
          <tr>
            <td>${item.item}</td>
            <td class="amount">${item.amount.toLocaleString()}</td>
            <td class="amount" style="color: #059669;">${item.paid.toLocaleString()}</td>
            <td class="amount">${(item.amount - item.paid).toLocaleString()}</td>
          </tr>
        `).join('')}
        <tr class="total-row">
          <td><strong>Total</strong></td>
          <td class="amount"><strong>${totalFees.toLocaleString()}</strong></td>
          <td class="amount" style="color: #059669;"><strong>${totalPaid.toLocaleString()}</strong></td>
          <td class="amount" style="color: ${balance > 0 ? '#dc2626' : '#059669'};">
            <strong>${balance.toLocaleString()}</strong>
          </td>
        </tr>
      </tbody>
    </table>
    <h3 style="margin: 30px 0 10px; color: #1e40af;">Payment History</h3>
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Reference</th>
          <th>Method</th>
          <th class="amount">Amount (KES)</th>
        </tr>
      </thead>
      <tbody>
        ${data.payments.map((payment) => `
          <tr>
            <td>${payment.date}</td>
            <td>${payment.reference}</td>
            <td>${payment.method}</td>
            <td class="amount">${payment.amount.toLocaleString()}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    <div class="receipt-box" style="margin-top: 30px; text-align: center;">
      <h3 style="color: ${balance > 0 ? '#dc2626' : '#059669'};">
        ${balance > 0 ? `Outstanding Balance: KES ${balance.toLocaleString()}` : 'FULLY PAID'}
      </h3>
      ${balance > 0 ? '<p style="font-size: 12px; color: #666;">Please clear your balance before the examination period.</p>' : ''}
    </div>
    <div class="signature-section">
      <div class="signature-box">
        <div class="signature-line">Finance Officer</div>
      </div>
      <div class="signature-box">
        <div class="signature-line">Date & Stamp</div>
      </div>
    </div>
    <div class="footer">
      <p>This statement is computer-generated. For inquiries, contact finance@university.edu</p>
      <p>Generated on: ${new Date().toLocaleString()}</p>
    </div>
  `;
  openPrintWindow(generatePrintWrapper(content, `Fee Statement - ${data.studentId}`));
}
/**
 * Open print window with HTML content
 */
function openPrintWindow(html) {
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
  } else {
    alert('Please allow popups to print documents');
  }
}