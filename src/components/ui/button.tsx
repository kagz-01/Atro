import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-sans font-medium tracking-wide uppercase transition-[background-color,color,border-color,transform,box-shadow,opacity] duration-200 ease-out disabled:pointer-events-none disabled:opacity-40 hover:enabled:-translate-y-px hover:enabled:shadow-soft active:enabled:translate-y-0 active:enabled:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold motion-reduce:translate-y-0 motion-reduce:scale-100 motion-reduce:transition-none",
  {
    variants: {
      variant: {
        primary:
          "bg-burgundy text-paper hover:bg-maroon border border-burgundy",
        gold: "bg-gold text-maroon hover:bg-gold-light border border-gold",
        outline:
          "bg-transparent text-burgundy border border-burgundy hover:bg-burgundy hover:text-paper",
        inverse:
          "bg-paper text-maroon border border-paper hover:bg-gold-light",
        ghost:
          "bg-transparent text-ink border border-transparent hover:border-line hover:bg-stone/40",
        line: "bg-transparent text-paper border border-paper/40 hover:border-gold hover:text-gold",
      },
      size: {
        sm: "h-10 px-4 text-[11px] rounded-xs",
        md: "h-12 px-5 text-[12px] rounded-xs",
        lg: "h-14 px-7 text-[12px] rounded-xs",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export function Button({
  className,
  variant,
  size,
  asChild,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />
  );
}
