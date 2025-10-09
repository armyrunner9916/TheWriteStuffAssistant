import React from 'react';
    import * as ToastPrimitives from '@radix-ui/react-toast';
    import { cva } from 'class-variance-authority';
    import { X } from 'lucide-react';

    import { cn } from '@/lib/utils';

    const ToastProvider = ToastPrimitives.Provider;

    const ToastViewport = React.forwardRef(({ className, ...props }, ref) => (
      <ToastPrimitives.Viewport
        ref={ref}
        className={cn(
          'fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[380px]', // Reduced max-width
          className
        )}
        {...props}
      />
    ));
    ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

    const toastVariants = cva(
      'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-4 pr-8 shadow-lg transition-all data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full data-[state=closed]:slide-out-to-right-full data-[swipe=move]:transition-none', // Reduced padding
      {
        variants: {
          variant: {
            default: 'border-green-500 bg-black text-green-500', // Black bg, green border/text for success
            destructive: 'destructive border-red-500 bg-black text-red-500', // Black bg, red border/text for error
          },
        },
        defaultVariants: {
          variant: 'default',
        },
      }
    );

    const Toast = React.forwardRef(({ className, variant, ...props }, ref) => {
      return (
        <ToastPrimitives.Root
          ref={ref}
          className={cn(toastVariants({ variant }), className)}
          {...props}
        />
      );
    });
    Toast.displayName = ToastPrimitives.Root.displayName;

    const ToastAction = React.forwardRef(({ className, ...props }, ref) => (
      <ToastPrimitives.Action
        ref={ref}
        className={cn(
          'inline-flex h-8 shrink-0 items-center justify-center rounded-md border border-yellow-400 bg-transparent px-3 text-sm font-medium text-yellow-400 ring-offset-black transition-colors hover:bg-yellow-400 hover:text-black focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          // Removed group destructive styles as base styles handle color now
          className
        )}
        {...props}
      />
    ));
    ToastAction.displayName = ToastPrimitives.Action.displayName;

    const ToastClose = React.forwardRef(({ className, ...props }, ref) => (
      <ToastPrimitives.Close
        ref={ref}
        className={cn(
          'absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100',
          'group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-500 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600', // Destructive variant colors
          'group-[&:not(.destructive)]:text-green-300 group-[&:not(.destructive)]:hover:text-green-500 group-[&:not(.destructive)]:focus:ring-green-400 group-[&:not(.destructive)]:focus:ring-offset-green-600', // Default (success) variant colors
          className
        )}
        {...props}
      >
        <X className="h-4 w-4" />
      </ToastPrimitives.Close>
    ));
    ToastClose.displayName = ToastPrimitives.Close.displayName;

    const ToastTitle = React.forwardRef(({ className, ...props }, ref) => (
      <ToastPrimitives.Title
        ref={ref}
        className={cn('text-sm font-semibold', className)} // Text color is inherited from Toast root
        {...props}
      />
    ));
    ToastTitle.displayName = ToastPrimitives.Title.displayName;

    const ToastDescription = React.forwardRef(({ className, ...props }, ref) => (
      <ToastPrimitives.Description
        ref={ref}
        className={cn('text-sm opacity-90', className)} // Text color is inherited from Toast root
        {...props}
      />
    ));
    ToastDescription.displayName = ToastPrimitives.Description.displayName;

    export {
      Toast,
      ToastAction,
      ToastClose,
      ToastDescription,
      ToastProvider,
      ToastTitle,
      ToastViewport,
      toastVariants, // Export variants if needed elsewhere, though unlikely
    };