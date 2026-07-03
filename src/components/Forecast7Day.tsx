import React from "react";
import { Sun, Cloud, CloudRain, Snowflake, CloudLightning, Eye, HelpCircle } from "lucide-react";
import { DailyForecastData, getWeatherDescription } from "../types";

interface Forecast7DayProps {
  daily: DailyForecastData[];
  tempUnit: "C" | "F";
}

export default function Forecast7Day({ daily, tempUnit }: Forecast7DayProps) {
  
  // Format dates nicely, e.g. "Monday, Jul 3"
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
    const monthDay = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    return { dayName, monthDay };
  };

  // Convert temperature to display string
  const formatTemp = (tempC: number) => {
    if (tempUnit === "F") {
      const tempF = (tempC * 9) / 5 + 32;
      return `${Math.round(tempF)}°`;
    }
    return `${Math.round(tempC)}°`;
  };

  // Get weather icon based on the mapped type
  const getWeatherIcon = (code: number) => {
    const { type } = getWeatherDescription(code);
    const sizeClass = "h-8 w-8";
    switch (type) {
      case "sunny":
        return <Sun className={`${sizeClass} text-amber-500 animate-[spin_30s_linear_infinite]`} />;
      case "rainy":
        return <CloudRain className={`${sizeClass} text-blue-500`} />;
      case "snowy":
        return <Snowflake className={`${sizeClass} text-sky-400`} />;
      case "stormy":
        return <CloudLightning className={`${sizeClass} text-purple-500`} />;
      case "foggy":
        return <Eye className={`${sizeClass} text-slate-400`} />;
      case "cloudy":
      default:
        return <Cloud className={`${sizeClass} text-slate-400`} />;
    }
  };

  // Get color overlay for UV indexes
  const getUvBadgeClass = (uv: number) => {
    if (uv <= 2) return "bg-green-500/10 text-green-300 border-green-500/20";
    if (uv <= 5) return "bg-yellow-500/10 text-yellow-300 border-yellow-500/20";
    if (uv <= 7) return "bg-orange-500/10 text-orange-300 border-orange-500/20";
    return "bg-red-500/10 text-red-300 border-red-500/20";
  };

  return (
    <div className="bg-white/5 rounded-[24px] border border-white/10 p-6 shadow-2xl backdrop-blur-xl text-white" id="forecast-7day-section">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">7-Day Extended Forecast</h3>
          <p className="text-xs text-white/40 font-mono">Day-by-day predictive analytics</p>
        </div>
        <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2.5 py-1 rounded-md font-mono border border-blue-500/10 uppercase">
          7-Day Range
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4" id="forecast-grid">
        {daily.map((day, index) => {
          const { dayName, monthDay } = formatDate(day.date);
          const { description } = getWeatherDescription(day.weather_code);
          const isToday = index === 0;

          return (
            <div
              key={day.date}
              className={`rounded-xl p-4 border transition-all flex flex-col justify-between text-center relative group hover:shadow-2xl ${
                isToday
                  ? "bg-blue-500/10 border-blue-400/40 ring-2 ring-blue-500/20"
                  : "bg-white/5 border-white/5 hover:border-white/10"
              }`}
            >
              {isToday && (
                <span className="absolute top-2 right-2 bg-gradient-to-r from-blue-500 to-teal-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-sm font-mono uppercase tracking-wider">
                  Today
                </span>
              )}

              {/* Day Name */}
              <div>
                <p className={`text-xs font-bold font-mono uppercase tracking-wider ${isToday ? "text-blue-400" : "text-white/40"}`}>
                  {dayName}
                </p>
                <p className="text-[11px] text-white/50 font-mono mt-0.5">{monthDay}</p>
              </div>

              {/* Weather icon & desc */}
              <div className="my-4 flex flex-col items-center justify-center">
                <div className="p-2.5 bg-white/5 rounded-xl shadow-inner border border-white/10 group-hover:scale-105 transition-transform">
                  {getWeatherIcon(day.weather_code)}
                </div>
                <p className="text-[11px] text-white/70 font-medium truncate w-full mt-2" title={description}>
                  {description}
                </p>
              </div>

              {/* Min / Max temperature */}
              <div className="mt-auto">
                <div className="flex items-center justify-center gap-2 mb-2 font-mono">
                  <span className="text-sm font-bold text-white">{formatTemp(day.max_temp)}</span>
                  <span className="text-xs text-white/40 font-medium">{formatTemp(day.min_temp)}</span>
                </div>

                {/* Micro metrics - UV & Precip */}
                <div className="space-y-1">
                  {day.precipitation_sum > 0 ? (
                    <p className="text-[10px] text-blue-300 font-mono font-medium flex items-center justify-center gap-0.5">
                      🌧️ {day.precipitation_sum.toFixed(1)} mm
                    </p>
                  ) : (
                    <p className="text-[10px] text-white/30 font-mono">No Rain</p>
                  )}
                  
                  <div className={`text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded-sm border inline-block ${getUvBadgeClass(day.uv_index)}`}>
                    UV: {Math.round(day.uv_index)}
                  </div>
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
