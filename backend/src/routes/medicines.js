const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authenticateToken = require('../middlewares/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get all medicines with their total stock
router.get('/', authenticateToken, async (req, res) => {
  try {
    const medicines = await prisma.medicine.findMany({
      include: {
        batches: true
      }
    });

    const enrichedMedicines = medicines.map(med => ({
      ...med,
      total_stock: med.batches.reduce((sum, batch) => sum + batch.quantity, 0)
    }));

    res.json(enrichedMedicines);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new medicine
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, brand, category, unit, low_stock_threshold } = req.body;
    
    const newMedicine = await prisma.medicine.create({
      data: {
        name,
        brand,
        category,
        unit,
        low_stock_threshold: low_stock_threshold || 10
      }
    });

    res.status(201).json(newMedicine);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update medicine
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, brand, category, unit, low_stock_threshold } = req.body;

    const updatedMedicine = await prisma.medicine.update({
      where: { id: Number(id) },
      data: {
        name,
        brand,
        category,
        unit,
        low_stock_threshold
      }
    });

    res.json(updatedMedicine);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete medicine
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.medicine.delete({
      where: { id: Number(id) }
    });

    res.json({ message: 'Medicine deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
