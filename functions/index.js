// functions/index.js (Javascript)
import * as functions from "firebase-functions";
import axios from "axios";

export const getWeather = functions.https.onRequest(async (request, response) => {
  const apiKey = functions.config().openweather.apikey;
  const { lat, lon } = request.query;

  if (!lat || !lon) {
    response.status(400).send("Missing lat or lon parameters.");
    return;
  }

  try {
    const weatherResponse = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
    );
    response.send(weatherResponse.data);
  } catch (error) {
    console.error("Error fetching weather:", error);
    response.status(500).send("Error fetching weather data.");
  }
});