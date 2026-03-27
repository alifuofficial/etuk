'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, 
  MapPin, 
  Search, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Loader2, 
  Building2,
  ChevronRight,
  Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface Region {
  id: string;
  name: string;
  nameAm: string | null;
  nameOr: string | null;
  code: string;
  isActive: boolean;
  _count?: {
    cities: number;
  };
}

interface City {
  id: string;
  name: string;
  nameAm: string | null;
  nameOr: string | null;
  regionId: string;
  isActive: boolean;
  region: Region;
}

export default function LocationsPage() {
  const [regions, setRegions] = useState<Region[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('regions');

  // Modals
  const [isRegionModalOpen, setIsRegionModalOpen] = useState(false);
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const [editingRegion, setEditingRegion] = useState<Region | null>(null);
  const [editingCity, setEditingCity] = useState<City | null>(null);

  // Form States
  const [regionForm, setRegionForm] = useState({
    name: '',
    nameAm: '',
    nameOr: '',
    code: '',
  });
  const [cityForm, setCityForm] = useState({
    name: '',
    nameAm: '',
    nameOr: '',
    regionId: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [regionsRes, citiesRes] = await Promise.all([
        fetch('/api/admin/regions'),
        fetch('/api/admin/cities')
      ]);
      const regionsData = await regionsRes.json();
      const citiesData = await citiesRes.json();
      setRegions(regionsData);
      setCities(citiesData);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch data', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleRegionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingRegion ? 'PUT' : 'POST';
    const url = editingRegion ? `/api/admin/regions/${editingRegion.id}` : '/api/admin/regions';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regionForm),
      });

      if (res.ok) {
        toast({ title: 'Success', description: `Region ${editingRegion ? 'updated' : 'created'}` });
        setIsRegionModalOpen(false);
        fetchData();
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Action failed', variant: 'destructive' });
    }
  };

  const handleCitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingCity ? 'PUT' : 'POST';
    const url = editingCity ? `/api/admin/cities/${editingCity.id}` : '/api/admin/cities';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cityForm),
      });

      if (res.ok) {
        toast({ title: 'Success', description: `City ${editingCity ? 'updated' : 'created'}` });
        setIsCityModalOpen(false);
        fetchData();
      } else {
        const errorText = await res.text();
        toast({ 
          title: 'Error', 
          description: errorText || 'Action failed', 
          variant: 'destructive' 
        });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Action failed', variant: 'destructive' });
    }
  };

  const deleteRegion = async (id: string) => {
    if (!confirm('Area you sure? This will fail if cities are attached.')) return;
    try {
      const res = await fetch(`/api/admin/regions/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast({ title: 'Deleted' });
        fetchData();
      }
    } catch (error) {
      toast({ title: 'Error', variant: 'destructive' });
    }
  };

  const deleteCity = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      const res = await fetch(`/api/admin/cities/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast({ title: 'Deleted' });
        fetchData();
      } else {
        const errorText = await res.text();
        toast({ 
          title: 'Deletion Failed', 
          description: errorText || 'Could not delete city', 
          variant: 'destructive' 
        });
      }
    } catch (error) {
      toast({ title: 'Error', variant: 'destructive' });
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 bg-white min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Location Management</h1>
          <p className="text-gray-500 mt-1">Manage Ethiopian regions and cities for your agent network.</p>
        </div>
        <div className="flex gap-4">
          <Button 
            onClick={() => {
              setEditingRegion(null);
              setRegionForm({ name: '', nameAm: '', nameOr: '', code: '' });
              setIsRegionModalOpen(true);
            }}
            className="bg-gray-900 hover:bg-black text-white rounded-xl shadow-lg shadow-gray-200 px-6 h-11"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Region
          </Button>
          <Button 
            onClick={() => {
              setEditingCity(null);
              setCityForm({ name: '', nameAm: '', nameOr: '', regionId: '' });
              setIsCityModalOpen(true);
            }}
            className="bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-xl border-none"
          >
            <Plus className="w-4 h-4 mr-2" /> Add City
          </Button>
        </div>
      </div>

      <Tabs defaultValue="regions" onValueChange={setActiveTab} className="bg-white">
        <TabsList className="bg-slate-100/50 p-1 rounded-xl mb-6">
          <TabsTrigger value="regions" className="rounded-lg px-8 font-bold text-slate-500 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm transition-all">
            Regions ({regions.length})
          </TabsTrigger>
          <TabsTrigger value="cities" className="rounded-lg px-8 font-bold text-slate-500 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm transition-all">
            Cities ({cities.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="regions">
          <Card className="border-gray-100 shadow-sm rounded-2xl overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="font-bold">Name (EN)</TableHead>
                  <TableHead className="font-bold">Amharic</TableHead>
                  <TableHead className="font-bold">Afaan Oromoo</TableHead>
                  <TableHead className="font-bold">Code</TableHead>
                  <TableHead className="font-bold">Cities</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                   <TableRow><TableCell colSpan={6} className="text-center py-10"><Loader2 className="w-8 h-8 animate-spin mx-auto text-slate-200" /></TableCell></TableRow>
                ) : regions.map((region) => (
                  <TableRow key={region.id}>
                    <TableCell className="font-bold text-gray-900">{region.name}</TableCell>
                    <TableCell className="text-gray-600">{region.nameAm || '-'}</TableCell>
                    <TableCell className="text-gray-600">{region.nameOr || '-'}</TableCell>
                    <TableCell><Badge variant="outline" className="bg-slate-50 border-gray-100 rounded-md font-mono">{region.code}</Badge></TableCell>
                    <TableCell className="font-bold">{region._count?.cities || 0}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {
                            setEditingRegion(region);
                            setRegionForm({ name: region.name, nameAm: region.nameAm || '', nameOr: region.nameOr || '', code: region.code });
                            setIsRegionModalOpen(true);
                          }}><Edit2 className="w-4 h-4 mr-2" /> Edit</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => deleteRegion(region.id)} className="text-red-600"><Trash2 className="w-4 h-4 mr-2" /> Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="cities">
          <Card className="border-gray-100 shadow-sm rounded-2xl overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="font-bold">City Name</TableHead>
                  <TableHead className="font-bold">Region</TableHead>
                  <TableHead className="font-bold">Names (AM/OR)</TableHead>
                  <TableHead className="font-bold">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-10"><Loader2 className="w-8 h-8 animate-spin mx-auto text-slate-200" /></TableCell></TableRow>
                ) : cities.map((city) => (
                  <TableRow key={city.id}>
                    <TableCell className="font-bold text-gray-900">{city.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3 h-3 text-deepSkyBlue" />
                        <span className="font-medium">{city.region.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600 font-medium">
                      {city.nameAm || '-'} / {city.nameOr || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge className={city.isActive ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'}>
                        {city.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {
                            setEditingCity(city);
                            setCityForm({ name: city.name, nameAm: city.nameAm || '', nameOr: city.nameOr || '', regionId: city.regionId });
                            setIsCityModalOpen(true);
                          }}><Edit2 className="w-4 h-4 mr-2" /> Edit</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => deleteCity(city.id)} className="text-red-600"><Trash2 className="w-4 h-4 mr-2" /> Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Region Modal */}
      <Dialog open={isRegionModalOpen} onOpenChange={setIsRegionModalOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl">
          <form onSubmit={handleRegionSubmit}>
            <DialogHeader>
              <DialogTitle>{editingRegion ? 'Edit Region' : 'Add New Region'}</DialogTitle>
              <DialogDescription>Enter the region details below.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Region Name (English)</Label>
                <Input value={regionForm.name} onChange={(e) => setRegionForm({...regionForm, name: e.target.value})} placeholder="Oromia" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Amharic Name</Label>
                  <Input value={regionForm.nameAm} onChange={(e) => setRegionForm({...regionForm, nameAm: e.target.value})} placeholder="ኦሮሚያ" />
                </div>
                <div className="space-y-2">
                  <Label>Afaan Oromoo</Label>
                  <Input value={regionForm.nameOr} onChange={(e) => setRegionForm({...regionForm, nameOr: e.target.value})} placeholder="Oromiyaa" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Region Code</Label>
                <Input value={regionForm.code} onChange={(e) => setRegionForm({...regionForm, code: e.target.value.toUpperCase()})} placeholder="OR" required />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" className="bg-deepSkyBlue hover:bg-blue-600 w-full rounded-xl h-12">
                {editingRegion ? 'Update Region' : 'Create Region'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* City Modal */}
      <Dialog open={isCityModalOpen} onOpenChange={setIsCityModalOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl">
          <form onSubmit={handleCitySubmit}>
            <DialogHeader>
              <DialogTitle>{editingCity ? 'Edit City' : 'Add New City'}</DialogTitle>
              <DialogDescription>Specify region and city details.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
               <div className="space-y-2">
                <Label>Parent Region</Label>
                <Select value={cityForm.regionId} onValueChange={(v) => setCityForm({...cityForm, regionId: v})}>
                  <SelectTrigger className="rounded-xl h-12 bg-slate-50 border-gray-100">
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    {regions.map((r) => (
                      <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>City Name (English)</Label>
                <Input value={cityForm.name} onChange={(e) => setCityForm({...cityForm, name: e.target.value})} placeholder="Adama" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Amharic Name</Label>
                  <Input value={cityForm.nameAm} onChange={(e) => setCityForm({...cityForm, nameAm: e.target.value})} placeholder="አዳማ" />
                </div>
                <div className="space-y-2">
                  <Label>Afaan Oromoo</Label>
                  <Input value={cityForm.nameOr} onChange={(e) => setCityForm({...cityForm, nameOr: e.target.value})} placeholder="Adaamaa" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" className="bg-deepSkyBlue hover:bg-blue-600 w-full rounded-xl h-12">
                {editingCity ? 'Update City' : 'Create City'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
