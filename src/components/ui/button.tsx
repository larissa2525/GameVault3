import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-[#B400FF] text-white hover:bg-[#9900DD] focus-visible:ring-[#B400FF]",
        destructive: "bg-[#FF0033] text-white hover:bg-[#CC0029] focus-visible:ring-[#FF0033]",
        outline: "border border-[#B400FF] text-[#B400FF] bg-transparent hover:bg-[#B400FF]/10",
        secondary: "bg-[#1A1A1A] text-white hover:bg-[#2A2A2A]",
        ghost: "text-gray-400 hover:text-white hover:bg-white/10",
        link: "text-[#00E5FF] underline-offset-4 hover:underline",
        neon: "bg-[#FF0033] text-white font-bold shadow-[0_0_15px_#FF0033] hover:shadow-[0_0_25px_#FF0033] hover:bg-[#FF0033]",
        gold: "bg-[#FFD700] text-black font-bold shadow-[0_0_15px_#FFD700] hover:shadow-[0_0_25px_#FFD700] hover:bg-[#FFC800]",
        electric: "bg-[#00E5FF] text-black font-bold shadow-[0_0_15px_#00E5FF] hover:shadow-[0_0_25px_#00E5FF]",
        lime: "bg-[#CCFF00] text-black font-bold shadow-[0_0_15px_#CCFF00] hover:shadow-[0_0_25px_#CCFF00]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
