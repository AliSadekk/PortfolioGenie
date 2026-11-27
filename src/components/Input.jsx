export default function Input({
  id,
  type = 'text',
  value,
  onChange,
  onBlur,
  onKeyDown,
  placeholder = '',
  maxLength,
  autoComplete,
  spellCheck,
  error = false,
  disabled = false,
  'aria-invalid': ariaInvalid,
  'aria-describedby': ariaDescribedby,
  className = '',
  ...props
}) {
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      maxLength={maxLength}
      autoComplete={autoComplete}
      spellCheck={spellCheck}
      disabled={disabled}
      aria-invalid={ariaInvalid ?? (error ? 'true' : undefined)}
      aria-describedby={ariaDescribedby}
      className={`w-full px-3 py-2 text-sm border rounded-[2px] bg-paper text-ink placeholder-muted/60
        focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand
        disabled:opacity-40 disabled:cursor-not-allowed transition-colors
        ${error ? 'border-danger' : 'border-line hover:border-brand/40'}
        ${className}`}
      {...props}
    />
  );
}
