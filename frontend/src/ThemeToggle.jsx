import React, { useContext } from 'react';
import { IconButton } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { ColorModeContext } from './ThemeContext';

const ThemeToggle = () => {
  const { toggleColorMode } = useContext(ColorModeContext);

  return (
    <IconButton onClick={toggleColorMode} color="inherit">
      <Brightness4 />
    </IconButton>
  );
};

export default ThemeToggle;
