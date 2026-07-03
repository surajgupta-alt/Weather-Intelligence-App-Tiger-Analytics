import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import CurrentWeather from "./components/CurrentWeather";
import Forecast7Day from "./components/Forecast7Day";
import WeatherCharts from "./components/WeatherCharts";
import PlanningRecommendations from "./components/PlanningRecommendations";
import {
  CurrentWeatherData,
  DailyForecastData,
  HourlyForecastData,
  FavoriteCity,
  PlanningRecommendations as RecommendationsType,
  getWeatherDescription,
} from "./types";
import { CloudOff, Sun, RefreshCw, Compass, ShieldAlert } from "lucide-react";

interface SelectedCity {
  name: string;
  lat: number;
  lon: number;
  country: string;
  state?: string;
}

export default function App() {
  const [selectedCity, setSelectedCity] = useState<SelectedCity>({
    name: "New York",
    lat: 40.7128,
    lon: -74.006,
    country: "United States",
    state: "New York",
  });

  const [tempUnit, setTempUnit] = useState<"C" | "F">("C");
  const [favorites, setFavorites] = useState<FavoriteCity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentWeather, setCurrentWeather] = useState<CurrentWeatherData | null>(null);
  const [dailyForecast, setDailyForecast] = useState<DailyForecastData[]>([]);
  const [hourlyForecast, setHourlyForecast] = useState<HourlyForecastData[]>([]);
  const [localRecommendations, setLocalRecommendations] = useState<RecommendationsType | null>(null);

  // Load favorites & unit preference from localStorage on mount
  useEffect(() => {
    const savedFavs = localStorage.getItem("aero_favs");
    if (savedFavs) {
      try {
        setFavorites(JSON.parse(savedFavs));
      } catch (e) {
        console.error("Failed to parse favorites", e);
      }
    }

    const savedUnit = localStorage.getItem("aero_unit");
    if (savedUnit === "C" || savedUnit === "F") {
      setTempUnit(savedUnit);
    }
  }, []);

  // Save favorites to localStorage when updated
  const saveFavorites = (newFavs: FavoriteCity[]) => {
    setFavorites(newFavs);
    localStorage.setItem("aero_favs", JSON.stringify(newFavs));
  };

  const handleToggleFavorite = () => {
    const isFav = favorites.some((f) => f.latitude === selectedCity.lat && f.longitude === selectedCity.lon);
    if (isFav) {
      const updated = favorites.filter((f) => !(f.latitude === selectedCity.lat && f.longitude === selectedCity.lon));
      saveFavorites(updated);
    } else {
      const newFav: FavoriteCity = {
        id: Date.now(),
        name: selectedCity.name,
        latitude: selectedCity.lat,
        longitude: selectedCity.lon,
        country: selectedCity.country,
        state: selectedCity.state,
      };
      saveFavorites([...favorites, newFav]);
    }
  };

  const isCurrentFavorite = favorites.some(
    (f) => f.latitude === selectedCity.lat && f.longitude === selectedCity.lon
  );

  const handleToggleUnit = () => {
    const nextUnit = tempUnit === "C" ? "F" : "C";
    setTempUnit(nextUnit);
    localStorage.setItem("aero_unit", nextUnit);
  };

  // Weather fetch logic triggered by change in lat or lon (primitives to prevent re-renders)
  const lat = selectedCity.lat;
  const lon = selectedCity.lon;

  useEffect(() => {
    let isMounted = true;

    async function fetchWeatherData() {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_sum&hourly=temperature_2m,precipitation_probability&timezone=auto`
        );

        if (!response.ok) {
          throw new Error("Failed to retrieve local meteorological readings");
        }

        const data = await response.json();

        if (!isMounted) return;

        // Current weather processing
        const cur = data.current;
        const currentData: CurrentWeatherData = {
          temp: cur.temperature_2m,
          feels_like: cur.apparent_temperature,
          weather_code: cur.weather_code,
          description: getWeatherDescription(cur.weather_code).description,
          humidity: cur.relative_humidity_2m,
          wind_speed: cur.wind_speed_10m,
          precipitation: cur.precipitation,
          is_day: cur.is_day === 1,
          time: cur.time,
        };

        // Daily forecast processing
        const d = data.daily;
        const dailyData: DailyForecastData[] = [];
        for (let i = 0; i < d.time.length; i++) {
          dailyData.push({
            date: d.time[i],
            max_temp: d.temperature_2m_max[i],
            min_temp: d.temperature_2m_min[i],
            weather_code: d.weather_code[i],
            description: getWeatherDescription(d.weather_code[i]).description,
            uv_index: d.uv_index_max[i] ?? 0,
            precipitation_sum: d.precipitation_sum[i] ?? 0,
            sunrise: d.sunrise[i] || "",
            sunset: d.sunset[i] || "",
          });
        }

        // Hourly forecast processing (take next 24 hours)
        const h = data.hourly;
        const hourlyData: HourlyForecastData[] = [];
        const currentHourStr = cur.time.split("T")[1]?.substring(0, 2) || "00";
        const currentHourNum = parseInt(currentHourStr, 10);
        
        // Find starting index matching the current hour or default to 0
        let startIndex = 0;
        const todayDateStr = cur.time.split("T")[0];
        for (let j = 0; j < h.time.length; j++) {
          if (h.time[j].startsWith(todayDateStr) && h.time[j].includes(`T${currentHourStr}:`)) {
            startIndex = j;
            break;
          }
        }

        for (let i = startIndex; i < startIndex + 24 && i < h.time.length; i++) {
          const timePart = h.time[i].split("T")[1]?.substring(0, 5) || h.time[i];
          hourlyData.push({
            time: timePart,
            temp: h.temperature_2m[i],
            precipitation_prob: h.precipitation_probability[i] ?? 0,
          });
        }

        // Compile instant local planning recommendations
        const recs = generateLocalRecommendations(currentData, dailyData);

        setCurrentWeather(currentData);
        setDailyForecast(dailyData);
        setHourlyForecast(hourlyData);
        setLocalRecommendations(recs);
      } catch (err: any) {
        if (isMounted) {
          console.error("Fetch error:", err);
          setError(err.message || "Failed to download forecast analytics.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchWeatherData();

    return () => {
      isMounted = false;
    };
  }, [lat, lon]);

  // Offline/Analytical Rules Engine for Instant Recommendations
  const generateLocalRecommendations = (current: CurrentWeatherData, daily: DailyForecastData[]): RecommendationsType => {
    const temp = current.temp;
    const isRainy = current.precipitation > 0 || current.weather_code >= 51;
    const isExtremeCold = temp < 10;
    const isExtremeHot = temp > 30;

    let outfitSuggestion = "Wear comfortable clothing suitable for moderate weather conditions.";
    let advisory = "Conditions are stable. Ensure you carry normal hydration.";
    let hourlyPlanningTips = "The climate is favorable for standard scheduling. Seek daytime outdoors.";
    
    const activities = [
      { activity: "Running & Jogging", suitability: "Suitable", reason: "Favorable temperatures and low wind resistance." },
      { activity: "Sightseeing", suitability: "Suitable", reason: "Mild atmospheric humidity and clear visibility." },
      { activity: "Outdoor Dining", suitability: "Suitable", reason: "Pleasant surrounding ambient temperatures." },
      { activity: "Hiking/Backpacking", suitability: "Suitable", reason: "Stable ground conditions forecasted." }
    ];

    if (isExtremeHot) {
      outfitSuggestion = "Choose light-weight linen or cotton, a sun-protection hat, and polarized sunglasses. Light hues are strongly advised.";
      advisory = "Hydration alert! High solar radiation index. Apply minimum SPF 50 sunscreen. Limit physical strain.";
      hourlyPlanningTips = "Schedule any physical exercises before 8 AM or after 7:30 PM. Dedicate mid-day to indoor spaces.";
      
      activities[0] = { activity: "Running & Jogging", suitability: "Poor", reason: "Severe heat index increases fatigue, risk of cramps, and sunstroke." };
      activities[2] = { activity: "Outdoor Dining", suitability: "Suitable", reason: "Feasible only if the terrace offers mist cooling or shaded covers." };
      activities[3] = { activity: "Hiking/Backpacking", suitability: "Poor", reason: "Risk of high solar exposure and heat exhaustion on open trails." };
    } else if (isExtremeCold) {
      outfitSuggestion = "Layer generously: thermal base layer, thick fleece mid-layer, windproof winter coat, scarf, gloves, and thick socks.";
      advisory = "Freezing risks! Guard extremities carefully. Keep a hot beverage close and dry your gear immediately.";
      hourlyPlanningTips = "Optimal timing is between 11:30 AM and 2:30 PM when the sun provides peak direct warmth.";
      
      activities[0] = { activity: "Running & Jogging", suitability: "Suitable", reason: "Excellent cardio environment but requires careful respiratory warmth." };
      activities[2] = { activity: "Outdoor Dining", suitability: "Poor", reason: "Extremely cold to sit stationary outdoors. Opt for warm indoor dining." };
      activities[3] = { activity: "Hiking/Backpacking", suitability: "Suitable", reason: "Invigorating, provided paths are clear of frost and thermals are worn." };
    } else if (temp >= 18 && temp <= 26 && !isRainy) {
      outfitSuggestion = "Casual and breezy outfitting: classic t-shirt, comfortable trousers, sneakers, and sunglasses.";
      advisory = "Highly pleasant climate. Ideal ultraviolet exposure thresholds. Carry a light windbreaker just in case.";
      hourlyPlanningTips = "Outstanding conditions all day. Perfect weather window to enjoy outdoor projects.";
      
      activities[0] = { activity: "Running & Jogging", suitability: "Highly Suitable", reason: "Atmospheric perfection for peak cardiovascular endurance workouts." };
      activities[1] = { activity: "Sightseeing", suitability: "Highly Suitable", reason: "Highly comfortable thermal state for exploration on foot." };
      activities[2] = { activity: "Outdoor Dining", suitability: "Highly Suitable", reason: "Perfect gentle breeze and warm ambient temperatures." };
      activities[3] = { activity: "Hiking/Backpacking", suitability: "Highly Suitable", reason: "Ideal thermal range for technical mountain ascents." };
    }

    if (isRainy) {
      outfitSuggestion = "Waterproof trench coat, rubber-soled water-resistant boots, and a premium windproof umbrella.";
      advisory = "Precipitation warning. Slippery walkways and road splash hazards. Keep umbrellas ready.";
      hourlyPlanningTips = "Reorganize calendars around indoor galleries, cafes, or libraries. Avoid unsheltered areas.";
      
      activities[0] = { activity: "Running & Jogging", suitability: "Poor", reason: "Wet pavement increases slippage and muscle strain risks." };
      activities[1] = { activity: "Sightseeing", suitability: "Suitable", reason: "Manageable if holding a solid umbrella; prefer covered bus tours." };
      activities[2] = { activity: "Outdoor Dining", suitability: "Poor", reason: "Windblown raindrops will damp patio seatings." };
      activities[3] = { activity: "Hiking/Backpacking", suitability: "Poor", reason: "Muddy terrain, poor footing, and absolute fog blocks at summits." };
    }

    return { outfitSuggestion, advisory, hourlyPlanningTips, activities };
  };

  return (
    <div className="min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/30 via-slate-950 to-slate-950 text-white flex flex-col justify-between" id="app-root">
      
      {/* App Header */}
      <Header
        currentCityName={selectedCity.name}
        isFavorite={isCurrentFavorite}
        onToggleFavorite={handleToggleFavorite}
        tempUnit={tempUnit}
        onToggleUnit={handleToggleUnit}
        onSelectCity={(city) => setSelectedCity(city)}
        favorites={favorites}
      />

      {/* Main Panel Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Loading overlay screen */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 space-y-6" id="loading-state-screen">
            <div className="relative">
              <Sun className="h-16 w-16 text-amber-400 animate-[spin_10s_linear_infinite]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <RefreshCw className="h-8 w-8 text-blue-400 animate-spin" />
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-white tracking-tight">Syncing Atmosphere Diagnostics</h3>
              <p className="text-xs text-white/40 font-mono mt-1">Downloading satellite data for {selectedCity.name}...</p>
            </div>
          </div>
        )}

        {/* Error overlay screen */}
        {error && (
          <div className="bg-white/5 border border-red-500/20 rounded-[24px] p-8 max-w-xl mx-auto text-center shadow-2xl my-12 backdrop-blur-xl" id="error-state-screen">
            <div className="mx-auto w-16 h-16 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center mb-5 border border-red-500/20">
              <CloudOff className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">Telemetry Handshake Failure</h3>
            <p className="text-sm text-white/60 mt-2 font-mono leading-relaxed">{error}</p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                onClick={() => setSelectedCity({
                  name: "New York",
                  lat: 40.7128,
                  lon: -74.006,
                  country: "United States",
                  state: "New York",
                })}
                className="bg-white/10 hover:bg-white/15 text-white border border-white/10 text-xs font-semibold px-4 py-2.5 rounded-xl transition-all"
              >
                Reset to New York
              </button>
              <button
                onClick={() => setSelectedCity({ ...selectedCity })}
                className="bg-gradient-to-tr from-blue-400 to-teal-400 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg transition-all flex items-center gap-1.5"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Retry Sync
              </button>
            </div>
          </div>
        )}

        {/* Weather Loaded Interface */}
        {!loading && !error && currentWeather && localRecommendations && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300" id="weather-dashboard-view">
            
            {/* Bento Current Conditions */}
            <CurrentWeather
              cityName={selectedCity.name}
              country={selectedCity.country}
              state={selectedCity.state}
              current={currentWeather}
              todayForecast={dailyForecast[0] || null}
              tempUnit={tempUnit}
            />

            {/* Middle Section: Recharts 24-Hour trends & recommendations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <WeatherCharts hourlyData={hourlyForecast} tempUnit={tempUnit} />
              <PlanningRecommendations
                cityName={selectedCity.name}
                current={currentWeather}
                daily={dailyForecast}
                tempUnit={tempUnit}
                localRecommendations={localRecommendations}
              />
            </div>

            {/* Bottom Section: 7-day extended forecasts */}
            <Forecast7Day daily={dailyForecast} tempUnit={tempUnit} />

          </div>
        )}

      </main>

      {/* App footer */}
      <footer className="bg-white/5 border-t border-white/10 py-6" id="app-footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/40 font-mono">
          <p>© 2026 AeroIntel Weather Intelligence. All atmospheric rights reserved.</p>
          <div className="flex items-center space-x-4">
            <span>Powered by Open-Meteo & Gemini 3.5</span>
            <span className="h-3 w-px bg-white/10" />
            <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">
              Open-Meteo API
            </a>
          </div>
        </div>
      </footer>

    </div>
  );
}
