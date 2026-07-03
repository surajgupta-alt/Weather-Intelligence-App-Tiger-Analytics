export interface CitySearchResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string; // State / Region
  country_code: string;
}

export interface CurrentWeatherData {
  temp: number;
  feels_like: number;
  weather_code: number;
  description: string;
  humidity: number;
  wind_speed: number;
  precipitation: number;
  time: string;
  is_day: boolean;
}

export interface DailyForecastData {
  date: string;
  max_temp: number;
  min_temp: number;
  weather_code: number;
  description: string;
  uv_index: number;
  precipitation_sum: number;
  sunrise: string;
  sunset: string;
}

export interface HourlyForecastData {
  time: string; // e.g. "09:00"
  temp: number;
  precipitation_prob: number;
}

export interface PlanningActivity {
  activity: string;
  suitability: "Highly Suitable" | "Suitable" | "Poor" | string;
  reason: string;
}

export interface PlanningRecommendations {
  outfitSuggestion: string;
  advisory: string;
  hourlyPlanningTips: string;
  activities: PlanningActivity[];
}

export interface FavoriteCity {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  state?: string;
}

// Map WMO Weather Codes to descriptive strings and dynamic icons/styles
export function getWeatherDescription(code: number): { description: string; type: "sunny" | "cloudy" | "rainy" | "snowy" | "stormy" | "foggy" } {
  if (code === 0) return { description: "Clear sky", type: "sunny" };
  if (code === 1 || code === 2 || code === 3) return { description: "Mainly clear, partly cloudy, or overcast", type: "cloudy" };
  if (code === 45 || code === 48) return { description: "Fog and depositing rime fog", type: "foggy" };
  if (code === 51 || code === 53 || code === 55) return { description: "Drizzle: Light, moderate, or dense intensity", type: "rainy" };
  if (code === 56 || code === 57) return { description: "Freezing Drizzle: Light or dense intensity", type: "rainy" };
  if (code === 61 || code === 63 || code === 65) return { description: "Rain: Slight, moderate, or heavy intensity", type: "rainy" };
  if (code === 66 || code === 67) return { description: "Freezing Rain: Light or heavy intensity", type: "rainy" };
  if (code === 71 || code === 73 || code === 75) return { description: "Snow fall: Slight, moderate, or heavy intensity", type: "snowy" };
  if (code === 77) return { description: "Snow grains", type: "snowy" };
  if (code === 80 || code === 81 || code === 82) return { description: "Rain showers: Slight, moderate, or violent", type: "rainy" };
  if (code === 85 || code === 86) return { description: "Snow showers: Slight or heavy", type: "snowy" };
  if (code === 95) return { description: "Thunderstorm: Slight or moderate", type: "stormy" };
  if (code === 96 || code === 99) return { description: "Thunderstorm with slight or heavy hail", type: "stormy" };
  
  return { description: "Unknown Weather Condition", type: "cloudy" };
}
