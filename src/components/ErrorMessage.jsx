export default function ErrorMessage({ children, className = '' }) {
  if (!children) return null;
  return (
    <p role="alert" className={`text-xs text-danger mt-1 font-mono ${className}`}>
      {children}
    </p>
  );
}
