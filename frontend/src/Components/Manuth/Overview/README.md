# Artist Manager Dashboard - Overview Component

## Overview

The Overview component provides a comprehensive dashboard for artist managers to monitor key metrics and recent bookings. It includes real-time data updates, interactive elements, and a clean, modern UI design.

## Features

### Overview Cards
- **Total Revenue**: Displays sum of all booking payments (from Stripe)
- **Total Artists**: Shows count of registered artists
- **Pending**: Number of bookings with "pending" status
- **Rejected**: Number of bookings with "rejected" status

### Recent Bookings Table
- Shows the 5 most recent bookings
- Columns: Customer, Artist Booked, Date, Status
- Clickable rows for future navigation to booking details
- Status badges with color coding

### Real-time Updates
- Automatic data refresh every 10 seconds
- WebSocket-ready architecture for future implementation
- Error handling with fallback to mock data

### Report Generation
- "Generate Report" button for PDF export
- Integrates with backend API for report generation
- Uses jsPDF library (already included in dependencies)

## API Endpoints

### Backend Routes
- `GET /api/dashboard/overview?artistId=<id>` - Fetch overview statistics
- `GET /api/dashboard/recent-bookings?artistId=<id>&limit=5` - Fetch recent bookings
- `POST /api/dashboard/reports/generate` - Generate dashboard report

### Data Structure

#### Overview Data
```json
{
  "totalRevenue": 12500,
  "totalArtists": 24,
  "pending": 8,
  "rejected": 3
}
```

#### Booking Data
```json
{
  "id": "booking_id",
  "customer": "Customer Name",
  "artistBooked": "Artist Name",
  "date": "2024-01-15",
  "status": "confirmed"
}
```

## Components

### OverviewCard
Reusable component for displaying metric cards with:
- Icon emoji
- Title and value
- Description text
- Color-coded themes
- Hover effects

### Main Overview Component
- State management with React hooks
- API integration with axios
- Error handling and loading states
- Responsive design

## Styling

### Design System
- Off-white background (`#f8fafc`)
- Bold black headings
- Muted description text
- Purple "Generate Report" button
- Soft shadows and rounded corners
- Pastel color scheme for cards

### Responsive Design
- Mobile-first approach
- Grid layout for overview cards
- Responsive table design
- Touch-friendly interactions

## Usage

1. **Import the component**:
   ```jsx
   import Overview from './Components/Manuth/Overview/Overview';
   ```

2. **Add to your routes**:
   ```jsx
   <Route path="/overview" element={<Overview />} />
   ```

3. **Ensure backend is running** on port 5000

4. **Update artist ID** in the component (currently set to mock value)

## Future Enhancements

- WebSocket integration for real-time updates
- Advanced filtering and search
- Export to multiple formats (CSV, Excel)
- Interactive charts and graphs
- User preferences and customization
- Multi-language support

## Dependencies

- React 19.1.1+
- Axios for API calls
- jsPDF for report generation
- CSS modules for styling

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile responsive
- Progressive enhancement approach
