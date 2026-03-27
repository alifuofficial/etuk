'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Globe, Check, X, Languages } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Language {
  id: string;
  code: string;
  name: string;
  flag: string | null;
  isDefault: boolean;
  isActive: boolean;
}

export default function LanguageManager() {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newLang, setNewLang] = useState({ code: '', name: '', flag: '' });
  const { toast } = useToast();

  const fetchLanguages = async () => {
    try {
      const response = await fetch('/api/languages');
      if (response.ok) {
        const data = await response.json();
        setLanguages(data);
      }
    } catch (error) {
      console.error('Failed to fetch languages:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLanguages();
  }, []);

  const handleAddLanguage = async () => {
    if (!newLang.code || !newLang.name) {
      toast({ title: 'Error', description: 'Code and Name are required', variant: 'destructive' });
      return;
    }

    try {
      const response = await fetch('/api/languages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLang),
      });

      if (response.ok) {
        toast({ title: 'Success', description: 'Language added successfully' });
        setIsAdding(false);
        setNewLang({ code: '', name: '', flag: '' });
        fetchLanguages();
      } else {
        throw new Error('Failed to add language');
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to add language', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Supported Locales</h3>
          <p className="text-sm text-gray-500 mt-1">Manage languages available on the public website.</p>
        </div>
        
        <Dialog open={isAdding} onOpenChange={setIsAdding}>
          <DialogTrigger asChild>
            <Button className="bg-deepSkyBlue hover:bg-deepSkyBlue/90 text-white font-bold h-10 px-6 rounded-lg gap-2">
              <Plus className="w-4 h-4" />
              Add Language
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white border-slate-100 shadow-2xl rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">New Language</DialogTitle>
              <DialogDescription>
                Add a new language code and name. This will initialize the data architecture for the new locale.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-bold text-xs uppercase text-gray-500">Code</Label>
                <Input
                  className="col-span-3 h-11 bg-slate-50 border-slate-200"
                  placeholder="e.g. tg"
                  value={newLang.code}
                  onChange={(e) => setNewLang({ ...newLang, code: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-bold text-xs uppercase text-gray-500">Name</Label>
                <Input
                  className="col-span-3 h-11 bg-slate-50 border-slate-200"
                  placeholder="e.g. Tigrinya"
                  value={newLang.name}
                  onChange={(e) => setNewLang({ ...newLang, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-bold text-xs uppercase text-gray-500">Flag</Label>
                <Input
                  className="col-span-3 h-11 bg-slate-50 border-slate-200"
                  placeholder="e.g. 🇪🇹"
                  value={newLang.flag}
                  onChange={(e) => setNewLang({ ...newLang, flag: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter className="gap-3">
              <Button variant="outline" onClick={() => setIsAdding(false)} className="h-11 rounded-lg">Cancel</Button>
              <Button onClick={handleAddLanguage} className="bg-gray-900 hover:bg-black text-white h-11 rounded-lg px-8 font-bold">Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {languages.map((lang) => (
          <Card key={lang.id} className="border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden relative group">
            <div className={`h-1.5 w-full ${lang.isDefault ? 'bg-deepSkyBlue' : 'bg-slate-100'}`} />
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-2xl">
                  {lang.flag || <Globe className="w-6 h-6 text-slate-300" />}
                </div>
                {lang.isDefault && (
                  <span className="text-[10px] font-black uppercase tracking-widest text-deepSkyBlue bg-deepSkyBlue/10 px-3 py-1 rounded-full border border-deepSkyBlue/20">
                    Default
                  </span>
                )}
              </div>
              
              <h4 className="text-xl font-black text-slate-900 mb-1">{lang.name}</h4>
              <p className="text-xs font-black uppercase text-slate-400 tracking-[0.2em]">{lang.code}</p>

              <div className="mt-6 flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className={`flex-1 rounded-xl h-10 font-bold transition-all ${lang.isActive ? 'border-emerald-100 text-emerald-600 hover:bg-emerald-50' : 'border-slate-100 text-slate-400'}`}
                  disabled={lang.isDefault}
                >
                  {lang.isActive ? <Check className="w-4 h-4 mr-2" /> : <X className="w-4 h-4 mr-2" />}
                  {lang.isActive ? 'Active' : 'Inactive'}
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-xl h-10 w-10 text-slate-300 hover:text-red-500 hover:bg-red-50"
                  disabled={lang.isDefault}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
