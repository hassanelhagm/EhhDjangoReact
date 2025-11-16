import React from 'react';
import { Box, Typography, Avatar } from '@mui/material';
import QRCode from 'react-qr-code';

const StudentIdCard = ({ student }) => (
  <Box
  
    sx={{
      width: '3.25in',
      height: '4in',
      border: '1px solid #ccc',
      borderRadius: '8px',
      padding: '8px',
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
      src={student.photo}
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

export default StudentIdCard;
