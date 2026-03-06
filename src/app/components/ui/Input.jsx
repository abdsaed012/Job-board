import { forwardRef, useId } from 'react';
import { cn } from '../../utils/cn';

const Input = forwardRef(
  (
    {
      label,
      error,
      leftIcon: LeftIcon,
      className,
      id: idProp,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const id = idProp ?? props.name ?? generatedId;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {LeftIcon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <LeftIcon className="size-4" aria-hidden />
            </span>
          )}
          <input
            ref={ref}
            id={id}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : undefined}
            className={cn(
              'w-full h-11 rounded-lg border bg-white px-3',
              'placeholder:text-slate-400',
              'focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-1 focus:border-transparent',
              'transition-shadow duration-150',
              LeftIcon ? 'pl-10' : 'pl-3',
              error
                ? 'border-red-500 focus:ring-red-500'
                : 'border-slate-200 hover:border-slate-300',
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p id={`${id}-error`} className="mt-1.5 text-sm text-red-600">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
