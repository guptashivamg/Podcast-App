import React from 'react';

interface CarouselDotsProps {
  totalSlides: number;
  selectedIndex: number;
  onDotClick: (index: number) => void;
  className?: string;
}

const CarouselDots = ({ 
  totalSlides, 
  selectedIndex, 
  onDotClick,
  className = ""
}: CarouselDotsProps) => {
  return (
    <div className={`flex justify-center w-full mt-4 ${className}`}>
      {Array.from({ length: totalSlides }).map((_, index) => (
        <button
          key={index}
          onClick={() => onDotClick(index)}
          className={`w-3 h-3 rounded-full transition-all mx-1 ${
            index === selectedIndex
              ? 'bg-orange-1 scale-125'
              : 'bg-[white] hover:bg-white/50'
          }`}
          aria-label={`Go to slide ${index + 1}`}
        />
      ))}
    </div>
  );
};

export default CarouselDots;