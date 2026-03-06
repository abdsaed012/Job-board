import { cn } from '../../utils/cn';

const sizes = {
  sm: 'size-4',
  md: 'size-6',
  lg: 'size-8',
};

function Spinner({ size = 'md', className, ...props }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn(
        'inline-block rounded-full border-2 border-slate-200 border-t-slate-600 animate-spin',
        sizes[size],
        className
      )}
      {...props}
    />
  );
}

export default Spinner;
