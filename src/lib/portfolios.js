/**
 * Portfolio CRUD operations.
 * All functions throw an Error with a readable message on failure.
 * Owner: Member B
 */
import { supabase } from './supabase';

/**
 * Returns a new empty portfolio object matching the JSON contract.
 * All fields are empty strings or empty arrays, never null or undefined.
 */
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

/**
 * Lists all portfolios for the current user.
 * Returns id, title, template, updated_at, ordered by most recent.
 */
export async function listPortfolios() {
  const { data, error } = await supabase
    .from('portfolios')
    .select('id, title, template, updated_at')
    .order('updated_at', { ascending: false });

  if (error) {
    throw new Error('Failed to load portfolios: ' + error.message);
  }
  return data || [];
}

/**
 * Creates a new portfolio with the given title and empty data.
 * Returns the newly created row.
 */
export async function createPortfolio(title = 'Untitled') {
  const empty = emptyPortfolio();
  empty.title = title;

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

/**
 * Gets a single portfolio by ID. Returns the full row.
 * Throws if the portfolio does not exist or is not owned by the user.
 */
export async function getPortfolio(id) {
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

/**
 * Updates a portfolio. Accepts partial updates: title, template, data.
 * Returns the updated row.
 */
export async function updatePortfolio(id, updates) {
  const payload = {};
  if (updates.title !== undefined) payload.title = updates.title;
  if (updates.template !== undefined) payload.template = updates.template;
  if (updates.data !== undefined) payload.data = updates.data;

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

/**
 * Deletes a portfolio by ID.
 */
export async function deletePortfolio(id) {
  const { error } = await supabase
    .from('portfolios')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error('Failed to delete portfolio: ' + error.message);
  }
}

/**
 * Clones a portfolio: copies the row and appends " (copy)" to the title.
 * Returns the new portfolio row.
 */
export async function clonePortfolio(id) {
  const original = await getPortfolio(id);
  const clonedData = JSON.parse(JSON.stringify(original.data || emptyPortfolio()));
  const newTitle = `${original.title || 'Untitled'} (copy)`;
  clonedData.title = newTitle;

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
