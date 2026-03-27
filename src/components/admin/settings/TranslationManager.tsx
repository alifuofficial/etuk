'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Search, Save, RotateCcw, Filter, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

interface Language {
  code: string;
  name: string;
  flag: string | null;
}

interface TranslationData {
  [key: string]: {
    [locale: string]: string;
  };
}

export default function TranslationManager() {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [translations, setTranslations] = useState<TranslationData>({});
  const [isModified, setIsModified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 15;
  const { toast } = useToast();

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Fetch languages
      const langRes = await fetch('/api/languages');
      const langs: Language[] = await langRes.json();
      setLanguages(langs);

      // Fetch translations for each language
      const allTranslations: TranslationData = {};
      for (const lang of langs) {
        const transRes = await fetch(`/api/translations?locale=${lang.code}`);
        const data = await transRes.json();
        
        Object.entries(data).forEach(([key, value]) => {
          if (!allTranslations[key]) allTranslations[key] = {};
          allTranslations[key][lang.code] = value as string;
        });
      }
      setTranslations(allTranslations);
    } catch (error) {
      console.error('Failed to fetch translation data:', error);
      toast({ title: 'Error', description: 'Failed to load translations', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const filteredKeys = useMemo(() => {
    return Object.keys(translations)
      .filter(key => key.toLowerCase().includes(search.toLowerCase()))
      .sort();
  }, [translations, search]);

  const paginatedKeys = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filteredKeys.slice(start, start + itemsPerPage);
  }, [filteredKeys, page]);

  const handleValueChange = (key: string, locale: string, value: string) => {
    setTranslations(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [locale]: value,
      },
    }));
    setIsModified(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Group updates by locale for efficiency
      const updatesByLocale: Record<string, Record<string, string>> = {};
      languages.forEach(lang => {
        updatesByLocale[lang.code] = {};
        Object.keys(translations).forEach(key => {
          updatesByLocale[lang.code][key] = translations[key][lang.code] || '';
        });
      });

      // Sequential updates (could be optimized further)
      for (const [locale, data] of Object.entries(updatesByLocale)) {
        await fetch('/api/translations', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ locale, translations: data }),
        });
      }

      toast({ title: 'Success', description: 'All translations saved successfully' });
      setIsModified(false);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save translations', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-4">
        <Loader2 className="w-8 h-8 text-deepSkyBlue animate-spin" />
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Hydrating Dictionary...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search keys (e.g. nav.home)..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-10 h-11 bg-slate-50 border-slate-200 rounded-xl focus:bg-white transition-all font-bold text-slate-900"
          />
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={fetchAllData}
            className="h-11 rounded-xl px-4 text-slate-600 font-bold border-slate-200 hover:bg-slate-50"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!isModified || saving}
            className="h-11 rounded-xl px-8 bg-gray-900 hover:bg-black text-white font-bold shadow-lg shadow-gray-200 disabled:opacity-50 transition-all flex items-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {paginatedKeys.map((key) => (
          <Card key={key} className="border-slate-100 shadow-sm overflow-hidden group hover:border-deepSkyBlue/30 transition-all">
            <div className="bg-slate-50/50 px-6 py-3 border-b border-slate-100 flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{key}</span>
              <div className="h-1.5 w-1.5 rounded-full bg-deepSkyBlue/30 group-hover:bg-deepSkyBlue group-hover:scale-125 transition-all" />
            </div>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {languages.map((lang) => (
                  <div key={lang.code} className="space-y-2">
                    <div className="flex items-center gap-2 px-1">
                      <span className="text-sm">{lang.flag}</span>
                      <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{lang.name}</Label>
                    </div>
                    <Input 
                      value={translations[key][lang.code] || ''}
                      onChange={(e) => handleValueChange(key, lang.code, e.target.value)}
                      className="h-10 bg-white border-slate-200 rounded-lg focus:border-deepSkyBlue focus:ring-1 focus:ring-deepSkyBlue/20 transition-all font-medium text-slate-800"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredKeys.length > itemsPerPage && (
        <div className="flex items-center justify-between py-8">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Showing {Math.min(filteredKeys.length, (page - 1) * itemsPerPage + 1)}-{Math.min(filteredKeys.length, page * itemsPerPage)} of {filteredKeys.length} keys
          </p>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-xl h-10 w-10 border-slate-200 disabled:opacity-30"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="h-10 px-4 flex items-center justify-center bg-slate-50 rounded-xl font-bold text-slate-900 border border-slate-200 text-sm">
              {page}
            </div>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => setPage(p => p + 1)}
              disabled={page * itemsPerPage >= filteredKeys.length}
              className="rounded-xl h-10 w-10 border-slate-200 disabled:opacity-30"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      )}

      {filteredKeys.length === 0 && !loading && (
        <div className="text-center py-20 bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-200">
           <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
           <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No keys matching "{search}"</p>
        </div>
      )}
    </div>
  );
}
