import React, { useState, useMemo } from 'react';
import {MaterialReactTable} from 'material-react-table';
import { Box, Button, Typography } from '@mui/material';
import { Editor } from '@tinymce/tinymce-react';
import AxiosInstance from '../AxiosInstance'


export default function StudentEmailPagenew() {
const students = useMemo(
    () => [
      { id: 1, name: 'Ali Hassan', email: 'hassanelhagm@gmail.com' },
      { id: 2, name: 'Sara Ahmed', email: 'hassanelhagm@gmail.com' },
      { id: 3, name: 'Omar Khalid', email: 'hassanelhagm@gmail.com' },
    ],
    []
  );


  const [emailBody, setEmailBody] = useState('');
  const [rowSelection, setRowSelection] = useState({});
  const selectedStudents = Object.keys(rowSelection).map(rowId => students[parseInt(rowId)]);
 
  
  const columns = useMemo(
    () => [
      { accessorKey: 'name', header: 'Name' },
      { accessorKey: 'email', header: 'Email' },
    ],
    []
  );

  const handleSendEmail = async () => {
  const selectedStudents = Object.keys(rowSelection).map(rowId => students[parseInt(rowId)]);

  if (selectedStudents.length === 0) {
    alert('Please select at least one student.');
    return;
  }

  try {
    const response = await AxiosInstance.post('students/send_student_email/', {
      recipients: selectedStudents.map(s => s.email),
      body: emailBody,
    });
    alert('Email sent successfully!');
  } catch (error) {
    console.error('Email send error:', error);
    alert('Failed to send email.');
  }
};

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h5" gutterBottom>
        Send Email to Students
      </Typography>

          <MaterialReactTable
              columns={columns}
              data={students}
              enableRowSelection
              onRowSelectionChange={setRowSelection}
              state={{ rowSelection }}
/>

      <Box sx={{ marginTop: 4 }}>
        <Editor
        apiKey="kmz6hdrw4omadsd4jlff98hat2flshafwdy3qw59nkaut7tx" // optional, free signup at tiny.cloud
          value={emailBody}
          onEditorChange={setEmailBody}
          init={{
            height: 300,
            menubar: false,
            plugins: ['image', 'link', 'lists', 'code'],
            toolbar:
              'undo redo | bold italic underline | image | alignleft aligncenter alignright | bullist numlist outdent indent | removeformat | code',
            automatic_uploads: true,
            file_picker_types: 'image',
            images_upload_handler: function (blobInfo) {
              return new Promise((resolve, reject) => {
                const formData = new FormData();
                formData.append('image', blobInfo.blob(), blobInfo.filename());

                AxiosInstance.post('students/upload_image/', formData)
                  .then(response => {
                    const imageUrl = response.data.location;
                    if (imageUrl) {
                      resolve(imageUrl);
                    } else {
                      reject('No image URL returned');
                    }
                  })
                  .catch(error => {
                    console.error('Upload error:', error);
                    reject('Image upload failed  newpage');
                  });
              });
            },
          }}
        />
      </Box>

      <Button
        variant="contained"
        color="primary"
        sx={{ marginTop: 2 }}
        onClick={handleSendEmail}
      >
        Send Email
      </Button>
    </Box>
  );
}
