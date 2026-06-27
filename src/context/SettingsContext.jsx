import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const SettingsCtx = createContext(null);

const DEFAULTS = {
  company: { name: 'Your Company', address: '', phone: '', email: '', website: '', gst: '', logo_url: null, seal_name: '', seal_url: null },
  tax: { cgst: 9, sgst: 9 },
  numbering: { prefix: 'QT-', next_number: 1, pad: 6 },
  terms: { content: '' },
  template: { selected: 'emerald', accent: '#22673a' },
};

export function SettingsProvider({ children }) {
  const [company, setCompany] = useState(DEFAULTS.company);
  const [tax, setTax] = useState(DEFAULTS.tax);
  const [numbering, setNumbering] = useState(DEFAULTS.numbering);
  const [terms, setTerms] = useState(DEFAULTS.terms);
  const [template, setTemplate] = useState(DEFAULTS.template);
  const [loading, setLoading] = useState(true);

  async function reload() {
    const [c, t, n, tm, tp] = await Promise.all([
      supabase.from('company_settings').select('*').eq('id', 1).single(),
      supabase.from('tax_settings').select('*').eq('id', 1).single(),
      supabase.from('numbering_settings').select('*').eq('id', 1).single(),
      supabase.from('terms_settings').select('*').eq('id', 1).single(),
      supabase.from('template_settings').select('*').eq('id', 1).single(),
    ]);
    if (c.data) setCompany(c.data);
    if (t.data) setTax(t.data);
    if (n.data) setNumbering(n.data);
    if (tm.data) setTerms(tm.data);
    if (tp.data) setTemplate(tp.data);
    setLoading(false);
  }

  useEffect(() => {
    reload();
  }, []);

  async function saveCompany(patch) {
    const { data, error } = await supabase.from('company_settings').update(patch).eq('id', 1).select().single();
    if (!error && data) setCompany(data);
    return { error };
  }
  async function saveTax(patch) {
    const { data, error } = await supabase.from('tax_settings').update(patch).eq('id', 1).select().single();
    if (!error && data) setTax(data);
    return { error };
  }
  async function saveNumbering(patch) {
    const { data, error } = await supabase.from('numbering_settings').update(patch).eq('id', 1).select().single();
    if (!error && data) setNumbering(data);
    return { error };
  }
  async function saveTerms(content) {
    const { data, error } = await supabase.from('terms_settings').update({ content }).eq('id', 1).select().single();
    if (!error && data) setTerms(data);
    return { error };
  }
  async function saveTemplate(patch) {
    const { data, error } = await supabase.from('template_settings').update(patch).eq('id', 1).select().single();
    if (!error && data) setTemplate(data);
    return { error };
  }
  async function uploadBrandingFile(file, kind) {
    const path = `${kind}-${Date.now()}-${file.name}`;
    const { error: upErr } = await supabase.storage.from('branding').upload(path, file, { upsert: true });
    if (upErr) return { error: upErr };
    const { data } = supabase.storage.from('branding').getPublicUrl(path);
    return { url: data.publicUrl };
  }

  const value = {
    company, tax, numbering, terms, template, loading, reload,
    saveCompany, saveTax, saveNumbering, saveTerms, saveTemplate, uploadBrandingFile,
  };

  return <SettingsCtx.Provider value={value}>{children}</SettingsCtx.Provider>;
}

export function useSettings() {
  return useContext(SettingsCtx);
}
