// src/components/layout/MobileBottomSheet.jsx
import React, { useState, useRef, useEffect } from 'react';
import { motion, useAnimation, useMotionValue, useTransform } from 'framer-motion';
import { ChevronUp } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import MobilePropertyCard from '@/components/mobile/MobilePropertyCard';

const MobileBottomSheet = ({ properties = [], selectedProperty, onPropertySelect }) => {
  const [sheetState, setSheetState] = useState('peek'); // 'peek', 'half', 'full'
  const constraintsRef = useRef(null);
  const controls = useAnimation();
  const y = useMotionValue(0);
  
  // Usar vh units para movimento mais suave
  const PEEK_HEIGHT = 35; // 35vh
  const HALF_HEIGHT = 65; // 65vh  
  const FULL_HEIGHT = 85; // 85vh (para não ir atrás da search bar)

  // Função para animar para um estado específico
  const animateToState = (state) => {
    let targetY;
    if (state === 'peek') {
      targetY = 0;
    } else if (state === 'half') {
      targetY = -30; // Move 30vh para cima
    } else {
      targetY = -50; // Move 50vh para cima (máximo)
    }
    
    controls.start({ y: `${targetY}vh` });
    setSheetState(state);
  };

  // Handle drag end - snap to nearest state
  const handleDragEnd = (event, info) => {
    const velocity = info.velocity.y;
    const currentY = parseFloat(y.get()) || 0;
    
    // Calculate which state to snap to based on position and velocity
    if (velocity > 300) {
      // Fast downward swipe - go to peek
      animateToState('peek');
    } else if (velocity < -300) {
      // Fast upward swipe - go to full
      animateToState('full');
    } else {
      // Based on position - usar valores vh mais simples
      if (currentY > -15) {
        animateToState('peek');
      } else if (currentY > -35) {
        animateToState('half');
      } else {
        animateToState('full');
      }
    }
  };

  // Handle header tap to toggle between states
  const handleHeaderTap = () => {
    if (sheetState === 'peek') {
      animateToState('half');
    } else if (sheetState === 'half') {
      animateToState('full');
    } else {
      animateToState('peek');
    }
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 pointer-events-none">
      <motion.div
        drag="y"
        dragConstraints={{ top: -50, bottom: 0 }}
        dragElastic={0.2}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        animate={controls}
        style={{ y }}
        className="bg-background rounded-t-2xl shadow-xl border-t border-border pointer-events-auto"
        initial={{ y: 0 }}
      >
        {/* Drag Handle */}
        <div 
          className="flex flex-col items-center pt-4 pb-2 cursor-pointer"
          onClick={handleHeaderTap}
        >
          <div className="w-12 h-1 bg-muted-foreground/30 rounded-full mb-3" />
          <div className="flex items-center gap-2 px-4">
            <ChevronUp className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${
              sheetState === 'full' ? 'rotate-180' : ''
            }`} />
            <h2 className="text-lg font-semibold text-foreground">
              {properties.length} Properties Available
            </h2>
          </div>
        </div>

        {/* Content */}
        <div 
          className="px-4 pb-4 overflow-hidden"
          style={{ 
            height: sheetState === 'peek' ? `${PEEK_HEIGHT}vh` : 
                   sheetState === 'half' ? `${HALF_HEIGHT}vh` : `${FULL_HEIGHT}vh`
          }}
        >
          <ScrollArea className="h-full">
            {sheetState === 'peek' ? (
              // Peek state - horizontal scroll of cards
              <div className="flex gap-4 pb-4 overflow-x-auto">
                {properties.slice(0, 5).map((property) => (
                  <MobilePropertyCard 
                    key={property.id} 
                    property={property}
                    isSelected={selectedProperty?.id === property.id}
                    onSelect={onPropertySelect}
                    variant="horizontal"
                  />
                ))}
              </div>
            ) : (
              // Half/Full state - vertical list
              <div className="space-y-3 pb-4">
                {properties.map((property) => (
                  <MobilePropertyCard 
                    key={property.id} 
                    property={property}
                    isSelected={selectedProperty?.id === property.id}
                    onSelect={onPropertySelect}
                    variant="vertical"
                  />
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </motion.div>
    </div>
  );
};

export default MobileBottomSheet;
