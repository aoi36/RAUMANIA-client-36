// @/components/ui/slider.tsx
import * as RadixSlider from "@radix-ui/react-slider";
import React from "react";
import clsx from "clsx";

interface SliderProps {
    value?: number[];
    onValueChange: (value: number[]) => void;
    max?: number;
    step?: number;
    className?: string;
    defaultValue?: number[]; // Added defaultValue
  }

export const Slider: React.FC<SliderProps> = ({
    value,
    onValueChange,
    max = 100,
    step = 1,
    className,
    defaultValue = [0, max],
  }) => {
    return (
      <RadixSlider.Root
        className={clsx("relative flex items-center select-none touch-none w-full h-5", className)}
        value={value || defaultValue}
        defaultValue={defaultValue} // Added defaultValue here
        onValueChange={onValueChange}
        max={max}
        step={step}
      >
        <RadixSlider.Track className="bg-gray-200 relative grow rounded-full h-[3px]">
          <RadixSlider.Range className="absolute bg-black rounded-full h-full" />
        </RadixSlider.Track>
        <RadixSlider.Thumb className="block w-4 h-4 bg-black rounded-full hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black" />
        <RadixSlider.Thumb className="block w-4 h-4 bg-black rounded-full hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black" />
      </RadixSlider.Root>
    );
  };
