# Event Registration Pass with QR Code - Implementation Guide

## Overview
This implementation adds automatic PDF event pass generation with QR codes for artist registrations in the KalaaLink project. When an artist successfully registers for an event via Stripe payment, a professional PDF pass is automatically generated and stored.

## Features Added

### 1. PDF Pass Generation Service (`BACKEND/utils/pdfPassGenerator.js`)
- **Professional PDF Layout**: Clean, branded design with KalaaLink logo
- **QR Code Integration**: Unique QR codes containing registration data
- **Event Details**: Event name, artist info, date, venue, registration ID
- **Automatic File Management**: Unique filenames with timestamps
- **Error Handling**: Graceful failure without breaking registration flow

### 2. Enhanced Artist Registration Model (`BACKEND/model/artistRegistration.js`)
- **Registration ID**: Unique identifier for each registration
- **Pass Tracking**: Fields to track PDF generation status and file path
- **Automatic ID Generation**: Self-generating unique registration IDs

### 3. Updated Event Controller (`BACKEND/controllers/eventController.js`)
- **Webhook Integration**: PDF generation in Stripe payment success webhook
- **Fallback Support**: PDF generation in manual registration fallback
- **Download Endpoint**: API endpoint to download generated passes
- **Error Resilience**: PDF generation failures don't break registration

### 4. New API Routes (`BACKEND/routes/eventRoute.js`)
- **Download Route**: `GET /api/events/pass/:registrationId` for downloading passes

## How It Works

### Registration Flow
1. Artist registers for event via frontend
2. Stripe checkout session created with metadata
3. Payment processed successfully
4. Stripe webhook triggers (`checkout.session.completed`)
5. Artist added to event's registered artists list
6. ArtistRegistration record created with unique ID
7. **PDF pass automatically generated** with QR code
8. Pass file path stored in database

### QR Code Contents
The QR code contains JSON data:
```json
{
  "registrationId": "REG-1736532123456-ABC123",
  "artistId": "507f1f77bcf86cd799439012",
  "eventId": "507f1f77bcf86cd799439011",
  "artistEmail": "artist@example.com",
  "eventTitle": "Rhythm & Beats 2025",
  "generatedAt": "2025-01-10T13:34:21.636Z"
}
```

## File Structure
```
BACKEND/
├── passes/                          # Generated PDF storage
│   └── event-pass-REG-*-timestamp.pdf
├── utils/
│   └── pdfPassGenerator.js         # PDF generation service
├── model/
│   └── artistRegistration.js       # Enhanced with pass fields
├── controllers/
│   └── eventController.js         # Updated with PDF generation
└── routes/
    └── eventRoute.js              # Added download route
```

## API Endpoints

### Download Event Pass
```
GET /api/events/pass/:registrationId
```
- Downloads the PDF pass for a specific registration
- Returns 404 if pass not generated or file not found
- Streams PDF file directly to client

## Dependencies Used
- **pdfkit**: PDF generation (already installed)
- **qrcode**: QR code generation (already installed)
- **fs**: File system operations (Node.js built-in)
- **path**: Path utilities (Node.js built-in)

## Error Handling
- PDF generation failures are logged but don't break registration
- File system errors are handled gracefully
- Missing dependencies are caught and logged
- Webhook failures have fallback mechanisms

## Security Considerations
- PDF files are stored locally on server
- Registration IDs are unique and unpredictable
- QR codes contain only necessary data
- File access is controlled through API endpoints

## Future Enhancements
- Email attachment functionality (if EmailJS is configured)
- Pass validation at event entrance
- Bulk pass generation for existing registrations
- Pass template customization
- Cloud storage integration

## Testing
The implementation has been tested and verified to work correctly:
- PDF generation creates professional-looking passes
- QR codes are scannable and contain correct data
- File storage and retrieval works properly
- Integration with existing registration flow is seamless

## Maintenance
- Old PDF files can be cleaned up using the `cleanupOldPasses()` utility
- Monitor disk space in the `passes/` directory
- Consider implementing automatic cleanup based on file age
