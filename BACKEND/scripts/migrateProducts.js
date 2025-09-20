const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kalaalink', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const Art = require('../model/Art');

async function migrateProducts() {
  try {
    console.log('🔄 Starting product migration...');
    
    // Find all products that don't have the new fields
    const productsToUpdate = await Art.find({
      $or: [
        { material: { $exists: false } },
        { style: { $exists: false } },
        { frameOption: { $exists: false } }
      ]
    });
    
    console.log(`📦 Found ${productsToUpdate.length} products to migrate`);
    
    if (productsToUpdate.length === 0) {
      console.log('✅ No products need migration');
      return;
    }
    
    // Update each product with default values
    for (const product of productsToUpdate) {
      const updateData = {};
      
      // Set default material based on artType
      if (!product.material) {
        const artType = product.artType.toLowerCase();
        if (artType.includes('photo') || artType.includes('photography')) {
          updateData.material = 'photography';
        } else if (artType.includes('paint') || artType.includes('painting')) {
          updateData.material = 'painting';
        } else if (artType.includes('draw') || artType.includes('drawing')) {
          updateData.material = 'drawing';
        } else if (artType.includes('digital')) {
          updateData.material = 'digital';
        } else if (artType.includes('sculpture')) {
          updateData.material = 'sculpture';
        } else {
          updateData.material = 'mixed media';
        }
      }
      
      // Set default style based on artType
      if (!product.style) {
        const artType = product.artType.toLowerCase();
        if (artType.includes('abstract')) {
          updateData.style = 'abstract';
        } else if (artType.includes('realism') || artType.includes('realistic')) {
          updateData.style = 'realism';
        } else if (artType.includes('modern')) {
          updateData.style = 'modern';
        } else if (artType.includes('traditional')) {
          updateData.style = 'traditional';
        } else if (artType.includes('contemporary')) {
          updateData.style = 'contemporary';
        } else if (artType.includes('minimalist')) {
          updateData.style = 'minimalist';
        } else if (artType.includes('impressionist')) {
          updateData.style = 'impressionist';
        } else {
          updateData.style = 'contemporary';
        }
      }
      
      // Set default frame option based on frameSize
      if (!product.frameOption) {
        const frameSize = product.frameSize.toLowerCase();
        if (frameSize.includes('frame') || frameSize.includes('framed')) {
          updateData.frameOption = 'framed';
        } else if (frameSize.includes('ready') || frameSize.includes('hang')) {
          updateData.frameOption = 'ready-to-hang';
        } else {
          updateData.frameOption = 'unframed';
        }
      }
      
      // Update the product
      await Art.findByIdAndUpdate(product._id, updateData);
      console.log(`✅ Updated product: ${product.artType} - Material: ${updateData.material || product.material}, Style: ${updateData.style || product.style}, Frame: ${updateData.frameOption || product.frameOption}`);
    }
    
    console.log('🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    mongoose.connection.close();
  }
}

migrateProducts();
