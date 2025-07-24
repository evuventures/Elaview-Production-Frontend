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
  
  // Altura máxima que a sheet pode ir (deixar 15vh livres para search bar)
  const MAX_HEIGHT_VH = 70; // Reduzido de 85 para 70
  
  // Transform Y position to dynamic height - menos sensível
  const height = useTransform(y, 
    [-MAX_HEIGHT_VH, 0], 
    [`${MAX_HEIGHT_VH}vh`, '35vh']
  );

  // Função para animar para um estado específico (apenas para taps, não drag)
  const animateToState = (state) => {
    let targetY;
    if (state === 'peek') {
      targetY = 0;
      setSheetState('peek');
    } else if (state === 'half') {
      targetY = -25; // Ajustado para nova altura máxima
      setSheetState('half');
    } else {
      targetY = -45; // Ajustado para nova altura máxima (não vai atrás da search bar)
      setSheetState('full');
    }
    
    controls.start({ y: targetY });
  };

  // Update sheet state based on current position (durante o drag) - menos sensível
  const updateSheetState = (currentY) => {
    if (currentY > -12) { // Menos sensível
      setSheetState('peek');
    } else if (currentY > -30) { // Menos sensível
      setSheetState('half');
    } else {
      setSheetState('full');
    }
  };

  // Listen to Y changes during drag to update state
  useEffect(() => {
    const unsubscribe = y.onChange((latest) => {
      updateSheetState(latest);
    });
    return unsubscribe;
  }, [y]);

  // Handle drag end - snap to nearest state apenas no final
  const handleDragEnd = (event, info) => {
    const velocity = info.velocity.y;
    const currentY = y.get();
    
    // Snap suave baseado em velocidade e posição - menos sensível
    if (velocity > 500) {
      // Swipe rápido para baixo
      animateToState('peek');
    } else if (velocity < -500) {
      // Swipe rápido para cima 
      animateToState('full');
    } else {
      // Snap para o estado mais próximo baseado na posição atual - ajustado para nova altura
      if (currentY > -12) { // Menos sensível
        animateToState('peek');
      } else if (currentY > -30) { // Tolerante para half
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
        dragConstraints={{ top: -MAX_HEIGHT_VH, bottom: 0 }}
        dragElastic={0.1}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        animate={controls}
        style={{ y, height }}
        className="bg-background rounded-t-2xl shadow-xl border-t border-border pointer-events-auto flex flex-col"
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
        <div className="px-4 pb-4 overflow-hidden flex-1">
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
