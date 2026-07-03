import React, { useState } from "react";
import { Sparkles, Shirt, ShieldAlert, Clock, ThumbsUp, HelpCircle, CheckCircle, AlertTriangle, XCircle, Brain, RefreshCw } from "lucide-react";
import { PlanningRecommendations as RecommendationsType, CurrentWeatherData, DailyForecastData } from "../types";

interface PlanningRecommendationsProps {
  cityName: string;
  current: CurrentWeatherData;
  daily: DailyForecastData[];
  tempUnit: "C" | "F";
  localRecommendations: RecommendationsType;
}

export default function PlanningRecommendations({
  cityName,
  current,
  daily,
  tempUnit,
  localRecommendations,
}: PlanningRecommendationsProps) {
  const [aiRecommendations, setAiRecommendations] = useState<RecommendationsType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeMode, setActiveMode] = useState<"local" | "ai">("local");
  const [loadingStep, setLoadingStep] = useState(0);

  const activeRecommendations = activeMode === "ai" && aiRecommendations ? aiRecommendations : localRecommendations;

  // Cycle through interesting loading states for the AI generator
  const loadingSteps = [
    "Consulting atmospheric intelligence models...",
    "Analyzing thermal index & feels-like parameters...",
    "Evaluating UV radiation thresholds & cloud cover...",
    "Synthesizing optimal daily outdoor activity windows...",
    "Compiling custom dress-code & safety suggestions...",
  ];

  const fetchAIIntelReport = async () => {
    setLoading(true);
    setError("");
    setLoadingStep(0);

    // Rotate messages every 1.5 seconds
    const interval = setInterval(() => {
      setLoadingStep((prev) => (prev + 1) % loadingSteps.length);
    }, 1500);

    try {
      const response = await fetch("/api/recommendations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          city: cityName,
          current: {
            temp: current.temp,
            feels_like: current.feels_like,
            weather_code: current.weather_code,
            description: current.description,
            humidity: current.humidity,
            wind_speed: current.wind_speed,
            precipitation: current.precipitation,
          },
          daily: daily.map((day) => ({
            max_temp: day.max_temp,
            min_temp: day.min_temp,
            weather_code: day.weather_code,
            description: day.description,
            uv_index: day.uv_index,
          })),
          unit: tempUnit,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to compile AI meteorological insights");
      }

      const data = await response.json();
      setAiRecommendations(data);
      setActiveMode("ai");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred while connecting to the Weather Intelligence Service.");
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };

  const getSuitabilityIcon = (suitability: string) => {
    const s = suitability.toLowerCase();
    if (s.includes("highly suitable") || s.includes("perfect")) {
      return <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />;
    }
    if (s.includes("poor") || s.includes("unsuitable") || s.includes("avoid")) {
      return <XCircle className="h-5 w-5 text-red-400 shrink-0" />;
    }
    return <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0" />;
  };

  const getSuitabilityBadgeClass = (suitability: string) => {
    const s = suitability.toLowerCase();
    if (s.includes("highly suitable") || s.includes("perfect")) {
      return "bg-emerald-500/10 text-emerald-300 border-emerald-500/20";
    }
    if (s.includes("poor") || s.includes("unsuitable") || s.includes("avoid")) {
      return "bg-red-500/10 text-red-300 border-red-500/20";
    }
    return "bg-amber-500/10 text-amber-300 border-amber-500/20";
  };

  return (
    <div className="space-y-6" id="planning-recommendations-section">
      
      {/* Title & Toggle Modes */}
      <div className="bg-white/5 rounded-[24px] border border-white/10 p-6 shadow-2xl backdrop-blur-xl text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-400" />
              Intelligence recommendations
            </h3>
            <p className="text-xs text-white/40 font-mono">Tailored apparel, schedules, & safety alerts</p>
          </div>

          {/* Mode Tabs */}
          {aiRecommendations && (
            <div className="bg-white/10 p-1 rounded-full flex items-center border border-white/20 backdrop-blur-md">
              <button
                onClick={() => setActiveMode("local")}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold font-mono tracking-tight transition-all cursor-pointer ${
                  activeMode === "local"
                    ? "bg-white/20 text-white shadow-sm border border-white/10"
                    : "text-white/50 hover:text-white"
                }`}
              >
                Analytical Rules
              </button>
              <button
                onClick={() => setActiveMode("ai")}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold font-mono tracking-tight transition-all flex items-center gap-1 cursor-pointer ${
                  activeMode === "ai"
                    ? "bg-blue-500/20 text-white border border-blue-500/30 shadow-sm"
                    : "text-blue-300 hover:text-white"
                }`}
              >
                <Sparkles className="h-3.5 w-3.5 text-blue-300" />
                Gemini AI Intel
              </button>
            </div>
          )}
        </div>

        {/* AI report status */}
        {!aiRecommendations && !loading && (
          <div className="mt-5 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-white/10 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 backdrop-blur-md animate-in fade-in duration-300">
            <div className="flex items-start space-x-3">
              <div className="p-2.5 bg-gradient-to-tr from-blue-400 to-teal-400 text-white rounded-xl shadow-lg shrink-0">
                <Sparkles className="h-4.5 w-4.5 animate-pulse" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white tracking-tight">Unlock Generative Weather Intelligence</h4>
                <p className="text-xs text-white/70 mt-0.5">
                  Request a hyper-personalized plan compiled by Gemini 3.5 Flash using active humidity, UV curves, wind thresholds, and hourly trends.
                </p>
              </div>
            </div>
            <button
              id="get-ai-insights-btn"
              onClick={fetchAIIntelReport}
              className="bg-gradient-to-tr from-blue-400 to-teal-400 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg transition-all flex items-center gap-1.5 whitespace-nowrap self-start sm:self-auto cursor-pointer hover:scale-102 hover:opacity-90"
            >
              <Sparkles className="h-4 w-4" />
              Generate AI Report
            </button>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="mt-5 bg-white/5 border border-white/10 rounded-xl p-6 text-center flex flex-col items-center justify-center space-y-4 min-h-48 animate-pulse backdrop-blur-md">
            <div className="p-3 bg-white/10 text-blue-400 rounded-full animate-spin">
              <RefreshCw className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-white font-mono tracking-tight">
                {loadingSteps[loadingStep]}
              </p>
              <p className="text-xs text-white/40 mt-1">Calling server-side Gemini flash model...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mt-5 bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center backdrop-blur-md">
            <p className="text-sm text-red-300 font-medium">{error}</p>
            <button
              onClick={fetchAIIntelReport}
              className="mt-2 text-xs bg-red-500/20 hover:bg-red-500/30 text-red-200 font-bold px-3 py-1.5 rounded-lg transition-all border border-red-500/10"
            >
              Retry AI Connection
            </button>
          </div>
        )}

        {/* Recommendations display */}
        {!loading && !error && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* Apparel / Clothing advice */}
            <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex flex-col justify-between backdrop-blur-md">
              <div>
                <div className="flex items-center space-x-2 text-white font-bold text-sm mb-3">
                  <div className="p-1.5 bg-white/10 text-white rounded-lg">
                    <Shirt className="h-4 w-4" />
                  </div>
                  <span>Apparel & Outfitting</span>
                </div>
                <p className="text-xs text-white/70 leading-relaxed">
                  {activeRecommendations.outfitSuggestion}
                </p>
              </div>
              {activeMode === "ai" && (
                <span className="text-[9px] text-blue-300 font-mono uppercase tracking-wider mt-4 block">
                  ✨ Powered by Gemini
                </span>
              )}
            </div>

            {/* Health & Safety advisories */}
            <div className="bg-amber-500/5 border border-amber-500/20 p-4 rounded-xl flex flex-col justify-between backdrop-blur-md">
              <div>
                <div className="flex items-center space-x-2 text-amber-300 font-bold text-sm mb-3">
                  <div className="p-1.5 bg-amber-500/20 text-amber-300 rounded-lg">
                    <ShieldAlert className="h-4 w-4" />
                  </div>
                  <span>Safety & Comfort Alerts</span>
                </div>
                <p className="text-xs text-amber-200 leading-relaxed">
                  {activeRecommendations.advisory}
                </p>
              </div>
              {activeMode === "ai" && (
                <span className="text-[9px] text-blue-300 font-mono uppercase tracking-wider mt-4 block">
                  ✨ Powered by Gemini
                </span>
              )}
            </div>

            {/* Timings advice */}
            <div className="bg-indigo-500/5 border border-indigo-500/20 p-4 rounded-xl flex flex-col justify-between backdrop-blur-md">
              <div>
                <div className="flex items-center space-x-2 text-indigo-300 font-bold text-sm mb-3">
                  <div className="p-1.5 bg-indigo-500/20 text-indigo-300 rounded-lg">
                    <Clock className="h-4 w-4" />
                  </div>
                  <span>Optimal Scheduling</span>
                </div>
                <p className="text-xs text-indigo-200 leading-relaxed">
                  {activeRecommendations.hourlyPlanningTips}
                </p>
              </div>
              {activeMode === "ai" && (
                <span className="text-[9px] text-blue-300 font-mono uppercase tracking-wider mt-4 block">
                  ✨ Powered by Gemini
                </span>
              )}
            </div>

          </div>
        )}
      </div>

      {/* Activity Suitability Checklist */}
      {!loading && !error && (
        <div className="bg-white/5 rounded-[24px] border border-white/10 p-6 shadow-2xl backdrop-blur-xl text-white">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-white tracking-tight flex items-center gap-1.5">
              <ThumbsUp className="h-4 w-4 text-blue-400" />
              Activity Feasibility Report
            </h3>
            <p className="text-xs text-white/40 font-mono">Dynamic assessment across multi-factor atmospheric hazards</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeRecommendations.activities.map((item, index) => (
              <div
                key={`${item.activity}-${index}`}
                className="p-4 rounded-xl border border-white/5 bg-white/5 flex items-start space-x-3.5 hover:bg-white/10 hover:border-white/10 transition-colors"
              >
                {getSuitabilityIcon(item.suitability)}
                
                <div className="space-y-1 w-full">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold text-white">{item.activity}</p>
                    <span className={`text-[9px] font-semibold font-mono px-2 py-0.5 rounded-sm border shrink-0 ${getSuitabilityBadgeClass(item.suitability)}`}>
                      {item.suitability}
                    </span>
                  </div>
                  <p className="text-xs text-white/50 leading-relaxed">{item.reason}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
