import React, { useState, useEffect, useMemo, useContext } from 'react';
import {
  TextField, Select, MenuItem, Button, Typography, Box,
  Snackbar, Alert, IconButton
} from '@mui/material';
import {MaterialReactTable} from 'material-react-table';
import AxiosInstance from '../AxiosInstance'
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { ColorModeContext } from '../../ThemeContext'; // adjust path if needed

const SearchStudents = () => {
  const [filters, setFilters] = useState({ name: '', ssn: '', degree_level: '' });
  const [degreeLevels, setDegreeLevels] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);

  const { toggleColorMode } = useContext(ColorModeContext);

  useEffect(() => {
    AxiosInstance.get('degree-levels/').then(res => setDegreeLevels(res.data));
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    const params = {};
    if (filters.name) params.name = filters.name;
    if (filters.ssn) params.ssn = filters.ssn;
    if (filters.degree_level) params.degree_level = filters.degree_level;

    try {
      const res = await AxiosInstance.get('students/', { params });
      setStudents(res.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const hasInput = filters.name || filters.ssn || filters.degree_level;
    if (!hasInput) {
      setSnackbarOpen(true);
      return;
    }
    setPagination({ ...pagination, pageIndex: 0 });
    fetchStudents();
  };

  const handleReset = () => {
    setFilters({ name: '', ssn: '', degree_level: '' });
    setStudents([]);
  };

  const columns = useMemo(() => [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'ssn', header: 'SSN' },
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'cell_phone', header: 'Phone' },
    {
      accessorKey: 'degree_level.name',
      header: 'Degree Level',
      filterVariant: 'select',
      filterSelectOptions: degreeLevels.map(dl => dl.name),
    },
  ], [degreeLevels]);

  return (
    <Box
      sx={{
        width: '80vw',
        margin: '0 auto',
        mt: 4,
      }}
    >
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h5">Search Students</Typography>
        <IconButton onClick={toggleColorMode} color="inherit">
          <Brightness4 />
        </IconButton>
      </Box>

      <Box display="flex" gap={2} mb={2}>
        <TextField
          label="Name"
          value={filters.name}
          onChange={e => setFilters({ ...filters, name: e.target.value })}
        />
        <TextField
          label="SSN"
          value={filters.ssn}
          onChange={e => setFilters({ ...filters, ssn: e.target.value })}
        />
        <Select
          value={filters.degree_level}
          onChange={e => setFilters({ ...filters, degree_level: e.target.value })}
          displayEmpty
        >
          <MenuItem value="">All Degrees</MenuItem>
          {degreeLevels.map(dl => (
            <MenuItem key={dl.id} value={dl.id}>{dl.name}</MenuItem>
          ))}
        </Select>
        <Button variant="contained" onClick={handleSearch}>Search</Button>
        <Button variant="outlined" onClick={handleReset}>Reset</Button>
      </Box>

      <MaterialReactTable
        columns={columns}
        data={students}
        manualPagination
        manualSorting
        manualFiltering
        rowCount={students?.length || 0}
        state={{ pagination, sorting, columnFilters, isLoading: loading }}
        onPaginationChange={setPagination}
        onSortingChange={setSorting}
        onColumnFiltersChange={setColumnFilters}
      />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ mt: 10 }}
      >
        <Alert severity="warning" onClose={() => setSnackbarOpen(false)}>
          Please enter at least one search field!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SearchStudents;




/* import React, { useState, useEffect, useMemo } from 'react';
import {
  TextField, Select, MenuItem, Button, Typography, Box, Snackbar, Alert
} from '@mui/material';
import {MaterialReactTable} from 'material-react-table';
import AxiosInstance from '../AxiosInstance'


const SearchStudents = () => {
  const [filters, setFilters] = useState({ name: '', ssn: '', degree_level: '' });
  const [degreeLevels, setDegreeLevels] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);

  useEffect(() => {
    AxiosInstance.get('degree-levels/').then(res => setDegreeLevels(res.data));
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    const params = {
      limit: pagination.pageSize,
      offset: pagination.pageIndex * pagination.pageSize,
    };

    if (filters.name) params.name = filters.name;
    if (filters.ssn) params.ssn = filters.ssn;
    if (filters.degree_level) params.degree_level = filters.degree_level;

    const res = await AxiosInstance.get('students/', { params });
    setStudents(res.data);
    setLoading(false);
  };

  const handleSearch = () => {
    const hasInput = filters.name || filters.ssn || filters.degree_level;
    if (!hasInput) {
      setSnackbarOpen(true);
      return;
    }
    setPagination({ ...pagination, pageIndex: 0 });
    fetchStudents();
  };

  const columns = useMemo(() => [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'ssn', header: 'SSN' },
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'cell_phone', header: 'Phone' },
    {
      accessorKey: 'degree_level.name',
      header: 'Degree Level',
      filterVariant: 'select',
      filterSelectOptions: degreeLevels.map(dl => dl.name),
    },
  ], [degreeLevels]);

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Search Students</Typography>
      <Box display="flex" gap={2} mb={2}>
        <TextField label="Name" value={filters.name} onChange={e => setFilters({ ...filters, name: e.target.value })} />
        <TextField label="SSN" value={filters.ssn} onChange={e => setFilters({ ...filters, ssn: e.target.value })} />
        <Select
          value={filters.degree_level}
          onChange={e => setFilters({ ...filters, degree_level: e.target.value })}
          displayEmpty
        >
          <MenuItem value="">All Degrees</MenuItem>
          {degreeLevels.map(dl => (
            <MenuItem key={dl.id} value={dl.id}>{dl.name}</MenuItem>
          ))}
        </Select>
        <Button variant="contained" onClick={handleSearch}>Search</Button>
      </Box>

      <MaterialReactTable
        columns={columns}
        data={students}
        manualPagination
        manualSorting
        manualFiltering
        rowCount={students.length}
        state={{ pagination, sorting, columnFilters, isLoading: loading }}
        onPaginationChange={setPagination}
        onSortingChange={setSorting}
        onColumnFiltersChange={setColumnFilters}
      />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="warning" onClose={() => setSnackbarOpen(false)}>
          Please enter at least one search field!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SearchStudents;

 */




/* import React, { useState, useEffect, useMemo } from 'react';
import {
  TextField, Select, MenuItem, Button, Typography, Box
} from '@mui/material';
import {MaterialReactTable} from 'material-react-table';
import AxiosInstance from '../AxiosInstance'

const SearchStudents = () => {
  const [filters, setFilters] = useState({ name: '', ssn: '', degree_level: '' , email: '' });
  const [degreeLevels, setDegreeLevels] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  // Table state
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);

  useEffect(() => {
    AxiosInstance.get('degree-levels/').then(res => setDegreeLevels(res.data));
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    const params = {
      limit: pagination.pageSize,
      offset: pagination.pageIndex * pagination.pageSize,
    };

    if (filters.name || filters.ssn  || filters.email ) {
      params.search = filters.name || filters.ssn  || filters.email;
    }
    if (filters.degree_level) {
      params.degree_level = filters.degree_level;
    }

    const res = await AxiosInstance.get('students/', { params });
    setStudents(res.data);
    setLoading(false);
  };

  const handleSearch = () => {
    setPagination({ ...pagination, pageIndex: 0 }); // reset to first page
    fetchStudents();
  };

  const columns = useMemo(() => [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'ssn', header: 'SSN' },
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'cell_phone', header: 'Phone' },
    {
      accessorKey: 'degree_level.name',
      header: 'Degree Level',
      filterVariant: 'select',
      filterSelectOptions: degreeLevels.map(dl => dl.name),
    },
  ], [degreeLevels]);

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Search Students</Typography>
      <Box display="flex" gap={2} mb={2}>
        <TextField label="Name" value={filters.name} onChange={e => setFilters({ ...filters, name: e.target.value })} />
        <TextField label="SSN" value={filters.ssn} onChange={e => setFilters({ ...filters, ssn: e.target.value })} />
        <TextField label="Email Address" value={filters.email} onChange={e => setFilters({ ...filters, email: e.target.value })} />
        <Select
          value={filters.degree_level}
          onChange={e => setFilters({ ...filters, degree_level: e.target.value })}
          displayEmpty
        >
          <MenuItem value="">All Degrees</MenuItem>
          {degreeLevels.map(dl => (
            <MenuItem key={dl.id} value={dl.id}>{dl.name}</MenuItem>
          ))}
        </Select>
        <Button variant="contained" onClick={handleSearch}>Search</Button>
      </Box>

      <MaterialReactTable
        columns={columns}
        data={students}
        manualPagination
        manualSorting
        manualFiltering
        rowCount={1000} // optional: set if you know total count
        state={{ pagination, sorting, columnFilters, isLoading: loading }}
        onPaginationChange={setPagination}
        onSortingChange={setSorting}
        onColumnFiltersChange={setColumnFilters}
      />
    </Box>
  );
};

export default SearchStudents;
 */