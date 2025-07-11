/// <reference types="google.maps" />

// google-maps.d.ts - Type definitions for Google Maps API
declare global {
  interface Window {
    google: typeof google;
    initMap?: () => void;
  }
}

declare const google: {
  maps: {
    Map: any;
    InfoWindow: any;
    Circle: any;
    importLibrary: (library: string) => Promise<any>;
    marker: {
      AdvancedMarkerElement: any;
    };
  };
};

export {};
