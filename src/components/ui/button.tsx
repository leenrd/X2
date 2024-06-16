import { cn } from "@/lib/utils";
import { cva, VariantProps } from "class-variance-authority";
import { Loader } from "lucide-react";
import { Slot, Slottable } from "@radix-ui/react-slot";
import { ButtonHTMLAttributes, FC, forwardRef } from "react";
import { Icon, Icons } from "../icons";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap active:scale-95 rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus:ring-slate-400 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-slate-900 text-white hover:bg-slate-800",
        destructive: "bg-red-500 text-white hover:bg-red-500/90",
        ghost: "bg-transparent hover:text-slate-900 hover:bg-slate-200",
        ringHover:
          "bg-slate-900 text-white transition-all duration-300 hover:bg-black/90 hover:ring-2 hover:ring-black/90 hover:ring-offset-2",
        expandIcon: "group relative text-white bg-black hover:bg-black/90",
      },
      size: {
        sm: "px-2.5 py-1.5",
        md: "px-3 py-2",
        lg: "px-4 py-2.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

interface IconProps {
  IconUse: Icon;
  iconPlacement: "left" | "right";
}

interface IconRefProps {
  IconUse?: never;
  iconPlacement?: undefined;
}

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  asChild?: boolean;
}

export type ButtonIconProps = IconProps | IconRefProps;

const Button = forwardRef<HTMLButtonElement, ButtonProps & ButtonIconProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      IconUse,
      iconPlacement,
      isLoading,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    const IconPick = Icons[IconUse as Icon];
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isLoading}
        {...props}
      >
        {IconUse && iconPlacement === "left" && (
          <div className="w-0 translate-x-[0%] pr-0 opacity-0 transition-all duration-200 group-hover:w-5 group-hover:translate-x-100 group-hover:pr-2 group-hover:opacity-100">
            <IconPick className="h-4 w-4" />
          </div>
        )}
        <Slottable>
          {isLoading ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : null}

          {props.children}
        </Slottable>
        {IconUse && iconPlacement === "right" && (
          <div className="w-0 translate-x-[100%] pl-0 opacity-0 transition-all duration-200 group-hover:w-5 group-hover:translate-x-0 group-hover:pl-2 group-hover:opacity-100">
            <IconPick className="h-4 w-4" />
          </div>
        )}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export default Button;
