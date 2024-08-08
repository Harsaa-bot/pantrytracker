'use client';
import { Box, Stack, Typography, Button, Modal, TextField, CircularProgress, Snackbar } from '@mui/material';
import { firestore } from './firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '1px solid #ddd',
  borderRadius: 4,
  boxShadow: 24,
  p: 4,
};

export default function Home() {
  const [pantry, setPantry] = useState([]);
  const [open, setOpen] = useState(false);
  const [newItem, setNewItem] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleAddItem = async () => {
    if (newItem.trim()) {
      setLoading(true);
      try {
        const docRef = await addDoc(collection(firestore, 'pantry'), { name: newItem, quantity: 0 });
        setPantry(prevPantry => [...prevPantry, { id: docRef.id, name: newItem, quantity: 0 }]);
        setNewItem('');
        handleClose();
        setSnackbarOpen(true);
      } catch (error) {
        console.error('Error adding document: ', error);
        setError('Failed to add item. Please try again.');
        setSnackbarOpen(true);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleRemoveItem = async (id) => {
    try {
      await deleteDoc(doc(firestore, 'pantry', id));
      setPantry(prevPantry => prevPantry.filter(item => item.id !== id));
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error removing document: ', error);
      setError('Failed to remove item. Please try again.');
      setSnackbarOpen(true);
    }
  };

  const handleQuantityChange = async (id, delta) => {
    try {
      const item = pantry.find(item => item.id === id);
      if (item) {
        const newQuantity = Math.max(0, (item.quantity || 0) + delta);
        await updateDoc(doc(firestore, 'pantry', id), { quantity: newQuantity });
        setPantry(prevPantry =>
          prevPantry.map(item =>
            item.id === id ? { ...item, quantity: newQuantity } : item
          )
        );
      }
    } catch (error) {
      console.error('Error updating quantity: ', error);
      setError('Failed to update quantity. Please try again.');
      setSnackbarOpen(true);
    }
  };

  const updatePantry = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(firestore, 'pantry'));
      const pantryList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        quantity: doc.data().quantity || 0 // Ensure quantity is set to 0 if undefined
      }));
      setPantry(pantryList);
    } catch (error) {
      console.error('Error fetching pantry items: ', error);
      setError('Failed to fetch pantry items. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    updatePantry();
  }, []);

  return (
    <Box
      width="100vw"
      minHeight="100vh"
      display="flex"
      justifyContent="center"
      flexDirection="column"
      alignItems="center"
      sx={{ fontFamily: 'Roboto, sans-serif', bgcolor: '#f5f5f5' }}
    >
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={modalStyle}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Add a New Item
          </Typography>
          <TextField
            fullWidth
            id="outlined-basic"
            label="Item Name"
            variant="outlined"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            sx={{ mt: 2, mb: 2 }}
          />
          <Button
            variant="contained"
            onClick={handleAddItem}
            disabled={loading}
            sx={{ width: '100%' }}
          >
            {loading ? <CircularProgress size={24} /> : 'Add Item'}
          </Button>
        </Box>
      </Modal>

      <Box
        width="80%"
        maxWidth="1200px"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        bgcolor="#ffffff"
        sx={{ mb: 4, p: 3, borderRadius: 4, boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}
      >
        <Typography variant="h2" color="#333" textAlign="center" sx={{ mb: 2 }}>
          Pantry Items
        </Typography>

        <Box
          width="100%"
          maxHeight="500px"
          overflow="auto"
          sx={{ border: '1px solid #ddd', borderRadius: 4, mb: 2, boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}
        >
          <Stack spacing={2}>
            {pantry.map((item) => (
              <Box
                key={item.id}
                width="100%"
                height="100px"
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                bgcolor="#f9f9f9"
                sx={{ border: '1px solid #ddd', borderRadius: 4, padding: '0 16px' }}
              >
                <Typography variant="h4" color="#333" fontWeight="bold">
                  {item.name && item.name.charAt(0).toUpperCase() + item.name.slice(1)}
                </Typography>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Button onClick={() => handleQuantityChange(item.id, -1)} disabled={item.quantity <= 0}>
                    -
                  </Button>
                  <Typography variant="h6" color="#333">{item.quantity}</Typography>
                  <Button onClick={() => handleQuantityChange(item.id, 1)}>
                    +
                  </Button>
                </Stack>
                <Button variant="contained" color="secondary" onClick={() => handleRemoveItem(item.id)}>
                  Remove
                </Button>
              </Box>
            ))}
          </Stack>
        </Box>

        <Button variant="contained" onClick={handleOpen}>
          Add Item
        </Button>
      </Box>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={error || 'Operation successful!'}
        action={
          <Button color="inherit" onClick={() => setSnackbarOpen(false)}>
            Close
          </Button>
        }
      />
    </Box>
  );
}



