import { supabase, isSupabaseConfigured } from './supabase';

const LOCAL_STORAGE_KEY = 'portfoliogenie_local_portfolios';

export function emptyPortfolio() {
  return {
    title: 'Untitled',
    template: 'template1',
    profile: {
      fullName: '',
      jobTitle: '',
      bio: '',
      email: '',
      github: '',
      linkedin: '',
    },
    skills: [],
    projects: [],
  };
}

function readLocalPortfolios() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocalPortfolios(rows) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(rows));
}

function generateLocalId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export async function listPortfolios() {
  if (!isSupabaseConfigured) {
    return readLocalPortfolios()
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
      .map(({ id, title, template, updated_at }) => ({ id, title, template, updated_at }));
  }

  const { data, error } = await supabase
    .from('portfolios')
    .select('id, title, template, updated_at')
    .order('updated_at', { ascending: false });

  if (error) {
    throw new Error('Failed to load portfolios: ' + error.message);
  }
  return data || [];
}

export async function createPortfolio(title = 'Untitled') {
  const empty = emptyPortfolio();
  empty.title = title;

  if (!isSupabaseConfigured) {
    const now = new Date().toISOString();
    const row = {
      id: generateLocalId(),
      title,
      template: empty.template,
      data: empty,
      created_at: now,
      updated_at: now,
    };
    const rows = readLocalPortfolios();
    writeLocalPortfolios([row, ...rows]);
    return row;
  }

  const { data, error } = await supabase
    .from('portfolios')
    .insert({
      title,
      template: empty.template,
      data: empty,
    })
    .select()
    .single();

  if (error) {
    throw new Error('Failed to create portfolio: ' + error.message);
  }
  return data;
}

export async function getPortfolio(id) {
  if (!isSupabaseConfigured) {
    const found = readLocalPortfolios().find((p) => p.id === id);
    if (!found) {
      throw new Error('Portfolio not found');
    }
    return found;
  }

  const { data, error } = await supabase
    .from('portfolios')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw new Error('Portfolio not found or access denied: ' + error.message);
  }
  return data;
}

export async function updatePortfolio(id, updates) {
  const payload = {};
  if (updates.title !== undefined) payload.title = updates.title;
  if (updates.template !== undefined) payload.template = updates.template;
  if (updates.data !== undefined) payload.data = updates.data;

  if (!isSupabaseConfigured) {
    const rows = readLocalPortfolios();
    const idx = rows.findIndex((p) => p.id === id);
    if (idx === -1) {
      throw new Error('Portfolio not found');
    }
    const updated = {
      ...rows[idx],
      ...payload,
      updated_at: new Date().toISOString(),
    };
    rows[idx] = updated;
    writeLocalPortfolios(rows);
    return updated;
  }

  const { data, error } = await supabase
    .from('portfolios')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error('Failed to save portfolio: ' + error.message);
  }
  return data;
}

export async function deletePortfolio(id) {
  if (!isSupabaseConfigured) {
    const rows = readLocalPortfolios().filter((p) => p.id !== id);
    writeLocalPortfolios(rows);
    return;
  }

  const { error } = await supabase
    .from('portfolios')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error('Failed to delete portfolio: ' + error.message);
  }
}

export async function clonePortfolio(id) {
  const original = await getPortfolio(id);
  const clonedData = JSON.parse(JSON.stringify(original.data || emptyPortfolio()));
  const newTitle = `${original.title || 'Untitled'} (copy)`;
  clonedData.title = newTitle;

  if (!isSupabaseConfigured) {
    const now = new Date().toISOString();
    const row = {
      id: generateLocalId(),
      title: newTitle,
      template: original.template || 'template1',
      data: clonedData,
      created_at: now,
      updated_at: now,
    };
    const rows = readLocalPortfolios();
    writeLocalPortfolios([row, ...rows]);
    return row;
  }

  const { data, error } = await supabase
    .from('portfolios')
    .insert({
      title: newTitle,
      template: original.template || 'template1',
      data: clonedData,
    })
    .select()
    .single();

  if (error) {
    throw new Error('Failed to clone portfolio: ' + error.message);
  }
  return data;
}
