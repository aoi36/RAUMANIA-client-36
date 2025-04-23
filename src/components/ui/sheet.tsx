// @/components/ui/sheet.tsx
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import React from "react";
import clsx from "clsx";

export const Sheet = Dialog.Root;
export const SheetTrigger = Dialog.Trigger;

export const SheetContent = ({
  children,
  className,
  side = "right",
}: {
  children: React.ReactNode;
  className?: string;
  side?: "top" | "bottom" | "left" | "right";
}) => {
  const sideStyles: Record<string, string> = {
    top: "top-0 left-0 right-0 h-1/3",
    bottom: "bottom-0 left-0 right-0 h-1/3",
    left: "left-0 top-0 bottom-0 w-2/3",
    right: "right-0 top-0 bottom-0 w-2/3",
  };

  return (
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
      <Dialog.Content
        className={clsx(
          "fixed z-50 bg-white shadow-xl ease-in-out transition-all duration-300",
          sideStyles[side],
          className
        )}
      >
        <div className="absolute top-4 right-4">
          <Dialog.Close asChild>
            <button aria-label="Close">
              <X className="w-5 h-5" />
            </button>
          </Dialog.Close>
        </div>
        {children}
      </Dialog.Content>
    </Dialog.Portal>
  );
};

export const SheetHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="p-6 border-b">{children}</div>
);

export const SheetTitle = ({ children }: { children: React.ReactNode }) => (
  <Dialog.Title className="text-lg font-semibold">{children}</Dialog.Title>
);

export const SheetDescription = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <Dialog.Description className="text-sm text-gray-500 mt-1">
    {children}
  </Dialog.Description>
);
