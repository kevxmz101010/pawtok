"use client"
import React, { createContext, useContext, forwardRef } from 'react';
import useEmblaCarousel, { UseEmblaCarouselType } from 'embla-carousel-react';
import { PrevButton, NextButton, useCarouselButtons } from './carousel-button';
import { CarouselIndicator as BaseIndicator, useCarouselIndicator } from './carousel-indicator';

type CarouselContextType = {
  carouselRef: UseEmblaCarouselType[0];
  api: UseEmblaCarouselType[1];
};

const CarouselContext = createContext<CarouselContextType | null>(null);

function useCarousel() {
  const context = useContext(CarouselContext);
  if (!context) {
    throw new Error('useCarousel must be used within a <Carousel.Root />');
  }
  return context;
}

const Root = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { 
    setApi?: (api: UseEmblaCarouselType[1]) => void,
    opts?: any,
    plugins?: any[]
  }>(
  ({ className, children, setApi, opts, plugins, ...props }, ref) => {
    const [carouselRef, api] = useEmblaCarousel(
      { align: 'center', ...opts },
      plugins
    );

    React.useEffect(() => {
      if (api && setApi) {
        setApi(api);
      }
    }, [api, setApi]);

    return (
      <CarouselContext.Provider value={{ carouselRef, api }}>
        <div ref={ref} className={`relative ${className || ''}`} {...props}>
          {children}
        </div>
      </CarouselContext.Provider>
    );
  }
);
Root.displayName = "CarouselRoot";

const Content = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    const { carouselRef } = useCarousel();
    return (
      <div ref={carouselRef} className="overflow-hidden h-full py-4">
        <div ref={ref} className={`flex h-full ${className || ''}`} {...props}>
          {React.Children.map(children, (child, index) => {
            if (React.isValidElement(child)) {
              return React.cloneElement(child, { index } as any);
            }
            return child;
          })}
        </div>
      </div>
    );
  }
);
Content.displayName = "CarouselContent";

const Item = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { index?: number }>(
  ({ className, children, index, ...props }, ref) => {
    const { api } = useCarousel();
    const [selected, setSelected] = React.useState(false);

    React.useEffect(() => {
      if (!api || index === undefined) return;
      const onSelect = () => setSelected(api.selectedScrollSnap() === index);
      api.on("select", onSelect);
      api.on("reInit", onSelect);
      onSelect();
      return () => { 
        api.off("select", onSelect);
        api.off("reInit", onSelect);
      };
    }, [api, index]);

    return (
      <div 
        ref={ref} 
        className={`min-w-0 shrink-0 grow-0 transition-all duration-500 ease-out px-2 ${
          selected ? 'scale-100 opacity-100' : 'scale-90 opacity-40'
        } ${className || ''}`} 
        {...props}
      >
        {children}
      </div>
    );
  }
);
Item.displayName = "CarouselItem";

const PrevTrigger = forwardRef<HTMLButtonElement, React.HTMLAttributes<HTMLButtonElement>>(
  ({ className, children, ...props }, ref) => {
    const { api } = useCarousel();
    const { prevBtnDisabled, onPrevButtonClick } = useCarouselButtons(api);
    return (
      <button
        ref={ref}
        type="button"
        className={className}
        disabled={prevBtnDisabled}
        onClick={onPrevButtonClick}
        {...props}
      >
        {children}
      </button>
    );
  }
);
PrevTrigger.displayName = "CarouselPrevTrigger";

const NextTrigger = forwardRef<HTMLButtonElement, React.HTMLAttributes<HTMLButtonElement>>(
  ({ className, children, ...props }, ref) => {
    const { api } = useCarousel();
    const { nextBtnDisabled, onNextButtonClick } = useCarouselButtons(api);
    return (
      <button
        ref={ref}
        type="button"
        className={className}
        disabled={nextBtnDisabled}
        onClick={onNextButtonClick}
        {...props}
      >
        {children}
      </button>
    );
  }
);
NextTrigger.displayName = "CarouselNextTrigger";

export const Carousel = { Root, Content, Item, PrevTrigger, NextTrigger };

export const CarouselIndicator = ({ framed, className = '' }: { framed?: boolean; className?: string }) => {
  const { api } = useCarousel();
  const { selectedIndex, scrollSnaps, onDotButtonClick } = useCarouselIndicator(api);

  if (!scrollSnaps || scrollSnaps.length <= 1) return null;

  return (
    <div className={`flex items-center gap-1.5 ${framed ? 'bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full' : ''} ${className}`}>
      {scrollSnaps.map((_, index) => (
        <BaseIndicator
          key={index}
          onClick={() => onDotButtonClick(index)}
          className={`w-2 h-2 rounded-full transition-all duration-300 ${
            index === selectedIndex ? "bg-white scale-125" : "bg-white/40"
          }`}
        />
      ))}
    </div>
  );
};
