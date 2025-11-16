import { useState } from 'react'
import './App.css'
import Home from './components/Home'
import Register from './components/Register'
import Login from './components/Login'
import About from './components/About'
import Products from './components/Products'
import Navbar from './components/Navbar'
import {Routes, Route, useLocation} from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoutes'
import PasswordResetRequest from './components/PasswordResetRequest'
import PasswordReset from './components/PasswordReset'
import ReactTable from  './components/ReactTable'
import ReactTable02 from  './components/ReactTable02'
import StudentTable from  './components/StudentComponents/StudentTable'
import SearchStudents from  './components/StudentComponents/SearchStudents'
import StudentIdCardTable from  './components/StudentComponents/StudentIdCardTable'

import StudentEmailPage from  './components/sendemailcomponents/StudentEmailPage'

import Create from  './components/productsappcomponents/Create'
import ProjectHome from  './components/productsappcomponents/ProjectHome'
import ProjectHomeDialog from  './components/productsappcomponents/ProjectHomeDialog'
import PopulateFromExcel from  './components/productsappcomponents/PopulateFromExcel'



import { ErrorBoundary } from "react-error-boundary";
function App() {
  const location = useLocation()
  const noNavbar = location.pathname === "/register" || location.pathname === "/" || location.pathname.includes("password")

  return (
    <>
      {
        noNavbar ?
        <Routes>
            <Route path="/" element={<Login/>}/>
            <Route path="/register" element={<Register/>}/>
            <Route path="/request/password_reset" element={<PasswordResetRequest/>}/>
            <Route path="/password-reset/:token" element={<PasswordReset/>}/>
        </Routes>

        :

        <Navbar
        content={
          <Routes>
            <Route element={<ProtectedRoute/>}> 
                <Route path="/home" element={<Home/>}/>
                <Route path="/about" element={<About/>}/>
                <Route path="/products" element={<Products/>}/>
                <Route path="/products2" element=
                {
                  <ErrorBoundary fallback={<div>Something went wrong</div>}>                                    
                       <ReactTable/>
                   </ErrorBoundary>
                 } />
                
            </Route>

            <Route path="/products3" element=
                {
                  <ErrorBoundary fallback={<div>Something went wrong</div>}>                                    
                       <ReactTable02/>
                   </ErrorBoundary>
               } />

              <Route path="/studentBarcode" element=
                {
                  <ErrorBoundary fallback={<div>Something went wrong</div>}>                                    
                       <StudentTable/>
                   </ErrorBoundary>
               } /> 


               <Route path="/studentSearch" element=
                {
                  <ErrorBoundary fallback={<div>Something went wrong</div>}>                                    
                       <SearchStudents/>
                   </ErrorBoundary>
               } />   

               <Route path="/studentPrintCard" element=
                {
                  <ErrorBoundary fallback={<div>Something went wrong</div>}>                                    
                       <StudentIdCardTable/>
                   </ErrorBoundary>
               } />   

               <Route path="/studentSendEmail" element=
                {
                  <ErrorBoundary fallback={<div>Something went wrong</div>}>                                    
                       <StudentEmailPage/>
                   </ErrorBoundary>
               } />   

                <Route path="/CreateProject" element=
                {
                  <ErrorBoundary fallback={<div>Something went wrong</div>}>                                    
                       <Create/>
                   </ErrorBoundary>
               } />  

               <Route path="/ProjectsHome" element=
                {
                  <ErrorBoundary fallback={<div>Something went wrong</div>}>                                    
                       <ProjectHome/>
                   </ErrorBoundary>
               } />    

               <Route path="/ProjectsHomeDialog" element=
                {
                  <ErrorBoundary fallback={<div>Something went wrong</div>}>                                    
                       <ProjectHomeDialog/>
                   </ErrorBoundary>
               } />    
                 <Route path="/PopulateFromExcelPage" element=
                {
                  <ErrorBoundary fallback={<div>Something went wrong</div>}>                                    
                       <PopulateFromExcel/>
                   </ErrorBoundary>
               } />    
           
               
   
                
            </Routes>

        }
      />
      }
    </>
  )
}

export default App
