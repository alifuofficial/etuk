'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
  ExternalLink,
  Plus,
  Download,
  FileSpreadsheet,
  Trash2,
  Boxes,
  MessageSquare,
  Edit,
  Shield,
  User,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
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
  region: string;
  city: string;
  woreda: string | null;
  kebele: string | null;
  address: string | null;
  hasWarehouse: boolean;
  warehouseSize: string | null;
  tinNumber: string | null;
  tradeLicense: string | null;
  status: string;
  reviewNotes: string | null;
  createdAt: string;
  userId?: string | null;
  user?: { id: string; isActive: boolean } | null;
}

export default function AgentsPage() {
  const { data: session } = useSession();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  useEffect(() => {
    fetchAgents();
  }, [statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      const response = await fetch(`/api/agents?${params}`);
      if (response.ok) {
        const data = await response.json();
        setAgents(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Failed to fetch agents:', error);
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
          description: 'The agent status has been updated.',
        });
        fetchAgents();
        setShowDialog(false);
        setSelectedAgent(null);
        setReviewNotes('');
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to update.', variant: 'destructive' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteAgent = async (agentId: string) => {
    if (!confirm('Delete this agent? This cannot be undone.')) return;
    setActionLoading(true);
    try {
      const response = await fetch(`/api/agents/${agentId}`, { method: 'DELETE' });
      if (response.ok) {
        toast({ title: 'Agent deleted', description: 'Record removed permanently.' });
        fetchAgents();
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to delete.', variant: 'destructive' });
    } finally {
      setActionLoading(false);
    }
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
  const paginatedAgents = filteredAgents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const statusCounts = {
    all: agents.length,
    PENDING: agents.filter(a => a.status === 'PENDING').length,
    APPROVED: agents.filter(a => a.status === 'APPROVED').length,
    REJECTED: agents.filter(a => a.status === 'REJECTED').length,
  };

  return (
    <div className="space-y-6">
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
          <Button className="h-10 bg-gray-900 hover:bg-gray-800">
            <Plus className="w-4 h-4 mr-2" /> Add Agent
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search agents..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="h-10 pl-10 bg-white"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40 h-10 bg-white">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All ({statusCounts.all})</SelectItem>
            <SelectItem value="PENDING">Pending ({statusCounts.PENDING})</SelectItem>
            <SelectItem value="APPROVED">Approved ({statusCounts.APPROVED})</SelectItem>
            <SelectItem value="REJECTED">Rejected ({statusCounts.REJECTED})</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Pending', count: statusCounts.PENDING, color: 'amber', icon: Clock },
          { label: 'Approved', count: statusCounts.APPROVED, color: 'emerald', icon: CheckCircle },
          { label: 'Rejected', count: statusCounts.REJECTED, color: 'red', icon: XCircle },
        ].map(stat => (
          <Card key={stat.label} className="border-gray-200/60">
            <CardContent className="p-4 flex items-center gap-4">
              <div className={`p-2.5 rounded-xl bg-${stat.color}-50`}>
                <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.count}</p>
                <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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
            <div className="divide-y divide-gray-100">
              {paginatedAgents.map(agent => (
                <div
                  key={agent.id}
                  className="flex items-center justify-between p-4 hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-gray-600">
                        {agent.firstName[0]}{agent.lastName[0]}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900 truncate">
                          {agent.firstName} {agent.lastName}
                        </span>
                        <Badge variant="outline" className={getStatusBadge(agent.status)}>
                          {agent.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {agent.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {agent.city}, {agent.region}
                        </span>
                        {agent.businessName && (
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3 h-3" /> {agent.businessName}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-gray-400 mr-4">{formatDate(agent.createdAt)}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-500 hover:text-gray-900"
                      onClick={() => {
                        setSelectedAgent(agent);
                        setReviewNotes(agent.reviewNotes || '');
                        setShowDialog(true);
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    {session?.user?.role === 'ADMIN' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => handleDeleteAgent(agent.id)}
                        disabled={actionLoading}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredAgents.length)} of {filteredAgents.length}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).slice(
                  Math.max(0, currentPage - 3),
                  Math.min(totalPages, currentPage + 2)
                ).map(page => (
                  <Button
                    key={page}
                    variant={currentPage === page ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className={currentPage === page ? 'bg-gray-900 hover:bg-gray-800' : ''}
                  >
                    {page}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedAgent && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <span className="text-lg font-bold text-gray-600">
                      {selectedAgent.firstName[0]}{selectedAgent.lastName[0]}
                    </span>
                  </div>
                  <div>
                    <DialogTitle className="text-xl">
                      {selectedAgent.firstName} {selectedAgent.lastName}
                    </DialogTitle>
                    <p className="text-sm text-gray-500">
                      Applied {formatDate(selectedAgent.createdAt)}
                    </p>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-gray-400 uppercase">Email</p>
                    <p className="text-sm font-medium text-gray-900">{selectedAgent.email}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-gray-400 uppercase">Phone</p>
                    <p className="text-sm font-medium text-gray-900">{selectedAgent.phone}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-gray-400 uppercase">Location</p>
                    <p className="text-sm font-medium text-gray-900">{selectedAgent.city}, {selectedAgent.region}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-gray-400 uppercase">Business</p>
                    <p className="text-sm font-medium text-gray-900">{selectedAgent.businessName || 'Individual'}</p>
                  </div>
                  {selectedAgent.tinNumber && (
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-gray-400 uppercase">TIN Number</p>
                      <p className="text-sm font-medium text-gray-900">{selectedAgent.tinNumber}</p>
                    </div>
                  )}
                  {selectedAgent.businessType && (
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-gray-400 uppercase">Type</p>
                      <p className="text-sm font-medium text-gray-900">{selectedAgent.businessType}</p>
                    </div>
                  )}
                </div>

                {selectedAgent.tradeLicense && (
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium">Trade License</p>
                          <p className="text-xs text-gray-500">Verification document</p>
                        </div>
                      </div>
                      <a
                        href={getFileUrl(selectedAgent.tradeLicense)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                      >
                        View <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                )}

                {selectedAgent.message && (
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-xs font-bold text-gray-400 uppercase mb-2">Message</p>
                    <p className="text-sm text-gray-700 italic">"{selectedAgent.message}"</p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-xs font-bold text-gray-400 uppercase">Review Notes</Label>
                  <Textarea
                    value={reviewNotes}
                    onChange={e => setReviewNotes(e.target.value)}
                    placeholder="Add notes about this application..."
                    rows={3}
                    className="bg-gray-50 border-gray-200"
                  />
                </div>
              </div>

              {selectedAgent.status === 'PENDING' && (
                <DialogFooter className="gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => handleStatusUpdate(selectedAgent.id, 'REJECTED')}
                    disabled={actionLoading}
                  >
                    <XCircle className="w-4 h-4 mr-2" /> Reject
                  </Button>
                  <Button
                    className="flex-1 bg-gray-900 hover:bg-gray-800"
                    onClick={() => handleStatusUpdate(selectedAgent.id, 'APPROVED')}
                    disabled={actionLoading}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" /> Approve
                  </Button>
                </DialogFooter>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}