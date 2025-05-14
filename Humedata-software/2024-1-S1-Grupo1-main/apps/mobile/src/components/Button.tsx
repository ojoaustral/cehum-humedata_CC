import React from "react";
import { type VariantProps, cva } from "class-variance-authority";
import { Text, TouchableOpacity } from "react-native";

import { cn } from "@ui/utils";

const buttonVariants = cva(
  "flex flex-row items-center justify-center rounded-md",
  {
    variants: {
      variant: {
        default: "bg-primary rounded-full",
        secondary: "bg-secondary rounded-full",
        destructive: "bg-destructive rounded-full",
        ghost: "bg-slate-400 rounded-full",
        link: "text-primary underline-offset-4",
        green: "border-[#93c020] border-2",
        gray: "bg-gray-400",
      },
      size: {
        default: "h-10 px-4",
        sm: "h-8 px-2",
        lg: "h-12 px-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const buttonTextVariants = cva("text-center font-medium", {
  variants: {
    variant: {
      default: "text-white",
      secondary: "text-secondary-foreground",
      destructive: "text-destructive-foreground",
      ghost: "text-primary-foreground",
      link: "text-primary-foreground underline",
      green: "text-[#93c020]",
      gray: "text-white",
    },
    size: {
      default: "text-base",
      sm: "text-sm",
      lg: "text-xl",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

interface ButtonProps
  extends React.ComponentPropsWithoutRef<typeof TouchableOpacity>,
    VariantProps<typeof buttonVariants> {
  label: string;
  labelClasses?: string;
}

const Button = React.forwardRef<TouchableOpacity, ButtonProps>(
  (
    { label, labelClasses, className, variant, size, ...props }: ButtonProps,
    ref
  ) => {
    return (
      <TouchableOpacity
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      >
        <Text
          className={cn(buttonTextVariants({ variant, size }), labelClasses)}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  }
);

export { Button, buttonVariants, buttonTextVariants };
