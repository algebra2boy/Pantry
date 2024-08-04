import React, { useState } from 'react'
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  TextField,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'

function Header({ onSearch }) {
  const [searchInput, setSearchInput] = useState('')

  const handleSearchChange = (event) => {
    setSearchInput(event.target.value)
    if (onSearch) {
      onSearch(event.target.value)
    }
  }

  return (
    <AppBar position="static" sx={{ backgroundColor: '#324849' }}>
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Inventory Management
        </Typography>
        <TextField
          value={searchInput}
          onChange={handleSearchChange}
          variant="outlined"
          size="small"
          placeholder="Search..."
          sx={{ mr: 3, bgcolor: 'background.paper', borderRadius: 2 }}
        />
        <Button color="inherit">Login</Button>
      </Toolbar>
    </AppBar>
  )
}

export default Header