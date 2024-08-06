'use client'
import Image from "next/image";
import { useState, useEffect } from 'react';
import { firestore, storage } from '@/firebase';
import { Box, Typography, Stack, TextField, Button, Modal, InputAdornment } from '@mui/material';
import { collection, deleteDoc, doc, getDocs, query, getDoc, setDoc } from 'firebase/firestore';
import SearchIcon from '@mui/icons-material/Search';
import ImageCapture from './imageCapture';

export default function Home() {
  const [inventory, setInventory] = useState([]) // using state var to store inventory
  const [filteredInventory, setFilteredInventory] = useState([]) // using state var to store filtered inventory
  const [open, setOpen] = useState(false)        // using state var to store open (used to add and remove items)
  const [itemName, setItemName] = useState('')   // using state var to store item name (to store the name of the item when adding or removing)  
  const [searchTerm, setSearchTerm] = useState('') // using state var to store search term
  const [imageUrl, setImageUrl] = useState('');

  // using ASYNC - wont block the code while fetching data from firebase
  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory')) // querying the inventory collection
    const docs = await getDocs(snapshot)
    const inventoryList = [] // inventory list
    docs.forEach((doc) => { // every doc we want to add to our inventory list
      inventoryList.push({
        name: doc.id,
        ...doc.data(),
      }) // add the data to the list
    })
    setInventory(inventoryList) // update the state with the inventory list
    setFilteredInventory(inventoryList) // initially set filtered inventory to all items
  }

  // helper function to add items
  const addItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity, imageUrl: existingImageUrl } = docSnap.data();
      await setDoc(docRef, { quantity: quantity + 1, imageUrl: imageUrl || existingImageUrl });
    } else {
      await setDoc(docRef, { quantity: 1, imageUrl });
    }
    setImageUrl('');
    await updateInventory();
  }
  // helper function to remove items
  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item) // gets direct item
    const docSnap = await getDoc(docRef) // gets document ref

    if (docSnap.exists()) {
      const { quantity } = docSnap.data()
      if (quantity === 1) {
        await deleteDoc(docRef)
      } else {
        await setDoc(docRef, { quantity: quantity - 1 })
      }
    }
    await updateInventory()
  }

  useEffect(() => {
    updateInventory() // call the updateInventory function when the component mounts
  }, []) // empty array means it only runs once

  // Filter inventory based on search term
  useEffect(() => {
    const filtered = inventory.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredInventory(filtered)
  }, [searchTerm, inventory])

  // model
  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  return (
    <Box width="100vw" height="100vh" display="flex" flexDirection="column" justifyContent="center" alignItems="center" gap={2}>
      <Modal open={open} onClose={handleClose} sx={{ overflow: 'auto' }}>
        <Box position="absolute" top="50%" left="50%" width={400} bgcolor="white" border="2px solid #000" boxShadow={24} p={4} display="flex" flexDirection="column" gap={3} sx={{ transform: 'translate(-50%,-50%)', }}>
          <Typography variant="h6">Add Item</Typography>
          <ImageCapture onImageUpload={(url) => setImageUrl(url)} />
          {imageUrl && <img src={imageUrl} alt="Captured item" style={{ width: '100%', maxHeight: '200px', objectFit: 'contain' }} />}
          <Stack width="100%" direction="row" spacing={2}>
            <TextField variant='outlined' fullWidth value={itemName}
              onChange={(e) => {
                setItemName(e.target.value)
              }}
            />
            <Button variant="outlined" onClick={() => {
              addItem(itemName)
              setItemName('')
              handleClose()
            }}>Add
            </Button>
          </Stack>
        </Box>
      </Modal>
      {/* Opens modal */}
      <Button variant="contained" onClick={() => {
        handleOpen()
      }}>Add New Item
      </Button>
      <Box border='1px solid #333'>
        <Box width="800px" height="100px" bgcolor="#ADD8E6" display="flex" alignItems="center" justifyContent="center">
          <Typography variant='h2' color='#333'>
            Inventory List
          </Typography>
        </Box>

        <Box width="800px" p={2}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Stack width="800px" height="300px" spacing={2} overflow="auto">
          {filteredInventory.map(({ name, quantity, imageUrl }) => (
            <Box key={name} width="100%" minHeight="150px" display="flex" alignItems="center" justifyContent="space-between" bgColor="f0f0f0" padding={5}>
              {imageUrl && <img src={imageUrl} alt={name} style={{ width: '100px', height: '100px', objectFit: 'cover' }} />}
              <Typography variant="h3" color="#333" textAlign="center">{name.charAt(0).toUpperCase() + name.slice(1)}</Typography>
              <Typography variant="h3" color="#333" textAlign="center">{quantity}</Typography>
              <Stack direction="row" spacing={2}>
                <Button variant="contained" onClick={() => {
                  addItem(name)
                }}
                >
                  Add
                </Button>
                <Button variant="contained" onClick={() => {
                  removeItem(name)
                }}
                >
                  Remove
                </Button>
              </Stack>
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
  )
}