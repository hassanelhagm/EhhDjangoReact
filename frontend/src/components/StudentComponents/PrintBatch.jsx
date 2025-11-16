// components/PrintBatch.jsx

// import { Button, Typography, Divider, Box, Avatar } from '@mui/material';
// import { QRCode } from '../utils/generateQRCode'
// 

import { useLocation, useNavigate } from 'react-router-dom';

import React from 'react';
import {
  Box,
  Typography,
  Divider,
  Avatar,
  Button,
  Container,
} from '@mui/material';
import { QRCode } from './utils/generateQRCode'

export default function PrintBatch() {
  const navigate = useNavigate();
  const location = useLocation();
  const students = location.state?.students || [];

/* const location = useLocation();
const navigate = useNavigate();
const students = location.state?.students || [];
 */

  const handlePrint = () => {
    const printContents = document.getElementById('print-area').innerHTML;
    const printWindow = window.open('', '_blank');
    
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Student</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
            }
            .student-card {
              display: flex;
              align-items: center;
              gap: 20px;
              margin-bottom: 40px;
            }
            .student-photo {
              width: 100px;
              height: 100px;
              object-fit: cover;
              border-radius: 8px;
            }
            .qr-code {
              margin-left: auto;
            }
          </style>
        </head>
        <body>
          ${printContents}
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Student Print Preview
      </Typography>

      <Button variant="contained" onClick={handlePrint} sx={{ mb: 3 }}>
        Print This Page
      </Button>

      <Button onClick={() => navigate('/students')}>Back to Students</Button>

  
{/* 
      <Button onClick={() => navigate('/students')}>
        Back to Students
      </Button> */}

      <div id="print-area">
        {students.map((student) => (
          <Box key={student.id} className="student-card" sx={{ mb: 4 }}>
            <Avatar
              src={student.photo}
              alt={student.name}
              sx={{ width: 100, height: 100 }}
            />
            <Box>
              <Typography variant="h6">{student.name}</Typography>
              <Typography>SSN: {student.ssn}</Typography>
              <Typography>Email: {student.email}</Typography>
              <Typography>Phone: {student.cell_phone}</Typography>
              <Typography>Degree Level: {student.degree_level?.name}</Typography>
            </Box>
            <Box className="qr-code" sx={{ ml: 'auto' }}>
              <QRCode
               
                    value={student.ssn}
                // value={`http://localhost:8000/students/${student.id}`}
                size={100}
              />
            </Box>
            <Divider sx={{ mt: 2 }} />
          </Box>
        ))}
      </div>
    </Container>
  );
}

















/* import { useEffect } from 'react';
import { QRCode } from '../utils/generateQRCode'
import  {Box,Button} from '@mui/material';

export default function PrintBatch({ students, onClose }) {
  useEffect(() => {
    setTimeout(() => window.print(), 100);
  }, []);

  return (
    <div id="print-area">
      <div style={{ padding: '20px' }}>
        <h2>Student Details</h2>
        {students.map((student) => (
          <Box key={student.id} sx={{ marginBottom: 4 }}>
          <div key={student.id} style={{ marginBottom: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              
              <img
                src={student.photo }
                alt={student.name}
                style={{ width: '100px', height: '100px', objectFit: 'cover' }}
              />
              <div>
                <p><strong>Name:</strong> {student.name}</p>
                <p><strong>SSN:</strong> {student.ssn}</p>
                <p><strong>Email:</strong> {student.email}</p>
                <p><strong>Phone:</strong> {student.cell_phone}</p>
                <p><strong>Degree Level:</strong> {student.degree_level?.name}</p>
              </div>
              <QRCode
                value={`http://localhost:8000/students/${student.id}`}
                size={100}
              />
            </div>
            <hr style={{ marginTop: '20px' }} />
          </div>
           </Box>

        ))}
      </div>
      <Button
        variant="contained"
        onClick={() => window.print()}
        sx={{ marginBottom: 2 }}
      >
        Print This Student
      </Button>

    </div>
  );
}
 */