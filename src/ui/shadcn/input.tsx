"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
	({ className, type, value, defaultValue, ...props }, ref) => {
		return (
			<input
				ref={ref}
				type={type}
				// prevents warnings when extensions add attributes (e.g., fdprocessedid)
				suppressHydrationWarning
				// avoid controlled/uncontrolled mismatch if value sometimes undefined
				{...(value === undefined ? { defaultValue } : { value })}
				className={cn(
					"flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
					className,
				)}
				{...props}
			/>
		);
	},
);
Input.displayName = "Input";
