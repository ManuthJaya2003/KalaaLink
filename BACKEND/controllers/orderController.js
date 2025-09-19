const Order = require('../model/Order');
const Art = require('../model/Art');
const Delivery = require('../model/Delivery');
const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Get all orders
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('items.productId', 'artType price image')
      .populate('productId', 'artType price')
      .populate('deliveryId', 'customerName')
      .sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
};

// Get orders by customer email
exports.getOrdersByCustomer = async (req, res) => {
  try {
    const { email } = req.params;
    const orders = await Order.find({ customerEmail: email })
      .populate('items.productId', 'artType price image')
      .populate('productId', 'artType price')
      .sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching customer orders', error: error.message });
  }
};

// Create order (legacy support)
exports.createOrder = async (req, res) => {
  try {
    const { productId, quantity, deliveryId, amount } = req.body;
    const order = new Order({ productId, quantity, deliveryId, amount });
    const savedOrder = await order.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(500).json({ message: 'Error creating order', error: error.message });
  }
};

// Create marketplace order with Stripe checkout
exports.createMarketplaceOrder = async (req, res) => {
  try {
    const { 
      items, 
      customerName, 
      customerEmail, 
      customerPhone,
      deliveryAddress,
      useDelivery 
    } = req.body;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Items array is required and cannot be empty' });
    }

    if (!customerName || !customerEmail) {
      return res.status(400).json({ message: 'Customer name and email are required' });
    }

    // Validate and calculate total
    let totalAmount = 0;
    const validatedItems = [];

    for (const item of items) {
      if (!item.productId || !item.quantity || item.quantity < 1) {
        return res.status(400).json({ message: 'Invalid item data' });
      }

      // Get product details
      const product = await Art.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Product with ID ${item.productId} not found` });
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      validatedItems.push({
        productId: product._id,
        quantity: item.quantity,
        price: product.price,
        productName: product.artType,
        productImage: product.image,
      });
    }

    // Create order
    const order = new Order({
      items: validatedItems,
      customerName,
      customerEmail,
      customerPhone,
      deliveryAddress: useDelivery ? deliveryAddress : null,
      useDelivery,
      totalAmount,
      paymentStatus: 'pending',
    });

    console.log('Creating order with data:', {
      items: validatedItems,
      customerName,
      customerEmail,
      totalAmount,
      useDelivery
    });

    const savedOrder = await order.save();
    
    console.log('Order created successfully:', {
      orderId: savedOrder._id,
      itemsCount: savedOrder.items.length,
      totalAmount: savedOrder.totalAmount
    });

    // Create delivery record immediately if delivery is requested
    if (savedOrder.useDelivery && savedOrder.deliveryAddress) {
      console.log('🚚 Creating delivery records for order:', {
        orderId: savedOrder._id,
        useDelivery: savedOrder.useDelivery,
        deliveryAddress: savedOrder.deliveryAddress,
        itemsCount: savedOrder.items.length
      });
      
      try {
        // Create delivery record for each item in the order
        for (const item of savedOrder.items) {
          const delivery = new Delivery({
            artId: item.productId,
            orderId: savedOrder._id, // Link to the order
            customerName: savedOrder.customerName,
            customerEmail: savedOrder.customerEmail,
            address: savedOrder.deliveryAddress.address,
            city: savedOrder.deliveryAddress.city,
            district: savedOrder.deliveryAddress.district,
            postalCode: savedOrder.deliveryAddress.postalCode,
            contactNumber: savedOrder.deliveryAddress.contactNumber,
            coordinates: savedOrder.deliveryAddress.coordinates,
            deliveryStatus: 'Pending',
            quantity: item.quantity,
            productName: item.productName,
            productPrice: item.price
          });
          
          await delivery.save();
          console.log('✅ Delivery record created immediately:', {
            deliveryId: delivery._id,
            orderId: savedOrder._id,
            productName: item.productName,
            customerName: savedOrder.customerName,
            status: 'Pending'
          });
        }
        
        console.log('✅ All delivery records created successfully for order:', savedOrder._id);
      } catch (deliveryError) {
        console.error('❌ Error creating delivery records immediately:', deliveryError);
        console.error('❌ Delivery creation error details:', {
          error: deliveryError.message,
          stack: deliveryError.stack,
          orderId: savedOrder._id,
          useDelivery: savedOrder.useDelivery,
          deliveryAddress: savedOrder.deliveryAddress
        });
        // Don't fail the order creation if delivery creation fails
      }
    } else {
      console.log('⚠️ Delivery creation skipped:', {
        orderId: savedOrder._id,
        useDelivery: savedOrder.useDelivery,
        hasDeliveryAddress: !!savedOrder.deliveryAddress
      });
    }

    // Create Stripe checkout session
    const lineItems = validatedItems.map(item => ({
      price_data: {
        currency: 'lkr',
        product_data: {
          name: item.productName,
          description: `Quantity: ${item.quantity}`,
          images: item.productImage ? [item.productImage] : [],
        },
        unit_amount: Math.round(item.price * 100), // Convert to cents
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/order-confirmation?orderId=${savedOrder._id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/marketplace?payment=cancelled`,
      metadata: {
        orderId: savedOrder._id.toString(),
        customerEmail,
        customerName,
        totalAmount: totalAmount.toString(),
      },
      customer_email: customerEmail,
    });

    // Update order with Stripe session ID
    savedOrder.stripeSessionId = session.id;
    await savedOrder.save();

    res.status(200).json({
      orderId: savedOrder._id,
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Error creating marketplace order:', error);
    res.status(500).json({ message: 'Error creating order', error: error.message });
  }
};

// Handle Stripe webhook for marketplace orders
exports.handleStripeWebhook = async (req, res) => {
  console.log('🔔 Webhook received:', {
    timestamp: new Date().toISOString(),
    headers: req.headers,
    bodyLength: req.body ? req.body.length : 0
  });

  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  console.log('🔑 Webhook configuration:', {
    hasSignature: !!sig,
    hasEndpointSecret: !!endpointSecret,
    endpointSecretLength: endpointSecret ? endpointSecret.length : 0
  });

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    console.log('✅ Webhook signature verified successfully');
    console.log('📋 Event type:', event.type);
    console.log('📋 Event ID:', event.id);
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', {
      error: err.message,
      signature: sig,
      hasBody: !!req.body
    });
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle different event types
  console.log('🔄 Processing event type:', event.type);

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    console.log('💳 Checkout session completed:', {
      sessionId: session.id,
      paymentStatus: session.payment_status,
      metadata: session.metadata
    });
    
    try {
      const orderId = session.metadata?.orderId;
      
      if (!orderId) {
        console.error('❌ No orderId found in session metadata:', session.metadata);
        return res.status(400).json({ error: 'No orderId in session metadata' });
      }

      console.log('🔍 Looking for order:', orderId);
      const order = await Order.findById(orderId);
      
      if (!order) {
        console.error('❌ Order not found:', orderId);
        return res.status(404).json({ error: 'Order not found' });
      }

      console.log('📦 Found order:', {
        orderId: order._id,
        currentStatus: order.paymentStatus,
        currentOrderStatus: order.status
      });

      // Update order status
      order.paymentStatus = 'paid';
      order.stripePaymentIntentId = session.payment_intent;
      order.paidAt = new Date();
      order.status = 'Processing';
      
      await order.save();
      
      // Create delivery record if delivery is requested and not already created
      if (order.useDelivery && order.deliveryAddress) {
        try {
          // Check if deliveries already exist for this order
          const existingDeliveries = await Delivery.find({ orderId: order._id });
          
          if (existingDeliveries.length === 0) {
            // Create delivery record for each item in the order
            for (const item of order.items) {
              const delivery = new Delivery({
                artId: item.productId,
                orderId: order._id, // Link to the order
                customerName: order.customerName,
                customerEmail: order.customerEmail,
                address: order.deliveryAddress.address,
                city: order.deliveryAddress.city,
                district: order.deliveryAddress.district,
                postalCode: order.deliveryAddress.postalCode,
                contactNumber: order.deliveryAddress.contactNumber,
                coordinates: order.deliveryAddress.coordinates,
                deliveryStatus: 'Pending',
                quantity: item.quantity,
                productName: item.productName,
                productPrice: item.price
              });
              
              await delivery.save();
              console.log('✅ Delivery record created on payment confirmation:', {
                deliveryId: delivery._id,
                orderId: order._id,
                productName: item.productName,
                customerName: order.customerName
              });
            }
          } else {
            console.log('✅ Delivery records already exist for order:', order._id);
          }
        } catch (deliveryError) {
          console.error('❌ Error creating delivery records:', deliveryError);
          // Don't fail the order update if delivery creation fails
        }
      }
      
      console.log('✅ Marketplace order updated successfully:', {
        orderId: order._id,
        newPaymentStatus: order.paymentStatus,
        newOrderStatus: order.status,
        paidAt: order.paidAt,
        deliveryCreated: order.useDelivery && order.deliveryAddress
      });

      return res.status(200).json({ 
        success: true, 
        message: `Order ${orderId} marked as paid`,
        orderId: orderId
      });
    } catch (error) {
      console.error('❌ Error updating marketplace order status:', {
        error: error.message,
        stack: error.stack,
        orderId: session.metadata?.orderId
      });
      return res.status(500).json({ 
        error: 'Error updating order status',
        details: error.message 
      });
    }
  } else if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    console.log('💳 Payment intent succeeded:', {
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      metadata: paymentIntent.metadata
    });
    
    // Handle payment intent success - find order by payment intent ID
    try {
      const order = await Order.findOne({ stripePaymentIntentId: paymentIntent.id });
      if (order && order.paymentStatus !== 'paid') {
        order.paymentStatus = 'paid';
        order.paidAt = new Date();
        order.status = 'Processing';
        await order.save();
        
        console.log('✅ Order updated via payment_intent.succeeded:', {
          orderId: order._id,
          paymentIntentId: paymentIntent.id
        });
      }
    } catch (error) {
      console.error('❌ Error updating order via payment_intent.succeeded:', error);
    }
  } else if (event.type === 'payment_intent.payment_failed') {
    const paymentIntent = event.data.object;
    console.log('❌ Payment intent failed:', {
      paymentIntentId: paymentIntent.id,
      lastPaymentError: paymentIntent.last_payment_error
    });
    
    // Handle payment failure
    try {
      const order = await Order.findOne({ stripePaymentIntentId: paymentIntent.id });
      if (order) {
        order.paymentStatus = 'failed';
        order.status = 'Cancelled';
        await order.save();
        
        console.log('❌ Order marked as failed:', {
          orderId: order._id,
          paymentIntentId: paymentIntent.id
        });
      }
    } catch (error) {
      console.error('❌ Error updating order via payment_intent.payment_failed:', error);
    }
  } else if (event.type === 'checkout.session.expired') {
    const session = event.data.object;
    console.log('⏰ Checkout session expired:', session.id);
    
    // Handle expired sessions
    try {
      const orderId = session.metadata?.orderId;
      if (orderId) {
        const order = await Order.findById(orderId);
        if (order && order.paymentStatus === 'pending') {
          order.paymentStatus = 'cancelled';
          order.status = 'Cancelled';
          await order.save();
          
          console.log('⏰ Order marked as cancelled due to expired session:', orderId);
        }
      }
    } catch (error) {
      console.error('❌ Error updating order via checkout.session.expired:', error);
    }
  } else {
    console.log('ℹ️ Unhandled event type:', event.type);
  }

  res.status(200).json({ received: true, eventType: event.type });
};

// Get order by ID
exports.getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId)
      .populate('items.productId', 'artType price image artistName')
      .populate('productId', 'artType price');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching order', error: error.message });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json({ message: 'Order status updated successfully', order });
  } catch (error) {
    res.status(500).json({ message: 'Error updating order status', error: error.message });
  }
};

// Test payment confirmation endpoint (for debugging)
exports.testPaymentConfirmation = async (req, res) => {
  try {
    console.log('🧪 Testing payment confirmation endpoint');
    
    // Get a sample order for testing
    const sampleOrder = await Order.findOne({ paymentStatus: 'pending' });
    
    if (!sampleOrder) {
      return res.status(404).json({
        success: false,
        message: 'No pending orders found for testing'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Payment confirmation endpoint is working',
      testOrder: {
        id: sampleOrder._id,
        currentStatus: sampleOrder.paymentStatus,
        totalAmount: sampleOrder.totalAmount || sampleOrder.amount
      },
      instructions: {
        endpoint: 'POST /api/orders/confirm-payment',
        body: {
          orderId: 'order_id_here',
          sessionId: 'stripe_session_id_here (optional)'
        }
      }
    });
  } catch (error) {
    console.error('❌ Error in test payment confirmation:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Test webhook endpoint (for debugging)
exports.testWebhook = async (req, res) => {
  try {
    console.log('🧪 Webhook test endpoint called');
    console.log('📋 Request headers:', req.headers);
    console.log('📋 Request body length:', req.body ? req.body.length : 0);
    
    res.status(200).json({
      success: true,
      message: 'Webhook endpoint is working',
      timestamp: new Date().toISOString(),
      hasWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
      webhookSecretLength: process.env.STRIPE_WEBHOOK_SECRET ? process.env.STRIPE_WEBHOOK_SECRET.length : 0
    });
  } catch (error) {
    console.error('❌ Error in webhook test:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Confirm order payment (similar to event booking system)
exports.confirmOrderPayment = async (req, res) => {
  try {
    const { orderId, sessionId } = req.body;

    console.log('🔍 Confirming order payment:', { orderId, sessionId });

    if (!orderId) {
      return res.status(400).json({ message: 'Order ID is required' });
    }

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // If sessionId is provided, verify payment with Stripe
    if (sessionId) {
      try {
        console.log('🔍 Verifying payment with Stripe for session:', sessionId);
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        
        console.log('📋 Stripe session status:', {
          sessionId: session.id,
          paymentStatus: session.payment_status,
          status: session.status
        });

        if (session.payment_status === 'paid' && session.status === 'complete') {
          // Payment is confirmed by Stripe
          order.paymentStatus = 'paid';
          order.stripePaymentIntentId = session.payment_intent;
          order.paidAt = new Date();
          order.status = 'Processing';
          
          await order.save();
          
          // Create delivery record if delivery is requested and not already created
          if (order.useDelivery && order.deliveryAddress) {
            try {
              // Check if deliveries already exist for this order
              const existingDeliveries = await Delivery.find({ orderId: order._id });
              
              if (existingDeliveries.length === 0) {
                // Create delivery record for each item in the order
                for (const item of order.items) {
                  const delivery = new Delivery({
                    artId: item.productId,
                    orderId: order._id, // Link to the order
                    customerName: order.customerName,
                    customerEmail: order.customerEmail,
                    address: order.deliveryAddress.address,
                    city: order.deliveryAddress.city,
                    district: order.deliveryAddress.district,
                    postalCode: order.deliveryAddress.postalCode,
                    contactNumber: order.deliveryAddress.contactNumber,
                    coordinates: order.deliveryAddress.coordinates,
                    deliveryStatus: 'Pending',
                    quantity: item.quantity,
                    productName: item.productName,
                    productPrice: item.price
                  });
                  
                  await delivery.save();
                  console.log('✅ Delivery record created via payment confirmation:', {
                    deliveryId: delivery._id,
                    orderId: order._id,
                    productName: item.productName,
                    customerName: order.customerName
                  });
                }
              } else {
                console.log('✅ Delivery records already exist for order:', order._id);
              }
            } catch (deliveryError) {
              console.error('❌ Error creating delivery records via payment confirmation:', deliveryError);
              // Don't fail the order update if delivery creation fails
            }
          }
          
          console.log('✅ Order payment confirmed via Stripe verification:', {
            orderId: order._id,
            sessionId: session.id,
            paymentIntentId: session.payment_intent
          });

          return res.status(200).json({
            success: true,
            message: 'Order payment confirmed successfully',
            order: {
              _id: order._id,
              paymentStatus: order.paymentStatus,
              status: order.status,
              paidAt: order.paidAt
            }
          });
        } else {
          console.log('❌ Payment not completed in Stripe session:', {
            sessionId: session.id,
            paymentStatus: session.payment_status,
            status: session.status
          });
          
          return res.status(400).json({
            success: false,
            message: 'Payment not completed',
            paymentStatus: session.payment_status,
            sessionStatus: session.status
          });
        }
      } catch (stripeError) {
        console.error('❌ Error verifying payment with Stripe:', stripeError);
        return res.status(500).json({
          success: false,
          message: 'Error verifying payment with Stripe',
          error: stripeError.message
        });
      }
    } else {
      // Manual confirmation without Stripe verification
      if (order.paymentStatus === 'paid') {
        return res.status(400).json({ message: 'Order is already paid' });
      }

      order.paymentStatus = 'paid';
      order.paidAt = new Date();
      order.status = 'Processing';
      
      await order.save();
      
      // Create delivery record if delivery is requested and not already created
      if (order.useDelivery && order.deliveryAddress) {
        try {
          // Check if deliveries already exist for this order
          const existingDeliveries = await Delivery.find({ orderId: order._id });
          
          if (existingDeliveries.length === 0) {
            // Create delivery record for each item in the order
            for (const item of order.items) {
              const delivery = new Delivery({
                artId: item.productId,
                orderId: order._id, // Link to the order
                customerName: order.customerName,
                customerEmail: order.customerEmail,
                address: order.deliveryAddress.address,
                city: order.deliveryAddress.city,
                district: order.deliveryAddress.district,
                postalCode: order.deliveryAddress.postalCode,
                contactNumber: order.deliveryAddress.contactNumber,
                coordinates: order.deliveryAddress.coordinates,
                deliveryStatus: 'Pending',
                quantity: item.quantity,
                productName: item.productName,
                productPrice: item.price
              });
              
              await delivery.save();
              console.log('✅ Delivery record created via manual payment confirmation:', {
                deliveryId: delivery._id,
                orderId: order._id,
                productName: item.productName,
                customerName: order.customerName
              });
            }
          } else {
            console.log('✅ Delivery records already exist for order:', order._id);
          }
        } catch (deliveryError) {
          console.error('❌ Error creating delivery records via manual payment confirmation:', deliveryError);
          // Don't fail the order update if delivery creation fails
        }
      }
      
      console.log('✅ Order payment manually confirmed:', {
        orderId: order._id,
        paymentStatus: order.paymentStatus
      });

      return res.status(200).json({
        success: true,
        message: 'Order payment confirmed manually',
        order: {
          _id: order._id,
          paymentStatus: order.paymentStatus,
          status: order.status,
          paidAt: order.paidAt
        }
      });
    }
  } catch (error) {
    console.error('❌ Error in confirmOrderPayment:', error);
    res.status(500).json({
      success: false,
      message: 'Error confirming order payment',
      error: error.message
    });
  }
};

// Manual payment status update (for testing and emergency use)
exports.manualUpdatePaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { paymentStatus, reason } = req.body;

    console.log('🔧 Manual payment status update:', {
      orderId,
      paymentStatus,
      reason,
      timestamp: new Date().toISOString()
    });

    if (!orderId) {
      return res.status(400).json({ message: 'Order ID is required' });
    }

    if (!paymentStatus || !['paid', 'pending', 'failed', 'cancelled', 'refunded'].includes(paymentStatus)) {
      return res.status(400).json({ 
        message: 'Valid payment status is required (paid, pending, failed, cancelled, refunded)' 
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const previousStatus = order.paymentStatus;
    
    // Update payment status
    order.paymentStatus = paymentStatus;
    
    // Set additional fields based on status
    if (paymentStatus === 'paid') {
      order.paidAt = new Date();
      order.status = 'Processing';
      
      // Create delivery record if delivery is requested and order wasn't already paid
      if (previousStatus !== 'paid' && order.useDelivery && order.deliveryAddress) {
        try {
          // Check if deliveries already exist for this order
          const existingDeliveries = await Delivery.find({ orderId: order._id });
          
          if (existingDeliveries.length === 0) {
            // Create delivery record for each item in the order
            for (const item of order.items) {
              const delivery = new Delivery({
                artId: item.productId,
                orderId: order._id, // Link to the order
                customerName: order.customerName,
                customerEmail: order.customerEmail,
                address: order.deliveryAddress.address,
                city: order.deliveryAddress.city,
                district: order.deliveryAddress.district,
                postalCode: order.deliveryAddress.postalCode,
                contactNumber: order.deliveryAddress.contactNumber,
                coordinates: order.deliveryAddress.coordinates,
                deliveryStatus: 'Pending',
                quantity: item.quantity,
                productName: item.productName,
                productPrice: item.price
              });
              
              await delivery.save();
              console.log('✅ Delivery record created via manual payment status update:', {
                deliveryId: delivery._id,
                orderId: order._id,
                productName: item.productName,
                customerName: order.customerName
              });
            }
          } else {
            console.log('✅ Delivery records already exist for order:', order._id);
          }
        } catch (deliveryError) {
          console.error('❌ Error creating delivery records via manual payment status update:', deliveryError);
          // Don't fail the order update if delivery creation fails
        }
      }
    } else if (paymentStatus === 'failed' || paymentStatus === 'cancelled') {
      order.status = 'Cancelled';
    }

    await order.save();

    console.log('✅ Manual payment status update successful:', {
      orderId: order._id,
      previousStatus,
      newStatus: order.paymentStatus,
      reason: reason || 'Manual update'
    });

    res.status(200).json({ 
      message: 'Payment status updated successfully', 
      order: {
        _id: order._id,
        paymentStatus: order.paymentStatus,
        status: order.status,
        paidAt: order.paidAt,
        previousStatus
      }
    });
  } catch (error) {
    console.error('❌ Error in manual payment status update:', error);
    res.status(500).json({ 
      message: 'Error updating payment status', 
      error: error.message 
    });
  }
};