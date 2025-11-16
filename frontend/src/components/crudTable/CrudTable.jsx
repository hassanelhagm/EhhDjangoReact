import React, { useState } from "react";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
// import 'jspdf-autotable';
import { applyPlugin } from 'jspdf-autotable';
applyPlugin(jsPDF);



import {
  MRT_EditActionButtons,
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Tooltip,
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
 // *****************************************************************
   
 const exportToXlsx = (table, fileName = 'table-data') => {
 // const allRows = table.getRowModel().rows;
  const allRows = table.getPrePaginationRowModel().rows;
  const dataToExport = allRows.map((row) => row.original);
  
  const worksheet = XLSX.utils.json_to_sheet(dataToExport);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
  saveAs(data, `${fileName}.xlsx`);
};

const exportToPdf = (table, fileName = 'table-data') => {
  const doc = new jsPDF();
  // const allRows = table.getRowModel().rows;
   const allRows = table.getPrePaginationRowModel().rows;
  const dataToExport = allRows.map((row) => row.original);

  const columnsToExport = table.getAllColumns().filter(
    (column) => column.getIsVisible() && column.columnDef.accessorKey,
  );

  const headers = columnsToExport.map((column) => column.columnDef.header);
  const body = dataToExport.map((row) =>
    columnsToExport.map((column) => row[column.columnDef.accessorKey]),
  );

  doc.autoTable({
    head: [headers],
    body: body,
  });

  doc.save(`${fileName}.pdf`);
};

    // ***************************************************************

const CrudTable = ({
  data,
  fetchData,
  setValidationErrors,
  columns,
  crud_url,
  validateData,
}) => {
  const [isLoadingDataError, setIsLoadingDataError] = useState(false);

  // CUD Actions
  const createData = async (values) => {
    const response = await axios.post(crud_url, values);
    fetchData();
  };

  const updateData = async (values) => {
    const response = await axios.put(`${crud_url}${values.id}/`, values);
    fetchData();
  };

  const deleteData = async (id) => {
    const response = await axios.delete(`${crud_url}${id}/`);
    fetchData();
  };

  //CREATE action
  const handleCreateData = async ({ values, table }) => {
    // console.log(values);
    const newValidationErrors = validateData(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    createData(values);
    // console.log(values);
    table.setCreatingRow(null); //exit creating mode
  };

  //UPDATE action
  const handleSaveData = async ({ values, table }) => {
    // console.log(values);
    const newValidationErrors = validateData(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    // await
    updateData(values);
    console.log(values);
    table.setEditingRow(null); //exit editing mode
  };

  //DELETE action
  const openDeleteConfirmModal = (row) => {
    // console.log(row.original.id);
    if (window.confirm("Are you sure you want to delete this Data?")) {
      deleteData(row.original.id);
      console.log("Deleted Data");
    }
  };

  const table = useMaterialReactTable({
    columns,
    data: data,
    // createDisplayMode: "modal", //default ('row', and 'custom' are also available)
    editDisplayMode: "modal", //default ('row', 'cell', 'table', and 'custom' are also available)
    enableEditing: true,
    getRowId: (row) => row.id,
    muiToolbarAlertBannerProps: isLoadingDataError
      ? {
          color: "error",
          children: "Error loading data",
        }
      : undefined,
    muiTableContainerProps: {
      sx: {
        minHeight: "500px",
      },
    },
    onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: handleCreateData,
    onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSaveData,
    renderCreateRowDialogContent: ({ table, row, internalEditComponents }) => (
      <>
        <DialogTitle variant="h3">Create New Data</DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: "1rem" }}
        >
          {internalEditComponents} {/* or render custom edit components here */}
        </DialogContent>
        <DialogActions>
          <MRT_EditActionButtons variant="text" table={table} row={row} />
        </DialogActions>
      </>
    ),
    renderEditRowDialogContent: ({ table, row, internalEditComponents }) => (
      <>
        <DialogTitle variant="h3">Edit Data</DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
        >
          {internalEditComponents} {/* or render custom edit components here */}
        </DialogContent>
        <DialogActions>
          <MRT_EditActionButtons variant="text" table={table} row={row} />
        </DialogActions>
      </>
    ),
    renderRowActions: ({ row, table }) => (
      <Box sx={{ display: "flex", gap: "1rem" }}>
        <Tooltip title="Edit">
          <IconButton onClick={() => table.setEditingRow(row)}>
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton color="error" onClick={() => openDeleteConfirmModal(row)}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </Box>
    ),
    renderTopToolbarCustomActions: ({ table }) => (
      <Box sx={{ display: 'flex', gap: '1rem', p: '4px' }}>
      <Button
        variant="contained"
        onClick={() => {
          table.setCreatingRow(true);
        }}
      >
        Create New Data
      </Button>
       <Button
        variant="contained"
        disabled={table.getPrePaginationRowModel().rows.length === 0}

        onClick={() => {
          exportToXlsx(table)
        }}
      >
       Expport to XLSX
      </Button>

       <Button
        variant="contained"
        onClick={() => {
          exportToPdf(table)
        }}
      >
       Expport to PDF
      </Button>
      
     </Box>

    ),
    
  });

  return <MaterialReactTable table={table} />;
};

export default CrudTable;
