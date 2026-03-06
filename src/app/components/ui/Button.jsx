import { forwardRef } from 'react';
import { cn } from '../../utils/cn';

const variants = {
  primary:
    'bg-slate-900 text-white hover:bg-slate-800 focus:ring-slate-500 disabled:bg-slate-400',
  secondary:
    'bg-slate-100 text-slate-900 hover:bg-slate-200 focus:ring-slate-400 disabled:bg-slate-50 disabled:text-slate-400',
  ghost:
    'bg-transparent text-slate-700 hover:bg-slate-100 focus:ring-slate-300 disabled:text-slate-400',
  danger:
    'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:bg-red-300',
};

const sizes = {
  sm: 'h-9 px-3 text-sm gap-1.5',
  md: 'h-11 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2.5',
};

const Button = forwardRef(
  (
    {
      variant = 'primary',
      size = 'md',
      leftIcon: LeftIcon,
      loading = false,
      disabled,
      className,
      children,
      type = 'button',
      ...props
    },
    ref
  ) => (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center font-medium rounded-lg',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        'transition-colors duration-150',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading ? (
        <span className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : LeftIcon ? (
        <LeftIcon className="size-4 shrink-0" aria-hidden />
      ) : null}
      {children}
    </button>
  )
);

Button.displayName = 'Button';

export default Button;
