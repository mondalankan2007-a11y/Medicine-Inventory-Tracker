const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authenticateToken = require('../middlewares/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get all sales
router.get('/', authenticateToken, async (req, res) => {
  try {
    const sales = await prisma.sale.findMany({
      include: {
        user: { select: { id: true, name: true } },
        saleItems: {
          include: {
            medicineBatch: {
              include: { medicine: true }
            }
          }
        }
      },
      orderBy: { sale_date: 'desc' }
    });
    res.json(sales);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Process a sale (FIFO stock deduction)
router.post('/', authenticateToken, async (req, res) => {
  const { items } = req.body; // Array of { medicine_id, quantity }
  const created_by = req.user.id;

  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'No items in sale' });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      let total_amount = 0;
      const saleItemsData = [];

      for (const item of items) {
        const { medicine_id, quantity } = item;
        let remainingToSell = quantity;

        // Fetch batches for this medicine, ordered by expiry date (FIFO)
        const batches = await tx.medicineBatch.findMany({
          where: {
            medicine_id: Number(medicine_id),
            quantity: { gt: 0 },
            expiry_date: { gt: new Date() } // don't sell expired medicines
          },
          orderBy: { expiry_date: 'asc' }
        });

        const totalAvailable = batches.reduce((sum, b) => sum + b.quantity, 0);
        if (totalAvailable < remainingToSell) {
          throw new Error(`Insufficient non-expired stock for medicine ID ${medicine_id}`);
        }

        for (const batch of batches) {
          if (remainingToSell <= 0) break;

          const qtyFromBatch = Math.min(batch.quantity, remainingToSell);
          const subtotal = qtyFromBatch * batch.selling_price;
          
          total_amount += subtotal;
          remainingToSell -= qtyFromBatch;

          // Deduct from batch
          await tx.medicineBatch.update({
            where: { id: batch.id },
            data: { quantity: batch.quantity - qtyFromBatch }
          });

          saleItemsData.push({
            medicine_batch_id: batch.id,
            quantity: qtyFromBatch,
            price: batch.selling_price,
            subtotal
          });
        }
      }

      // Create Sale record
      const sale = await tx.sale.create({
        data: {
          total_amount,
          created_by,
          saleItems: {
            create: saleItemsData
          }
        },
        include: {
          saleItems: true
        }
      });

      return sale;
    });

    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    if (error.message.includes('Insufficient')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Server error processing sale' });
  }
});

module.exports = router;
