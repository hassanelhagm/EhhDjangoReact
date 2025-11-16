
import { React, useEffect, useMemo, useState } from 'react';
import AxiosInstance from '../AxiosInstance';
import { MaterialReactTable } from 'material-react-table';
import Dayjs from 'dayjs';
import {
  Box,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  OutlinedInput,
  Checkbox,
  ListItemText,
  Alert,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon, Download as DownloadIcon } from '@mui/icons-material';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const hardcoded_options = [
  { id: '', name: 'None' },
  { id: 'Open', name: 'Open' },
  { id: 'In progress', name: 'In progress' },
  { id: 'Completed', name: 'Completed' },
];

const initialFormState = {
  name: '',
  status: '',
  comments: '',
  start_date: '',
  end_date: '',
  projectmanager: '',
  employees: [],
};

const ProjectHome = () => {
  const [myData, setMydata] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dialog state
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('add'); // 'add' or 'edit'
  const [formState, setFormState] = useState(initialFormState);
  const [editId, setEditId] = useState(null);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  // Delete confirmation dialog
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // Select options
  const [projectmanager, setProjectmanager] = useState([]);
  const [employees, setEmployees] = useState([]);

  const GetData = () => {
    AxiosInstance.get(`project/`).then((res) => {
      setMydata(res.data);
      setLoading(false);
    });
  };

  const GetOptions = () => {
    AxiosInstance.get('projectmanager/').then((res) => setProjectmanager(res.data));
    AxiosInstance.get('employees/').then((res) => setEmployees(res.data));
  };

  useEffect(() => {
    GetData();
    GetOptions();
  }, []);

  // Table columns
  const columns = useMemo(
    () => [
      { accessorKey: 'name', header: 'Name', size: 150 },
      { accessorKey: 'status', header: 'Status', size: 150 },
      { accessorKey: 'comments', header: 'Comments', size: 200 },
      {
        accessorFn: (row) => Dayjs(row.start_date).format('DD-MM-YYYY'),
        header: 'Start date',
        size: 150,
      },
      {
        accessorFn: (row) => Dayjs(row.end_date).format('DD-MM-YYYY'),
        header: 'End date',
        size: 150,
      },
      {
        accessorFn: (row) => {
          const pm = projectmanager.find((pm) => pm.id === row.projectmanager);
          return pm ? pm.name : '';
        },
        header: 'Project Manager',
        size: 150,
      },
      {
        accessorFn: (row) => {
          if (!row.employees || !Array.isArray(row.employees)) return '';
          return row.employees
            .map((eid) => {
              const emp = employees.find((e) => e.id === eid);
              return emp ? emp.name : '';
            })
            .join(', ');
        },
        header: 'Employees',
        size: 200,
      },
    ],
    [projectmanager, employees]
  );

  // Dialog handlers
  const handleOpenAdd = () => {
    setDialogMode('add');
    setFormState(initialFormState);
    setErrors({});
    setSuccessMessage('');
    setOpenDialog(true);
    setEditId(null);
  };

  const handleOpenEdit = (row) => {
    setDialogMode('edit');
    setFormState({
      name: row.name,
      status: row.status,
      comments: row.comments,
      start_date: Dayjs(row.start_date).format('YYYY-MM-DD'),
      end_date: Dayjs(row.end_date).format('YYYY-MM-DD'),
      projectmanager: row.projectmanager || '',
      employees: row.employees || [],
    });
    setErrors({});
    setSuccessMessage('');
    setEditId(row.id);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormState(initialFormState);
    setEditId(null);
    setErrors({});
    setSuccessMessage('');
  };

  // CRUD handlers
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleEmployeesChange = (event) => {
    const {
      target: { value },
    } = event;
    setFormState((prev) => ({
      ...prev,
      employees: typeof value === 'string' ? value.split(',') : value,
    }));
    // Clear error for employees field
    if (errors.employees) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.employees;
        return newErrors;
      });
    }
  };

  // Export to XLSX
  const handleExportXLSX = () => {
    const exportData = myData.map((row) => ({
      Name: row.name,
      Status: row.status,
      Comments: row.comments,
      'Start Date': Dayjs(row.start_date).format('DD-MM-YYYY'),
      'End Date': Dayjs(row.end_date).format('DD-MM-YYYY'),
      'Project Manager': projectmanager.find((pm) => pm.id === row.projectmanager)?.name || '',
      Employees: row.employees
        ?.map((eid) => employees.find((e) => e.id === eid)?.name || '')
        .join(', ') || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Projects');

    // Auto-size columns
    const colWidths = [20, 15, 25, 15, 15, 20, 30];
    worksheet['!cols'] = colWidths.map((width) => ({ wch: width }));

    XLSX.writeFile(workbook, `Projects_${Dayjs().format('YYYY-MM-DD')}.xlsx`);
  };

  // Export to PDF
  const handleExportPDF = () => {
    const doc = new jsPDF();

    const tableData = myData.map((row) => [
      row.name,
      row.status,
      row.comments,
      Dayjs(row.start_date).format('DD-MM-YYYY'),
      Dayjs(row.end_date).format('DD-MM-YYYY'),
      projectmanager.find((pm) => pm.id === row.projectmanager)?.name || '',
      row.employees
        ?.map((eid) => employees.find((e) => e.id === eid)?.name || '')
        .join(', ') || '',
    ]);

    autoTable(doc, {
      head: [['Name', 'Status', 'Comments', 'Start Date', 'End Date', 'Project Manager', 'Employees']],
      body: tableData,
      startY: 10,
      styles: {
        fontSize: 10,
        cellPadding: 5,
        overflow: 'linebreak',
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 20 },
        2: { cellWidth: 30 },
        3: { cellWidth: 20 },
        4: { cellWidth: 20 },
        5: { cellWidth: 25 },
        6: { cellWidth: 40 },
      },
    });

    doc.save(`Projects_${Dayjs().format('YYYY-MM-DD')}.pdf`);
  };

  const handleSubmit = async () => {
    // Clear previous errors
    setErrors({});

    // Validate start_date is not after end_date
    if (formState.start_date && formState.end_date) {
      const startDate = new Date(formState.start_date);
      const endDate = new Date(formState.end_date);

      if (startDate > endDate) {
        setErrors({ start_date: 'Start date cannot be after end date' });
        return;
      }
    }

    const payload = {
      ...formState,
      start_date: formState.start_date,
      end_date: formState.end_date,
      employees: formState.employees,
    };

    try {
      if (dialogMode === 'add') {
        await AxiosInstance.post('project/', payload);
        setSuccessMessage('Project added successfully!');
      } else if (dialogMode === 'edit') {
        await AxiosInstance.put(`project/${editId}/`, payload);
        setSuccessMessage('Project updated successfully!');
      }
      GetData();
      // Reset form for adding new project
      if (dialogMode === 'add') {
        setFormState(initialFormState);
      }
    } catch (error) {
      if (error.response && error.response.data) {
        setErrors(error.response.data);
      } else {
        setErrors({ general: 'An error occurred. Please try again.' });
      }
    }
  };

  // Delete handlers
  const handleOpenDeleteConfirm = (id) => {
    setDeleteId(id);
    setOpenDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await AxiosInstance.delete(`project/${deleteId}/`);
      setOpenDeleteConfirm(false);
      setDeleteId(null);
      GetData();
    } catch (error) {
      if (error.response && error.response.data) {
        console.error('Delete error:', error.response.data);
      }
    }
  };

  const handleCancelDelete = () => {
    setOpenDeleteConfirm(false);
    setDeleteId(null);
  };

  return (
    <div>
      <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenAdd}
        >
          Add Project
        </Button>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={handleExportXLSX}
          disabled={myData.length === 0}
        >
          Export XLSX
        </Button>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={handleExportPDF}
          disabled={myData.length === 0}
        >
          Export PDF
        </Button>
      </Box>
      {loading ? (
        <p>Loading data...</p>
      ) : (
        <MaterialReactTable
          columns={columns}
          data={myData}
          enableRowActions
          renderRowActions={({ row }) => (
            <Box sx={{ display: 'flex', flexWrap: 'nowrap', gap: '8px' }}>
              <IconButton
                color="secondary"
                onClick={() => handleOpenEdit(row.original)}
              >
                <EditIcon />
              </IconButton>
              <IconButton
                color="error"
                onClick={() => handleOpenDeleteConfirm(row.original.id)}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          )}
        />
      )}

      {/* Add/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={(event, reason) => {
          if (reason !== 'backdropClick') {
            handleCloseDialog();
          }
        }}
        disableEscapeKeyDown
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {dialogMode === 'add' ? 'Add Project' : 'Edit Project'}
        </DialogTitle>
        <DialogContent>
          {/* Success Message */}
          {successMessage && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {successMessage}
            </Alert>
          )}

          {/* General Error Message */}
          {errors.general && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errors.general}
            </Alert>
          )}

          <TextField
            margin="dense"
            label="Name"
            name="name"
            value={formState.name}
            onChange={handleFormChange}
            fullWidth
            error={!!errors.name}
            helperText={errors.name ? (Array.isArray(errors.name) ? errors.name[0] : errors.name) : ''}
          />
          <TextField
            margin="dense"
            label="Comments"
            name="comments"
            value={formState.comments}
            onChange={handleFormChange}
            fullWidth
            error={!!errors.comments}
            helperText={errors.comments ? (Array.isArray(errors.comments) ? errors.comments[0] : errors.comments) : ''}
          />
          <TextField
            margin="dense"
            label="Start Date"
            name="start_date"
            type="date"
            value={formState.start_date}
            onChange={handleFormChange}
            fullWidth
            InputLabelProps={{ shrink: true }}
            error={!!errors.start_date}
            helperText={errors.start_date ? (Array.isArray(errors.start_date) ? errors.start_date[0] : errors.start_date) : ''}
          />
          <TextField
            margin="dense"
            label="End Date"
            name="end_date"
            type="date"
            value={formState.end_date}
            onChange={handleFormChange}
            fullWidth
            InputLabelProps={{ shrink: true }}
            error={!!errors.end_date}
            helperText={errors.end_date ? (Array.isArray(errors.end_date) ? errors.end_date[0] : errors.end_date) : ''}
          />
          {/* Status Select */}
          <FormControl margin="dense" fullWidth error={!!errors.status}>
            <InputLabel>Status</InputLabel>
            <Select
              name="status"
              value={formState.status}
              onChange={handleFormChange}
              input={<OutlinedInput label="Status" />}
            >
              {hardcoded_options.map((option) => (
                <MenuItem key={option.id} value={option.id}>
                  {option.name}
                </MenuItem>
              ))}
            </Select>
            {errors.status && <Box sx={{ color: '#d32f2f', fontSize: '0.75rem', mt: 0.5 }}>{Array.isArray(errors.status) ? errors.status[0] : errors.status}</Box>}
          </FormControl>
          {/* Project Manager Select */}
          <FormControl margin="dense" fullWidth error={!!errors.projectmanager}>
            <InputLabel>Project Manager</InputLabel>
            <Select
              name="projectmanager"
              value={formState.projectmanager}
              onChange={handleFormChange}
              input={<OutlinedInput label="Project Manager" />}
            >
              <MenuItem value="">None</MenuItem>
              {projectmanager.map((pm) => (
                <MenuItem key={pm.id} value={pm.id}>
                  {pm.name}
                </MenuItem>
              ))}
            </Select>
            {errors.projectmanager && <Box sx={{ color: '#d32f2f', fontSize: '0.75rem', mt: 0.5 }}>{Array.isArray(errors.projectmanager) ? errors.projectmanager[0] : errors.projectmanager}</Box>}
          </FormControl>
          {/* Employees Multi-Select */}
          <FormControl margin="dense" fullWidth error={!!errors.employees}>
            <InputLabel>Employees</InputLabel>
            <Select
              multiple
              name="employees"
              value={formState.employees}
              onChange={handleEmployeesChange}
              input={<OutlinedInput label="Employees" />}
              renderValue={(selected) =>
                employees
                  .filter((e) => selected.includes(e.id))
                  .map((e) => e.name)
                  .join(', ')
              }
            >
              {employees.map((emp) => (
                <MenuItem key={emp.id} value={emp.id}>
                  <Checkbox checked={formState.employees.indexOf(emp.id) > -1} />
                  <ListItemText primary={emp.name} />
                </MenuItem>
              ))}
            </Select>
            {errors.employees && <Box sx={{ color: '#d32f2f', fontSize: '0.75rem', mt: 0.5 }}>{Array.isArray(errors.employees) ? errors.employees[0] : errors.employees}</Box>}
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {dialogMode === 'add' ? 'Add' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteConfirm}
        onClose={(event, reason) => {
          if (reason !== 'backdropClick') {
            handleCancelDelete();
          }
        }}
        disableEscapeKeyDown
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this project? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ProjectHome;