import React, { useState, useEffect } from 'react';
import {MaterialReactTable} from 'material-react-table';
import {
  Box, Button, TextField, Typography, Paper
} from '@mui/material';
import AxiosInstance from '../AxiosInstance'
import * as XLSX from 'xlsx';
import html2pdf from 'html2pdf.js';
import '../../index.css'
import Cookies from 'js-cookie';
import { Alert } from '@mui/material';
import { useMaterialReactTable } from 'material-react-table';
import CircularProgress from '@mui/material/CircularProgress';


import { Editor } from '@tinymce/tinymce-react';



const StudentEmailPage = () => {
  const [students, setStudents] = useState([]);
  const [rowSelection, setRowSelection] = useState({});
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  

 

  
 
  
  useEffect(() => {
  AxiosInstance.get('students/').then(res => {
    setStudents(res.data);
    setFilteredStudents(res.data); // show all by default
  });
}, []);

  const selectedStudents = Object.keys(rowSelection).map(key => students[parseInt(key)]);

  //***************************************************************** */
   const sendEmailToSelected = async () => {

     const selectedStudents = table.getSelectedRowModel().flatRows.map(row => row.original);

  for (const student of selectedStudents) {
    const formData = new FormData();
    formData.append('subject', subject);
    formData.append('body', body);
    attachments.forEach(file => {
      formData.append('attachments', file);
    });
     setLoading(true);
    try {
        const res = await AxiosInstance.post(`students/send_student_email/${student.id}/`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            timeout: 20000, // 20 seconds timeout
        });
        console.log(`Email sent to ${student.email}:`, res.data.status);
        setMessage(res.data.status);
        setIsError(false); // ✅ success
        setSubject('');
        setBody('');
        setAttachments([]);
        setRowSelection({});
        AxiosInstance.get('students/').then(res => {
            setStudents(res.data);
            setFilteredStudents(res.data); // show all by default
        });
    } catch (err) {
      console.log(`Error sending to ${student.email}:`, err);
      setMessage(err.response?.data?.error || err.message || 'Something went wrong');
      setIsError(true); // 🔴 error
   } finally {
    setLoading(false);
  }
    
  }
  
};

  //*************************************************************************** */

   

  const resetFlags = async () => {
    await AxiosInstance.post('students/reset_email_flags/');
     AxiosInstance.get('students/').then(res => {
    setStudents(res.data);
    setFilteredStudents(res.data); // show all by default
  });
    // await AxiosInstance.get('students/').then(res => setStudents(res.data));
  };

  const filterSent = () => {
     const sent = students.filter(s => s.emailsentflag === true);
     setFilteredStudents(sent);
  };

  const filterUnsent = () => {
    const unsent = students.filter(s => s.emailsentflag === false);
    setFilteredStudents(unsent);
  
  };

  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(students);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');
    XLSX.writeFile(workbook, 'students.xlsx');
  };

  const exportPDF = () => {
    const element = document.getElementById('student-table');
    html2pdf().from(element).save('students.pdf');
  };

  const columns = [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'emailsentflag', header: 'Email Sent', Cell: ({ cell }) => cell.getValue() ? '✅' : '❌' },
  ];

  const table = useMaterialReactTable({
  columns,
  data: filteredStudents,
  state: { rowSelection },
  onRowSelectionChange: setRowSelection,
  enableRowSelection: true,
});



  return (

    
   
    
    <Box sx={{ padding: 2 }}>
      <Typography variant="h5" gutterBottom>Email Students</Typography>

       {message && (
                      <Alert
                          severity={isError ? 'error' : 'success'} // 🔴 error = red, 🟢 success = green
                          onClose={() => setMessage('')}
                          sx={{ mb: 2 }}
                      >
                          {message}
                      </Alert>
                  )}


      {loading && (
  <div
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(255, 255, 255, 0.7)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <CircularProgress size={60} />
  </div>
)}


    {/* //************************************************************ */ }
    
    {selectedStudents.length > 0 && (
  <Paper elevation={3} sx={{ padding: 2, marginBottom: 2 }}>
    <Typography variant="h6">
      Send Email to {selectedStudents.length === 1
        ? selectedStudents[0].name
        : `${selectedStudents.length} students`}
    </Typography>

                  <TextField
                      label="Subject"
                      fullWidth
                      value={subject}
                      onChange={e => setSubject(e.target.value)}
                      sx={{ marginBottom: 2 }}
                  />

                 
               {/*    <TextField
                      label="Body"
                      fullWidth
                      multiline
                      rows={4}
                      value={body}
                      onChange={e => setBody(e.target.value)}
                      sx={{ marginBottom: 2 }}
                  /> */}

                 {/*  <Editor
  apiKey="kmz6hdrw4omadsd4jlff98hat2flshafwdy3qw59nkaut7tx" // optional, free signup at tiny.cloud
  value={body}
  onEditorChange={newValue => setBody(newValue)}
  init={{
    height: 300,
    menubar: false,
    plugins: [
      'advlist autolink lists link charmap preview anchor',
      'searchreplace visualblocks code fullscreen',
      'insertdatetime media table paste help wordcount'
    ],
    toolbar:
      'undo redo | formatselect | bold italic underline | \
      alignleft aligncenter alignright alignjustify | \
      bullist numlist outdent indent | removeformat | help'
  }}
/> */}

{/* <Editor
 apiKey="kmz6hdrw4omadsd4jlff98hat2flshafwdy3qw59nkaut7tx" // optional, free signup at tiny.cloud
  value={body}
  onEditorChange={setBody}
  init={{
    height: 300,
    menubar: false,
    plugins: ['image', 'link', 'lists'],
    toolbar: 'undo redo | bold italic | image | alignleft aligncenter alignright',
  }}
/> */}



const [body, setBody] = useState('');
{/* 
  <Editor
    apiKey="kmz6hdrw4omadsd4jlff98hat2flshafwdy3qw59nkaut7tx" // optional, free signup at tiny.cloud
      value={body}
      onEditorChange={setBody}
      init={{
        height: 300,
        menubar: false,
        plugins: ['image', 'link', 'lists', 'code'],
        toolbar:
          'undo redo | bold italic underline | image | alignleft aligncenter alignright | bullist numlist outdent indent | removeformat | code',
        automatic_uploads: true,
        file_picker_types: 'image',

        // ✅ This is the correct Promise-based handler
        images_upload_handler: function (blobInfo) {
          return new Promise((resolve, reject) => {
            const formData = new FormData();
            formData.append('image', blobInfo.blob(), blobInfo.filename());
              console.log(' Ehh &&&&&&&&&&& :Uploading image to backend:', blobInfo.filename());
            AxiosInstance
              .post('students/upload_image/', formData)
              .then(response => {
                const imageUrl = response.data.location;
                 console.log('Upload response:', response.data);
                if (imageUrl) {
                  resolve(imageUrl); // ✅ TinyMCE inserts this URL
                } else {
                  reject('No image URL returned');
                }
              })
              .catch(error => {
                console.error('Upload error:', error);
                reject('Image upload failed'); // ✅ This is what TinyMCE expects
              });
          });
        },
      }}
    /> */}








   {/*  <Editor
     apiKey="kmz6hdrw4omadsd4jlff98hat2flshafwdy3qw59nkaut7tx" // optional, free signup at tiny.cloud
      value={body}
      onEditorChange={setBody}
      init={{
        height: 300,
        menubar: false,
        plugins: ['image', 'link', 'lists', 'code'],
        toolbar:
          'undo redo | bold italic underline | image | alignleft aligncenter alignright | bullist numlist outdent indent | removeformat | code',
        automatic_uploads: true,
        file_picker_types: 'image',

        // ✅ Axios-based image upload handler
        images_upload_handler: function (blobInfo) {
          return new Promise((resolve, reject) => {
            const formData = new FormData();
            formData.append('image', blobInfo.blob(), blobInfo.filename());

            
              AxiosInstance.post('students/upload_image/', formData)
              .then(response => {
                const imageUrl = response.data.location;
                if (imageUrl) {
                  resolve(imageUrl); // ✅ TinyMCE inserts this URL
                } else {
                  reject('No image URL returned');
                }
              })
              .catch(error => {
                console.error('Upload error:', error);
                reject('Image upload failed');
              });
          });
        },
      }}
    />
 */}


<Editor
 apiKey="kmz6hdrw4omadsd4jlff98hat2flshafwdy3qw59nkaut7tx" // optional, free signup at tiny.cloud
  value={body}
  onEditorChange={setBody}
  init={{
    height: 300,
    menubar: false,
    plugins: ['image', 'link', 'lists', 'code'],
    toolbar: 'undo redo | bold italic underline | image | alignleft aligncenter alignright | bullist numlist outdent indent | removeformat | code',
    image_title: true,
    automatic_uploads: true,
    file_picker_types: 'image',
    file_picker_callback: (cb, value, meta) => {
      const input = document.createElement('input');
      input.setAttribute('type', 'file');
      input.setAttribute('accept', 'image/*');

      input.onchange = function () {
        const file = this.files[0];
        const reader = new FileReader();

        reader.onload = function () {
          const base64 = reader.result;
          cb(base64, { title: file.name });
        };
        reader.readAsDataURL(file);
      };

      input.click();
    },
  }}
/>


    <Button variant="outlined" component="label" sx={{ marginBottom: 2 }}>
      📎 Add Attachment

      
      <input type="file" hidden multiple onChange={e => setAttachments([...e.target.files])} />

                      {/* <input
                          type="file"
                          accept="image/*"
                          onChange={e => setAttachments([...e.target.files])}
                      />
 */}


    </Button>

    <Button
      variant="contained"
      component="label"
      sx={{ marginBottom: 2 }}
      onClick={sendEmailToSelected}
      disabled={!subject || !body}
    >
      Send Email to Selected ({selectedStudents.length})
    </Button>
  </Paper>
)}


    {/* //************************************************************** */ }


       

      <Box sx={{ display: 'flex', gap: 2, marginBottom: 2 }}>
        <Button variant="outlined" onClick={filterSent}>📋 Show Sent</Button>
        <Button variant="outlined" onClick={filterUnsent}>📋 Show Unsent</Button>
        <Button variant="outlined" onClick={exportExcel}>📤 Export to Excel</Button>
        <Button variant="outlined" onClick={exportPDF}>📄 Export to PDF</Button>
        <Button variant="contained" color="error" onClick={resetFlags}>🔄 Reset Flags</Button>
        {/* <button onClick={() => setFilteredStudents(students)}>Show All</button> */}
             {/*  <Button
                  variant="contained"
                  onClick={sendEmailToSelected}
                  disabled={loading || !subject || !body}
                  startIcon={loading ? <CircularProgress size={20} /> : null}
              >
                  {loading ? 'Sending...' : `Send Email to Selected (${selectedStudents.length})`}
              </Button> */}
              
       
      </Box>

      
      

      <div id="student-table">
        <MaterialReactTable
          columns={columns}
          data={filteredStudents}
          enableRowSelection
          onRowSelectionChange={setRowSelection}
          state={{ rowSelection }}
          muiTablePaginationProps={{
            rowsPerPageOptions: [5, 10, 20],
            showFirstButton: true,
            showLastButton: true,
          }}
        />
      </div>
    </Box>
  );
};

export default StudentEmailPage;

