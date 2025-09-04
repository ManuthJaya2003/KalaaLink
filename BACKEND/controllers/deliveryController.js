const Delivery = require('../model/Delivery');
const Art = require('../model/Art');

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
    const deliveries = await Delivery.find().populate('artId', 'artType price');
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