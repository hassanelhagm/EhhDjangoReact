// components/StudentDialog.jsx
import { Dialog, DialogTitle, TextField, Button } from '@mui/material';

export default function StudentDialog() {
  return (
    <Dialog open={false}>
      <DialogTitle>Add/Edit Student</DialogTitle>
      {/* Form fields and logic here */}
      <Button>Save</Button>
    </Dialog>
  );
}
