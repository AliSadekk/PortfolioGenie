import Button from '../components/Button';

export default function SaveStatus({ status, onRetry }) {
  const statusConfig = {
    saved: { text: 'Saved', color: 'text-muted' },
    unsaved: { text: 'Unsaved changes', color: 'text-accent' },
    saving: { text: 'Saving…', color: 'text-muted' },
    error: { text: 'Save failed', color: 'text-danger' },
  };

  const config = statusConfig[status] || statusConfig.saved;

  return (
    <div className="flex items-center gap-2">
      <span className={`text-xs font-mono ${config.color}`}>{config.text}</span>
      {status === 'error' && (
        <Button variant="secondary" className="text-xs px-2 py-1 h-7" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  );
}
