const Art = require('../model/Art');

exports.createArt = async (req, res) => {
  try {
    let { size, artistName, frameSize, colorPalette, artType, price, material, style, frameOption } = req.body;
    const imageUrl = req.body.imageUrl;

    // Parse colorPalette correctly
    if (typeof colorPalette === 'string') {
      try {
        colorPalette = JSON.parse(colorPalette); // if sent as JSON string
      } catch {
        colorPalette = colorPalette.split(',').map(c => c.trim()).filter(Boolean);
      }
    }

    if (!Array.isArray(colorPalette) || colorPalette.length === 0) {
      return res.status(400).json({ message: 'colorPalette must be a non-empty array' });
    }

    const art = new Art({
      size,
      artistName,
      frameSize,
      colorPalette,
      artType,
      price: Number(price),
      material,
      style,
      frameOption,
      image: imageUrl,
    });

    await art.save();
    res.status(201).json(art);
  } catch (error) {
    res.status(400).json({ message: 'Invalid data', error: error.message });
  }
};

exports.getAllArts = async (req, res) => {
  try {
    const arts = await Art.find();
    res.json(arts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getArtById = async (req, res) => {
  try {
    const art = await Art.findById(req.params.id);
    if (!art) return res.status(404).json({ message: 'Art not found' });
    res.json(art);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateArt = async (req, res) => {
  try {
    let { size, artistName, frameSize, colorPalette, artType, price, material, style, frameOption } = req.body;
    const imageUrl = req.body.imageUrl;

    if (typeof colorPalette === 'string') {
      try {
        colorPalette = JSON.parse(colorPalette);
      } catch {
        colorPalette = colorPalette.split(',').map(c => c.trim()).filter(Boolean);
      }
    }

    const art = await Art.findByIdAndUpdate(
      req.params.id,
      { size, artistName, frameSize, colorPalette, artType, price: Number(price), material, style, frameOption, image: imageUrl },
      { new: true, runValidators: true }
    );

    if (!art) return res.status(404).json({ message: 'Art not found' });
    res.json(art);
  } catch (error) {
    res.status(400).json({ message: 'Invalid data', error: error.message });
  }
};

exports.deleteArt = async (req, res) => {
  try {
    const art = await Art.findByIdAndDelete(req.params.id);
    if (!art) return res.status(404).json({ message: 'Art not found' });
    res.json({ message: 'Art deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
