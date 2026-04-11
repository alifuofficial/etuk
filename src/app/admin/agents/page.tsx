'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSession } from 'next-auth/react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import {
  Search,
  Mail,
  Phone,
  MapPin,
  Building2,
  FileText,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Plus,
  Download,
  FileSpreadsheet,
  Trash2,
  MessageSquare,
  Edit,
  Shield,
  User,
  ChevronLeft,
  ChevronRight,
  Upload,
  X,
  Key,
  FileUp,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

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
  tradeLicense: string | null;
  idDocument: string | null;
  message: string | null;
  howDidYouHear: string | null;
  status: string;
  reviewNotes: string | null;
  createdAt: string;
  userId?: string | null;
  user?: { id: string; isActive: boolean } | null;
}

interface Region {
  id: string;
  name: string;
  cities: { id: string; name: string }[];
}

const BUSINESS_TYPES = [
  'Retail',
  'Wholesale',
  'Service',
  'Distributor',
  'Manufacturer',
  'Individual',
];

const EXPERIENCE_LEVELS = [
  'Less than 1 year',
  '1-3 years',
  '3-5 years',
  '5-10 years',
  'More than 10 years',
];

const HOW_DID_YOU_HEAR = [
  'Website',
  'Social Media',
  'Friend/Family',
  'Advertisement',
  'Trade Show',
  'Other',
];

export default function AgentsPage() {
  const { data: session } = useSession();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showSmsDialog, setShowSmsDialog] = useState(false);
  const [showPortalDialog, setShowPortalDialog] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [regions, setRegions] = useState<Region[]>([]);
  
  // SMS state
  const [smsMessage, setSmsMessage] = useState('');
  const [smsSending, setSmsSending] = useState(false);
  
  // Portal state
  const [portalPassword, setPortalPassword] = useState('');
  const [portalLoading, setPortalLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    alternativePhone: '',
    businessName: '',
    businessType: '',
    experience: '',
    region: '',
    city: '',
    woreda: '',
    kebele: '',
    address: '',
    hasWarehouse: false,
    warehouseSize: '',
    existingBrands: '',
    staffCount: '',
    estimatedCapital: '',
    bankName: '',
    accountNumber: '',
    tinNumber: '',
    message: '',
    howDidYouHear: '',
    status: 'PENDING',
    tradeLicense: null as File | null,
    idDocument: null as File | null,
  });
  
  // Preview URLs
  const [licensePreview, setLicensePreview] = useState<string | null>(null);
  const [idPreview, setIdPreview] = useState<string | null>(null);
  
  const itemsPerPage = 15;

  useEffect(() => {
    fetchAgents();
    fetchRegions();
  }, [statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  const fetchRegions = async () => {
    try {
      const res = await fetch('/api/regions');
      if (res.ok) setRegions(await res.json());
    } catch (e) {
      console.error('Failed to fetch regions:', e);
    }
  };

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      const res = await fetch(`/api/agents?${params}`);
      if (res.ok) {
        const data = await res.json();
        setAgents(Array.isArray(data) ? data : []);
      } else {
        console.error('Failed to fetch agents:', res.status);
        setAgents([]);
      }
    } catch (e) {
      console.error('Failed to fetch agents:', e);
      setAgents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (agentId: string, newStatus: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/agents/${agentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, reviewNotes }),
      });
      if (res.ok) {
        toast({ title: `Application ${newStatus.toLowerCase()}`, description: 'Status updated successfully.' });
        fetchAgents();
        setShowDetailDialog(false);
        setSelectedAgent(null);
        setReviewNotes('');
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to update status.', variant: 'destructive' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (agentId: string) => {
    if (!confirm('Delete this agent? This cannot be undone.')) return;
    setActionLoading(true);
    try {
      await fetch(`/api/agents/${agentId}`, { method: 'DELETE' });
      toast({ title: 'Agent deleted' });
      fetchAgents();
    } catch {
      toast({ title: 'Error', description: 'Failed to delete.', variant: 'destructive' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendSms = async () => {
    if (!selectedAgent || !smsMessage.trim()) return;
    setSmsSending(true);
    try {
      const res = await fetch('/api/sms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phones: [{ phone: selectedAgent.phone }], message: smsMessage }),
      });
      if (res.ok) {
        toast({ title: 'SMS Sent', description: `Message sent to ${selectedAgent.phone}` });
        setShowSmsDialog(false);
        setSmsMessage('');
      } else {
        throw new Error('SMS failed');
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to send SMS.', variant: 'destructive' });
    } finally {
      setSmsSending(false);
    }
  };

  const handlePortalAccess = async (activate: boolean) => {
    if (!selectedAgent) return;
    if (activate && (!portalPassword || portalPassword.length < 6)) {
      toast({ title: 'Error', description: 'Password must be at least 6 characters.', variant: 'destructive' });
      return;
    }
    setPortalLoading(true);
    try {
      const res = await fetch(`/api/admin/agents/${selectedAgent.id}/portal-access`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(activate ? { password: portalPassword, isActive: true } : { isActive: false }),
      });
      if (res.ok) {
        toast({ title: 'Portal Access Updated', description: activate ? 'Agent can now access the portal.' : 'Portal access disabled.' });
        setShowPortalDialog(false);
        setPortalPassword('');
        fetchAgents();
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to update portal access.', variant: 'destructive' });
    } finally {
      setPortalLoading(false);
    }
  };

  const handleFileChange = (field: 'tradeLicense' | 'idDocument', file: File | null) => {
    setFormData(prev => ({ ...prev, [field]: file }));
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (field === 'tradeLicense') setLicensePreview(reader.result as string);
        else setIdPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      if (field === 'tradeLicense') setLicensePreview(null);
      else setIdPreview(null);
    }
  };

  const handleAddAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const form = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== '' && key !== 'tradeLicense' && key !== 'idDocument') {
          form.append(key, value.toString());
        }
      });
      if (formData.tradeLicense) form.append('tradeLicense', formData.tradeLicense);
      if (formData.idDocument) form.append('idDocument', formData.idDocument);
      
      const res = await fetch('/api/agents', { method: 'POST', body: form });
      if (res.ok) {
        toast({ title: 'Agent Added', description: 'New agent created successfully.' });
        setShowAddDialog(false);
        resetForm();
        fetchAgents();
      } else {
        const err = await res.json();
        throw new Error(err.error || 'Failed to add agent');
      }
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgent) return;
    setActionLoading(true);
    try {
      const form = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== '' && key !== 'tradeLicense' && key !== 'idDocument') {
          form.append(key, value.toString());
        }
      });
      if (formData.tradeLicense) form.append('tradeLicense', formData.tradeLicense);
      if (formData.idDocument) form.append('idDocument', formData.idDocument);
      
      const res = await fetch(`/api/agents/${selectedAgent.id}`, { method: 'PUT', body: form });
      if (res.ok) {
        toast({ title: 'Agent Updated' });
        setShowEditDialog(false);
        fetchAgents();
      } else {
        const err = await res.json();
        throw new Error(err.error || 'Failed to update');
      }
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setActionLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      alternativePhone: '',
      businessName: '',
      businessType: '',
      experience: '',
      region: '',
      city: '',
      woreda: '',
      kebele: '',
      address: '',
      hasWarehouse: false,
      warehouseSize: '',
      existingBrands: '',
      staffCount: '',
      estimatedCapital: '',
      bankName: '',
      accountNumber: '',
      tinNumber: '',
      message: '',
      howDidYouHear: '',
      status: 'PENDING',
      tradeLicense: null,
      idDocument: null,
    });
    setLicensePreview(null);
    setIdPreview(null);
  };

  const openEditDialog = (agent: Agent) => {
    setSelectedAgent(agent);
    setFormData({
      firstName: agent.firstName,
      lastName: agent.lastName,
      email: agent.email,
      phone: agent.phone,
      alternativePhone: agent.alternativePhone || '',
      businessName: agent.businessName || '',
      businessType: agent.businessType || '',
      experience: agent.experience || '',
      region: agent.region,
      city: agent.city,
      woreda: agent.woreda || '',
      kebele: agent.kebele || '',
      address: agent.address || '',
      hasWarehouse: agent.hasWarehouse,
      warehouseSize: agent.warehouseSize || '',
      existingBrands: agent.existingBrands || '',
      staffCount: agent.staffCount?.toString() || '',
      estimatedCapital: agent.estimatedCapital || '',
      bankName: agent.bankName || '',
      accountNumber: agent.accountNumber || '',
      tinNumber: agent.tinNumber || '',
      message: agent.message || '',
      howDidYouHear: agent.howDidYouHear || '',
      status: agent.status,
      tradeLicense: null,
      idDocument: null,
    });
    setLicensePreview(agent.tradeLicense ? getFileUrl(agent.tradeLicense) : null);
    setIdPreview(agent.idDocument ? getFileUrl(agent.idDocument) : null);
    setShowEditDialog(true);
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
      REJECTED: 'bg-red-50 text-red-700 border-red-200',
    };
    return styles[status] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const getFileUrl = (path: string | null) => {
    if (!path) return '';
    if (path.startsWith('http') || path.startsWith('/api')) return path;
    return `/api/uploads/agents/${path}`;
  };

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();

  const exportToExcel = () => {
    const data = filteredAgents.map(a => ({
      Name: `${a.firstName} ${a.lastName}`,
      Email: a.email,
      Phone: a.phone,
      Region: a.region,
      City: a.city,
      Business: a.businessName || 'Individual',
      Status: a.status,
      Applied: formatDate(a.createdAt)
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Agents');
    XLSX.writeFile(wb, `ETUK_Agents_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('ETUK Agent List', 14, 15);
    autoTable(doc, {
      head: [['Name', 'Email', 'Phone', 'Location', 'Status', 'Date']],
      body: filteredAgents.map(a => [
        `${a.firstName} ${a.lastName}`,
        a.email,
        a.phone,
        `${a.city}, ${a.region}`,
        a.status,
        formatDate(a.createdAt)
      ]),
      startY: 20,
    });
    doc.save(`ETUK_Agents_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const filteredAgents = agents.filter(agent => {
    const q = search.toLowerCase();
    return (
      agent.firstName.toLowerCase().includes(q) ||
      agent.lastName.toLowerCase().includes(q) ||
      agent.email.toLowerCase().includes(q) ||
      agent.region.toLowerCase().includes(q) ||
      agent.city.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filteredAgents.length / itemsPerPage);
  const paginatedAgents = filteredAgents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const statusCounts = {
    all: agents.length,
    PENDING: agents.filter(a => a.status === 'PENDING').length,
    APPROVED: agents.filter(a => a.status === 'APPROVED').length,
    REJECTED: agents.filter(a => a.status === 'REJECTED').length,
  };

  const selectedCities = formData.region
    ? regions.find(r => r.name === formData.region)?.cities || []
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agents</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your distribution network</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={exportToExcel} className="h-10">
            <FileSpreadsheet className="w-4 h-4 mr-2" /> Excel
          </Button>
          <Button variant="outline" onClick={exportToPDF} className="h-10">
            <Download className="w-4 h-4 mr-2" /> PDF
          </Button>
          <Button onClick={() => { resetForm(); setShowAddDialog(true); }} className="h-10 bg-gray-900 hover:bg-gray-800 text-white">
            <Plus className="w-4 h-4 mr-2" /> Add Agent
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'All', count: statusCounts.all, icon: User, color: 'gray', filter: 'all' },
          { label: 'Pending', count: statusCounts.PENDING, icon: Clock, color: 'amber', filter: 'PENDING' },
          { label: 'Approved', count: statusCounts.APPROVED, icon: CheckCircle, color: 'emerald', filter: 'APPROVED' },
          { label: 'Rejected', count: statusCounts.REJECTED, icon: XCircle, color: 'red', filter: 'REJECTED' },
        ].map(stat => (
          <Card 
            key={stat.label} 
            className={`border-gray-200/60 cursor-pointer hover:border-gray-300 transition-colors ${statusFilter === stat.filter ? 'ring-2 ring-gray-900' : ''}`}
            onClick={() => setStatusFilter(stat.filter)}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-${stat.color}-50`}>
                  <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stat.count}</p>
                  <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by name, email, or location..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="h-10 pl-10 bg-white"
          />
        </div>
      </div>

      {/* Agent List */}
      <Card className="border-gray-200/60 shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            </div>
          ) : paginatedAgents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <User className="w-12 h-12 mb-4" />
              <p className="font-medium">No agents found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Agent</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Contact</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Location</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Date</th>
                      <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginatedAgents.map(agent => (
                      <tr key={agent.id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                              <span className="text-xs font-bold text-gray-600">{agent.firstName[0]}{agent.lastName[0]}</span>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{agent.firstName} {agent.lastName}</p>
                              <p className="text-xs text-gray-500">{agent.businessName || 'Individual'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-gray-900">{agent.email}</p>
                          <p className="text-xs text-gray-500">{agent.phone}</p>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">{agent.city}, {agent.region}</td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className={getStatusBadge(agent.status)}>{agent.status}</Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">{formatDate(agent.createdAt)}</td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="sm" onClick={() => { setSelectedAgent(agent); setReviewNotes(agent.reviewNotes || ''); setShowDetailDialog(true); }}>
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => { setSelectedAgent(agent); setSmsMessage(''); setShowSmsDialog(true); }}>
                              <MessageSquare className="w-4 h-4" />
                            </Button>
                            {agent.status === 'APPROVED' && (
                              <Button variant="ghost" size="sm" onClick={() => { setSelectedAgent(agent); setPortalPassword(''); setShowPortalDialog(true); }}>
                                <Key className="w-4 h-4" />
                              </Button>
                            )}
                            <Button variant="ghost" size="sm" onClick={() => openEditDialog(agent)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            {session?.user?.role === 'ADMIN' && (
                              <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(agent.id)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                  <p className="text-sm text-gray-500">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredAgents.length)} of {filteredAgents.length}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                      return (
                        <Button key={page} variant={currentPage === page ? 'default' : 'outline'} size="sm" onClick={() => setCurrentPage(page)}
                          className={currentPage === page ? 'bg-gray-900 hover:bg-gray-800' : ''}>
                          {page}
                        </Button>
                      );
                    })}
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedAgent && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <span className="text-lg font-bold text-gray-600">{selectedAgent.firstName[0]}{selectedAgent.lastName[0]}</span>
                  </div>
                  <div>
                    <DialogTitle>{selectedAgent.firstName} {selectedAgent.lastName}</DialogTitle>
                    <p className="text-sm text-gray-500">Applied {formatDate(selectedAgent.createdAt)}</p>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase mb-1">Email</p>
                    <p className="text-sm font-medium">{selectedAgent.email}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase mb-1">Phone</p>
                    <p className="text-sm font-medium">{selectedAgent.phone}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase mb-1">Location</p>
                    <p className="text-sm font-medium">{selectedAgent.city}, {selectedAgent.region}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase mb-1">Business</p>
                    <p className="text-sm font-medium">{selectedAgent.businessName || 'Individual'}</p>
                  </div>
                  {selectedAgent.tinNumber && (
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase mb-1">TIN</p>
                      <p className="text-sm font-medium">{selectedAgent.tinNumber}</p>
                    </div>
                  )}
                  {selectedAgent.businessType && (
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase mb-1">Type</p>
                      <p className="text-sm font-medium">{selectedAgent.businessType}</p>
                    </div>
                  )}
                </div>

                {selectedAgent.tradeLicense && (
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                      <span className="text-xs font-bold text-gray-500 uppercase">Trade License</span>
                    </div>
                    <div className="p-4 bg-gray-50">
                      {selectedAgent.tradeLicense.toLowerCase().endsWith('.pdf') ? (
                        <iframe src={getFileUrl(selectedAgent.tradeLicense)} className="w-full h-64 rounded-lg" title="License" />
                      ) : (
                        <img src={getFileUrl(selectedAgent.tradeLicense)} alt="License" className="w-full h-64 object-contain rounded-lg" />
                      )}
                    </div>
                  </div>
                )}

                {selectedAgent.idDocument && (
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                      <span className="text-xs font-bold text-gray-500 uppercase">ID Document</span>
                    </div>
                    <div className="p-4 bg-gray-50">
                      <img src={getFileUrl(selectedAgent.idDocument)} alt="ID" className="w-full h-64 object-contain rounded-lg" />
                    </div>
                  </div>
                )}

                {selectedAgent.message && (
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-xs font-bold text-gray-400 uppercase mb-2">Message</p>
                    <p className="text-sm text-gray-700 italic">"{selectedAgent.message}"</p>
                  </div>
                )}

                <div>
                  <Label className="text-xs font-bold text-gray-400 uppercase">Review Notes</Label>
                  <Textarea
                    value={reviewNotes}
                    onChange={e => setReviewNotes(e.target.value)}
                    placeholder="Add notes..."
                    rows={3}
                    className="mt-2"
                  />
                </div>
              </div>

              {selectedAgent.status === 'PENDING' && (
                <DialogFooter className="gap-2">
                  <Button variant="outline" className="flex-1 text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleStatusUpdate(selectedAgent.id, 'REJECTED')} disabled={actionLoading}>
                    <XCircle className="w-4 h-4 mr-2" /> Reject
                  </Button>
                  <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleStatusUpdate(selectedAgent.id, 'APPROVED')} disabled={actionLoading}>
                    <CheckCircle className="w-4 h-4 mr-2" /> Approve
                  </Button>
                </DialogFooter>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Agent Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Add New Agent</DialogTitle>
            <DialogDescription>Register a new agent in the system</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddAgent} className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b pb-2">Personal Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-500">First Name *</Label>
                  <Input value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} required className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Last Name *</Label>
                  <Input value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} required className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Email *</Label>
                  <Input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Phone *</Label>
                  <Input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} required className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Alternative Phone</Label>
                  <Input value={formData.alternativePhone} onChange={e => setFormData({ ...formData, alternativePhone: e.target.value })} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs text-gray-500">TIN Number</Label>
                  <Input value={formData.tinNumber} onChange={e => setFormData({ ...formData, tinNumber: e.target.value })} className="mt-1" />
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b pb-2">Location</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-500">Region *</Label>
                  <Select value={formData.region} onValueChange={v => setFormData({ ...formData, region: v, city: '' })}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select region" /></SelectTrigger>
                    <SelectContent>{regions.map(r => <SelectItem key={r.id} value={r.name}>{r.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">City *</Label>
                  <Select value={formData.city} onValueChange={v => setFormData({ ...formData, city: v })}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select city" /></SelectTrigger>
                    <SelectContent>{selectedCities.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Woreda</Label>
                  <Input value={formData.woreda} onChange={e => setFormData({ ...formData, woreda: e.target.value })} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Kebele</Label>
                  <Input value={formData.kebele} onChange={e => setFormData({ ...formData, kebele: e.target.value })} className="mt-1" />
                </div>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Address</Label>
                <Textarea value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} rows={2} className="mt-1" />
              </div>
            </div>

            {/* Business Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b pb-2">Business Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-500">Business Name</Label>
                  <Input value={formData.businessName} onChange={e => setFormData({ ...formData, businessName: e.target.value })} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Business Type</Label>
                  <Select value={formData.businessType} onValueChange={v => setFormData({ ...formData, businessType: v })}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>{BUSINESS_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Experience</Label>
                  <Select value={formData.experience} onValueChange={v => setFormData({ ...formData, experience: v })}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select experience" /></SelectTrigger>
                    <SelectContent>{EXPERIENCE_LEVELS.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Staff Count</Label>
                  <Input type="number" value={formData.staffCount} onChange={e => setFormData({ ...formData, staffCount: e.target.value })} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Estimated Capital</Label>
                  <Input value={formData.estimatedCapital} onChange={e => setFormData({ ...formData, estimatedCapital: e.target.value })} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Existing Brands</Label>
                  <Input value={formData.existingBrands} onChange={e => setFormData({ ...formData, existingBrands: e.target.value })} className="mt-1" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="hasWarehouse" checked={formData.hasWarehouse} onCheckedChange={v => setFormData({ ...formData, hasWarehouse: !!v })} />
                <Label htmlFor="hasWarehouse">Has Warehouse</Label>
              </div>
              {formData.hasWarehouse && (
                <div>
                  <Label className="text-xs text-gray-500">Warehouse Size</Label>
                  <Input value={formData.warehouseSize} onChange={e => setFormData({ ...formData, warehouseSize: e.target.value })} className="mt-1" />
                </div>
              )}
            </div>

            {/* Bank Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b pb-2">Bank Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-500">Bank Name</Label>
                  <Input value={formData.bankName} onChange={e => setFormData({ ...formData, bankName: e.target.value })} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Account Number</Label>
                  <Input value={formData.accountNumber} onChange={e => setFormData({ ...formData, accountNumber: e.target.value })} className="mt-1" />
                </div>
              </div>
            </div>

            {/* Documents */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b pb-2">Documents</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-500">Trade License</Label>
                  <div className="mt-1">
                    <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-gray-300 hover:bg-gray-50 transition-all">
                      {licensePreview ? (
                        <img src={licensePreview} alt="Preview" className="w-full h-full object-contain rounded-lg" />
                      ) : (
                        <div className="flex flex-col items-center">
                          <Upload className="w-6 h-6 text-gray-400" />
                          <span className="text-xs text-gray-500 mt-1">Upload License</span>
                        </div>
                      )}
                      <input type="file" accept="image/*,.pdf" className="hidden" onChange={e => handleFileChange('tradeLicense', e.target.files?.[0] || null)} />
                    </label>
                    {licensePreview && (
                      <Button variant="ghost" size="sm" className="mt-2 text-red-500" onClick={() => { setLicensePreview(null); setFormData(prev => ({ ...prev, tradeLicense: null })); }}>
                        <X className="w-4 h-4 mr-1" /> Remove
                      </Button>
                    )}
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">ID Document</Label>
                  <div className="mt-1">
                    <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-gray-300 hover:bg-gray-50 transition-all">
                      {idPreview ? (
                        <img src={idPreview} alt="Preview" className="w-full h-full object-contain rounded-lg" />
                      ) : (
                        <div className="flex flex-col items-center">
                          <Upload className="w-6 h-6 text-gray-400" />
                          <span className="text-xs text-gray-500 mt-1">Upload ID</span>
                        </div>
                      )}
                      <input type="file" accept="image/*,.pdf" className="hidden" onChange={e => handleFileChange('idDocument', e.target.files?.[0] || null)} />
                    </label>
                    {idPreview && (
                      <Button variant="ghost" size="sm" className="mt-2 text-red-500" onClick={() => { setIdPreview(null); setFormData(prev => ({ ...prev, idDocument: null })); }}>
                        <X className="w-4 h-4 mr-1" /> Remove
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b pb-2">Additional Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-500">How did you hear about us?</Label>
                  <Select value={formData.howDidYouHear} onValueChange={v => setFormData({ ...formData, howDidYouHear: v })}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{HOW_DID_YOU_HEAR.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Status</Label>
                  <Select value={formData.status} onValueChange={v => setFormData({ ...formData, status: v })}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="APPROVED">Approved</SelectItem>
                      <SelectItem value="REJECTED">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Message</Label>
                <Textarea value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })} rows={2} className="mt-1" />
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
              <Button type="submit" disabled={actionLoading} className="bg-gray-900 hover:bg-gray-800">
                {actionLoading ? 'Saving...' : 'Add Agent'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Agent Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Edit Agent</DialogTitle>
            <DialogDescription>Update agent information and documents</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditAgent} className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b pb-2">Personal Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-500">First Name *</Label>
                  <Input value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} required className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Last Name *</Label>
                  <Input value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} required className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Email *</Label>
                  <Input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Phone *</Label>
                  <Input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} required className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Alternative Phone</Label>
                  <Input value={formData.alternativePhone} onChange={e => setFormData({ ...formData, alternativePhone: e.target.value })} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs text-gray-500">TIN Number</Label>
                  <Input value={formData.tinNumber} onChange={e => setFormData({ ...formData, tinNumber: e.target.value })} className="mt-1" />
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b pb-2">Location</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-500">Region *</Label>
                  <Select value={formData.region} onValueChange={v => setFormData({ ...formData, region: v, city: '' })}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select region" /></SelectTrigger>
                    <SelectContent>{regions.map(r => <SelectItem key={r.id} value={r.name}>{r.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">City *</Label>
                  <Select value={formData.city} onValueChange={v => setFormData({ ...formData, city: v })}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select city" /></SelectTrigger>
                    <SelectContent>{selectedCities.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Woreda</Label>
                  <Input value={formData.woreda} onChange={e => setFormData({ ...formData, woreda: e.target.value })} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Kebele</Label>
                  <Input value={formData.kebele} onChange={e => setFormData({ ...formData, kebele: e.target.value })} className="mt-1" />
                </div>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Address</Label>
                <Textarea value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} rows={2} className="mt-1" />
              </div>
            </div>

            {/* Business Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b pb-2">Business Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-500">Business Name</Label>
                  <Input value={formData.businessName} onChange={e => setFormData({ ...formData, businessName: e.target.value })} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Business Type</Label>
                  <Select value={formData.businessType} onValueChange={v => setFormData({ ...formData, businessType: v })}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>{BUSINESS_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Experience</Label>
                  <Select value={formData.experience} onValueChange={v => setFormData({ ...formData, experience: v })}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select experience" /></SelectTrigger>
                    <SelectContent>{EXPERIENCE_LEVELS.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Staff Count</Label>
                  <Input type="number" value={formData.staffCount} onChange={e => setFormData({ ...formData, staffCount: e.target.value })} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Estimated Capital</Label>
                  <Input value={formData.estimatedCapital} onChange={e => setFormData({ ...formData, estimatedCapital: e.target.value })} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Existing Brands</Label>
                  <Input value={formData.existingBrands} onChange={e => setFormData({ ...formData, existingBrands: e.target.value })} className="mt-1" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="editHasWarehouse" checked={formData.hasWarehouse} onCheckedChange={v => setFormData({ ...formData, hasWarehouse: !!v })} />
                <Label htmlFor="editHasWarehouse">Has Warehouse</Label>
              </div>
              {formData.hasWarehouse && (
                <div>
                  <Label className="text-xs text-gray-500">Warehouse Size</Label>
                  <Input value={formData.warehouseSize} onChange={e => setFormData({ ...formData, warehouseSize: e.target.value })} className="mt-1" />
                </div>
              )}
            </div>

            {/* Bank Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b pb-2">Bank Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-500">Bank Name</Label>
                  <Input value={formData.bankName} onChange={e => setFormData({ ...formData, bankName: e.target.value })} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Account Number</Label>
                  <Input value={formData.accountNumber} onChange={e => setFormData({ ...formData, accountNumber: e.target.value })} className="mt-1" />
                </div>
              </div>
            </div>

            {/* Documents */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b pb-2">Documents</h3>
              <p className="text-xs text-gray-500">Upload new files to replace existing documents.</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-500">Trade License</Label>
                  <div className="mt-1">
                    <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-gray-300 hover:bg-gray-50 transition-all">
                      {licensePreview ? (
                        licensePreview.startsWith('data:') ? (
                          <img src={licensePreview} alt="New License" className="w-full h-full object-contain rounded-lg" />
                        ) : (
                          <img src={licensePreview} alt="Current License" className="w-full h-full object-contain rounded-lg" />
                        )
                      ) : (
                        <div className="flex flex-col items-center">
                          <FileUp className="w-6 h-6 text-gray-400" />
                          <span className="text-xs text-gray-500 mt-1">Replace License</span>
                        </div>
                      )}
                      <input type="file" accept="image/*,.pdf" className="hidden" onChange={e => handleFileChange('tradeLicense', e.target.files?.[0] || null)} />
                    </label>
                    {licensePreview && (
                      <Button variant="ghost" size="sm" className="mt-2 text-red-500" onClick={() => { setLicensePreview(null); setFormData(prev => ({ ...prev, tradeLicense: null })); }}>
                        <X className="w-4 h-4 mr-1" /> Remove
                      </Button>
                    )}
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">ID Document</Label>
                  <div className="mt-1">
                    <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-gray-300 hover:bg-gray-50 transition-all">
                      {idPreview ? (
                        idPreview.startsWith('data:') ? (
                          <img src={idPreview} alt="New ID" className="w-full h-full object-contain rounded-lg" />
                        ) : (
                          <img src={idPreview} alt="Current ID" className="w-full h-full object-contain rounded-lg" />
                        )
                      ) : (
                        <div className="flex flex-col items-center">
                          <FileUp className="w-6 h-6 text-gray-400" />
                          <span className="text-xs text-gray-500 mt-1">Replace ID</span>
                        </div>
                      )}
                      <input type="file" accept="image/*,.pdf" className="hidden" onChange={e => handleFileChange('idDocument', e.target.files?.[0] || null)} />
                    </label>
                    {idPreview && (
                      <Button variant="ghost" size="sm" className="mt-2 text-red-500" onClick={() => { setIdPreview(null); setFormData(prev => ({ ...prev, idDocument: null })); }}>
                        <X className="w-4 h-4 mr-1" /> Remove
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Status */}
            <div>
              <Label className="text-xs text-gray-500">Status</Label>
              <Select value={formData.status} onValueChange={v => setFormData({ ...formData, status: v })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>Cancel</Button>
              <Button type="submit" disabled={actionLoading} className="bg-gray-900 hover:bg-gray-800">
                {actionLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* SMS Dialog */}
      <Dialog open={showSmsDialog} onOpenChange={setShowSmsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send SMS</DialogTitle>
            <DialogDescription>To: {selectedAgent?.phone}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={smsMessage}
              onChange={e => setSmsMessage(e.target.value)}
              placeholder="Enter your message..."
              rows={4}
              maxLength={160}
            />
            <p className="text-xs text-gray-500">{smsMessage.length}/160 characters</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSmsDialog(false)}>Cancel</Button>
            <Button onClick={handleSendSms} disabled={smsSending || !smsMessage.trim()} className="bg-gray-900 hover:bg-gray-800">
              {smsSending ? 'Sending...' : 'Send SMS'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Portal Access Dialog */}
      <Dialog open={showPortalDialog} onOpenChange={setShowPortalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Portal Access
            </DialogTitle>
            <DialogDescription>Manage portal access for {selectedAgent?.firstName} {selectedAgent?.lastName}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-xs font-bold text-gray-500 uppercase mb-1">Current Status</p>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${selectedAgent?.user?.isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
                <p className="font-medium">
                  {selectedAgent?.userId 
                    ? (selectedAgent?.user?.isActive ? 'Portal Active' : 'Portal Disabled') 
                    : 'No Portal Access'}
                </p>
              </div>
            </div>
            
            <div>
              <Label>Set New Password</Label>
              <Input
                type="password"
                value={portalPassword}
                onChange={e => setPortalPassword(e.target.value)}
                placeholder="Enter password (min 6 characters)"
                className="mt-1"
              />
            </div>
            
            {selectedAgent?.user?.isActive && (
              <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50" onClick={() => handlePortalAccess(false)} disabled={portalLoading}>
                Disable Portal Access
              </Button>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowPortalDialog(false)}>Cancel</Button>
            <Button onClick={() => handlePortalAccess(true)} disabled={portalLoading || portalPassword.length < 6} className="bg-gray-900 hover:bg-gray-800">
              {portalLoading ? 'Saving...' : 'Save Password'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}