import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  listPortfolios,
  createPortfolio,
  deletePortfolio,
  clonePortfolio,
} from '../lib/portfolios';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import ErrorMessage from '../components/ErrorMessage';
import DeleteDialog from '../builder/DeleteDialog';
import { Plus, Copy, Trash2, FileText } from 'lucide-react';

/**
 * Dashboard — Person B
 * Lists all portfolios belonging to the signed-in user.
 * Actions: New · Open · Clone · Delete
 */
export default function Dashboard() {
  const navigate = useNavigate();
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);

  // Delete dialog state
  const [deleteTarget, setDeleteTarget] = useState(null); // { id, title }
  const [deleting, setDeleting] = useState(false);

  /* ── Load list on mount ── */
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    listPortfolios()
      .then((rows) => { if (!cancelled) setPortfolios(rows); })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  /* ── Actions ── */
  const handleNew = async () => {
    if (creating) return;
    setCreating(true);
    try {
      const row = await createPortfolio('Untitled');
      navigate(`/builder/${row.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleClone = async (id) => {
    try {
      const row = await clonePortfolio(id);
      setPortfolios((prev) => [row, ...prev]);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    try {
      await deletePortfolio(deleteTarget.id);
      setPortfolios((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  /* ── Render ── */
  return (
    <div className="min-h-screen bg-paper">
      {/* Header */}
      <header className="border-b border-line bg-paper sticky top-0 z-10">
        <div className="max-w-[1000px] mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <p className="font-serif font-bold text-brand tracking-widest text-sm uppercase">
            PortfolioGenie
          </p>
          <Button
            variant="primary"
            onClick={handleNew}
            disabled={creating}
          >
            <Plus className="h-4 w-4" />
            {creating ? 'Creating…' : 'New portfolio'}
          </Button>
        </div>
      </header>

      <main className="max-w-[1000px] mx-auto px-4 py-10">
        <h1 className="text-3xl font-serif font-bold mb-2">My Portfolios</h1>
        <p className="text-sm text-muted mb-8">
          Click a portfolio to edit it, or create a new one.
        </p>

        {error && <ErrorMessage className="mb-4">{error}</ErrorMessage>}

        {loading && (
          <div className="flex justify-center py-16">
            <Spinner size={32} />
          </div>
        )}

        {!loading && portfolios.length === 0 && (
          <div className="border border-dashed border-line rounded-[2px] p-12 text-center">
            <FileText className="h-10 w-10 text-muted mx-auto mb-3" />
            <p className="text-muted text-sm mb-4">
              You have no portfolios yet. Create your first one!
            </p>
            <Button variant="primary" onClick={handleNew} disabled={creating}>
              <Plus className="h-4 w-4" />
              New portfolio
            </Button>
          </div>
        )}

        {!loading && portfolios.length > 0 && (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {portfolios.map((p) => (
              <li
                key={p.id}
                className="border border-line rounded-[2px] bg-paper hover:border-brand/40 transition-colors"
              >
                <button
                  type="button"
                  onClick={() => navigate(`/builder/${p.id}`)}
                  className="w-full text-left p-5 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-[2px]"
                >
                  <p className="font-serif font-semibold text-base truncate">
                    {p.title || 'Untitled'}
                  </p>
                  <p className="text-xs text-muted font-mono mt-1">
                    {new Date(p.updated_at).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </button>
                <div className="flex items-center gap-1 px-5 pb-4 pt-0">
                  <Button
                    variant="secondary"
                    className="text-xs px-2 py-1 h-7"
                    onClick={() => handleClone(p.id)}
                    title="Duplicate portfolio"
                  >
                    <Copy className="h-3 w-3" />
                    Clone
                  </Button>
                  <Button
                    variant="danger"
                    className="text-xs px-2 py-1 h-7"
                    onClick={() => setDeleteTarget({ id: p.id, title: p.title })}
                    title="Delete portfolio"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>

      <DeleteDialog
        open={!!deleteTarget}
        title={deleteTarget?.title || ''}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
