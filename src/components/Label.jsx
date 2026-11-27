export default function Label({ htmlFor, children, className = '' }) {
  return (
    <label
      htmlFor={htmlFor}
      className={`block text-sm font-medium text-ink mb-1 ${className}`}
    >
      {children}
    </label>
  );
}
