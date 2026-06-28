import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-ink px-5 text-white hover:bg-moss",
        primary: "bg-coral px-5 text-white hover:bg-[#da573d]",
        outline:
          "border border-black/10 bg-white px-5 text-ink hover:border-moss/40 hover:bg-[#f4f8f5]",
        ghost: "px-4 text-ink hover:bg-black/5",
        soft: "bg-[#eaf4ef] px-5 text-moss hover:bg-[#dcece4]",
      },
      size: {
        default: "h-11",
        sm: "h-9 min-h-9 px-4 text-xs",
        lg: "h-13 min-h-13 px-7 text-base",
        icon: "h-11 w-11 min-h-11 px-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
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
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
