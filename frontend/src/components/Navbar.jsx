
import * as React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import AppBar from '@mui/material/AppBar';
import CssBaseline from '@mui/material/CssBaseline';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import HomeIcon from '@mui/icons-material/Home';
import InfoIcon from '@mui/icons-material/Info';
import {Link, useLocation} from 'react-router-dom'
import LogoutIcon from '@mui/icons-material/Logout';
import AxiosInstance from './AxiosInstance';
import { useNavigate } from 'react-router-dom';

const drawerWidth = 240;

export default function Navbar(props) {
  const {content} = props
  const location = useLocation()
  const path = location.pathname
  const navigate = useNavigate()

  const logoutUser = () =>{
     AxiosInstance.post(`logoutall/`,{
     })
     .then( () => {
        localStorage.removeItem("Token")
        navigate('/')
     }

     )
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            Clipped drawer
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
          
              <ListItem key={1} disablePadding>
                <ListItemButton component={Link} to="/home" selected={"/home" === path}>
                  <ListItemIcon>
                        <HomeIcon /> 
                  </ListItemIcon>
                  <ListItemText primary={"Home"} />
                </ListItemButton>
              </ListItem>

              <ListItem key={2} disablePadding>
              <ListItemButton component={Link} to="/about" selected={"/about" === path}>
                  <ListItemIcon>
                        <InfoIcon /> 
                  </ListItemIcon>
                  <ListItemText primary={"About"} />
                </ListItemButton>
              </ListItem>

              <ListItem key={3} disablePadding>
              <ListItemButton onClick={logoutUser}>
                  <ListItemIcon>
                        <LogoutIcon/> 
                  </ListItemIcon>
                  <ListItemText primary={"Logout"} />
                </ListItemButton>
              </ListItem>
              <ListItem key={4} disablePadding>
              <ListItemButton component={Link} to="/products" selected={"/products" === path}>
                  <ListItemIcon>
                        <InfoIcon /> 
                  </ListItemIcon>
                  <ListItemText primary={"Products"} />
                </ListItemButton>
              </ListItem>

               <ListItem key={5} disablePadding>
              <ListItemButton component={Link} to="/products2" selected={"/products" === path}>
                  <ListItemIcon>
                        <InfoIcon /> 
                  </ListItemIcon>
                  <ListItemText primary={"ReactTable"} />
                </ListItemButton>
              </ListItem>

        
              <ListItem key={6} disablePadding>
              <ListItemButton component={Link} to="/products3" selected={"/products" === path}>
                  <ListItemIcon>
                        <InfoIcon /> 
                  </ListItemIcon>
                  <ListItemText primary={"ReactTable02"} />
                </ListItemButton>
              </ListItem>

              
              <ListItem key={7} disablePadding>
              <ListItemButton component={Link} to="/studentBarcode" selected={"/students" === path}>
                  <ListItemIcon>
                        <InfoIcon /> 
                  </ListItemIcon>
                  <ListItemText primary={"StudentTable"} />
                </ListItemButton>
              </ListItem>



               <ListItem key={8} disablePadding>
              <ListItemButton component={Link} to="/studentSearch" selected={"/students" === path}>
                  <ListItemIcon>
                        <InfoIcon /> 
                  </ListItemIcon>
                  <ListItemText primary={"SearchStudents"} />
                </ListItemButton>
              </ListItem>

              <ListItem key={9} disablePadding>
              <ListItemButton component={Link} to="/studentPrintCard" selected={"/students" === path}>
                  <ListItemIcon>
                        <InfoIcon /> 
                  </ListItemIcon>
                  <ListItemText primary={"StudentIdCardTable"} />
                </ListItemButton>
              </ListItem>

              <ListItem key={10} disablePadding>
              <ListItemButton component={Link} to="/studentSendEmail" selected={"/students" === path}>
                  <ListItemIcon>
                        <InfoIcon /> 
                  </ListItemIcon>
                  <ListItemText primary={"StudentEmailPage"} />
                </ListItemButton>
              </ListItem>

                <ListItem key={11} disablePadding>
              <ListItemButton component={Link} to="/CreateProject" selected={"/students" === path}>
                  <ListItemIcon>
                        <InfoIcon /> 
                  </ListItemIcon>
                  <ListItemText primary={"Create"} />
                </ListItemButton>
              </ListItem>

               <ListItem key={12} disablePadding>
             
                <ListItemButton component={Link} to="/ProjectsHome" selected={"/students" === path}>
                <ListItemIcon>
                        <HomeIcon/>
                </ListItemIcon>
                <ListItemText primary={"ProjectHome"} />
                </ListItemButton>
             
                </ListItem>
                 <ListItem key={13} disablePadding>
             
                <ListItemButton component={Link} to="/ProjectsHomeDialog" selected={"/students" === path}>
                <ListItemIcon>
                        <HomeIcon/>
                </ListItemIcon>
                <ListItemText primary={"ProjectHomeDialog"} />
                </ListItemButton>
             
                </ListItem> 

                 <ListItem key={14} disablePadding>
             
                <ListItemButton component={Link} to="/PopulateFromExcelPage" selected={"/students" === path}>
                <ListItemIcon>
                        <HomeIcon/>
                </ListItemIcon>
                <ListItemText primary={"PopulateFromExcel"} />
                </ListItemButton>
             
                </ListItem> 


                
                   


              
              

          </List>
         
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
            {content}
      </Box>
    </Box>
  );
}