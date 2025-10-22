import { cn } from '@/lib/utils';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import React from 'react';

const buttonVariants = cva(
	'inline-flex items-center justify-center rounded-xl text-sm font-semibold ring-offset-background transition-all duration-250 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
	{
		variants: {
			variant: {
				default: 'bg-gradient-to-br from-yellow-400 to-yellow-500 text-black shadow-[0_2px_8px_rgba(255,212,0,0.3)] hover:scale-[1.04] hover:shadow-[0_0_12px_rgba(255,212,0,0.4),0_4px_16px_rgba(255,212,0,0.2)]',
				destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-lg hover:scale-[1.04]',
				outline:
          'border border-yellow-400/30 bg-transparent text-yellow-400 hover:bg-yellow-400/10 hover:scale-[1.04] hover:shadow-[0_0_12px_rgba(255,212,0,0.2)]',
				secondary:
          'bg-gradient-to-br from-yellow-400 to-yellow-500 text-black hover:scale-[1.04]',
				ghost: 'hover:bg-yellow-400/10 hover:text-yellow-400',
				link: 'text-yellow-400 underline-offset-4 hover:underline',
			},
			size: {
				default: 'h-10 px-6 py-2',
				sm: 'h-9 rounded-lg px-4',
				lg: 'h-12 rounded-xl px-8',
				icon: 'h-10 w-10',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
		},
	},
);

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
	const Comp = asChild ? Slot : 'button';
	return (
		<Comp
			className={cn(buttonVariants({ variant, size, className }))}
			ref={ref}
			{...props}
		/>
	);
});
Button.displayName = 'Button';

export { Button, buttonVariants };