'use client'
import Header from './Header'
import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import {
  Box,
  Grid,
  Typography,
  Button,
  Modal,
  TextField,
  Card,
  CardContent,
  CardActions,
  Snackbar,
  Stack,
  CircularProgress,
  Container,
} from '@mui/material'
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  deleteDoc,
  getDoc,
} from 'firebase/firestore'
import { firestore } from '@/firebase'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import DeleteIcon from '@mui/icons-material/Delete'

const Firestore = dynamic(
  () => import('@/firebase').then((mod) => mod.firestore),
  {
    ssr: false,
  }
)

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '1px solid #000',
  boxShadow: 24,
  p: 4,
  borderRadius: 4,
}

export default function Home() {
  const [inventory, setInventory] = useState([])
  const [open, setOpen] = useState(false)
  const [itemName, setItemName] = useState('')
  const [itemQuantity, setItemQuantity] = useState('')
  const [loading, setLoading] = useState(false)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearchChange = (query) => {
    setSearchQuery(query)
  }

  const updateInventory = async () => {
    setLoading(true)
    const snapshot = query(collection(firestore, 'inventory'))
    const docs = await getDocs(snapshot)
    const inventoryList = docs.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
    setInventory(inventoryList)
    setLoading(false)
  }

  const handleItemOperation = async (item, operation, quantity = 1) => {
    setLoading(true)
    const docRef = doc(collection(firestore, 'inventory'), item)
    if (operation === 'add') {
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        const currentQuantity = docSnap.data().quantity
        await setDoc(
          docRef,
          { quantity: currentQuantity + parseInt(quantity, 10) },
          { merge: true }
        )
        setSnackbarMessage(`Increased quantity of ${item}`)
      } else {
        await setDoc(docRef, { quantity: parseInt(quantity, 10) })
        setSnackbarMessage(`Added new item: ${item} with quantity: ${quantity}`)
      }
    } else if (operation === 'remove') {
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        const currentQuantity = docSnap.data().quantity
        const newQuantity = currentQuantity - 1
        if (newQuantity > 0) {
          await setDoc(docRef, { quantity: newQuantity }, { merge: true })
          setSnackbarMessage(`Decreased quantity of ${item}`)
        } else {
          await deleteDoc(docRef)
          setSnackbarMessage(`Removed ${item} from inventory`)
        }
      }
    } else if (operation === 'delete') {
      await deleteDoc(docRef)
      setSnackbarMessage(`Deleted ${item} from inventory`)
    }
    await updateInventory()
    setSnackbarOpen(true)
    setLoading(false)
  }

  useEffect(() => {
    updateInventory()
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined' && Firestore) {
      updateInventory()
    }
  }, [Firestore])

  const handleCloseSnackbar = () => setSnackbarOpen(false)
  const filteredInventory = inventory.filter((item) =>
    item.id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
      }}
    >
      <Header onSearch={handleSearchChange} />
      {loading && <CircularProgress />}
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
          <Button
            variant="contained"
            sx={{
              backgroundColor: '#793f26',
              color: '#fff',
              '&:hover': {
                backgroundColor: '#69331d',
              },
            }}
            onClick={() => setOpen(true)}
          >
            Add New Item
          </Button>
        </Box>
        <Modal
          open={open}
          onClose={() => {
            setOpen(false)
            setItemName('')
            setItemQuantity('')
          }}
          aria-labelledby="modal-title"
          aria-describedby="modal-description"
        >
          <Box sx={style}>
            <Typography id="modal-title" variant="h6">
              Add Item
            </Typography>
            <Stack direction="column" spacing={2} mt={2}>
              <TextField
                fullWidth
                label="Item Name"
                variant="outlined"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
              />
              <TextField
                fullWidth
                label="Initial Quantity"
                type="number"
                variant="outlined"
                value={itemQuantity}
                onChange={(e) => setItemQuantity(e.target.value)}
                InputProps={{ inputProps: { min: 0 } }}
              />
              <Button
                variant="contained"
                sx={{
                  backgroundColor: '#793f26',
                  color: '#fff',
                  '&:hover': {
                    backgroundColor: '#69331d',
                  },
                }}
                onClick={() => {
                  handleItemOperation(itemName, 'add', itemQuantity)
                  setItemName('')
                  setItemQuantity('')
                  setOpen(false)
                }}
              >
                Add
              </Button>
            </Stack>
          </Box>
        </Modal>
        <Grid container spacing={2} justifyContent="center" sx={{ px: 2 }}>
          {filteredInventory.map(({ id, quantity }) => (
            <Grid item xs={12} sm={6} md={4} key={id}>
              <Card sx={{ minWidth: 275 }}>
                <CardContent>
                  <Typography variant="h5">{id}</Typography>
                  <Typography variant="subtitle1">
                    Quantity: {quantity}
                  </Typography>
                </CardContent>
                <CardActions
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px',
                  }}
                >
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    size="small"
                    onClick={() => handleItemOperation(id, 'add')}
                    sx={{
                      minWidth: '90px',
                      backgroundColor: '#4b8573',
                      color: '#fff',
                      '&:hover': {
                        backgroundColor: '#32493f',
                      },
                    }}
                  >
                    Add
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<RemoveIcon />}
                    size="small"
                    onClick={() => handleItemOperation(id, 'remove')}
                    sx={{
                      minWidth: '90px',
                      backgroundColor: '#32493f',
                      color: '#fff',
                      '&:hover': {
                        backgroundColor: '#4b8573',
                      },
                    }}
                  >
                    Remove
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<DeleteIcon />}
                    size="small"
                    color="error"
                    onClick={() => handleItemOperation(id, 'delete')}
                    sx={{
                      minWidth: '90px',
                      backgroundColor: '#9c4756',
                      color: '#fff',
                      '&:hover': {
                        backgroundColor: '#c25160',
                      },
                    }}
                  >
                    Delete
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          message={snackbarMessage}
        />
      </Container>
    </Box>
  )
}