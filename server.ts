import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini AI
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// API endpoint for weather-based planning recommendations
app.post("/api/recommendations", async (req, res) => {
  try {
    const { city, current, daily, unit } = req.body;

    if (!city || !current || !daily) {
      return res.status(400).json({ error: "Missing required weather parameters" });
    }

    const prompt = `
      Provide highly tailored activity and apparel planning recommendations for a person staying in ${city}.
      Here is the weather data:
      - Current Temperature: ${current.temp}°${unit}
      - Feels Like Temperature: ${current.feels_like}°${unit}
      - Weather Code: ${current.weather_code} (Description: ${current.description})
      - Humidity: ${current.humidity}%
      - Wind Speed: ${current.wind_speed} km/h
      - Precipitation: ${current.precipitation} mm
      
      7-Day Forecast Overview:
      ${daily.map((day: any, idx: number) => `
        - Day ${idx + 1}: Max Temp ${day.max_temp}°${unit}, Min Temp ${day.min_temp}°${unit}, Weather Code ${day.weather_code} (${day.description}), UV Index Max: ${day.uv_index ?? "N/A"}
      `).join("\n")}
    `;

    try {
      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are an expert meteorological intelligence assistant. Analyze weather conditions and give highly structured, accurate, and helpful apparel, activity, and safety planning suggestions. Be specific about the UV index, wind speed, precipitation, and temperature levels provided. Do not use generic answers, tailor specifically to the given data.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              outfitSuggestion: { type: Type.STRING, description: "Clothing recommendation for the day (e.g. what to wear, layering, shoe type, accessories like sunglasses, hats, or umbrellas)." },
              advisory: { type: Type.STRING, description: "Safety/comfort advice (e.g. sunscreen requirements, hydration, high wind alerts, rain precautions, pollen level, or storm advice)." },
              hourlyPlanningTips: { type: Type.STRING, description: "Advice on optimal times of day to do activities based on the weather conditions (e.g., jog in the morning to avoid UV peak, do indoor activities between 1PM-4PM)." },
              activities: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    activity: { type: Type.STRING, description: "Name of the activity (e.g. Running, Sightseeing, Swimming, Outdoor dining, Hiking)." },
                    suitability: { type: Type.STRING, description: "Must be one of: 'Highly Suitable', 'Suitable', or 'Poor'" },
                    reason: { type: Type.STRING, description: "Contextual explanation based on the weather factors like temperature, wind, rain, and UV index." }
                  },
                  required: ["activity", "suitability", "reason"]
                }
              }
            },
            required: ["outfitSuggestion", "advisory", "hourlyPlanningTips", "activities"]
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Empty response from Gemini AI");
      }

      const recommendationData = JSON.parse(responseText.trim());
      return res.json(recommendationData);
    } catch (apiError: any) {
      console.warn("Gemini API call failed, generating fallback recommendations:", apiError.message);
      
      // Fallback rule-based recommendation generator when Gemini is not available or errors
      const fallback = generateFallbackRecommendations(current, daily, unit);
      return res.json(fallback);
    }
  } catch (error: any) {
    console.error("Server error in recommendations:", error);
    res.status(500).json({ error: "Failed to process planning recommendations", details: error.message });
  }
});

// Helper function to provide high-quality rule-based fallback recommendations
function generateFallbackRecommendations(current: any, daily: any, unit: string) {
  const temp = current.temp;
  const isCelsius = unit === "C";
  const tCelsius = isCelsius ? temp : ((temp - 32) * 5) / 9;
  
  let outfitSuggestion = "Wear comfortable clothing suitable for moderate weather.";
  let advisory = "Always check local alerts and stay safe.";
  let hourlyPlanningTips = "Plan your outdoor activities during daylight hours and avoid extreme temperatures.";
  
  const activities = [
    { activity: "Running/Jogging", suitability: "Suitable", reason: "Temperature and wind are favorable." },
    { activity: "Sightseeing", suitability: "Suitable", reason: "Good weather for discovering the city." },
    { activity: "Outdoor Dining", suitability: "Suitable", reason: "Pleasant environment for dining outside." },
    { activity: "Hiking", suitability: "Suitable", reason: "Clear terrain conditions predicted." }
  ];

  // Tailor based on temperature
  if (tCelsius > 30) {
    outfitSuggestion = "Wear extremely light, breathable clothing, sunglasses, and a wide-brimmed hat. Light colors are recommended to reflect heat.";
    advisory = "High temperatures! Drink plenty of water (hydration alert), apply sunscreen (SPF 50), and seek shade during peak sun hours.";
    hourlyPlanningTips = "Schedule any strenuous physical activities for the early morning (before 8 AM) or late evening (after 7 PM) when temperatures are cooler.";
    
    activities[0] = { activity: "Running/Jogging", suitability: "Poor", reason: "Extreme heat creates a risk of dehydration and heat exhaustion." };
    activities[2] = { activity: "Outdoor Dining", suitability: "Suitable", reason: "Only in shaded or air-conditioned outdoor areas." };
    activities[3] = { activity: "Hiking", suitability: "Poor", reason: "Avoid intense outdoor hiking to prevent heat strokes." };
  } else if (tCelsius < 10) {
    outfitSuggestion = "Dress in warm layers: a heavy coat, scarf, gloves, and insulated boots.";
    advisory = "Cold conditions! Keep extremities warm to prevent chills. Ensure you have warm fluids accessible.";
    hourlyPlanningTips = "Stick to midday hours (11 AM to 3 PM) for any outdoor walks to capture maximum warmth and sunshine.";
    
    activities[0] = { activity: "Running/Jogging", suitability: "Suitable", reason: "Invigorating, but warm up extensively and wear thermals." };
    activities[2] = { activity: "Outdoor Dining", suitability: "Poor", reason: "Too cold for sitting comfortably outdoors." };
    activities[3] = { activity: "Hiking", suitability: "Suitable", reason: "Great with correct thermal gearing, check for icy patches." };
  } else if (tCelsius >= 18 && tCelsius <= 26) {
    outfitSuggestion = "Perfect weather for a light t-shirt, jeans, and comfortable walking shoes. Bring sunglasses!";
    advisory = "Excellent weather. Moderate UV index. SPF 30 recommended for extended sun exposure.";
    hourlyPlanningTips = "The entire day is beautiful for outdoors. Mid-afternoon is exceptionally pleasant.";
    
    activities[0] = { activity: "Running/Jogging", suitability: "Highly Suitable", reason: "Perfect temperature range for cardiovascular exercise." };
    activities[1] = { activity: "Sightseeing", suitability: "Highly Suitable", reason: "Delightful mild weather for exploring streets and parks." };
    activities[2] = { activity: "Outdoor Dining", suitability: "Highly Suitable", reason: "Absolutely beautiful conditions to dine patio-style." };
    activities[3] = { activity: "Hiking", suitability: "Highly Suitable", reason: "Clear trails and comfortable temperatures." };
  }

  // Tailor based on precipitation/rain
  if (current.precipitation > 0 || current.weather_code >= 51) {
    outfitSuggestion = "Wear a waterproof jacket or raincoat with a hood, water-resistant shoes, and carry a sturdy umbrella.";
    advisory = "Rainy conditions! Roadways may be slippery. Watch out for puddles and splash areas.";
    hourlyPlanningTips = "Prioritize indoor activities (museums, cafes, shopping centers). If you must go outside, look for break windows in precipitation.";
    
    activities[0] = { activity: "Running/Jogging", suitability: "Poor", reason: "Wet trails and poor traction create injury hazards." };
    activities[1] = { activity: "Sightseeing", suitability: "Suitable", reason: "Focus on indoor monuments or carry full waterproof cover." };
    activities[2] = { activity: "Outdoor Dining", suitability: "Poor", reason: "Rain dampens open-air patios." };
    activities[3] = { activity: "Hiking", suitability: "Poor", reason: "Muddy, slippery trails and zero summit visibility." };
  }

  // Tailor based on wind speed
  if (current.wind_speed > 25) {
    advisory += " Strong winds detected. Secure loose belongings and watch out for flying debris.";
    if (activities[2].suitability === "Highly Suitable") activities[2].suitability = "Suitable";
    activities[2].reason += " Note: High winds might blow napkins or cool food rapidly.";
  }

  return { outfitSuggestion, advisory, hourlyPlanningTips, activities };
}

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
