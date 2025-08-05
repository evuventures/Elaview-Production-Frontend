import React from 'react';
import SpaceCard from './SpaceCard';

export default function SpacesGrid({
  spaces,
  onSpaceCardClick,
  onSpaceClick,
  animatingSpace,
  savedSpaces,
  toggleSavedSpace,
  isInCart,
  addToCart
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {spaces.map(space => (
        <SpaceCard
          key={space.id}
          space={space}
          onCardClick={onSpaceCardClick}
          onSpaceClick={onSpaceClick}
          isAnimating={animatingSpace === space.id}
          savedSpaces={savedSpaces}
          toggleSavedSpace={toggleSavedSpace}
          isInCart={isInCart}
          addToCart={addToCart}
        />
      ))}
    </div>
  );
}