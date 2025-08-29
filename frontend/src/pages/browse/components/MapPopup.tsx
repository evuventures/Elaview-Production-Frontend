import React, { useState } from 'react';
import { X, Heart, ShoppingCart, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Space {
  id: string;
  name: string;
  title?: string;
  description?: string;
  type: string;
  baseRate?: number;
  pricing?: any;
  rateType?: string;
  currency?: string;
  status?: string;
  isActive?: boolean;
  images?: string;
  city: string;
  state?: string;
  country: string;
  coordinates?: {
    lat: number;
    lng: number;
  } | any;
  propertyId?: string;
  propertyName?: string;
  propertyAddress?: string;
  propertyCoords?: { lat: number; lng: number };
  property?: any;
}

interface MapPopupProps {
  space: Space;
  onClose: () => void;
  onAddToCart?: (space: Space) => void;
  onToggleFavorite?: (spaceId: string) => void;
  isInCart?: (spaceId: string) => boolean;
  isFavorite?: (spaceId: string) => boolean;
}

const MapPopup: React.FC<MapPopupProps> = ({
  space,
  onClose,
  onAddToCart,
  onToggleFavorite,
  isInCart,
  isFavorite,
}) => {
  const [expanded, setExpanded] = useState(false);

  const getFirstImage = (space: Space): string | null => {
    if (typeof space.images === 'string') {
      try {
        if (space.images.trim().startsWith('[')) {
          const arr = JSON.parse(space.images);
          if (Array.isArray(arr) && arr.length > 0) return arr[0];
        }
      } catch {}
      if (space.images.startsWith('http')) return space.images;
    }
    return null;
  };

  return (
    <div
      className="relative z-50 bg-white rounded-xl shadow-lg p-3 min-w-[260px] max-w-xs border border-slate-200"
    >
      <div className="relative w-full h-28 bg-slate-100 rounded-lg overflow-hidden mb-2">
        {getFirstImage(space) ? (
          <img src={getFirstImage(space)!} alt={space.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">No image</div>
        )}
        <button
          className="absolute top-1 right-1 p-1.5 rounded-full bg-white/80 hover:bg-white shadow"
          onClick={onClose}
          aria-label="Close"
        >
          <X className="w-4 h-4 text-slate-500" />
        </button>
        <button
          className="absolute top-1 left-1 p-1.5 rounded-full bg-white/80 hover:bg-white shadow"
          onClick={() => onToggleFavorite?.(space.id)}
          aria-label="Favorite"
        >
          <Heart className={`w-4 h-4 ${isFavorite?.(space.id) ? 'text-red-500 fill-red-500' : 'text-slate-700'}`} />
        </button>
      </div>
      <div className="flex items-center justify-between mb-1">
        <div>
          <h3 className="text-sm font-semibold mb-0.5">{space.name || space.title}</h3>
          <span className="text-xs text-slate-500">{space.propertyName}</span>
        </div>
        <button
          className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200"
          onClick={() => onAddToCart?.(space)}
          aria-label="Add to cart"
        >
          <ShoppingCart className={`w-4 h-4 ${isInCart?.(space.id) ? 'text-blue-500 fill-blue-500' : 'text-slate-700'}`} />
        </button>
      </div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-base font-bold text-[#4668AB]">
          {space.baseRate ? `$${space.baseRate}/${space.rateType?.toLowerCase() || 'day'}` : 'Contact for pricing'}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="text-xs text-slate-500 hover:text-[#4668AB]"
          onClick={() => setExpanded((e) => !e)}
        >
          Details <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
      {expanded && (
        <div className="mt-2 text-xs text-slate-600">
          <div className="mb-1 font-semibold">{space.title}</div>
          <div>{space.description}</div>
        </div>
      )}
      <div
        className="absolute left-1/2 top-full"
        style={{ transform: 'translate(-50%, 0)' }}
      >
        <div
          style={{
            width: 0,
            height: 0,
            borderLeft: '8px solid transparent',
            borderRight: '8px solid transparent',
            borderTop: '8px solid white',
          }}
        />
      </div>
    </div>
  );
};

export default MapPopup;
