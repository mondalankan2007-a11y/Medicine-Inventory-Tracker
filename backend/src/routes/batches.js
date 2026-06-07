const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authenticateToken = require('../middlewares/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get all batches
router.get('/', authenticateToken, async (req, res) => {
  try {
    const batches = await prisma.medicineBatch.findMany({
      include: {
        medicine: true,
        supplier: true
      }
    });
    res.json(batches);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new batch (receives stock)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { medicine_id, batch_number, quantity, purchase_price, selling_price, expiry_date, supplier_id } = req.body;
    
    const newBatch = await prisma.medicineBatch.create({
      data: {
        medicine_id: Number(medicine_id),
        batch_number,
        quantity: Number(quantity),
        purchase_price: Number(purchase_price),
        selling_price: Number(selling_price),
        expiry_date: new Date(expiry_date),
        supplier_id: supplier_id ? Number(supplier_id) : null
      }
    });

    res.status(201).json(newBatch);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update batch quantity or details
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, selling_price } = req.body;

    const updatedBatch = await prisma.medicineBatch.update({
      where: { id: Number(id) },
      data: {
        quantity: quantity !== undefined ? Number(quantity) : undefined,
        selling_price: selling_price !== undefined ? Number(selling_price) : undefined
      }
    });

    res.json(updatedBatch);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
