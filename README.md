# Weather Map Application

This project is a React application that displays weather data for different locations on an interactive map using React Leaflet. Users can explore weather information by clicking on locations, searching for cities, and enjoying a responsive, dark mode-enabled interface.

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
- Geolocation support with fallback to default location

### Bonus Features
- Search bar to find and center the map on specific cities
- Dark mode toggle with system preference detection
- Persistent dark mode and location preferences via local storage
- Smooth map interactions and animations
- Weather icons from OpenWeatherMap API

## Tech Stack

- **React**: Frontend framework
- **Vite**: Build tool and development server
- **React Leaflet**: Map integration
- **Axios**: API calls
- **CSS**: Styling
- **SweetAlert2**: User notifications
- **Leaflet**: Core mapping library
- **React Router Dom**: Potential future routing

## Project Setup

### Prerequisites
- Node.js (v16+)
- npm or yarn
- An OpenWeatherMap API key (free tier)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/SimanyeSTS/weather-map-app.git
cd weather-map
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory and add your API key:
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

## Assumptions and Design Choices

1. **User Location**
   - The app attempts to get the user's current location on load
   - If geolocation is denied or unavailable, defaults to Cape Town
   - Provides clear error messaging for location services

2. **Local Storage**
   - Stores user preferences like dark mode setting
   - Caches the last selected location and weather data
   - Enhances user experience by maintaining state between sessions

3. **API Interaction**
   - Respects the rate limits of the free tier of OpenWeatherMap API
   - Implements comprehensive error handling for API requests

4. **Responsive Design**
   - Mobile-first approach with adaptive layouts
   - Map and sidebar adjust based on screen size
   - Dark mode support with smooth transitions

5. **Browser Compatibility**
   - Designed for modern browsers with support for ES6+ features
   - Geolocation and localStorage feature detection

## Future Improvements

- Implement more detailed caching mechanisms
- Add comprehensive weather forecasts (hourly, multi-day)
- Implement unit switching (Celsius/Fahrenheit)
- Add weather radar or precipitation overlay
- Enhance accessibility features
- Implement multiple location bookmarking
- Add more detailed error logging
- Optimize performance for larger datasets
- Implement more advanced geolocation fallback strategies
- Add comprehensive internationalization support

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Contact

email: `simanyesomdaka@gmail.com`
LinkedIn: `https://www.linkedin.com/in/simanye-somdaka-6501712b2/`