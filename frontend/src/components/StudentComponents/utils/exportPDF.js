// utils/exportPDF.js
import jsPDF from 'jspdf';

export const exportToPDF = (data) => {
  const doc = new jsPDF();
  data.forEach((student, i) => {
    doc.text(`${student.name} - ${student.ssn}`, 10, 10 + i * 10);
  });
  doc.save('students.pdf');
};
