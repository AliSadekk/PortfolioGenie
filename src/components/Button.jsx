/**
 * Reusable Button component — shared UI atom
 * Variants: primary | secondary | danger
 */
export default function Button({
  children,
  variant = 'primary',
  className = '',
  disabled = false,
  type = 'button',
  onClick,
  ...props
}) {
  const base =
    'inline-flex items-center gap-1.5 px-4 py-2 text-sm font-mono font-medium rounded-[2px] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-40 disabled:cursor-not-allowed';

  const variants = {
    primary:
      'bg-brand text-paper hover:bg-brand/90 active:bg-brand/80',
    secondary:
      'bg-transparent text-ink border border-line hover:bg-line/40 active:bg-line/70',
    danger:
      'bg-transparent text-danger border border-danger/40 hover:bg-danger/10 active:bg-danger/20',
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${base} ${variants[variant] || variants.primary} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
