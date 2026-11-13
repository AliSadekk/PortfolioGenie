import { supabase } from './supabase';

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

export async function deletePortfolio(id) {
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
