export default function Textarea({
  id,
  value,
  onChange,
  onBlur,
  placeholder = '',
  rows = 4,
  maxLength,
  disabled = false,
  className = '',
  ...props
}) {
  return (
    <textarea
      id={id}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      placeholder={placeholder}
      rows={rows}
      maxLength={maxLength}
      disabled={disabled}
      className={`w-full px-3 py-2 text-sm border border-line rounded-[2px] bg-paper text-ink
        placeholder-muted/60 resize-y
        focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand
        disabled:opacity-40 disabled:cursor-not-allowed transition-colors
        hover:border-brand/40 ${className}`}
      {...props}
    />
  );
}
