import React, { useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Thermometer, CloudRain, Clock } from "lucide-react";
import { HourlyForecastData } from "../types";

interface WeatherChartsProps {
  hourlyData: HourlyForecastData[];
  tempUnit: "C" | "F";
}

export default function WeatherCharts({ hourlyData, tempUnit }: WeatherChartsProps) {
  const [activeTab, setActiveTab] = useState<"temp" | "rain">("temp");

  // Format hourly data for the chart based on units
  const chartData = hourlyData.map((item) => {
    let displayTemp = item.temp;
    if (tempUnit === "F") {
      displayTemp = Math.round((item.temp * 9) / 5 + 32);
    } else {
      displayTemp = Math.round(item.temp);
    }
    
    return {
      time: item.time, // e.g., "14:00"
      temp: displayTemp,
      precipitation_prob: item.precipitation_prob,
    };
  });

  // Custom tooltip formatter
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 border border-white/15 p-3 rounded-xl shadow-2xl font-mono text-xs text-white backdrop-blur-md">
          <p className="font-bold text-white mb-1 flex items-center gap-1">
            <Clock className="h-3 w-3 text-blue-400" />
            Time: {label}
          </p>
          {activeTab === "temp" ? (
            <p className="text-amber-400 font-bold flex items-center gap-1">
              <Thermometer className="h-3.5 w-3.5 text-amber-400" />
              Temperature: {payload[0].value}°{tempUnit}
            </p>
          ) : (
            <p className="text-teal-400 font-bold flex items-center gap-1">
              <CloudRain className="h-3.5 w-3.5 text-teal-400" />
              Rain Chance: {payload[0].value}%
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white/5 rounded-[24px] border border-white/10 p-6 shadow-2xl flex flex-col justify-between backdrop-blur-xl text-white" id="weather-charts-card">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">Hourly Chronology</h3>
          <p className="text-xs text-white/40 font-mono">Real-time 24-hour diagnostic trend</p>
        </div>

        {/* Tab Toggle */}
        <div className="bg-white/10 p-1 rounded-full flex items-center border border-white/25 backdrop-blur-md self-start sm:self-auto">
          <button
            id="chart-tab-temp"
            onClick={() => setActiveTab("temp")}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold font-mono tracking-tight transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "temp"
                ? "bg-white/20 text-white shadow-sm border border-white/10"
                : "text-white/50 hover:text-white"
            }`}
          >
            <Thermometer className="h-3.5 w-3.5 text-amber-400" />
            Temperature
          </button>
          <button
            id="chart-tab-rain"
            onClick={() => setActiveTab("rain")}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold font-mono tracking-tight transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "rain"
                ? "bg-white/20 text-white shadow-sm border border-white/10"
                : "text-white/50 hover:text-white"
            }`}
          >
            <CloudRain className="h-3.5 w-3.5 text-teal-400" />
            Precipitation
          </button>
        </div>
      </div>

      {/* Recharts container */}
      <div className="h-64 sm:h-72 w-full" id="chart-container">
        <ResponsiveContainer width="100%" height="100%">
          {activeTab === "temp" ? (
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.05)" />
              <XAxis
                dataKey="time"
                stroke="rgba(255, 255, 255, 0.4)"
                fontSize={10}
                fontFamily="JetBrains Mono, monospace"
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="rgba(255, 255, 255, 0.4)"
                fontSize={10}
                fontFamily="JetBrains Mono, monospace"
                tickLine={false}
                axisLine={false}
                domain={["auto", "auto"]}
                tickFormatter={(val) => `${val}°`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="temp"
                stroke="#f59e0b"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#tempGradient)"
              />
            </AreaChart>
          ) : (
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="rainGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.05)" />
              <XAxis
                dataKey="time"
                stroke="rgba(255, 255, 255, 0.4)"
                fontSize={10}
                fontFamily="JetBrains Mono, monospace"
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="rgba(255, 255, 255, 0.4)"
                fontSize={10}
                fontFamily="JetBrains Mono, monospace"
                tickLine={false}
                axisLine={false}
                domain={[0, 100]}
                tickFormatter={(val) => `${val}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="precipitation_prob"
                stroke="#2dd4bf"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#rainGradient)"
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>

      <div className="mt-4 border-t border-white/10 pt-3 flex items-center justify-between text-[11px] text-white/40 font-mono">
        <p>Values computed hourly across timezone</p>
        <p className="flex items-center gap-1">
          <span className={`inline-block h-2 w-2 rounded-full ${activeTab === 'temp' ? 'bg-amber-500' : 'bg-teal-400'}`} />
          Active: {activeTab === 'temp' ? 'Temperature trend' : 'Rain probability'}
        </p>
      </div>
    </div>
  );
}
