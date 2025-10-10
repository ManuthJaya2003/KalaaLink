const Artwork = require('../model/Artwork');

exports.createArtwork = async (req, res) => {
  try {
    const { image, title, artist, summary } = req.body;

    // Debug logging
    console.log('Received artwork data:', { image, title, artist, summary });
    console.log('File info:', req.file);

    // Validate required fields
    if (!image || !title || !artist || !summary) {
      console.log('Validation failed - missing fields:', { 
        hasImage: !!image, 
        hasTitle: !!title, 
        hasArtist: !!artist, 
        hasSummary: !!summary 
      });
      return res.status(400).json({ 
        message: 'All fields (image, title, artist, summary) are required',
        received: { image: !!image, title: !!title, artist: !!artist, summary: !!summary }
      });
    }

    const artwork = new Artwork({
      image,
      title,
      artist,
      summary
    });

    await artwork.save();
    console.log('Artwork saved successfully:', artwork._id);
    res.status(201).json(artwork);
  } catch (error) {
    console.error('Error creating artwork:', error);
    res.status(400).json({ 
      message: 'Invalid data', 
      error: error.message,
      details: error.stack
    });
  }
};

exports.getAllArtworks = async (req, res) => {
  try {
    const artworks = await Artwork.find().sort({ createdAt: -1 });
    res.json(artworks);
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

exports.getArtworkById = async (req, res) => {
  try {
    const artwork = await Artwork.findById(req.params.id);
    if (!artwork) {
      return res.status(404).json({ message: 'Artwork not found' });
    }
    res.json(artwork);
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

exports.updateArtwork = async (req, res) => {
  try {
    const { image, title, artist, summary } = req.body;

    const artwork = await Artwork.findByIdAndUpdate(
      req.params.id,
      { image, title, artist, summary },
      { new: true, runValidators: true }
    );

    if (!artwork) {
      return res.status(404).json({ message: 'Artwork not found' });
    }
    res.json(artwork);
  } catch (error) {
    res.status(400).json({ 
      message: 'Invalid data', 
      error: error.message 
    });
  }
};

exports.deleteArtwork = async (req, res) => {
  try {
    const artwork = await Artwork.findByIdAndDelete(req.params.id);
    if (!artwork) {
      return res.status(404).json({ message: 'Artwork not found' });
    }
    res.json({ message: 'Artwork deleted successfully' });
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};
