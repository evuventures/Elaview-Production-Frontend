import React from 'react';
import useIsMobile from '@/hooks/use-mobile';
import MobileTopBar from '@/components/layout/MobileTopBar';
import MobileSearchBar from '@/components/mobile/MobileSearchBar';
import MobilePropertiesView from '@/components/mobile/MobilePropertiesView';
import MobileNav from '@/components/layout/nested/MobileNav';
import GoogleMap from '@/components/browse/maps/GoogleMap'; // ajuste o caminho se necessário

export default function MobileLayout({ properties, allAreasMap, searchTerm, setSearchTerm, onAISearch }) {
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  return (
    <div className="flex flex-col h-screen bg-background text-foreground pt-16">
      <MobileTopBar />

      {/* Search bar */}
      <div className="px-4">
        <MobileSearchBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onAISearch={onAISearch}
        />
      </div>

      {/* Map */}
      <div className="flex-1 relative z-0">
        <GoogleMap properties={properties} allAreasMap={allAreasMap} />
      </div>

      {/* Bottom Sheet with cards */}
      <div className="relative z-10">
        <MobilePropertiesView properties={properties} allAreasMap={allAreasMap} />
      </div>

      {/* Navbar */}
      <MobileNav />
    </div>
  );
}