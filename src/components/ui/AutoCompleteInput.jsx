import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, MapPin, Search, Building, Star, Sparkles, Target } from 'lucide-react';
import { InvokeLLM } from '@/api/integrations';

const AutoCompleteInput = ({ 
  placeholder, 
  value, 
  onChange, 
  onSelect, 
  type = 'location',
  className = '',
  disabled = false 
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  useEffect(() => {
    if (value && value.length > 2) {
      const debounceTimer = setTimeout(() => {
        fetchSuggestions(value);
      }, 300);
      return () => clearTimeout(debounceTimer);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [value, type]);

  const fetchSuggestions = async (query) => {
    setIsLoading(true);
    try {
      let prompt = '';
      let responseSchema = {};

      switch (type) {
        case 'location':
          prompt = `Provide 5 location suggestions for: "${query}". Include full addresses, cities, and coordinates.`;
          responseSchema = {
            type: "object",
            properties: {
              suggestions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    address: { type: "string" },
                    city: { type: "string" },
                    state: { type: "string" },
                    country: { type: "string" },
                    latitude: { type: "number" },
                    longitude: { type: "number" },
                    type: { type: "string" }
                  }
                }
              }
            },
            required: ["suggestions"]
          };
          break;
        case 'company':
          prompt = `Suggest 5 well-known companies that match: "${query}". Include company names and industries.`;
          responseSchema = {
            type: "object",
            properties: {
              suggestions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    industry: { type: "string" },
                    description: { type: "string" }
                  }
                }
              }
            },
            required: ["suggestions"]
          };
          break;
        case 'brand':
          prompt = `Suggest 5 popular brands that match: "${query}". Include brand names and categories.`;
          responseSchema = {
            type: "object",
            properties: {
              suggestions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    category: { type: "string" },
                    description: { type: "string" }
                  }
                }
              }
            },
            required: ["suggestions"]
          };
          break;
        default:
          prompt = `Provide 5 relevant suggestions for: "${query}"`;
          responseSchema = {
            type: "object",
            properties: {
              suggestions: {
                type: "array",
                items: { type: "string" }
              }
            },
            required: ["suggestions"]
          };
      }

      const response = await InvokeLLM({
        prompt,
        response_json_schema: responseSchema,
        add_context_from_internet: true
      });

      if (response && response.suggestions) {
        setSuggestions(response.suggestions);
        setShowSuggestions(true);
        setSelectedIndex(-1);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    }
    setIsLoading(false);
  };

  const handleInputChange = (e) => {
    onChange(e.target.value);
    setSelectedIndex(-1);
  };

  const handleSuggestionClick = (suggestion) => {
    const suggestionText = type === 'location' 
      ? `${suggestion.address}, ${suggestion.city}` 
      : suggestion.name || suggestion;
    
    onChange(suggestionText);
    if (onSelect) onSelect(suggestion);
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSuggestionClick(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const getTypeIcon = (suggestionType) => {
    switch (suggestionType || type) {
      case 'location': return <MapPin className="w-4 h-4 text-blue-500" />;
      case 'company': return <Building className="w-4 h-4 text-green-500" />;
      case 'brand': return <Star className="w-4 h-4 text-purple-500" />;
      default: return <Search className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTypeBadgeColor = (suggestionType) => {
    switch (suggestionType || type) {
      case 'location': 
        return 'bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-950/40 dark:to-cyan-950/40 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-600';
      case 'company': 
        return 'bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-950/40 dark:to-emerald-950/40 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-600';
      case 'brand': 
        return 'bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-950/40 dark:to-pink-950/40 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-600';
      default: 
        return 'bg-gradient-to-r from-gray-100 to-slate-100 dark:from-gray-950/40 dark:to-slate-950/40 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600';
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <Input
          ref={inputRef}
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`${className} ${isLoading ? 'pr-10' : ''} bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm transition-all duration-200 focus:bg-white dark:focus:bg-gray-800`}
          disabled={disabled}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
        />
        
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="w-5 h-5 bg-gradient-to-r from-[#e574bc] to-[#ea84c9] rounded-full flex items-center justify-center">
              <Loader2 className="w-3 h-3 animate-spin text-white" />
            </div>
          </div>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <Card 
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-2 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-purple-200/50 dark:border-purple-700/50 rounded-2xl shadow-2xl shadow-purple-500/10 overflow-hidden"
        >
          <CardContent className="p-0 max-h-60 overflow-auto">
            {suggestions.map((suggestion, index) => {
              const isSelected = index === selectedIndex;
              const displayText = type === 'location' 
                ? `${suggestion.address}${suggestion.city ? `, ${suggestion.city}` : ''}`
                : suggestion.name || suggestion;

              return (
                <div
                  key={index}
                  className={`px-4 py-3 cursor-pointer border-b border-purple-200/30 dark:border-purple-700/30 last:border-b-0 transition-all duration-200 ${
                    isSelected 
                      ? 'bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/40 dark:to-pink-950/40 transform scale-[1.02]' 
                      : 'hover:bg-gradient-to-r hover:from-purple-25 hover:to-pink-25 dark:hover:from-purple-950/20 dark:hover:to-pink-950/20'
                  }`}
                  onClick={() => handleSuggestionClick(suggestion)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      isSelected 
                        ? 'bg-gradient-to-r from-[#e574bc] to-[#ea84c9] shadow-lg' 
                        : 'bg-gradient-to-r from-gray-100 to-slate-100 dark:from-gray-800 dark:to-slate-800'
                    }`}>
                      {getTypeIcon(type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className={`font-semibold text-sm leading-5 ${
                            isSelected 
                              ? 'text-purple-900 dark:text-purple-100' 
                              : 'text-gray-900 dark:text-white'
                          }`}>
                            {displayText}
                          </div>
                          {suggestion.description && (
                            <div className={`text-xs mt-1 leading-4 ${
                              isSelected 
                                ? 'text-purple-700 dark:text-purple-300' 
                                : 'text-muted-foreground'
                            }`}>
                              {suggestion.description}
                            </div>
                          )}
                        </div>
                        {(suggestion.industry || suggestion.category) && (
                          <Badge className={`text-xs px-2 py-1 rounded-full font-medium ${getTypeBadgeColor(type)}`}>
                            {suggestion.industry || suggestion.category}
                          </Badge>
                        )}
                      </div>
                      {type === 'location' && suggestion.state && (
                        <div className={`text-xs mt-1 flex items-center gap-1 ${
                          isSelected 
                            ? 'text-purple-600 dark:text-purple-400' 
                            : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          <Sparkles className="w-3 h-3" />
                          {suggestion.state}, {suggestion.country}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AutoCompleteInput;