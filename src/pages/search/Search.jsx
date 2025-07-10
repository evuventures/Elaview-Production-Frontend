import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Property, Campaign } from '@/api/entities';
import AdvancedSearchFilter from '@/components/search/AdvancedSearchFilter';
import SearchResults from '@/components/search/SearchResults';
import { 
  Search, 
  Building, 
  Target, 
  Layers, 
  TrendingUp,
  Clock,
  Sparkles,
  BookOpen,
  MapPin
} from 'lucide-react';
import { motion } from 'framer-motion';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // State
  const [activeTab, setActiveTab] = useState('properties');
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState({
    properties: [],
    campaigns: [],
    areas: []
  });
  const [filteredData, setFilteredData] = useState({
    properties: [],
    campaigns: [],
    areas: []
  });
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('relevance');
  const [searchHistory, setSearchHistory] = useState([]);

  // Get initial search params
  const initialQuery = searchParams.get('q') || '';
  const initialType = searchParams.get('type') || 'properties';

  // ✅ FIXED: Set initial tab type
  useEffect(() => {
    if (initialType && ['properties', 'campaigns', 'areas'].includes(initialType)) {
      setActiveTab(initialType);
    }
  }, [initialType]); // ✅ FIXED: Added dependency array

  // ✅ FIXED: Load data once when component mounts
  useEffect(() => {
    loadAllData();
  }, []); // ✅ FIXED: Added empty dependency array

  // ✅ FIXED: Load search history once when component mounts
  useEffect(() => {
    try {
      const history = localStorage.getItem('searchHistory');
      if (history) {
        setSearchHistory(JSON.parse(history));
      }
    } catch (error) {
      console.error('Error loading search history:', error);
    }
  }, []); // ✅ FIXED: Added empty dependency array

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [properties, campaigns] = await Promise.all([
        Property.list().catch(() => []),
        Campaign.list().catch(() => [])
      ]);

      // Mock some advertising areas since we don't have an endpoint yet
      const areas = [
        { 
          id: 1, 
          name: 'Downtown Plaza', 
          type: 'plaza', 
          location: 'Downtown', 
          features: ['high-traffic', 'prime-location'],
          status: 'available',
          priceRange: 1500,
          rating: 4.5,
          description: 'Premium outdoor advertising space in the heart of downtown'
        },
        { 
          id: 2, 
          name: 'Shopping Mall Entrance', 
          type: 'retail', 
          location: 'Mall District', 
          features: ['family-friendly', 'covered'],
          status: 'available',
          priceRange: 800,
          rating: 4.2,
          description: 'High-visibility location at main shopping center entrance'
        },
        { 
          id: 3, 
          name: 'University Campus', 
          type: 'educational', 
          location: 'Campus Area', 
          features: ['young-audience', 'seasonal'],
          status: 'occupied',
          priceRange: 600,
          rating: 4.0,
          description: 'Perfect for targeting university students and faculty'
        }
      ];

      const newData = {
        properties: properties || [],
        campaigns: campaigns || [],
        areas: areas || []
      };

      setData(newData);
      setFilteredData(newData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ FIXED: Apply initial search when data is loaded AND initial query exists
  useEffect(() => {
    if (initialQuery && data.properties.length > 0) {
      // Simulate applying initial search filters
      const filteredProperties = data.properties.filter(property => 
        property.name?.toLowerCase().includes(initialQuery.toLowerCase()) ||
        property.description?.toLowerCase().includes(initialQuery.toLowerCase()) ||
        property.location?.toLowerCase().includes(initialQuery.toLowerCase())
      );
      
      const filteredCampaigns = data.campaigns.filter(campaign => 
        campaign.name?.toLowerCase().includes(initialQuery.toLowerCase()) ||
        campaign.description?.toLowerCase().includes(initialQuery.toLowerCase()) ||
        campaign.target_audience?.toLowerCase().includes(initialQuery.toLowerCase())
      );
      
      const filteredAreas = data.areas.filter(area => 
        area.name?.toLowerCase().includes(initialQuery.toLowerCase()) ||
        area.description?.toLowerCase().includes(initialQuery.toLowerCase()) ||
        area.location?.toLowerCase().includes(initialQuery.toLowerCase())
      );

      setFilteredData({
        properties: filteredProperties,
        campaigns: filteredCampaigns,
        areas: filteredAreas
      });
    }
  }, [initialQuery, data.properties.length]); // ✅ FIXED: More specific dependencies

  // ✅ FIXED: Update URL params when tab changes
  useEffect(() => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('type', activeTab);
    setSearchParams(newParams, { replace: true });
  }, [activeTab]); // ✅ FIXED: Removed circular dependencies

  // Sort data
  const sortedData = useMemo(() => {
    const dataToSort = filteredData[activeTab] || [];
    
    return [...dataToSort].sort((a, b) => {
      switch (sortBy) {
        case 'price_low':
          return (getPrice(a) || 0) - (getPrice(b) || 0);
        case 'price_high':
          return (getPrice(b) || 0) - (getPrice(a) || 0);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'newest':
          return new Date(b.created_at || 0) - new Date(a.created_at || 0);
        case 'budget_high':
          return (b.total_budget || 0) - (a.total_budget || 0);
        case 'budget_low':
          return (a.total_budget || 0) - (b.total_budget || 0);
        default:
          return 0; // relevance - keep original order
      }
    });
  }, [filteredData, activeTab, sortBy]);

  const getPrice = (item) => {
    return item.base_price || 
           item.pricing?.daily_rate || 
           item.total_budget || 
           item.total_amount || 
           0;
  };

  // ✅ FIXED: handleFilter function no longer causes infinite loops
  const handleFilter = (results) => {
    setFilteredData(prev => ({
      ...prev,
      [activeTab]: results
    }));
  };

  const saveSearchToHistory = (query, type, resultsCount) => {
    if (!query.trim()) return;

    const searchEntry = {
      id: Date.now(),
      query,
      type,
      resultsCount,
      timestamp: new Date().toISOString()
    };

    const newHistory = [searchEntry, ...searchHistory.filter(h => h.query !== query)]
      .slice(0, 10); // Keep only last 10 searches

    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
  };

  const getTabCounts = () => {
    return {
      properties: filteredData.properties?.length || 0,
      campaigns: filteredData.campaigns?.length || 0,
      areas: filteredData.areas?.length || 0
    };
  };

  const getTabIcon = (tabName) => {
    const icons = {
      properties: Building,
      campaigns: Target,
      areas: Layers
    };
    return icons[tabName] || Building;
  };

  const getEmptyStateContent = (type) => {
    const content = {
      properties: {
        icon: Building,
        title: 'No Properties Found',
        description: 'Try adjusting your search criteria or explore different locations.',
        action: 'Browse All Properties'
      },
      campaigns: {
        icon: Target,
        title: 'No Campaigns Found',
        description: 'Check out active campaigns or create your own advertising campaign.',
        action: 'View Active Campaigns'
      },
      areas: {
        icon: Layers,
        title: 'No Advertising Areas Found',
        description: 'Discover available advertising spaces in different locations.',
        action: 'Explore Areas'
      }
    };
    return content[type] || content.properties;
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 }
    }
  };

  const counts = getTabCounts();

  return (
    <motion.div
      className="min-h-screen bg-background p-4 md:p-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto bg-gradient-brand rounded-3xl flex items-center justify-center shadow-lg">
            <Search className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gradient-brand">
            Advanced Search
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
            Find the perfect advertising properties, campaigns, and spaces with our powerful search tools
          </p>
        </motion.div>

        {/* Search Tabs */}
        <motion.div variants={itemVariants}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 glass border-[hsl(var(--border))] rounded-2xl p-1">
              {['properties', 'campaigns', 'areas'].map((tab) => {
                const Icon = getTabIcon(tab);
                return (
                  <TabsTrigger 
                    key={tab}
                    value={tab} 
                    className="flex items-center gap-2 rounded-xl data-[state=active]:bg-gradient-brand data-[state=active]:text-white"
                  >
                    <Icon className="w-4 h-4" />
                    <span className="capitalize">{tab}</span>
                    <Badge 
                      variant="secondary" 
                      className="ml-1 h-5 w-auto px-2 text-xs"
                    >
                      {counts[tab]}
                    </Badge>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {/* Search Content */}
            <div className="mt-8 space-y-6">
              {/* Search History */}
              {searchHistory.length > 0 && (
                <motion.div variants={itemVariants}>
                  <Card className="glass border-[hsl(var(--border))] rounded-2xl">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Clock className="w-5 h-5" />
                        Recent Searches
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {searchHistory.slice(0, 5).map((search) => (
                          <Button
                            key={search.id}
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setActiveTab(search.type);
                              // You might want to trigger the search here
                            }}
                            className="rounded-xl"
                          >
                            <Search className="w-3 h-3 mr-1" />
                            "{search.query}" in {search.type}
                            <Badge variant="secondary" className="ml-2">
                              {search.resultsCount}
                            </Badge>
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Tab Content */}
              {['properties', 'campaigns', 'areas'].map((tab) => (
                <TabsContent key={tab} value={tab} className="space-y-6">
                  <motion.div variants={itemVariants}>
                    {/* Advanced Search Filter */}
                    <AdvancedSearchFilter
                      type={tab}
                      data={data[tab] || []}
                      onFilter={handleFilter}
                      className="mb-6"
                    />
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    {/* Search Results */}
                    <SearchResults
                      results={sortedData}
                      type={tab}
                      loading={isLoading}
                      viewMode={viewMode}
                      onViewModeChange={setViewMode}
                      onSort={setSortBy}
                      sortBy={sortBy}
                    />
                  </motion.div>
                </TabsContent>
              ))}
            </div>
          </Tabs>
        </motion.div>

        {/* Quick Stats */}
        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="glass border-[hsl(var(--border))] rounded-2xl overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center">
                    <Building className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{data.properties?.length || 0}</p>
                    <p className="text-sm text-muted-foreground">Total Properties</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-[hsl(var(--border))] rounded-2xl overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{data.campaigns?.length || 0}</p>
                    <p className="text-sm text-muted-foreground">Active Campaigns</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-[hsl(var(--border))] rounded-2xl overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                    <Layers className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{data.areas?.length || 0}</p>
                    <p className="text-sm text-muted-foreground">Available Spaces</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Tips Card */}
        <motion.div variants={itemVariants}>
          <Card className="glass border-[hsl(var(--border))] rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-[hsl(var(--muted))]/50 to-[hsl(var(--accent-light))]/30 border-b border-[hsl(var(--border))]">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Search Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold">Quick Tips</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Use specific keywords like "downtown", "billboard", or "digital"</li>
                    <li>• Filter by price range to find options within your budget</li>
                    <li>• Save frequently used searches for quick access</li>
                    <li>• Use location search to find properties in specific areas</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold">Advanced Features</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Combine multiple filters for precise results</li>
                    <li>• Sort by relevance, price, or rating</li>
                    <li>• Switch between grid and list views</li>
                    <li>• Bookmark your favorite properties</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default SearchPage;