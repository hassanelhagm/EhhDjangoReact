import AxiosInstance from './AxiosInstance'
import {React, useEffect, useMemo, useState} from 'react'
import {Box, Icon, Tooltip} from '@mui/material'

import   { CrudTable, Spinner } from ".";
// import  XLSX from 'xlsx'

import * as XLSX from 'xlsx';

import { Button } from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';


const ReactTable = () =>{

const [myData, setMyData] = useState()
const [loading,setLoading] = useState(true)

const [data, setData] = useState([]);
 
  

  const GetData = () => {
        AxiosInstance.get(`products/`).then((res) =>{
            setMyData(res.data)
            console.log(res.data)
            setLoading(false)
        })
    }

    useEffect(() =>{
        GetData();
    },[])


   

  const crud_url = "http://localhost:8000/apiapp/products/";

  const [validationErrors, setValidationErrors] = useState({});
  const options_available = ["android", "ios", "windows"];

  // Column Headers
  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "ID",
        size: 50,
        enableEditing: false,
      },
      {
        accessorKey: "name",
        header: "Name",
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.name,
          helperText: validationErrors?.name,
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              name: undefined,
            }),
        },
      },
      {
        accessorKey: "description",
        header: "Description",
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.description,
          helperText: validationErrors?.description,
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              description: undefined,
            }),
        },
      },
      {
        accessorKey: "os",
        header: "Operating System",
        editVariant: "select",
        editSelectOptions: options_available,
        muiEditTextFieldProps: {
          select: true,
          error: !!validationErrors?.os,
          helperText: validationErrors?.os,
        },
      },

      {
        accessorKey: "price",
        header: "Price in USD",
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.price,
          helperText: validationErrors?.price,
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              price: undefined,
            }),
        },
      },

      {
        accessorKey: "quantity",
        header: "Quantity",
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.quantity,
          helperText: validationErrors?.quantity,
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              quantity: undefined,
            }),
        },
      },
    ],
    [validationErrors]
  );

  // Field Validators

  const validateLength = (value, field, lowest) => {
    if (value.length === 0) {
      return `${field} cannot be empty`;
    } else if (value.length < lowest) {
      return `A minimum of ${lowest} Characters is required`;
    } else {
      return "";
    }
  };

  const validateSelect = (value, options) => {
    return options.includes(value);
  };

  const validateMinNumber = (value, minimum) => {
    return value > minimum;
  };

  function validateData(data) {
    return {
      name: validateLength(data.name, "Name", 6),
      Description: validateLength(data.description, "Description", 20),
      os: !validateSelect(data.os, options_available)
        ? "Option Unavailable"
        : "",
      price: !validateMinNumber(data.price, 0)
        ? "Price cannot be less than 0"
        : "",
      quantity: !validateMinNumber(data.quantity, 0)
        ? "Quantity cannot be less than 0"
        : "",
    };
  }

  /* const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(crud_url);
      setData(response.data);
      setIsLoading(false);
      console.log(response.data);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
 */
  return (
    <div className="App">
      {loading ? 
        <p>Loading data...</p>:

      myData.length === 0 ?
       (
        <p>No Data Found</p>
       ) :
      
       (
       
        <CrudTable
          data={myData}
        //   fetchData={fetchData}
          fetchData={GetData}
          setValidationErrors={setValidationErrors}
          columns={columns}
          crud_url={crud_url}
          validateData={validateData}
         />
      )}
    </div>
  );
    
}

export default  ReactTable