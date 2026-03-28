'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import {
  Search,
  Filter,
  MapPin,
  Mail,
  Phone,
  Building2,
  FileText,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
} from 'lucide-react';

interface Agent {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  alternativePhone: string | null;
  businessName: string | null;
  businessType: string | null;
  experience: string | null;
  region: string;
  city: string;
  woreda: string | null;
  kebele: string | null;
  address: string | null;
  hasWarehouse: boolean;
  warehouseSize: string | null;
  existingBrands: string | null;
  staffCount: number | null;
  estimatedCapital: string | null;
  bankName: string | null;
  accountNumber: string | null;
  tinNumber: string | null;
  message: string | null;
  howDidYouHear: string | null;
  tradeLicense: string | null;
  status: string;
  reviewNotes: string | null;
  createdAt: string;
  reviewedAt: string | null;
  reviewer?: { name: string } | null;
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    fetchAgents();
  }, [statusFilter]);

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      const response = await fetch(`/api/agents?${params}`);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setAgents(data);
        } else {
          console.error('API response is not an array:', data);
          setAgents([]);
        }
      } else {
        const errorData = await response.json();
        console.error('Failed to fetch agents:', errorData);
        setAgents([]);
      }
    } catch (error) {
      console.error('Failed to fetch agents:', error);
      setAgents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (agentId: string, newStatus: string) => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/agents/${agentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, reviewNotes }),
      });

      if (response.ok) {
        toast({
          title: `Application ${newStatus.toLowerCase()}`,
          description: 'The agent application status has been updated.',
        });
        fetchAgents();
        setShowDialog(false);
        setSelectedAgent(null);
        setReviewNotes('');
        setPreviewOpen(false);
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to update application.',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'text-green-700 bg-green-50 border-green-100';
      case 'PENDING': return 'text-amber-700 bg-amber-50 border-amber-100';
      case 'REJECTED': return 'text-red-700 bg-red-50 border-red-100';
      default: return 'text-gray-700 bg-gray-50 border-gray-100';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const filteredAgents = Array.isArray(agents) ? agents.filter((agent) => {
    const searchLower = search.toLowerCase();
    const firstName = agent.firstName || '';
    const lastName = agent.lastName || '';
    const email = agent.email || '';
    const region = agent.region || '';
    const city = agent.city || '';
    
    return (
      firstName.toLowerCase().includes(searchLower) ||
      lastName.toLowerCase().includes(searchLower) ||
      email.toLowerCase().includes(searchLower) ||
      region.toLowerCase().includes(searchLower) ||
      city.toLowerCase().includes(searchLower)
    );
  }) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agent Applications</h1>
          <p className="text-sm text-gray-500 mt-1">Review and manage the distribution network.</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">Total Pool</p>
          <p className="text-xl font-bold text-gray-900">{filteredAgents.length}</p>
        </div>
      </div>

      {/* Filters Bar */}
      <Card className="border-gray-200 shadow-sm rounded-xl">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or city..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 h-11 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:bg-white focus:border-deepSkyBlue focus:ring-4 focus:ring-deepSkyBlue/5 outline-none transition-all"
              />
            </div>
            <div className="flex gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-56 h-11 bg-gray-50 border-gray-200 rounded-lg text-sm font-medium">
                   <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-400" />
                    <SelectValue placeholder="Status" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Applications</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Roster Table */}
      <Card className="border-gray-200 shadow-sm rounded-xl overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-deepSkyBlue" />
              <p className="text-sm text-gray-400">Loading records...</p>
            </div>
          ) : filteredAgents.length === 0 ? (
            <div className="text-center py-24">
              <Search className="w-12 h-12 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">No records found matching your search.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50/50">
                  <TableRow>
                    <TableHead className="px-6 py-4 font-bold text-xs uppercase text-gray-600">Name</TableHead>
                    <TableHead className="px-6 py-4 font-bold text-xs uppercase text-gray-600">Location</TableHead>
                    <TableHead className="px-6 py-4 font-bold text-xs uppercase text-gray-600">Business</TableHead>
                    <TableHead className="px-6 py-4 font-bold text-xs uppercase text-gray-600">Status</TableHead>
                    <TableHead className="px-6 py-4 font-bold text-xs uppercase text-gray-600">Applied</TableHead>
                    <TableHead className="px-6 py-4 text-right"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAgents.map((agent) => (
                    <TableRow key={agent.id} className="hover:bg-gray-50/50 transition-colors">
                      <TableCell className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900">{agent.firstName} {agent.lastName}</span>
                          <span className="text-xs text-gray-500">{agent.email}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-5">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <MapPin className="w-3.5 h-3.5 text-gray-400" />
                          <span>{agent.city}, {agent.region}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-5">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Building2 className="w-3.5 h-3.5 text-gray-400" />
                          <span>{agent.businessName || 'Individual'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-5">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${getStatusStyle(agent.status)}`}>
                          {agent.status}
                        </span>
                      </TableCell>
                      <TableCell className="px-6 py-5 text-sm text-gray-500">
                        {formatDate(agent.createdAt)}
                      </TableCell>
                      <TableCell className="px-6 py-5 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-deepSkyBlue hover:bg-gray-100 font-bold gap-2"
                          onClick={() => {
                            setSelectedAgent(agent);
                            setReviewNotes(agent.reviewNotes || '');
                            setPreviewOpen(false);
                            setShowDialog(true);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-2xl shadow-2xl">
          {selectedAgent && (
            <div className="flex flex-col">
              <div className="bg-gray-900 p-8 text-white">
                <DialogHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-deepSkyBlue uppercase tracking-[0.2em]">Application Details</span>
                  </div>
                  <DialogTitle className="text-3xl font-bold leading-none mb-1">
                    {selectedAgent.firstName} {selectedAgent.lastName}
                  </DialogTitle>
                  <DialogDescription className="text-gray-300 text-sm font-medium">
                    Review candidate information for Soreti agent status.
                  </DialogDescription>
                </DialogHeader>
              </div>

              <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto bg-white custom-scrollbar">
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-gray-600 uppercase tracking-widest border-b border-gray-100 pb-1">Contact</h4>
                    <DataPoint icon={<Mail className="w-4 h-4" />} label="Email" value={selectedAgent.email} />
                    <DataPoint icon={<Phone className="w-4 h-4" />} label="Phone" value={selectedAgent.phone} />
                    <DataPoint icon={<MapPin className="w-4 h-4" />} label="City / Region" value={`${selectedAgent.city}, ${selectedAgent.region}`} />
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-gray-600 uppercase tracking-widest border-b border-gray-100 pb-1">Business</h4>
                    <DataPoint label="Organization" value={selectedAgent.businessName || 'N/A'} />
                    <DataPoint label="TIN Number" value={selectedAgent.tinNumber || 'N/A'} />
                    <DataPoint label="Focus" value={selectedAgent.businessType || 'N/A'} />
                    <DataPoint label="Experience" value={selectedAgent.experience || 'N/A'} />
                  </div>
                </div>

                {selectedAgent.message && (
                  <div className="p-5 bg-gray-50 border border-gray-100 rounded-xl space-y-2">
                    <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Candidate Message</p>
                    <p className="text-sm text-gray-700 italic">"{selectedAgent.message}"</p>
                  </div>
                )}

                {selectedAgent.tradeLicense && (
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-blue-100 shadow-sm">
                          <FileText className="w-5 h-5 text-deepSkyBlue" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">Business License</p>
                          <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Verification Document</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setPreviewOpen(!previewOpen)}
                          className="bg-white border-blue-200 text-deepSkyBlue hover:bg-blue-50 font-bold h-9"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          {previewOpen ? 'Hide Preview' : 'Preview'}
                        </Button>
                        <a 
                          href={selectedAgent.tradeLicense} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          <Button variant="ghost" size="sm" className="h-9 w-9 p-0 text-gray-400 hover:text-deepSkyBlue hover:bg-blue-50">
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </a>
                      </div>
                    </div>
                    
                    {previewOpen && (
                      <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-inner flex flex-col">
                        <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex justify-between items-center text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                          <span>Document Explorer</span>
                          <span className="text-gray-400">{selectedAgent.tradeLicense.split('/').pop()}</span>
                        </div>
                        <div className="min-h-[300px] flex items-center justify-center p-2 bg-slate-50/50">
                          {selectedAgent.tradeLicense.toLowerCase().endsWith('.pdf') ? (
                            <iframe 
                              src={selectedAgent.tradeLicense} 
                              className="w-full h-[500px] rounded-lg border-none shadow-sm"
                              title="License PDF"
                            />
                          ) : (
                            <img 
                              src={selectedAgent.tradeLicense} 
                              alt="Business License" 
                              className="max-w-full h-auto rounded-lg shadow-sm cursor-zoom-in"
                              onClick={() => window.open(selectedAgent.tradeLicense!, '_blank')}
                            />
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-3 pt-4">
                  <Label htmlFor="reviewNotes" className="text-xs font-bold text-gray-900 uppercase tracking-widest pl-1">Review Notes</Label>
                  <Textarea
                    id="reviewNotes"
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="Add notes about this agent application..."
                    rows={4}
                    className="bg-gray-50 border-gray-200 rounded-xl p-4 text-sm focus:bg-white focus:border-deepSkyBlue focus:ring-0 transition-all resize-none shadow-none"
                  />
                </div>

                {selectedAgent.status === 'PENDING' && (
                  <div className="flex flex-col sm:flex-row gap-3 pt-6">
                    <Button
                      variant="outline"
                      className="h-12 flex-1 rounded-xl border-gray-200 text-red-600 hover:bg-red-50 hover:border-red-100 font-bold"
                      onClick={() => handleStatusUpdate(selectedAgent.id, 'REJECTED')}
                      disabled={actionLoading}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                    <Button
                      className="h-12 flex-1 rounded-xl bg-gray-900 text-white hover:bg-black font-bold shadow-lg shadow-gray-200 transition-all"
                      onClick={() => handleStatusUpdate(selectedAgent.id, 'APPROVED')}
                      disabled={actionLoading}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DataPoint({ icon, label, value }: { icon?: any, label: string, value: string }) {
  return (
    <div className="space-y-0.5">
      <p className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">{label}</p>
      <div className="flex items-center gap-2">
        {icon && <div className="text-deepSkyBlue">{icon}</div>}
        <p className="text-sm font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}
