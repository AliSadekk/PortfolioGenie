/**
 * useBuilder(id) — manages the builder draft state and autosave.
 * Other team members use this API to interact with portfolio data.
 * Owner: Member B
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { getPortfolio, updatePortfolio, emptyPortfolio } from '../lib/portfolios';

const MAX_SKILLS = 30;
const MAX_PROJECTS = 20;

export default function useBuilder(id) {
  const [data, setData] = useState(null);
  const [title, setTitle] = useState('Untitled');
  const [template, setTemplateState] = useState('template1');
  const [status, setStatus] = useState('saved');
  const [loadError, setLoadError] = useState(null);
  const [loadingData, setLoadingData] = useState(true);

  const saveTimeoutRef = useRef(null);
  const seqRef = useRef(0);
  const retryTimeoutRef = useRef(null);
  const latestDataRef = useRef(null);
  const latestTitleRef = useRef('Untitled');
  const latestTemplateRef = useRef('template1');

  // Load portfolio on mount
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoadingData(true);
      setLoadError(null);
      try {
        const row = await getPortfolio(id);
        if (cancelled) return;
        const base = emptyPortfolio();
        const portfolioData = row.data || base;
        const merged = {
          ...base,
          ...portfolioData,
          profile: { ...base.profile, ...(portfolioData.profile || {}) },
          skills: Array.isArray(portfolioData.skills) ? portfolioData.skills : [],
          projects: Array.isArray(portfolioData.projects) ? portfolioData.projects : [],
        };
        setData(merged);
        setTitle(row.title || 'Untitled');
        setTemplateState(row.template || 'template1');

        latestDataRef.current = merged;
        latestTitleRef.current = row.title || 'Untitled';
        latestTemplateRef.current = row.template || 'template1';
        setStatus('saved');
      } catch (err) {
        if (!cancelled) setLoadError(err.message);
      } finally {
        if (!cancelled) setLoadingData(false);
      }
    }

    if (id) {
      load();
    }
    return () => {
      cancelled = true;
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
    };
  }, [id]);

  // Execute actual save with sequence checking and retry logic
  const performSave = useCallback((targetData, targetTitle, targetTemplate, seq, attempt = 1) => {
    setStatus('saving');
    updatePortfolio(id, {
      title: targetTitle,
      template: targetTemplate,
      data: targetData,
    })
      .then(() => {
        if (seq === seqRef.current) {
          setStatus('saved');
        }
      })
      .catch((err) => {
        if (seq !== seqRef.current) return;
        if (attempt === 1) {
          retryTimeoutRef.current = setTimeout(() => {
            performSave(targetData, targetTitle, targetTemplate, seq, 2);
          }, 2000);
        } else if (attempt === 2) {
          retryTimeoutRef.current = setTimeout(() => {
            performSave(targetData, targetTitle, targetTemplate, seq, 3);
          }, 4000);
        } else {
          console.error('Autosave failed:', err);
          setStatus('error');
        }
      });
  }, [id]);

  // Autosave schedule: debounce 1000ms after last change
  const scheduleSave = useCallback((newData, newTitle, newTemplate) => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);

    setStatus('unsaved');
    latestDataRef.current = newData;
    latestTitleRef.current = newTitle;
    latestTemplateRef.current = newTemplate;

    const seq = ++seqRef.current;
    saveTimeoutRef.current = setTimeout(() => {
      performSave(newData, newTitle, newTemplate, seq, 1);
    }, 1000);
  }, [performSave]);

  // Warn on unsaved changes before leaving
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (status !== 'saved') {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [status]);

  /**
   * updateField(path, value) — updates a nested field.
   * e.g. updateField('profile.bio', 'New bio') or updateField('title', 'My Site')
   */
  const updateField = useCallback((path, value) => {
    setData((prev) => {
      if (!prev) return prev;
      const clone = JSON.parse(JSON.stringify(prev));
      const parts = path.split('.');
      let cur = clone;
      for (let i = 0; i < parts.length - 1; i++) {
        if (cur[parts[i]] === undefined || cur[parts[i]] === null) {
          cur[parts[i]] = {};
        }
        cur = cur[parts[i]];
      }
      cur[parts[parts.length - 1]] = value;

      let nextTitle = latestTitleRef.current;
      let nextTemplate = latestTemplateRef.current;
      if (path === 'title') {
        nextTitle = value;
        setTitle(value);
      }
      if (path === 'template') {
        nextTemplate = value;
        setTemplateState(value);
      }

      scheduleSave(clone, nextTitle, nextTemplate);
      return clone;
    });
  }, [scheduleSave]);

  /** addSkill(name) */
  const addSkill = useCallback((name) => {
    const trimmed = (name || '').trim();
    if (!trimmed) return;
    setData((prev) => {
      if (!prev) return prev;
      if (prev.skills.length >= MAX_SKILLS) return prev;
      if (prev.skills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) return prev;
      const clone = { ...prev, skills: [...prev.skills, trimmed] };
      scheduleSave(clone, latestTitleRef.current, latestTemplateRef.current);
      return clone;
    });
  }, [scheduleSave]);

  /** removeSkill(index) */
  const removeSkill = useCallback((index) => {
    setData((prev) => {
      if (!prev) return prev;
      const clone = {
        ...prev,
        skills: prev.skills.filter((_, i) => i !== index),
      };
      scheduleSave(clone, latestTitleRef.current, latestTemplateRef.current);
      return clone;
    });
  }, [scheduleSave]);

  /** addProject(project) */
  const addProject = useCallback((project) => {
    setData((prev) => {
      if (!prev) return prev;
      if (prev.projects.length >= MAX_PROJECTS) return prev;
      const clone = {
        ...prev,
        projects: [...prev.projects, project],
      };
      scheduleSave(clone, latestTitleRef.current, latestTemplateRef.current);
      return clone;
    });
  }, [scheduleSave]);

  /** updateProject(index, patch) */
  const updateProject = useCallback((index, patch) => {
    setData((prev) => {
      if (!prev) return prev;
      const nextProjects = prev.projects.map((p, i) => (i === index ? { ...p, ...patch } : p));
      const clone = { ...prev, projects: nextProjects };
      scheduleSave(clone, latestTitleRef.current, latestTemplateRef.current);
      return clone;
    });
  }, [scheduleSave]);

  /** removeProject(index) */
  const removeProject = useCallback((index) => {
    setData((prev) => {
      if (!prev) return prev;
      const clone = {
        ...prev,
        projects: prev.projects.filter((_, i) => i !== index),
      };
      scheduleSave(clone, latestTitleRef.current, latestTemplateRef.current);
      return clone;
    });
  }, [scheduleSave]);

  /** setTemplate(templateId) */
  const setTemplate = useCallback((templateId) => {
    setTemplateState(templateId);
    setData((prev) => {
      if (!prev) return prev;
      const clone = { ...prev, template: templateId };
      scheduleSave(clone, latestTitleRef.current, templateId);
      return clone;
    });
  }, [scheduleSave]);

  /** applyImportedProjects(projects) — used by Member C */
  const applyImportedProjects = useCallback((projects) => {
    setData((prev) => {
      if (!prev) return prev;
      const existingUrls = new Set(prev.projects.map((p) => p.repoUrl).filter(Boolean));
      const toAdd = (projects || []).filter((p) => !existingUrls.has(p.repoUrl) && p.repoUrl);
      const available = MAX_PROJECTS - prev.projects.length;
      const added = toAdd.slice(0, available);
      if (added.length === 0) return prev;

      const clone = { ...prev, projects: [...prev.projects, ...added] };
      scheduleSave(clone, latestTitleRef.current, latestTemplateRef.current);
      return clone;
    });
  }, [scheduleSave]);

  /** applySuggestion(path, text) — used by Member D */
  const applySuggestion = useCallback((path, text) => {
    updateField(path, text);
  }, [updateField]);

  /** retrySave() */
  const retrySave = useCallback(() => {
    if (!latestDataRef.current) return;
    const seq = ++seqRef.current;
    performSave(latestDataRef.current, latestTitleRef.current, latestTemplateRef.current, seq, 1);
  }, [performSave]);

  return {
    data,
    title,
    template,
    status,
    loadError,
    loadingData,
    updateField,
    addSkill,
    removeSkill,
    addProject,
    updateProject,
    removeProject,
    setTemplate,
    applyImportedProjects,
    applySuggestion,
    retrySave,
  };
}
