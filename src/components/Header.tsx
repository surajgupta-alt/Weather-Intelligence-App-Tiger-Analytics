import React, { useState, useEffect, useRef } from "react";
import { Search, MapPin, Star, Thermometer, Sun, Wind, Cloud, Menu, X } from "lucide-react";
import { CitySearchResult } from "../types";

interface HeaderProps {
  currentCityName: string;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  tempUnit: "C" | "F";
  onToggleUnit: () => void;
  onSelectCity: (city: { name: string; lat: number; lon: number; country: string; state?: string }) => void;
  favorites: any[];
}

export default function Header({
  currentCityName,
  isFavorite,
  onToggleFavorite,
  tempUnit,
  onToggleUnit,
  onSelectCity,
  favorites,
}: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<CitySearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close search dropdown on clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle geocoding API fetch
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    setIsSearching(true);
    setErrorMessage("");
    try {
      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          query
        )}&count=5&language=en&format=json`
      );
      if (!response.ok) {
        throw new Error("Geocoding failed");
      }
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        setSearchResults(data.results);
        setShowDropdown(true);
      } else {
        setSearchResults([]);
        setErrorMessage("No cities found matching that name.");
        setShowDropdown(true);
      }
    } catch (err) {
      console.error("Geocoding error:", err);
      setErrorMessage("Error finding cities. Please check connection.");
      setShowDropdown(true);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounce search typing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length > 1) {
        handleSearch(searchQuery);
      } else {
        setSearchResults([]);
        setShowDropdown(false);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const selectSearchResult = (city: CitySearchResult) => {
    onSelectCity({
      name: city.name,
      lat: city.latitude,
      lon: city.longitude,
      country: city.country,
      state: city.admin1,
    });
    setSearchQuery("");
    setShowDropdown(false);
  };

  const popularCities = [
    { name: "New York", lat: 40.7128, lon: -74.006, country: "United States" },
    { name: "London", lat: 51.5074, lon: -0.1278, country: "United Kingdom" },
    { name: "Tokyo", lat: 35.6762, lon: 139.6503, country: "Japan" },
    { name: "Paris", lat: 48.8566, lon: 2.3522, country: "France" },
    { name: "Sydney", lat: -33.8688, lon: 151.2093, country: "Australia" },
  ];

  return (
    <header className="bg-white/5 border-b border-white/10 sticky top-0 z-50 backdrop-blur-xl text-white" id="app-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Logo and App Brand Title */}
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-tr from-blue-400 to-teal-400 text-white p-2.5 rounded-xl shadow-lg flex items-center justify-center">
              <Sun className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                Aero<span className="text-blue-400">Intel</span>
                <span className="bg-white/10 text-blue-300 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-white/10">
                  v1.2
                </span>
              </h1>
              <p className="text-xs text-white/40 font-mono">Weather Intelligence System</p>
            </div>
          </div>

          {/* Search bar container */}
          <div className="flex-1 max-w-md relative" ref={dropdownRef}>
            <div className="relative">
              <input
                id="city-search-input"
                type="text"
                placeholder="Search for a city (e.g. San Francisco, Cairo)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/10 text-white placeholder-white/40 pl-10 pr-10 py-2.5 rounded-full border border-white/25 focus:outline-hidden focus:ring-2 focus:ring-blue-400/50 backdrop-blur-md transition-all text-sm shadow-inner"
              />
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40">
                <Search className="h-4 w-4" />
              </div>
              {isSearching && (
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                  <div className="h-4 w-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>

            {/* Results Dropdown */}
            {showDropdown && (searchQuery.trim().length > 1) && (
              <div className="absolute w-full mt-2 bg-slate-900/90 border border-white/15 shadow-2xl rounded-xl overflow-hidden z-50 backdrop-blur-xl animate-in fade-in slide-in-from-top-1 duration-200">
                {searchResults.length > 0 ? (
                  <ul className="divide-y divide-white/5 max-h-64 overflow-y-auto" id="search-results-list">
                    {searchResults.map((city) => (
                      <li key={city.id}>
                        <button
                          type="button"
                          onClick={() => selectSearchResult(city)}
                          className="w-full text-left px-4 py-3 hover:bg-white/10 transition-colors flex items-center justify-between"
                        >
                          <div className="flex items-center space-x-2.5">
                            <MapPin className="h-4 w-4 text-blue-400 shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-white">{city.name}</p>
                              <p className="text-xs text-white/50 font-mono">
                                {city.admin1 ? `${city.admin1}, ` : ""}{city.country}
                              </p>
                            </div>
                          </div>
                          <span className="text-xs bg-white/10 text-white/70 px-2 py-0.5 rounded-sm font-mono border border-white/10 uppercase">
                            {city.country_code}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="px-4 py-4 text-center text-sm text-white/50">
                    {errorMessage || "No matching cities found."}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action buttons (Favorites, Temperature Units) */}
          <div className="flex items-center justify-end gap-3.5">
            {/* Unit Toggle buttons */}
            <div className="bg-white/10 p-1 rounded-full flex items-center border border-white/20 backdrop-blur-md">
              <button
                id="unit-celsius"
                onClick={() => tempUnit !== "C" && onToggleUnit()}
                className={`px-4 py-1.5 rounded-full text-xs font-bold font-mono tracking-tight transition-all cursor-pointer ${
                  tempUnit === "C"
                    ? "bg-white/20 text-white shadow-sm border border-white/10"
                    : "text-white/50 hover:text-white"
                }`}
              >
                °C
              </button>
              <button
                id="unit-fahrenheit"
                onClick={() => tempUnit !== "F" && onToggleUnit()}
                className={`px-4 py-1.5 rounded-full text-xs font-bold font-mono tracking-tight transition-all cursor-pointer ${
                  tempUnit === "F"
                    ? "bg-white/20 text-white shadow-sm border border-white/10"
                    : "text-white/50 hover:text-white"
                }`}
              >
                °F
              </button>
            </div>

            {/* Favorite button */}
            <button
              id="favorite-toggle-btn"
              onClick={onToggleFavorite}
              className={`p-2.5 rounded-full flex items-center justify-center border transition-all cursor-pointer backdrop-blur-md ${
                isFavorite
                  ? "bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-xs"
                  : "bg-white/10 text-white/50 border-white/20 hover:text-white hover:bg-white/20"
              }`}
              title={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Star className="h-5 w-5 fill-current" />
            </button>
          </div>

        </div>

        {/* Popular Quick Links */}
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/10 pt-3">
          <span className="text-xs text-white/40 font-mono tracking-tight mr-1">Quick Links:</span>
          {popularCities.map((city) => (
            <button
              key={city.name}
              onClick={() => onSelectCity(city)}
              className="text-xs bg-white/5 text-white/80 hover:bg-white/15 hover:text-white border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-full font-medium transition-all cursor-pointer"
            >
              {city.name}
            </button>
          ))}
          {favorites.length > 0 && (
            <>
              <div className="h-4 w-px bg-white/10 mx-2" />
              <span className="text-xs text-white/40 font-mono tracking-tight mr-1">Favorites:</span>
              {favorites.map((fav) => (
                <button
                  key={fav.id}
                  onClick={() => onSelectCity(fav)}
                  className="text-xs bg-amber-500/10 text-amber-300 hover:bg-amber-500/25 border border-amber-500/20 hover:border-amber-500/30 px-3 py-1.5 rounded-full font-medium transition-all flex items-center gap-1 cursor-pointer"
                >
                  <MapPin className="h-3 w-3 shrink-0" />
                  {fav.name}
                </button>
              ))}
            </>
          )}
        </div>

      </div>
    </header>
  );
}
