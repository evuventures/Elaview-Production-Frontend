import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Search, Calendar as CalendarIcon, SlidersHorizontal, Filter, X, MapPin } from 'lucide-react';
import { format } from 'date-fns';

const FilterControls = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  dateRange,
  setDateRange,
}) => {
  const hasActiveFilters = searchTerm || statusFilter !== 'all' || (dateRange?.from && dateRange?.to);

  const clearAllFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    if (setDateRange) {
      setDateRange({ from: undefined, to: undefined });
    }
  };

  const getStatusIndicator = (status) => {
    const indicators = {
      'active': { color: 'bg-[hsl(var(--success))]', label: 'Active' },
      'booked': { color: 'bg-[hsl(var(--primary))]', label: 'Booked' },
      'maintenance': { color: 'bg-[hsl(var(--warning))]', label: 'Maintenance' },
      'inactive': { color: 'bg-[hsl(var(--muted-foreground))]', label: 'Inactive' },
      'pending_removal': { color: 'bg-[hsl(var(--destructive))]', label: 'Pending Removal' },
    };
    return indicators[status] || { color: 'bg-[hsl(var(--muted-foreground))]', label: status };
  };

  return (
    <div className="flex items-center gap-3">
      {/* Quick Search */}
      <div className="relative min-w-[250px]">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search spaces..."
          className="pl-10 glass border-[hsl(var(--border))] rounded-2xl py-3 px-4 focus-brand transition-brand"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSearchTerm('')}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-[hsl(var(--muted))] rounded-full transition-brand"
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>

      {/* Advanced Filters Popover */}
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className={`gap-2 glass hover:bg-[hsl(var(--card))] border-[hsl(var(--border))] rounded-2xl py-3 px-4 transition-brand ${
              hasActiveFilters ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5' : ''
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
            {hasActiveFilters && (
              <div className="w-2 h-2 bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] rounded-full"></div>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 glass-strong border-[hsl(var(--border))] rounded-3xl shadow-[var(--shadow-brand-lg)] p-0 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[hsl(var(--muted))]/80 to-[hsl(var(--accent-light))]/30 border-b border-[hsl(var(--border))] p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] rounded-2xl flex items-center justify-center shadow-[var(--shadow-brand)]">
                <SlidersHorizontal className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-lg text-[hsl(var(--foreground))]">Space Filters</h4>
                <p className="text-sm text-muted-foreground">Refine your view of advertising spaces</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Status Filter */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-[hsl(var(--foreground))]">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full glass border-[hsl(var(--border))] rounded-2xl py-3 focus-brand transition-brand">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="glass-strong border-[hsl(var(--border))] rounded-2xl">
                  <SelectItem value="all" className="rounded-xl">All Statuses</SelectItem>
                  <SelectItem value="active" className="rounded-xl">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-[hsl(var(--success))] rounded-full"></div>
                      Active
                    </div>
                  </SelectItem>
                  <SelectItem value="booked" className="rounded-xl">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-[hsl(var(--primary))] rounded-full"></div>
                      Booked
                    </div>
                  </SelectItem>
                  <SelectItem value="maintenance" className="rounded-xl">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-[hsl(var(--warning))] rounded-full"></div>
                      Maintenance
                    </div>
                  </SelectItem>
                  <SelectItem value="inactive" className="rounded-xl">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-[hsl(var(--muted-foreground))] rounded-full"></div>
                      Inactive
                    </div>
                  </SelectItem>
                  <SelectItem value="pending_removal" className="rounded-xl">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-[hsl(var(--destructive))] rounded-full"></div>
                      Pending Removal
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Range Filter */}
            {dateRange && setDateRange && (
              <div className="space-y-3">
                <label className="text-sm font-semibold text-[hsl(var(--foreground))]">Date Range</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start font-normal glass border-[hsl(var(--border))] rounded-2xl py-3 hover:bg-[hsl(var(--card))] focus-brand transition-brand"
                    >
                      <CalendarIcon className="mr-3 h-4 w-4" />
                      {dateRange.from ? (
                        dateRange.to ? (
                          <span>{format(dateRange.from, "MMM d")} - {format(dateRange.to, "MMM d")}</span>
                        ) : (
                          format(dateRange.from, "MMM d")
                        )
                      ) : (
                        <span className="text-muted-foreground">Select date range</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 glass-strong border-[hsl(var(--border))] rounded-2xl shadow-[var(--shadow-brand-lg)]" align="start">
                    <Calendar 
                      initialFocus 
                      mode="range" 
                      defaultMonth={dateRange.from} 
                      selected={dateRange} 
                      onSelect={setDateRange} 
                      numberOfMonths={1}
                      className="rounded-2xl"
                    />
                    <div className="p-3 border-t border-[hsl(var(--border))]">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setDateRange({ from: undefined, to: undefined })} 
                        className="w-full rounded-xl hover:bg-[hsl(var(--muted))] transition-brand"
                      >
                        Clear dates
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            )}

            {/* Filter Actions */}
            {hasActiveFilters && (
              <div className="pt-4 border-t border-[hsl(var(--border))]">
                <Button
                  variant="outline"
                  onClick={clearAllFilters}
                  className="w-full bg-[hsl(var(--destructive))]/5 hover:bg-[hsl(var(--destructive))]/10 border-[hsl(var(--destructive))] text-[hsl(var(--destructive))] rounded-2xl py-3 font-medium transition-brand"
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear All Filters
                </Button>
              </div>
            )}

            {/* Filter Summary */}
            {hasActiveFilters && (
              <div className="bg-[hsl(var(--primary))]/5 rounded-2xl p-4">
                <p className="text-sm font-medium text-[hsl(var(--primary))] mb-2">Active Filters:</p>
                <div className="flex flex-wrap gap-2">
                  {searchTerm && (
                    <div className="glass-strong px-3 py-1 rounded-full text-xs font-medium border border-[hsl(var(--border))] flex items-center gap-1">
                      <Search className="w-3 h-3" />
                      "{searchTerm}"
                    </div>
                  )}
                  {statusFilter !== 'all' && (
                    <div className="glass-strong px-3 py-1 rounded-full text-xs font-medium border border-[hsl(var(--border))] flex items-center gap-1">
                      <div className={`w-2 h-2 ${getStatusIndicator(statusFilter).color} rounded-full`}></div>
                      {getStatusIndicator(statusFilter).label}
                    </div>
                  )}
                  {dateRange?.from && dateRange?.to && (
                    <div className="glass-strong px-3 py-1 rounded-full text-xs font-medium border border-[hsl(var(--border))] flex items-center gap-1">
                      <CalendarIcon className="w-3 h-3" />
                      {format(dateRange.from, "MMM d")} - {format(dateRange.to, "MMM d")}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Space Type Categories (Optional Enhancement) */}
            <div className="bg-gradient-to-r from-[hsl(var(--primary))]/5 to-[hsl(var(--accent))]/5 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-[hsl(var(--primary))]" />
                <p className="text-sm font-medium text-[hsl(var(--primary))]">Quick Filters:</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {['Billboard', 'Digital Display', 'Transit', 'Street Furniture'].map((type) => (
                  <Button
                    key={type}
                    variant="ghost"
                    size="sm"
                    className="glass hover:bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl text-xs font-medium transition-brand"
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default FilterControls;