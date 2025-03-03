# Weather Map Application

This project is a React application that displays weather data for different locations on a map using React Leaflet. Users can interact with the map, select a location, and view relevant weather details fetched from the OpenWeatherMap API.

## Features

### Core Features
- Interactive world map using React Leaflet
- Click on any location to get weather data
- View detailed weather information in a sidebar:
  - Location name
  - Temperature in Celsius
  - Weather description
  - Humidity
  - Wind speed
- Clean and responsive layout
- Error handling with user-friendly messages

### Bonus Features
- Search bar to find and center the map on specific cities
- Dark mode toggle
- Weather icons from OpenWeatherMap API

## Tech Stack

- **React**: Frontend framework
- **Vite**: Build tool and development server
- **React Leaflet**: Map integration
- **Axios**: API calls
- **Sass**: Styling
- **React Router Dom**: For potential future routing

## Project Setup

### Prerequisites
- Node.js (v16+)
- npm or yarn
- An OpenWeatherMap API key (free tier)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/weather-map.git
cd weather-map
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add your API key:
```
VITE_OPENWEATHER_API_KEY=your_openweathermap_api_key_here
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:5173`

## Building for Production

To create a production build:

```bash
npm run build
```

The build files will be in the `dist` directory.

## Assumptions Made

1. **User Location**: The app attempts to get the user's current location on load to center the map. If permission is denied or unavailable, a default location (Cape Town) is used.

2. **API Limits**: The application respects the rate limits of the free tier of OpenWeatherMap API.

3. **Modern Browser Support**: The application is designed for modern browsers with support for ES6+ features.

4. **Mobile Responsiveness**: The layout adapts for mobile devices with the map taking priority and the sidebar appearing below on smaller screens.

## Future Improvements

- Add caching of weather data to reduce API calls
- Implement more detailed forecasts (hourly, 5-day)
- Add unit switching (Celsius/Fahrenheit)
- Add weather radar or precipitation overlay
- Improve accessibility features
- Add multiple location bookmarking