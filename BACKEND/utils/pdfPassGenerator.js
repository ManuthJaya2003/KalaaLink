const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generate an event registration pass PDF
 * @param {Object} registrationData - Registration data
 * @param {string} registrationData.eventTitle - Event title
 * @param {string} registrationData.artistName - Artist name
 * @param {string} registrationData.artistEmail - Artist email
 * @param {string} registrationData.eventDate - Event date
 * @param {string} registrationData.eventVenue - Event venue
 * @param {string} registrationData.registrationId - Registration ID (from ArtistRegistration model)
 * @param {string} registrationData.eventId - Event ID
 * @param {string} registrationData.artistId - Artist ID
 * @returns {Promise<string>} - Path to the generated PDF file
 */
const generateEventPassPDF = async (registrationData) => {
  try {
    const {
      eventTitle,
      artistName,
      artistEmail,
      eventDate,
      eventVenue,
      registrationId,
      eventId,
      artistId
    } = registrationData;

    // Create PDF document
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
      info: {
        Title: `Event Pass - ${eventTitle}`,
        Author: 'KalaaLink',
        Subject: 'Event Registration Pass'
      }
    });

    // Generate unique filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `event-pass-${registrationId || artistId}-${timestamp}.pdf`;
    const filepath = path.join(__dirname, '..', 'passes', filename);

    // Pipe PDF to file
    doc.pipe(fs.createWriteStream(filepath));


    // Header with KalaaLink branding
    doc.fontSize(24)
       .fillColor('#2c3e50')
       .text('KalaaLink', 50, 50, { align: 'center' });

    doc.fontSize(16)
       .fillColor('#7f8c8d')
       .text('Event Registration Pass', 50, 80, { align: 'center' });

    // Add a decorative line
    doc.strokeColor('#3498db')
       .lineWidth(3)
       .moveTo(50, 110)
       .lineTo(545, 110)
       .stroke();

    // Event details section
    doc.fontSize(20)
       .fillColor('#2c3e50')
       .text(eventTitle, 50, 140, { align: 'center' });

    doc.fontSize(14)
       .fillColor('#34495e')
       .text(`Artist: ${artistName}`, 50, 180)
       .text(`Email: ${artistEmail}`, 50, 200)
       .text(`Event Date: ${new Date(eventDate).toLocaleDateString('en-US', {
         weekday: 'long',
         year: 'numeric',
         month: 'long',
         day: 'numeric'
       })}`, 50, 220)
       .text(`Venue: ${eventVenue}`, 50, 240);

    // Registration details
    doc.fontSize(12)
       .fillColor('#7f8c8d')
       .text(`Registration ID: ${registrationId || 'N/A'}`, 50, 280)
       .text(`Generated: ${new Date().toLocaleDateString('en-US', {
         year: 'numeric',
         month: 'long',
         day: 'numeric',
         hour: '2-digit',
         minute: '2-digit'
       })}`, 50, 300);


    // Footer message
    doc.fontSize(14)
       .fillColor('#27ae60')
       .text('Thank you for registering!', 50, 400, { align: 'center' });

    doc.fontSize(12)
       .fillColor('#7f8c8d')
       .text('Please present this pass at the event entrance', 50, 420, { align: 'center' });

    // Add some decorative elements
    doc.strokeColor('#e74c3c')
       .lineWidth(2)
       .moveTo(50, 460)
       .lineTo(545, 460)
       .stroke();

    doc.fontSize(10)
       .fillColor('#95a5a6')
       .text('KalaaLink - Connecting Artists & Audiences', 50, 480, { align: 'center' });

    // Finalize PDF
    doc.end();

    // Wait for PDF to be written
    return new Promise((resolve, reject) => {
      doc.on('end', () => {
        console.log(`✅ Event pass PDF generated: ${filename}`);
        resolve(filepath);
      });
      
      doc.on('error', (err) => {
        console.error('Error generating PDF:', err);
        reject(err);
      });
    });

  } catch (error) {
    console.error('Error in generateEventPassPDF:', error);
    throw error;
  }
};

/**
 * Clean up old PDF files (optional utility)
 * @param {number} maxAgeHours - Maximum age of files in hours (default: 24)
 */
const cleanupOldPasses = (maxAgeHours = 24) => {
  try {
    const passesDir = path.join(__dirname, '..', 'passes');
    const files = fs.readdirSync(passesDir);
    const now = Date.now();
    const maxAge = maxAgeHours * 60 * 60 * 1000; // Convert to milliseconds

    files.forEach(file => {
      if (file.endsWith('.pdf')) {
        const filePath = path.join(passesDir, file);
        const stats = fs.statSync(filePath);
        const fileAge = now - stats.mtime.getTime();

        if (fileAge > maxAge) {
          fs.unlinkSync(filePath);
          console.log(`🗑️ Cleaned up old pass: ${file}`);
        }
      }
    });
  } catch (error) {
    console.error('Error cleaning up old passes:', error);
  }
};

module.exports = {
  generateEventPassPDF,
  cleanupOldPasses
};
