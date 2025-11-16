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
  CircularProgress,
  Typography,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Save as SaveIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
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

const PopulateFromExcel = () => {
  const [myData, setMydata] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Dialog state for editing rows
  const [openDialog, setOpenDialog] = useState(false);
  const [formState, setFormState] = useState(initialFormState);
  const [editIndex, setEditIndex] = useState(null);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  // Delete confirmation
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(null);

  // Lookups
  const [projectmanager, setProjectmanager] = useState([]);
  const [employees, setEmployees] = useState([]);

  // Fetch options (do NOT fetch projects)
  const GetOptions = () => {
    AxiosInstance.get('projectmanager/').then((res) => setProjectmanager(res.data)).catch(() => {});
    AxiosInstance.get('employees/').then((res) => setEmployees(res.data)).catch(() => {});
  };

  useEffect(() => {
    GetOptions();
  }, []);

  // Helpers to map names -> ids
  const getProjectManagerId = (name) => {
    if (!name) return '';
    const pm = projectmanager.find((p) => p.name === name || String(p.id) === String(name));
    return pm ? pm.id : '';
  };

  const getEmployeeIds = (names) => {
    if (!names) return [];
    const nameArray = Array.isArray(names) ? names : names.split(',').map((n) => n.trim());
    return nameArray
      .map((n) => {
        const emp = employees.find((e) => e.name === n || String(e.id) === String(n));
        return emp ? emp.id : null;
      })
      .filter((id) => id !== null);
  };

  // Columns including Note
  const columns = useMemo(
    () => [
      { accessorKey: 'name', header: 'Name', size: 150 },
      { accessorKey: 'status', header: 'Status', size: 120 },
      { accessorKey: 'comments', header: 'Comments', size: 200 },
      {
        accessorFn: (row) => (row.start_date ? Dayjs(row.start_date).format('DD-MM-YYYY') : ''),
        header: 'Start date',
        size: 110,
      },
      {
        accessorFn: (row) => (row.end_date ? Dayjs(row.end_date).format('DD-MM-YYYY') : ''),
        header: 'End date',
        size: 110,
      },
      {
        accessorFn: (row) => {
          const pm = projectmanager.find((p) => String(p.id) === String(row.projectmanager));
          return pm ? pm.name : row.projectmanager || '';
        },
        header: 'Project Manager',
        size: 150,
      },
      {
        accessorFn: (row) => {
          if (!row.employees || !Array.isArray(row.employees)) return '';
          return row.employees
            .map((eid) => employees.find((e) => String(e.id) === String(eid))?.name || eid)
            .join(', ');
        },
        header: 'Employees',
        size: 200,
      },
      {
        accessorKey: 'note',
        header: 'Note',
        size: 250,
        Cell: ({ cell }) => (
          <Box sx={{ color: cell.getValue() ? '#d32f2f' : '#4caf50', fontWeight: 'bold' }}>
            {cell.getValue() || '✓ Valid'}
          </Box>
        ),
      },
    ],
    [projectmanager, employees]
  );

  // Validate single row before saving
  const validateRow = (row) => {
    const issues = [];
    if (!row.name) issues.push('Name is required');
    if (!row.status) issues.push('Status is required');
    if (!row.start_date) issues.push('Start date is required');
    if (!row.end_date) issues.push('End date is required');
    if (row.start_date && row.end_date) {
      const s = new Date(row.start_date);
      const e = new Date(row.end_date);
      if (s > e) issues.push('Start date cannot be after end date');
    }
    return issues.length ? issues.join('; ') : '';
  };

  // Excel import
  const handleExcelUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const mapped = jsonData.map((row) => ({
          name: row.Name || '',
          status: row.Status || '',
          comments: row.Comments || '',
          start_date: row['Start Date'] ? Dayjs(row['Start Date']).format('YYYY-MM-DD') : '',
          end_date: row['End Date'] ? Dayjs(row['End Date']).format('YYYY-MM-DD') : '',
          projectmanager: row['Project Manager'] ? getProjectManagerId(row['Project Manager']) || row['Project Manager'] : '',
          employees: row.Employees ? getEmployeeIds(row.Employees) : [],
          note: '',
        }));

        setMydata(mapped);
        setSuccessMessage(`Loaded ${mapped.length} rows from Excel`);
        setErrors({});
      } catch (err) {
        setErrors({ general: 'Error reading Excel file. Ensure correct columns.' });
      } finally {
        setUploading(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Save all rows to DB, writing backend errors into note
  const handleSaveToDatabase = async () => {
    setIsSaving(true);
    const updated = [...myData];
    let successCount = 0;
    let failureCount = 0;

    for (let i = 0; i < updated.length; i++) {
      const row = updated[i];
      const validation = validateRow(row);
      if (validation) {
        updated[i].note = validation;
        failureCount++;
        continue;
      }

      const payload = {
        name: row.name,
        status: row.status,
        comments: row.comments,
        start_date: row.start_date || null,
        end_date: row.end_date || null,
        projectmanager: row.projectmanager || null,
        employees: row.employees || [],
      };

      try {
        await AxiosInstance.post('project/', payload);
        updated[i].note = '';
        successCount++;
      } catch (err) {
        if (err.response && err.response.data) {
          const vals = Object.values(err.response.data).flat();
          updated[i].note = Array.isArray(vals) ? vals.join('; ') : String(err.response.data);
        } else {
          updated[i].note = 'Error saving to database';
        }
        failureCount++;
      }
    }

    setMydata(updated);
    setSuccessMessage(`Saved ${successCount} projects. ${failureCount} failed.`);
    setIsSaving(false);
  };

  // Export helpers
  const handleExportXLSX = () => {
    const exportData = myData.map((row) => ({
      Name: row.name,
      Status: row.status,
      Comments: row.comments,
      'Start Date': row.start_date ? Dayjs(row.start_date).format('DD-MM-YYYY') : '',
      'End Date': row.end_date ? Dayjs(row.end_date).format('DD-MM-YYYY') : '',
      'Project Manager': projectmanager.find((p) => String(p.id) === String(row.projectmanager))?.name || row.projectmanager || '',
      Employees: (row.employees || []).map((id) => employees.find((e) => String(e.id) === String(id))?.name || id).join(', '),
      Note: row.note || '',
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Projects');
    worksheet['!cols'] = [20, 15, 25, 15, 15, 20, 30, 30].map((wch) => ({ wch }));
    XLSX.writeFile(workbook, `Projects_${Dayjs().format('YYYY-MM-DD')}.xlsx`);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const tableData = myData.map((row) => [
      row.name,
      row.status,
      row.comments,
      row.start_date ? Dayjs(row.start_date).format('DD-MM-YYYY') : '',
      row.end_date ? Dayjs(row.end_date).format('DD-MM-YYYY') : '',
      projectmanager.find((p) => String(p.id) === String(row.projectmanager))?.name || row.projectmanager || '',
      (row.employees || []).map((id) => employees.find((e) => String(e.id) === String(id))?.name || id).join(', '),
      row.note || '',
    ]);
    autoTable(doc, {
      head: [['Name', 'Status', 'Comments', 'Start', 'End', 'PM', 'Employees', 'Note']],
      body: tableData,
      styles: { fontSize: 9, cellPadding: 4, overflow: 'linebreak' },
    });
    doc.save(`Projects_${Dayjs().format('YYYY-MM-DD')}.pdf`);
  };

  // Edit row handlers
  const handleOpenEdit = (row, index) => {
    setFormState({
      name: row.name || '',
      status: row.status || '',
      comments: row.comments || '',
      start_date: row.start_date || '',
      end_date: row.end_date || '',
      projectmanager: row.projectmanager || '',
      employees: row.employees || [],
    });
    setEditIndex(index);
    setErrors({});
    setSuccessMessage('');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormState(initialFormState);
    setEditIndex(null);
    setErrors({});
    setSuccessMessage('');
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const n = { ...prev };
        delete n[name];
        return n;
      });
    }
  };

  const handleEmployeesChange = (event) => {
    const { value } = event.target;
    setFormState((prev) => ({ ...prev, employees: typeof value === 'string' ? value.split(',') : value }));
  };

  const handleSubmit = () => {
    // validate and update row in table (no DB call)
    const validation = validateRow(formState);
    const updated = [...myData];
    updated[editIndex] = { ...formState, note: validation || updated[editIndex]?.note || '' };
    setMydata(updated);
    setSuccessMessage('Row updated');
    setTimeout(() => handleCloseDialog(), 800);
  };

  // Delete handlers
  const handleOpenDeleteConfirm = (index) => {
    setDeleteIndex(index);
    setOpenDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    setMydata((prev) => prev.filter((_, i) => i !== deleteIndex));
    setOpenDeleteConfirm(false);
    setDeleteIndex(null);
  };

  const handleCancelDelete = () => {
    setOpenDeleteConfirm(false);
    setDeleteIndex(null);
  };

  const handleClearTable = () => {
    setMydata([]);
    setSuccessMessage('');
    setErrors({});
  };

  const showFullscreenLoader = uploading || isSaving;

  return (
    <div>
      {/* Fullscreen centered loader - large and blocks interaction */}
      {showFullscreenLoader && (
        <Box
          role="status"
          aria-busy="true"
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 1600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.45)',
            flexDirection: 'column',
            gap: 2,
            p: 2,
            pointerEvents: 'auto',
          }}
        >
          <CircularProgress size={96} thickness={5} color="primary" />
          <Typography variant="h6" sx={{ color: '#fff', mt: 2 }}>
            {uploading ? 'Reading Excel file...' : isSaving ? 'Saving to database...' : ''}
          </Typography>
        </Box>
      )}

      <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <Button variant="contained" component="label" startIcon={<UploadIcon />}>
          Import Excel
          <input hidden accept=".xlsx,.xls" type="file" onChange={handleExcelUpload} />
        </Button>

        <Button
          variant="contained"
          color="success"
          startIcon={<SaveIcon />}
          onClick={handleSaveToDatabase}
          disabled={myData.length === 0 || isSaving}
        >
          {isSaving ? 'Saving...' : 'Save to Database'}
        </Button>

        <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleExportXLSX} disabled={myData.length === 0}>
          Export XLSX
        </Button>

        <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleExportPDF} disabled={myData.length === 0}>
          Export PDF
        </Button>

        <Button
          variant="outlined"
          color="error"
          startIcon={<ClearIcon />}
          onClick={handleClearTable}
          disabled={myData.length === 0}
        >
          Clear Table
        </Button>
      </Box>

      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}

      {errors.general && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errors.general}
        </Alert>
      )}

      <MaterialReactTable
        columns={columns}
        data={myData}
        enableRowActions
        renderRowActions={({ row, table }) => (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton color="secondary" onClick={() => handleOpenEdit(row.original, row.index)}>
              <EditIcon />
            </IconButton>
            <IconButton color="error" onClick={() => handleOpenDeleteConfirm(row.index)}>
              <DeleteIcon />
            </IconButton>
          </Box>
        )}
      />

      {/* Edit Dialog */}
      <Dialog open={openDialog} onClose={(e, reason) => reason !== 'backdropClick' && handleCloseDialog()} disableEscapeKeyDown maxWidth="sm" fullWidth>
        <DialogTitle>Edit Row</DialogTitle>
        <DialogContent>
          {errors.general && <Alert severity="error" sx={{ mb: 2 }}>{errors.general}</Alert>}
          <TextField margin="dense" label="Name" name="name" value={formState.name} onChange={handleFormChange} fullWidth error={!!errors.name} helperText={errors.name || ''} />
          <TextField margin="dense" label="Comments" name="comments" value={formState.comments} onChange={handleFormChange} fullWidth />
          <TextField margin="dense" label="Start Date" name="start_date" type="date" value={formState.start_date} onChange={handleFormChange} fullWidth InputLabelProps={{ shrink: true }} error={!!errors.start_date} helperText={errors.start_date || ''} />
          <TextField margin="dense" label="End Date" name="end_date" type="date" value={formState.end_date} onChange={handleFormChange} fullWidth InputLabelProps={{ shrink: true }} error={!!errors.end_date} helperText={errors.end_date || ''} />

          <FormControl margin="dense" fullWidth>
            <InputLabel>Status</InputLabel>
            <Select name="status" value={formState.status} onChange={handleFormChange} input={<OutlinedInput label="Status" />}>
              {hardcoded_options.map((opt) => <MenuItem key={opt.id} value={opt.id}>{opt.name}</MenuItem>)}
            </Select>
          </FormControl>

          <FormControl margin="dense" fullWidth>
            <InputLabel>Project Manager</InputLabel>
            <Select name="projectmanager" value={formState.projectmanager} onChange={handleFormChange} input={<OutlinedInput label="Project Manager" />}>
              <MenuItem value="">None</MenuItem>
              {projectmanager.map((pm) => <MenuItem key={pm.id} value={pm.id}>{pm.name}</MenuItem>)}
            </Select>
          </FormControl>

          <FormControl margin="dense" fullWidth>
            <InputLabel>Employees</InputLabel>
            <Select multiple name="employees" value={formState.employees} onChange={handleEmployeesChange} input={<OutlinedInput label="Employees" />} renderValue={(selected) => (employees.filter((e) => selected.includes(e.id)).map((e) => e.name).join(', '))}>
              {employees.map((emp) => (
                <MenuItem key={emp.id} value={emp.id}>
                  <Checkbox checked={formState.employees.indexOf(emp.id) > -1} />
                  <ListItemText primary={emp.name} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={openDeleteConfirm} onClose={(e, reason) => reason !== 'backdropClick' && handleCancelDelete()} disableEscapeKeyDown>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>Are you sure you want to delete this row? This action cannot be undone.</DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleConfirmDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default PopulateFromExcel;