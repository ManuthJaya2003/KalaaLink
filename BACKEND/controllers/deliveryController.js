const Delivery = require('../model/Delivery');
const Art = require('../model/Art');

// Simple notification function (in production, use proper email service)
const sendDispatchNotification = async (delivery) => {
  // This is a placeholder for email notification
  // In a real application, you would integrate with services like:
  // - SendGrid, AWS SES, Mailgun, etc.
  // - SMS services like Twilio
  // - Push notification services
  
  console.log('📧 Sending dispatch notification to customer:', {
    customerName: delivery.customerName,
    customerEmail: delivery.customerEmail,
    productName: delivery.productName,
    deliveryAddress: `${delivery.address}, ${delivery.city}`,
    dispatchedAt: delivery.dispatchedAt
  });

  // Simulate email content
  const emailContent = {
    to: delivery.customerEmail,
    subject: `🚚 Your order has been dispatched! - ${delivery.productName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3b82f6;">🚚 Your Order Has Been Dispatched!</h2>
        <p>Dear ${delivery.customerName},</p>
        <p>Great news! Your order has been dispatched and is on its way to you.</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Order Details:</h3>
          <p><strong>Product:</strong> ${delivery.productName}</p>
          <p><strong>Quantity:</strong> ${delivery.quantity}</p>
          <p><strong>Delivery Address:</strong> ${delivery.address}, ${delivery.city}, ${delivery.district}</p>
          <p><strong>Contact Number:</strong> ${delivery.contactNumber}</p>
          <p><strong>Dispatched At:</strong> ${new Date(delivery.dispatchedAt).toLocaleString()}</p>
        </div>
        
        <p>You can track your delivery status in your account or contact us if you have any questions.</p>
        <p>Thank you for choosing KalaaLink!</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 12px;">
          This is an automated message. Please do not reply to this email.
        </p>
      </div>
    `
  };

  // In production, you would send the actual email here
  // For now, we'll just log it
  console.log('📧 Email notification prepared:', emailContent);
  
  return Promise.resolve();
};

exports.createDelivery = async (req, res) => {
  try {
    const { artId, customerName, address, city, district, postalCode, contactNumber, deliveryStatus } = req.body;
    const art = await Art.findById(artId);
    if (!art) return res.status(404).json({ message: 'Art not found' });

    const delivery = new Delivery({
      artId,
      customerName,
      address,
      city,
      district,
      postalCode,
      contactNumber,
      deliveryStatus: deliveryStatus || 'Pending', // Default to 'Pending' if not provided
    });
    const savedDelivery = await delivery.save();
    res.status(201).json(savedDelivery);
  } catch (error) {
    res.status(500).json({ message: 'Error creating delivery', error: error.message });
  }
};

exports.getAllDeliveries = async (req, res) => {
  try {
    const deliveries = await Delivery.find()
      .populate('artId', 'artType price image artistName')
      .populate('orderId', 'customerEmail totalAmount paymentStatus')
      .sort({ createdAt: -1 });
    res.status(200).json(deliveries);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching deliveries', error: error.message });
  }
};

exports.getDeliveryById = async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id).populate('artId', 'artType price');
    if (!delivery) return res.status(404).json({ message: 'Delivery not found' });
    res.status(200).json(delivery);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching delivery', error: error.message });
  }
};

exports.updateDelivery = async (req, res) => {
  try {
    const { customerName, address, city, district, postalCode, contactNumber, deliveryStatus } = req.body;
    const delivery = await Delivery.findByIdAndUpdate(
      req.params.id,
      { customerName, address, city, district, postalCode, contactNumber, deliveryStatus },
      { new: true, runValidators: true }
    ).populate('artId', 'artType price');
    if (!delivery) return res.status(404).json({ message: 'Delivery not found' });
    res.status(200).json(delivery);
  } catch (error) {
    res.status(500).json({ message: 'Error updating delivery', error: error.message });
  }
};

exports.deleteDelivery = async (req, res) => {
  try {
    const delivery = await Delivery.findByIdAndDelete(req.params.id);
    if (!delivery) return res.status(404).json({ message: 'Delivery not found' });
    res.status(200).json({ message: 'Delivery deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting delivery', error: error.message });
  }
};

// Dispatch delivery
exports.dispatchDelivery = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const delivery = await Delivery.findById(id);
    if (!delivery) {
      return res.status(404).json({ message: 'Delivery not found' });
    }

    if (delivery.deliveryStatus !== 'Pending') {
      return res.status(400).json({ 
        message: `Cannot dispatch delivery with status: ${delivery.deliveryStatus}` 
      });
    }

    // Update delivery status to dispatched
    delivery.deliveryStatus = 'Dispatched';
    delivery.dispatchedAt = new Date();
    if (notes) {
      delivery.notes = notes;
    }

    await delivery.save();

    // Send notification to customer (in a real app, you'd use email service like SendGrid, AWS SES, etc.)
    try {
      await sendDispatchNotification(delivery);
    } catch (notificationError) {
      console.error('❌ Failed to send dispatch notification:', notificationError);
      // Don't fail the dispatch if notification fails
    }

    console.log('✅ Delivery dispatched:', {
      deliveryId: delivery._id,
      customerName: delivery.customerName,
      productName: delivery.productName,
      dispatchedAt: delivery.dispatchedAt
    });

    res.status(200).json({ 
      message: 'Delivery dispatched successfully', 
      delivery: {
        _id: delivery._id,
        deliveryStatus: delivery.deliveryStatus,
        dispatchedAt: delivery.dispatchedAt,
        notes: delivery.notes
      }
    });
  } catch (error) {
    console.error('❌ Error dispatching delivery:', error);
    res.status(500).json({ message: 'Error dispatching delivery', error: error.message });
  }
};

// Update delivery status
exports.updateDeliveryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const validStatuses = ['Pending', 'Dispatched', 'In Transit', 'Delivered', 'Failed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
      });
    }

    const delivery = await Delivery.findById(id);
    if (!delivery) {
      return res.status(404).json({ message: 'Delivery not found' });
    }

    // Update delivery status
    delivery.deliveryStatus = status;
    
    // Set timestamps based on status
    if (status === 'Delivered' && !delivery.deliveredAt) {
      delivery.deliveredAt = new Date();
    }
    
    if (notes) {
      delivery.notes = notes;
    }

    await delivery.save();

    console.log('✅ Delivery status updated:', {
      deliveryId: delivery._id,
      customerName: delivery.customerName,
      oldStatus: delivery.deliveryStatus,
      newStatus: status,
      updatedAt: delivery.updatedAt
    });

    res.status(200).json({ 
      message: 'Delivery status updated successfully', 
      delivery: {
        _id: delivery._id,
        deliveryStatus: delivery.deliveryStatus,
        deliveredAt: delivery.deliveredAt,
        notes: delivery.notes,
        updatedAt: delivery.updatedAt
      }
    });
  } catch (error) {
    console.error('❌ Error updating delivery status:', error);
    res.status(500).json({ message: 'Error updating delivery status', error: error.message });
  }
};

// Get delivery statistics
exports.getDeliveryStats = async (req, res) => {
  try {
    const stats = await Delivery.aggregate([
      {
        $group: {
          _id: '$deliveryStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalDeliveries = await Delivery.countDocuments();
    const pendingDeliveries = await Delivery.countDocuments({ deliveryStatus: 'Pending' });
    const dispatchedDeliveries = await Delivery.countDocuments({ deliveryStatus: 'Dispatched' });
    const deliveredDeliveries = await Delivery.countDocuments({ deliveryStatus: 'Delivered' });

    res.status(200).json({
      total: totalDeliveries,
      pending: pendingDeliveries,
      dispatched: dispatchedDeliveries,
      delivered: deliveredDeliveries,
      statusBreakdown: stats
    });
  } catch (error) {
    console.error('❌ Error fetching delivery stats:', error);
    res.status(500).json({ message: 'Error fetching delivery statistics', error: error.message });
  }
};

// Clear completed and failed deliveries
exports.clearCompletedDeliveries = async (req, res) => {
  try {
    const result = await Delivery.deleteMany({
      deliveryStatus: { $in: ['Delivered', 'Failed'] }
    });
    
    console.log(`🧹 Cleared ${result.deletedCount} completed/failed deliveries`);
    
    res.json({
      message: `Successfully cleared ${result.deletedCount} completed deliveries`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('❌ Error clearing deliveries:', error);
    res.status(500).json({ error: 'Failed to clear deliveries' });
  }
};