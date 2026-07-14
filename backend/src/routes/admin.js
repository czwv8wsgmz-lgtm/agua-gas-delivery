const express = require('express');
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

// Get dashboard stats
router.get('/dashboard', adminAuth, async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $match: { paymentStatus: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalProducts = await Product.countDocuments();

    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('customer')
      .populate('items.product');

    const ordersByStatus = await Order.aggregate([
      {
        $group: {
          _id: '$orderStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      stats: {
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        totalCustomers,
        totalProducts
      },
      recentOrders,
      ordersByStatus
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all orders (admin)
router.get('/orders', adminAuth, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const filter = status ? { orderStatus: status } : {};

    const skip = (page - 1) * limit;
    const orders = await Order.find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('customer')
      .populate('items.product')
      .populate('deliveryAddress')
      .sort({ createdAt: -1 });

    const total = await Order.countDocuments(filter);

    res.json({
      orders,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all customers
router.get('/customers', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const skip = (page - 1) * limit;
    const customers = await User.find({ role: 'customer' })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-password')
      .sort({ createdAt: -1 });

    const total = await User.countDocuments({ role: 'customer' });

    res.json({
      customers,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Assign delivery person
router.put('/orders/:id/assign-delivery', adminAuth, async (req, res) => {
  try {
    const { deliveryPersonId } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { deliveryPerson: deliveryPersonId },
      { new: true }
    ).populate(['customer', 'deliveryPerson', 'items.product']);

    res.json({
      message: 'Delivery person assigned',
      order
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Sales report
router.get('/reports/sales', adminAuth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const filter = {
      paymentStatus: 'completed',
      createdAt: {
        $gte: new Date(startDate || '2024-01-01'),
        $lte: new Date(endDate || new Date())
      }
    };

    const sales = await Order.aggregate([
      { $match: filter },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          totalSales: { $sum: '$totalAmount' },
          totalOrders: { $sum: 1 },
          averageOrder: { $avg: '$totalAmount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Top products
router.get('/reports/top-products', adminAuth, async (req, res) => {
  try {
    const topProducts = await Order.aggregate([
      { $match: { paymentStatus: 'completed' } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.total' }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      }
    ]);

    res.json(topProducts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
