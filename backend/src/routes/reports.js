const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authenticateToken = require('../middlewares/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Dashboard summary
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const totalMedicines = await prisma.medicine.count();
    
    // Total stock value & Low stock count
    const medicines = await prisma.medicine.findMany({ include: { batches: true } });
    
    let totalStockValue = 0;
    let lowStockCount = 0;

    medicines.forEach(med => {
      const totalQty = med.batches.reduce((sum, b) => sum + b.quantity, 0);
      if (totalQty < med.low_stock_threshold) {
        lowStockCount++;
      }
      totalStockValue += med.batches.reduce((sum, b) => sum + (b.quantity * b.purchase_price), 0);
    });

    // Today's sales
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    
    const todaysSales = await prisma.sale.aggregate({
      where: { sale_date: { gte: startOfDay } },
      _sum: { total_amount: true }
    });

    res.json({
      totalMedicines,
      totalStockValue,
      lowStockCount,
      todaysSales: todaysSales._sum.total_amount || 0
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Low stock report
router.get('/low-stock', authenticateToken, async (req, res) => {
  try {
    const medicines = await prisma.medicine.findMany({ include: { batches: true } });
    const lowStockMeds = medicines
      .map(med => ({
        ...med,
        total_quantity: med.batches.reduce((sum, b) => sum + b.quantity, 0)
      }))
      .filter(med => med.total_quantity <= med.low_stock_threshold);
    
    res.json(lowStockMeds);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Expiring soon report (within 30 days)
router.get('/expiring-soon', authenticateToken, async (req, res) => {
  try {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const expiringBatches = await prisma.medicineBatch.findMany({
      where: {
        quantity: { gt: 0 },
        expiry_date: { lte: thirtyDaysFromNow, gt: new Date() }
      },
      include: {
        medicine: true
      },
      orderBy: { expiry_date: 'asc' }
    });

    res.json(expiringBatches);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
