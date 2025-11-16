import React, { useEffect, useState, useRef } from 'react';
import {MaterialReactTable} from 'material-react-table';
import { Button, Box, Typography, Avatar } from '@mui/material';
import QRCode from 'react-qr-code';
import AxiosInstance from '../AxiosInstance'
import html2pdf from 'html2pdf.js';
import '../../index.css'
/* 
import React, { useEffect, useState } from 'react';
import MaterialReactTable from 'material-react-table';
import { Button, Box, Typography, Avatar } from '@mui/material';
import QRCode from 'react-qr-code';
import axios from 'axios';
import html2pdf from 'html2pdf.js';
 */
const StudentIdCard = ({ student }) => (
  <Box
    className="id-card"
    sx={{
      width: '3.25in',
      height: '4in',
      border: '1px solid #ccc',
      borderRadius: '8px',
      padding: '8px',
      margin: '10px',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: '#fff',
      pageBreakInside: 'avoid',
    }}
  >
    <Avatar
      src={student.photoUrl}
      alt={student.name}
      sx={{
        width: '2.5in',
        height: '2.5in',
        borderRadius: '4px',
        objectFit: 'cover',
      }}
    />
    <Typography variant="h6" sx={{ marginTop: '8px', textAlign: 'center' }}>
      {student.name}
    </Typography>
    <Box sx={{ marginTop: '8px' }}>
      <QRCode value={student.ssn} size={80} />
    </Box>
  </Box>
);

const StudentIdCardTable = () => {
  const [students, setStudents] = useState([]);
  const [rowSelection, setRowSelection] = useState({});

  useEffect(() => {
    AxiosInstance.get('students/')
      .then((res) => setStudents(res.data))
      .catch((err) => console.error('Error fetching students:', err));
  }, []);

  const selectedStudents = Object.keys(rowSelection).map((key) => students[parseInt(key)]);

  const showAndPrint = (studentsToPrint) => {
  const html = `
    <html>
      <head>
        <title>Print ID Cards</title>
        <style>
        .id-card {
  width: 3.25in;
  height: 4in;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 8px;
  margin: 10px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  page-break-inside: avoid;
  overflow: hidden;
  background-color: green;
}

.id-photo {
  width: 2.5in;
  height: 2.5in;
  object-fit: cover;
  border-radius: 4px;
}

.name-block {
  width: 2.5in;
  height: 2.5in;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
}

.name-block h3 {
  margin: 0;
  font-size: 16px;
  text-align: center;
}

.qr {
  width: 2.5in;
  height: 1.5in;
  object-fit: contain;
}


        </style>
      </head>
      <body>
        ${studentsToPrint.map((student) => `
        
          <div class="id-card">
  <img class="id-photo" src="${student.photo}" alt="${student.name}" />
  <div class="name-block">
    <h3>${student.name}</h3>
    <img
      class="qr"
      src="https://api.qrserver.com/v1/create-qr-code/?size=250x150&data=${student.ssn}&color=ff0000"
      alt="QR Code"
    />
  </div>
</div>




        `).join('')}
        <script>
          const images = document.images;
          let loaded = 0;
          for (let i = 0; i < images.length; i++) {
            if (images[i].complete) {
              loaded++;
            } else {
              images[i].addEventListener('load', () => {
                loaded++;
                if (loaded === images.length) {
                  window.print();
                }
              });
              images[i].addEventListener('error', () => {
                loaded++;
                if (loaded === images.length) {
                  window.print();
                }
              });
            }
          }
          if (loaded === images.length) {
            window.print();
          }
        </script>
      </body>
    </html>
  `;

  const printWindow = window.open('', '', 'width=800,height=600');
  printWindow.document.write(html);
  printWindow.document.close();
};



  const showAndExportPDF = (containerId, filename) => {
    const area = document.getElementById(containerId);
    if (!area) return;
    area.style.display = 'block';
    setTimeout(() => {
      html2pdf().set({
        margin: 0,
        filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
      }).from(area).save().then(() => {
        area.style.display = 'none';
      });
    }, 500);
  };

  const columns = [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'ssn', header: 'SSN' },
  ];

  return (
    <>
      <MaterialReactTable
        columns={columns}
        data={students}
        enableRowSelection
        onRowSelectionChange={setRowSelection}
        state={{ rowSelection }}
        muiTablePaginationProps={{
          rowsPerPageOptions: [5, 10, 20],
          showFirstButton: true,
          showLastButton: true,
        }}
      />

      <Box sx={{ marginTop: 2, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Button
                  variant="contained"
                  color="primary"
                  disabled={selectedStudents.length === 0}
                  onClick={() => showAndPrint(selectedStudents)}
              >
                  🖨️ Print Selected
              </Button>

              <Button
                  variant="contained"
                  color="secondary"
                  disabled={students.length === 0}
                  onClick={() => showAndPrint(students)}
              >
                  🖨️ Print All
              </Button>

        <Button
          variant="outlined"
          disabled={selectedStudents.length === 0}
          onClick={() => showAndExportPDF('print-selected-area', 'selected-id-cards.pdf')}
        >
          📄 Export Selected to PDF
        </Button>

        <Button
          variant="outlined"
          disabled={students.length === 0}
          onClick={() => showAndExportPDF('print-all-area', 'all-id-cards.pdf')}
        >
          📄 Export All to PDF
        </Button>
      </Box>

      {/* Hidden print area for selected students */}
      <div id="print-selected-area" style={{ display: 'none' }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
          {selectedStudents.map((student) => (
            <StudentIdCard key={student.id} student={student} />
          ))}
        </Box>
      </div>

      {/* Hidden print area for all students */}
      <div id="print-all-area" style={{ display: 'none' }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
          {students.map((student) => (
            <StudentIdCard key={student.id} student={student} />
          ))}
        </Box>
      </div>
    </>
  );
};

export default StudentIdCardTable;
