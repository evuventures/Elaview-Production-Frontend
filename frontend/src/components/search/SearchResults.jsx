import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  MapPin, 
  DollarSign, 
  Star, 
  Eye, 
  Heart,
  Grid3X3,
  List,
  SortAsc,
  Filter,
  TrendingUp,
  Clock,
  Building
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';

const SearchResults = ({
  results = [],
  type = 'properties', // 'properties', 'campaigns', 'areas'
  loading = false,
  viewMode = 'grid', // 'grid', 'list'
  onViewModeChange,
  onSort,
  sortBy = 'relevance',
  className = ""
}) => {
  const [favorites, setFavorites] = useState([]);

  const sortOptions = {
    properties: [
      { value: 'relevance', label: 'Relevance' },
      { value: 'price_low', label: 'Price: Low to High' },
      { value: 'price_high', label: 'Price: High to Low' },
      { value: 'rating', label: 'Highest Rated' },
      { value: 'distance', label: 'Distance' },
      { value: 'newest', label: 'Newest First' }
    ],
    campaigns: [
      { value: 'relevance', label: 'Relevance' },
      { value: 'budget_high', label: 'Budget: High to Low' },
      { value: 'budget_low', label: 'Budget: Low to High' },
      { value: 'newest', label: 'Newest First' },
      { value: 'ending_soon', label: 'Ending Soon' },
      { value: 'status', label: 'Status' }
    ],
    areas: [
      { value: 'relevance', label: 'Relevance' },
      { value: 'price_low', label: 'Price: Low to High' },
      { value: 'price_high', label: 'Price: High to Low' },
      { value: 'size_large', label: 'Size: Largest First' },
      { value: 'popularity', label: 'Most Popular' }
    ]
  };

  const toggleFavorite = (itemId) => {
    setFavorites(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'active': { variant: 'default', label: 'Active' },
      'available': { variant: 'default', label: 'Available' },
      'booked': { variant: 'secondary', label: 'Booked' },
      'pending': { variant: 'secondary', label: 'Pending' },
      'maintenance': { variant: 'destructive', label: 'Maintenance' },
      'inactive': { variant: 'outline', label: 'Inactive' },
      'draft': { variant: 'outline', label: 'Draft' },
      'completed': { variant: 'default', label: 'Completed' }
    };
    
    return statusMap[status] || { variant: 'outline', label: status };
  };

  const formatPrice = (price, type) => {
    if (!price) return 'Price on request';
    
    switch (type) {
      case 'properties':
      case 'areas':
        return `$${price.toLocaleString()}/day`;
      case 'campaigns':
        return `$${price.toLocaleString()} budget`;
      default:
        return `$${price.toLocaleString()}`;
    }
  };

  const getImageUrl = (item) => {
    if (item.images && item.images.length > 0) {
      return item.images[0];
    }
    if (item.photos && item.photos.length > 0) {
      return item.photos[0];
    }
    if (item.campaign_image_url) {
      return item.campaign_image_url;
    }
    return `https://via.placeholder.com/400x300/6169A7/ffffff?text=${type.charAt(0).toUpperCase() + type.slice(1)}`;
  };

  const getItemUrl = (item) => {
    switch (type) {
      case 'properties':
        return createPageUrl(`Map?property_id=${item.id}`);
      case 'campaigns':
        return createPageUrl(`CampaignDetails?id=${item.id}`);
      case 'areas':
        return createPageUrl(`PropertyManagement?id=${item.property_id}&area_id=${item.id}`);
      default:
        return '#';
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: 'easeOut'
      }
    }
  };

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="h-6 w-32 bg-muted animate-pulse rounded" />
          <div className="h-8 w-24 bg-muted animate-pulse rounded" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="h-48 bg-muted animate-pulse" />
              <CardContent className="p-4 space-y-3">
                <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
                <div className="h-6 bg-muted animate-pulse rounded w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold">
            {results.length} {type} found
          </h2>
          {results.length > 0 && (
            <Badge variant="secondary" className="px-3 py-1">
              <Search className="w-3 h-3 mr-1" />
              Results
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Sort Options */}
          <Select value={sortBy} onValueChange={onSort}>
            <SelectTrigger className="w-48 glass border-[hsl(var(--border))] rounded-xl">
              <SortAsc className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="glass-strong border-[hsl(var(--border))] rounded-xl">
              {sortOptions[type]?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* View Mode Toggle */}
          <div className="flex rounded-xl border border-[hsl(var(--border))] overflow-hidden">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange && onViewModeChange('grid')}
              className="rounded-none"
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange && onViewModeChange('list')}
              className="rounded-none"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Results Grid/List */}
      {results.length === 0 ? (
        <Card className="glass border-[hsl(var(--border))] rounded-2xl">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-[hsl(var(--muted))] to-[hsl(var(--muted))]/80 rounded-full flex items-center justify-center">
              <Search className="w-10 h-10 text-[hsl(var(--muted-foreground))]" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-4">No results found</h3>
            <p className="text-muted-foreground text-lg mb-6">
              Try adjusting your search terms or filters to find what you're looking for.
            </p>
            <Button variant="outline" className="rounded-xl">
              <Filter className="w-4 h-4 mr-2" />
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <motion.div
          className={viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            : "space-y-4"
          }
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence>
            {results.map((item, index) => (
              <motion.div
                key={item.id}
                variants={itemVariants}
                layout
                className={viewMode === 'list' ? 'w-full' : ''}
              >
                {viewMode === 'grid' ? (
                  <ResultCard
                    item={item}
                    type={type}
                    isFavorite={favorites.includes(item.id)}
                    onToggleFavorite={toggleFavorite}
                    getStatusBadge={getStatusBadge}
                    formatPrice={formatPrice}
                    getImageUrl={getImageUrl}
                    getItemUrl={getItemUrl}
                  />
                ) : (
                  <ResultListItem
                    item={item}
                    type={type}
                    isFavorite={favorites.includes(item.id)}
                    onToggleFavorite={toggleFavorite}
                    getStatusBadge={getStatusBadge}
                    formatPrice={formatPrice}
                    getImageUrl={getImageUrl}
                    getItemUrl={getItemUrl}
                  />
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};

// Grid Card Component
const ResultCard = ({ 
  item, 
  type, 
  isFavorite, 
  onToggleFavorite, 
  getStatusBadge, 
  formatPrice, 
  getImageUrl, 
  getItemUrl 
}) => {
  const statusBadge = getStatusBadge(item.status);
  
  return (
    <Card className="group glass border-[hsl(var(--border))] rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className="relative">
        <img
          src={getImageUrl(item)}
          alt={item.name || item.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Overlay Badges */}
        <div className="absolute top-4 left-4 flex gap-2">
          <Badge className={`backdrop-blur-sm`} variant={statusBadge.variant}>
            {statusBadge.label}
          </Badge>
          {item.featured && (
            <Badge className="bg-gradient-brand text-white backdrop-blur-sm">
              <Star className="w-3 h-3 mr-1 fill-current" />
              Featured
            </Badge>
          )}
        </div>

        {/* Favorite Button */}
        {/* Favorite button removed */}

        {/* Price Tag */}
        <div className="absolute bottom-4 right-4">
          <Badge className="bg-black/80 text-white backdrop-blur-sm">
            <DollarSign className="w-3 h-3 mr-1" />
            {formatPrice(item.base_price || item.total_budget || item.pricing?.daily_rate, type)}
          </Badge>
        </div>
      </div>

      <CardContent className="p-6 space-y-4">
        <div>
          <h3 className="text-lg font-bold text-foreground group-hover:text-[hsl(var(--primary))] transition-colors line-clamp-2">
            {item.name || item.title}
          </h3>
          {item.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {item.description}
            </p>
          )}
        </div>

        {/* Location */}
        {item.location && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span className="truncate">
              {item.location.city || item.location.address}
            </span>
          </div>
        )}

        {/* Rating */}
        {item.rating && (
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(item.rating) 
                      ? 'text-yellow-500 fill-current' 
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              {item.rating.toFixed(1)} ({item.review_count || 0} reviews)
            </span>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2">
          <Button asChild className="w-full rounded-xl">
            <Link to={getItemUrl(item)}>
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// List Item Component
const ResultListItem = ({ 
  item, 
  type, 
  isFavorite, 
  onToggleFavorite, 
  getStatusBadge, 
  formatPrice, 
  getImageUrl, 
  getItemUrl 
}) => {
  const statusBadge = getStatusBadge(item.status);
  
  return (
    <Card className="glass border-[hsl(var(--border))] rounded-2xl overflow-hidden hover:shadow-md transition-all duration-200">
      <CardContent className="p-6">
        <div className="flex gap-6">
          {/* Image */}
          <div className="relative flex-shrink-0">
            <img
              src={getImageUrl(item)}
              alt={item.name || item.title}
              className="w-32 h-24 object-cover rounded-xl"
            />
            <Badge 
              className="absolute -top-2 -right-2 backdrop-blur-sm" 
              variant={statusBadge.variant}
            >
              {statusBadge.label}
            </Badge>
          </div>

          {/* Content */}
          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-foreground hover:text-[hsl(var(--primary))] transition-colors">
                  {item.name || item.title}
                </h3>
                {item.location && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                    <MapPin className="w-3 h-3" />
                    {item.location.city || item.location.address}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <div className="text-right">
                  <div className="font-bold text-lg text-[hsl(var(--success))]">
                    {formatPrice(item.base_price || item.total_budget || item.pricing?.daily_rate, type)}
                  </div>
                  {item.rating && (
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="w-3 h-3 text-yellow-500 fill-current" />
                      {item.rating.toFixed(1)}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {item.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {item.description}
              </p>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                {item.type && (
                  <div className="flex items-center gap-1">
                    <Building className="w-3 h-3" />
                    {item.type.replace('_', ' ')}
                  </div>
                )}
                {item.created_at && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(item.created_at).toLocaleDateString()}
                  </div>
                )}
              </div>

              <Button asChild size="sm" className="rounded-xl">
                <Link to={getItemUrl(item)}>
                  <Eye className="w-3 h-3 mr-1" />
                  View
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SearchResults;
