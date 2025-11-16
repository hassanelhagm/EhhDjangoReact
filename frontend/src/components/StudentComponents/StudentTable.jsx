// components/StudentTable.jsx
/*  */

import { MaterialReactTable } from 'material-react-table';
import { useEffect, useState } from 'react';
import { Visibility, Print } from '@mui/icons-material';
import { QRCode } from './utils/generateQRCode'
import { Snackbar, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AxiosInstance from '../AxiosInstance'



import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip,
  Avatar,
  Typography,
  Box,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import {
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  getDegreeLevels,
} from './services/api';
import { exportToPDF } from './utils/exportPDF';
import { exportToXLSX } from './utils/exportXLSX';
import PrintBatch from './PrintBatch';

export default function StudentTable() {
  const navigate = useNavigate();


  const [reviewStudent, setReviewStudent] = useState(null);
  const handleReviewDialog = (student) => {
    setReviewStudent(student);
  };
  const [students, setStudents] = useState([]);
  const [rowSelection, setRowSelection] = useState({});
  const [printMode, setPrintMode] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [degreeLevels, setDegreeLevels] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    ssn: '',
    email: '',
    cell_phone: '',
    degree_level: { id: '', name: '' },
  });
  //  ******send message*******************************************
  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  //  ******************************************************

  const [photoFile, setPhotoFile] = useState(null);

  //******copied from api.js with some modifications************************************************* */
     const getStudents = () => AxiosInstance.get(`students/`);

     const createStudent = (data) =>
        AxiosInstance.post(`students/`, data, {
         headers: { 'Content-Type': 'multipart/form-data' },
         });
     const updateStudent = (id, data) =>
           AxiosInstance.put(`students/${id}/`, data, {
           headers: { 'Content-Type': 'multipart/form-data' },
        });    
     const deleteStudent = (id) => AxiosInstance.delete(`students/${id}/`);
     const getDegreeLevels = () => AxiosInstance.get(`degree-levels/`);
  //************************************************************* */

  useEffect(() => {
    loadStudents();
    getDegreeLevels().then((res) => setDegreeLevels(res.data));
  }, []);

  const loadStudents = () => {
    getStudents().then((res) => setStudents(res.data));
  };

  const handleOpenDialog = (student = null) => {
    setEditingStudent(student);
    setFormData(
      student || {
        name: '',
        ssn: '',
        email: '',
        cell_phone: '',
        degree_level: { id: '', name: '' },
      }
    );
    setPhotoFile(null);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingStudent(null);
  };
   const handleSave = async () => {
  const formDataToSend = new FormData();
  formDataToSend.append('name', formData.name);
  formDataToSend.append('ssn', formData.ssn);
  formDataToSend.append('email', formData.email);
  formDataToSend.append('cell_phone', formData.cell_phone);
  formDataToSend.append('degree_level_id', formData.degree_level.id);

  if (photoFile instanceof File) {
    formDataToSend.append('photo', photoFile);
  }

  try {
    const action = editingStudent
      ? updateStudent(editingStudent.id, formDataToSend)
      : createStudent(formDataToSend);

    await action;
    loadStudents();
    handleCloseDialog();
  } catch (err) {
    console.error('Full error object:', err); // ✅ Log everything

    const backendErrors = err?.response?.data;
    console.log('Backend error data:', backendErrors); // ✅ Log just the response data

    if (backendErrors) {

       setFieldErrors(backendErrors); // ✅ Store field-level errors
      const message = Object.entries(backendErrors)
        .map(([field, errors]) => `${field}: ${errors.join(', ')}`)
        .join('\n');

      console.log('Formatted error message:', message); 

      setErrorMessage(message);
    } else {
      setErrorMessage('An unexpected error occurred.');
    }

    setShowError(true);
  }
};



  const handleDelete = (student) => {
    if (window.confirm(`Delete ${student.name}?`)) {
      deleteStudent(student.id).then(() => loadStudents());
    }
  };

  const selectedStudents = Object.keys(rowSelection).map(
    (key) => students[parseInt(key)]
  );

  const columns = [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'ssn', header: 'SSN' },
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'cell_phone', header: 'Phone' },
    { accessorKey: 'degree_level.name', header: 'Degree Level' },
  ];
  const handlePrintStudent = (student) => {
    const printWindow = window.open('', '_blank');

    const htmlContent = `
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
          @media print {
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <h2>Student Details</h2>
        <div class="student-card">
          <img src="${student.photo}" alt="${student.name}" class="student-photo" />
          <div>
            <p><strong>Name:</strong> ${student.name}</p>
            <p><strong>SSN:</strong> ${student.ssn}</p>
            <p><strong>Email:</strong> ${student.email}</p>
            <p><strong>Phone:</strong> ${student.cell_phone}</p>
            <p><strong>Degree Level:</strong> ${student.degree_level?.name}</p>
          </div>
          <div class="qr-code">
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${student.ssn}" />
          </div>
        </div>
        <button class="no-print" onclick="window.print()">Print This Page</button>
      </body>
    </html>
  `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };


  return (
    <>
      <MaterialReactTable
        columns={columns}
        data={students}
        enableRowSelection
        enableRowActions
        state={{ rowSelection }}
        onRowSelectionChange={setRowSelection}
        muiTableContainerProps={{
          sx: { overflowX: 'auto' }
        }}
        renderRowActions={({ row }) => (
          <>
            <Tooltip title="Edit">
              <IconButton onClick={() => handleOpenDialog(row.original)}>
                <Edit />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton onClick={() => handleDelete(row.original)}>
                <Delete />
              </IconButton>
            </Tooltip>

            <Tooltip title="Review">
              <IconButton onClick={() => handleReviewDialog(row.original)}>
                <Visibility />
              </IconButton>
            </Tooltip>
            <Tooltip title="Print">
              <IconButton onClick={() => handlePrintStudent(row.original)}>
                <Print />
              </IconButton>
            </Tooltip>

          </>
        )}
       
        renderTopToolbarCustomActions={() => (
          <>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenDialog()}
            >
              Add Student
            </Button>
            <Button onClick={() => exportToXLSX(students)}>Export XLSX</Button>
            <Button onClick={() => exportToPDF(students)}>Export PDF</Button>
            <Button onClick={() =>  navigate('/print-batch', { state: { students: selectedStudents } })}>Print Selected</Button>
            <Button onClick={() =>  navigate('/print-batch', { state: { students: students } })}>Print All</Button>
            {/* <Button onClick={() => setPrintMode('selected')}>Print Selected</Button> */}
            {/* <Button onClick={() => setPrintMode('all')}>Print All</Button> */}

            
           
          </>
        )}
        muiTableBodyRowProps={{
          sx: {
            '& .MuiTableCell-root': {
              whiteSpace: 'nowrap',
            },
          },
        }}

      />

      {printMode && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'white',
          zIndex: 9999,
          overflow: 'auto',
        }}>

          <PrintBatch
            students={printMode === 'selected' ? selectedStudents : students}
            onClose={() => setPrintMode(null)}
          />
        </div>
      )}

     
      {/* *****************Add/Edit Dialog*********************************************************** */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>{editingStudent ? 'Edit Student' : 'Add Student'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            fullWidth
            margin="dense"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={!!fieldErrors.name}
            helperText={fieldErrors.name?.[0]}
          />
          <TextField
            label="SSN"
            fullWidth
            margin="dense"
            value={formData.ssn}
            onChange={(e) => setFormData({ ...formData, ssn: e.target.value })}
             error={!!fieldErrors.ssn}
            helperText={fieldErrors.ssn?.[0]}
          />
          <TextField
            label="Email"
            fullWidth
            margin="dense"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            error={!!fieldErrors.email}
            helperText={fieldErrors.email?.[0]}
          />
          {errorMessage && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '200px', // adjust as needed
              }}
            >
              <Alert
                severity="error"
                onClose={() => setErrorMessage('')}
                sx={{ width: '100%', maxWidth: 400, textAlign: 'center' }}
              >
                {errorMessage}
              </Alert>
            </Box>
          )}

          <TextField
            label="Phone"
            fullWidth
            margin="dense"
            value={formData.cell_phone}
            onChange={(e) => setFormData({ ...formData, cell_phone: e.target.value })}
            error={!!fieldErrors.cell_phone}
            helperText={fieldErrors.cell_phone?.[0]}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Degree Level</InputLabel>
            <Select
              value={formData.degree_level?.id || ''}
              onChange={(e) => {
                const selected = degreeLevels.find(dl => dl.id === e.target.value);
                setFormData({ ...formData, degree_level: selected });
                
              }}
              error={!!fieldErrors.degree_level_id}
              helperText={fieldErrors.degree_level_id?.[0]}
              label="Degree Level"
            >
              {degreeLevels.map(dl => (
                <MenuItem key={dl.id} value={dl.id}>
                  {dl.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setPhotoFile(e.target.files[0])}
            style={{ marginTop: '1rem' }}
          />
          {photoFile && (
            <img
              src={URL.createObjectURL(photoFile)}
              alt="Preview"
              style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' }}
            />
          )}

          {/* //******display photo when editing***************************** */}

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Avatar
              src={formData.photo}
              alt={formData.name}
              sx={{ width: 100, height: 100 }}
            />
          </Box>
          {/* **************************************  */}

          <Snackbar
            open={showError}
            autoHideDuration={6000}
            onClose={() => setShowError(false)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert
              onClose={() => setShowError(false)}
              severity="error"
              sx={{ whiteSpace: 'pre-line' }}
            >
              {errorMessage}
            </Alert>
          </Snackbar>
          {/* *********************************************** */}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* //******preview dialog**************************** */}

      <Dialog open={!!reviewStudent} onClose={() => setReviewStudent(null)}>
        <DialogTitle>Student Details</DialogTitle>
        <DialogContent>
          {reviewStudent && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Avatar
                src={reviewStudent.photo}
                alt={reviewStudent.name}
                sx={{ width: 100, height: 100 }}
              />
              <Box>
                <Typography>Name: {reviewStudent.name}</Typography>
                <Typography>SSN: {reviewStudent.ssn}</Typography>
                <Typography>Email: {reviewStudent.email}</Typography>
                <Typography>Phone: {reviewStudent.cell_phone}</Typography>
                <Typography>Degree Level: {reviewStudent.degree_level?.name}</Typography>
              </Box>
              <QRCode
                value={reviewStudent.ssn}
                size={100}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>

          <Button className="no-print" onClick={() => setReviewStudent(null)}>
            Close
          </Button>
         

          <Button variant="contained" onClick={() => handlePrintStudent(reviewStudent)}>
            Print in New Page
          </Button>
         


        </DialogActions>
      </Dialog>



    </>
  );
}




