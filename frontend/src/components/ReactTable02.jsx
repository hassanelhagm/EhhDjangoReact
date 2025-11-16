import AxiosInstance from './AxiosInstance'
/* import {React, useEffect, useMemo, useState} from 'react'
import {Box, Icon, Tooltip} from '@mui/material'

import   { CrudTable, Spinner } from ".";
import  XLSX from 'xlsx'

import { Button } from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload'; */


//********************************** */


import React, { useEffect, useMemo, useState } from "react";

import { MaterialReactTable } from 'material-react-table';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import { FileDownload } from "@mui/icons-material";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

const ReactTable02 = () =>{
  const [students, setStudents] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [form, setForm] = useState({ first_name: "", last_name: "", degree: "", dob: "" });

  // Load students from API
 const fetchStudents = () => {
        AxiosInstance.get(`products/`).then((res) =>{
            setStudents(res.data)
            console.log(res.data)
            // setLoading(false)
        })
    }

    useEffect(() =>{
        fetchStudents();
    },[])



 /*  const fetchStudents = async () => {
    const res = await api.get("students/");
    setStudents(res.data);
    
  };

  useEffect(() => {
    fetchStudents();
  }, []); */

  const columns = useMemo(
    () => [
      { accessorKey: "name", header: "Name" },
      { accessorKey: "description", header: "Description" },
      { accessorKey: "os", header: "Os" },
      { accessorKey: "price", header: "Price" },
      { accessorKey: "quantity", header: "Quantity" },
    ],
    []
  );

  // CRUD actions
  const handleSave = async () => {
    if (editingRow) {
      await AxiosInstance.put(`products/${editingRow.id}/`, form);
    } else {
      await AxiosInstance.post("products/", form);
    }
    setOpen(false);
    setEditingRow(null);
    setForm({ name: "", description: "", os: "", price: "" });
    fetchStudents();
  };

  const handleEdit = (row) => {
    setEditingRow(row);
    setForm(row);
    setOpen(true);
  };

  const handleDelete = async (row) => {
    await AxiosInstance.delete(`products//${row.id}/`);
    fetchStudents();
  };

  // Export to Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(students);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "products");
    XLSX.writeFile(workbook, "products/.xlsx");
  };

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("products List", 14, 10);
    doc.autoTable({
      startY: 20,
      head: [["First Name", "Last Name", "Degree", "DOB"]],
      body: students.map((s) => [s.name, s.description, s.os, s.price]),
    });
    doc.save("students.pdf");
  };

  return (
    <Box sx={{ p: 3 }}>
      <MaterialReactTable
        columns={columns}
        fetchData={fetchStudents}
        data={students}
        enableRowActions
        renderRowActions={({ row }) => (
          <Box>
            <Button size="small" variant="outlined" sx={{ mr: 1 }} onClick={() => handleEdit(row.original)}>
              Edit
            </Button>
            <Button size="small" color="error" variant="outlined" onClick={() => handleDelete(row.original)}>
              Delete
            </Button>
          </Box>
        )}
        renderTopToolbarCustomActions={() => (
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button variant="contained" onClick={() => setOpen(true)}>
              Add Student
            </Button>
            <Button variant="outlined" startIcon={<FileDownload />} onClick={exportToExcel}>
              Export XLSX
            </Button>
            <Button variant="outlined" startIcon={<FileDownload />} onClick={exportToPDF}>
              Export PDF
            </Button>
          </Box>
        )}
      />

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{editingRow ? "Edit Student" : "Add Student"}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              label="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <TextField
              label="description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <TextField
              label="Os"
              value={form.os}
              onChange={(e) => setForm({ ...form, os: e.target.value })}
            />
            <TextField
              label="Price"
              type="descimal"
              InputLabelProps={{ shrink: true }}
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
             <TextField
              label="Quantity"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
export default  ReactTable02