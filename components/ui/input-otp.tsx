"use client";

import * as React from "react";
import { MinusIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// Simplified placeholder - not using input-otp package to avoid RTL CSS issues
interface InputOTPProps extends React.ComponentProps<"div"> {
  maxLength?: number;
  containerClassName?: string;
}

function InputOTP({
  className,
  containerClassName,
  children,
  ...props
}: InputOTPProps) {
  return (
    <div
      data-slot="input-otp"
      className={cn(
        "flex items-center gap-2 has-disabled:opacity-50",
        containerClassName,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function InputOTPGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-otp-group"
      className={cn("flex items-center", className)}
      {...props}
    />
  );
}

function InputOTPSlot({
  index,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  index: number;
}) {
  return (
    <div
      data-slot="input-otp-slot"
      className={cn(
        "border-input relative flex h-9 w-9 items-center justify-center border-y border-r text-sm shadow-xs transition-all outline-none first:rounded-l-md first:border-l last:rounded-r-md",
        className
      )}
      {...props}
    />
  );
}

function InputOTPSeparator({ ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="input-otp-separator" role="separator" {...props}>
      <MinusIcon />
    </div>
  );
}

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator };
