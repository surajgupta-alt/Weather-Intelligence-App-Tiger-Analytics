import React from "react";
import { Thermometer, Wind, Droplets, CloudRain, Sun, Cloud, Snowflake, CloudLightning, Eye, Navigation } from "lucide-react";
import { CurrentWeatherData, DailyForecastData, getWeatherDescription } from "../types";

interface CurrentWeatherProps {
  cityName: string;
  country: string;
  state?: string;
  current: CurrentWeatherData;
  todayForecast: DailyForecastData | null;
  tempUnit: "C" | "F";
}

export default function CurrentWeather({
  cityName,
  country,
  state,
  current,
  todayForecast,
  tempUnit,
}: CurrentWeatherProps) {
  const { description, type } = getWeatherDescription(current.weather_code);

  // Convert temperature to display string
  const formatTemp = (tempC: number) => {
    if (tempUnit === "F") {
      const tempF = (tempC * 9) / 5 + 32;
      return `${Math.round(tempF)}°F`;
    }
    return `${Math.round(tempC)}°C`;
  };

  // Determine background styling based on weather type
  const getWeatherTheme = () => {
    switch (type) {
      case "sunny":
        return {
          gradient: "from-amber-400 to-orange-500",
          cardBg: "bg-amber-50/70 border-amber-200",
          textColor: "text-amber-800",
          accentColor: "bg-amber-500",
          bgOverlay: "rgba(245, 158, 11, 0.15)",
        };
      case "rainy":
        return {
          gradient: "from-blue-500 to-indigo-600",
          cardBg: "bg-blue-50/70 border-blue-200",
          textColor: "text-blue-800",
          accentColor: "bg-blue-500",
          bgOverlay: "rgba(59, 130, 246, 0.15)",
        };
      case "snowy":
        return {
          gradient: "from-sky-300 to-blue-500",
          cardBg: "bg-sky-50/70 border-sky-200",
          textColor: "text-sky-800",
          accentColor: "bg-sky-500",
          bgOverlay: "rgba(14, 165, 233, 0.15)",
        };
      case "stormy":
        return {
          gradient: "from-purple-600 to-indigo-900",
          cardBg: "bg-purple-50/70 border-purple-200",
          textColor: "text-purple-800",
          accentColor: "bg-purple-500",
          bgOverlay: "rgba(147, 51, 234, 0.15)",
        };
      case "foggy":
        return {
          gradient: "from-slate-400 to-slate-600",
          cardBg: "bg-slate-100/70 border-slate-200",
          textColor: "text-slate-800",
          accentColor: "bg-slate-500",
          bgOverlay: "rgba(100, 116, 139, 0.15)",
        };
      case "cloudy":
      default:
        return {
          gradient: "from-blue-400 to-slate-500",
          cardBg: "bg-slate-50/70 border-slate-200",
          textColor: "text-slate-800",
          accentColor: "bg-blue-500",
          bgOverlay: "rgba(59, 130, 246, 0.15)",
        };
    }
  };

  const theme = getWeatherTheme();

  // Get icon component matching weather type
  const getWeatherIcon = (iconSizeClass = "h-16 w-16") => {
    switch (type) {
      case "sunny":
        return <Sun className={`${iconSizeClass} text-amber-500 animate-[spin_20s_linear_infinite]`} />;
      case "rainy":
        return <CloudRain className={`${iconSizeClass} text-blue-500 animate-bounce`} />;
      case "snowy":
        return <Snowflake className={`${iconSizeClass} text-sky-400 animate-pulse`} />;
      case "stormy":
        return <CloudLightning className={`${iconSizeClass} text-purple-600`} />;
      case "foggy":
        return <Eye className={`${iconSizeClass} text-slate-400`} />;
      case "cloudy":
      default:
        return <Cloud className={`${iconSizeClass} text-slate-500`} />;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-white" id="current-weather-section">
      
      {/* Primary Hero Card */}
      <div className="lg:col-span-2 overflow-hidden rounded-[24px] border border-white/10 bg-white/5 shadow-2xl flex flex-col justify-between backdrop-blur-2xl relative animate-in fade-in zoom-in-95 duration-500">
        
        {/* Dynamic header colored area */}
        <div className={`p-6 sm:p-8 bg-linear-to-br ${theme.gradient} text-white flex flex-col justify-between h-52 md:h-60 relative overflow-hidden border-b border-white/10 bg-opacity-95`}>
          {/* Subtle abstract background graphics */}
          <div className="absolute right-0 bottom-0 opacity-15 pointer-events-none scale-150 transform translate-x-12 translate-y-8">
            {getWeatherIcon("h-48 w-48 text-white")}
          </div>

          <div className="flex justify-between items-start z-10">
            <div>
              <span className="bg-white/20 text-white text-xs font-mono font-medium px-2.5 py-1 rounded-full uppercase tracking-widest backdrop-blur-md">
                Current Conditions
              </span>
              <h2 className="text-2xl md:text-3.5xl font-bold mt-2.5 tracking-tight flex items-center gap-2 text-white">
                {cityName}
              </h2>
              <p className="text-xs text-white/80 font-mono mt-1">
                {state ? `${state}, ` : ""}{country}
              </p>
            </div>
            
            <div className="text-right font-mono text-xs text-white/95">
              <p>{new Date().toLocaleDateString("en-US", { weekday: 'long', month: 'short', day: 'numeric' })}</p>
              <p className="opacity-75">Updated just now</p>
            </div>
          </div>

          <div className="flex items-end justify-between z-10 mt-auto">
            <div className="flex items-center space-x-3.5">
              <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-md">
                {getWeatherIcon("h-10 w-10 text-white")}
              </div>
              <div>
                <p className="text-3xl md:text-5xl font-extrabold tracking-tight">{formatTemp(current.temp)}</p>
                <p className="text-sm font-semibold opacity-90">{description}</p>
              </div>
            </div>

            <div className="text-right text-sm">
              <p className="opacity-90 flex items-center justify-end gap-1 font-mono">
                <Thermometer className="h-4 w-4" /> Feels Like: <span className="font-bold">{formatTemp(current.feels_like)}</span>
              </p>
              {todayForecast && (
                <p className="opacity-75 font-mono text-xs mt-1">
                  Range: {formatTemp(todayForecast.min_temp)} - {formatTemp(todayForecast.max_temp)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Bento secondary detailed metrics bar */}
        <div className="p-6 bg-white/5 grid grid-cols-2 md:grid-cols-4 gap-4 divide-y md:divide-y-0 md:divide-x divide-white/10 backdrop-blur-xl">
          
          <div className="pt-2 md:pt-0 flex items-center space-x-3">
            <div className="p-2.5 bg-blue-500/20 text-blue-300 rounded-xl border border-blue-400/20">
              <Droplets className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-white/40 font-mono uppercase tracking-wider">Humidity</p>
              <p className="text-base font-bold text-white font-mono">{current.humidity}%</p>
            </div>
          </div>

          <div className="pt-2 md:pt-0 md:pl-4 flex items-center space-x-3">
            <div className="p-2.5 bg-amber-500/20 text-amber-300 rounded-xl border border-amber-400/20">
              <Wind className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-white/40 font-mono uppercase tracking-wider">Wind Speed</p>
              <p className="text-base font-bold text-white font-mono">{current.wind_speed} km/h</p>
            </div>
          </div>

          <div className="pt-4 md:pt-0 md:pl-4 flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-500/20 text-indigo-300 rounded-xl border border-indigo-400/20">
              <CloudRain className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-white/40 font-mono uppercase tracking-wider">Precipitation</p>
              <p className="text-base font-bold text-white font-mono">{current.precipitation} mm</p>
            </div>
          </div>

          <div className="pt-4 md:pt-0 md:pl-4 flex items-center space-x-3">
            <div className="p-2.5 bg-teal-500/20 text-teal-300 rounded-xl border border-teal-400/20">
              <Sun className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-white/40 font-mono uppercase tracking-wider">UV Index</p>
              <p className="text-base font-bold text-white font-mono">{todayForecast ? Math.round(todayForecast.uv_index) : "N/A"}</p>
            </div>
          </div>

        </div>

      </div>

      {/* Astro Sun and Code card */}
      <div className="rounded-[24px] border border-white/10 bg-white/5 p-6 shadow-2xl flex flex-col justify-between backdrop-blur-xl text-white animate-in fade-in zoom-in-95 duration-500">
        <div>
          <h3 className="text-sm font-semibold text-white tracking-tight mb-4 flex items-center gap-1.5">
            <Navigation className="h-4 w-4 text-blue-400 shrink-0 rotate-45" />
            Astronomical Intel
          </h3>
          
          <div className="space-y-4">
            <div className="bg-amber-500/5 border border-amber-500/25 p-3 rounded-xl flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-amber-500/20 text-amber-300 rounded-lg">
                  <Sun className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] text-amber-200/50 font-mono uppercase">Sunrise</p>
                  <p className="text-sm font-bold text-amber-200 font-mono">
                    {todayForecast ? todayForecast.sunrise.split("T")[1] || todayForecast.sunrise : "N/A"}
                  </p>
                </div>
              </div>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-md font-mono border border-amber-500/10">AM</span>
            </div>

            <div className="bg-indigo-500/5 border border-indigo-500/25 p-3 rounded-xl flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-indigo-500/20 text-indigo-300 rounded-lg">
                  <Cloud className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] text-indigo-200/50 font-mono uppercase">Sunset</p>
                  <p className="text-sm font-bold text-indigo-200 font-mono">
                    {todayForecast ? todayForecast.sunset.split("T")[1] || todayForecast.sunset : "N/A"}
                  </p>
                </div>
              </div>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-md font-mono border border-indigo-500/10">PM</span>
            </div>
          </div>
        </div>

        <div className="mt-6 border-t border-white/10 pt-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-white/40 font-mono">Meteorological Code</p>
            <p className="text-xs text-white/70 font-mono font-medium">WMO Code: {current.weather_code}</p>
          </div>
          <span className="text-[10px] text-white/80 border border-white/10 bg-white/5 px-2 py-1 rounded-md font-mono">
            {type.toUpperCase()}
          </span>
        </div>

      </div>

    </div>
  );
}
