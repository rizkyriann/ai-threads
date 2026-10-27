import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-notion-blue focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-notion-blue text-white hover:bg-indigo-700",
        outline:
          "border border-black/10 bg-transparent text-slate-700 hover:bg-sky-tint hover:text-notion-blue",
        ghost: "text-slate-500 hover:bg-black/5 hover:text-slate-900",
        destructive: "border border-black/10 bg-transparent text-vermillion hover:bg-[#ffe9e5]",
        link: "min-h-11 px-1 text-notion-blue hover:text-indigo-700",
      },
      size: {
        default: "",
        sm: "min-h-10 rounded-md px-3 text-xs",
        icon: "h-11 w-11 px-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  ),
);
Button.displayName = "Button";

export { Button, buttonVariants };
