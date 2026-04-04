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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
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
  Plus,
  Download,
  FileSpreadsheet,
  Trash2,
  Upload,
  User as UserIcon,
  Warehouse,
  CreditCard,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Boxes,
  ArrowRightLeft,
  History,
  TrendingDown,
  TrendingUp,
  Edit,
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
  message: string | null;
  howDidYouHear: string | null;
  status: string;
  reviewNotes: string | null;
  createdAt: string;
  reviewedAt: string | null;
  reviewer?: { name: string } | null;
}

interface Region {
  id: string;
  name: string;
  cities: City[];
}

interface City {
  id: string;
  name: string;
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
  const [previewOpen, setPreviewOpen] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editAgent, setEditAgent] = useState<any>(null);
  
  // Inventory State
  const [showInventoryDialog, setShowInventoryDialog] = useState(false);
  const [agentInventory, setAgentInventory] = useState<any[]>([]);
  const [inventoryHistory, setInventoryHistory] = useState<any[]>([]);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [transferAmount, setTransferAmount] = useState<number>(0);
  const [transferProductId, setTransferProductId] = useState<string>('');
  const [transferLoading, setTransferLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [warehouseInventory, setWarehouseInventory] = useState<any[]>([]);

  useEffect(() => {
    if (showInventoryDialog && selectedAgent) {
      fetchAgentInventory(selectedAgent.id);
      fetchGlobalInventory();
    }
  }, [showInventoryDialog, selectedAgent]);

  const fetchAgentInventory = async (id: string) => {
    setInventoryLoading(true);
    try {
      const res = await fetch(`/api/agents/${id}/inventory`);
      if (res.ok) {
        const data = await res.json();
        setAgentInventory(data.inventory);
        setInventoryHistory(data.transactions);
      }
    } catch (error) {
      console.error('Failed to fetch agent inventory:', error);
    } finally {
      setInventoryLoading(false);
    }
  };

  const fetchGlobalInventory = async () => {
    try {
      const [prodRes, invRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/inventory')
      ]);
      if (prodRes.ok) setProducts(await prodRes.json());
      if (invRes.ok) setWarehouseInventory(await invRes.json());
    } catch (error) {
      console.error('Failed to fetch global inventory:', error);
    }
  };

  const handleTransfer = async () => {
    if (!selectedAgent || !transferProductId || transferAmount <= 0) return;
    
    setTransferLoading(true);
    try {
      const res = await fetch('/api/inventory/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: transferProductId,
          toAgentId: selectedAgent.id,
          quantity: transferAmount,
          type: 'TRANSFER',
          notes: `Assigned units to agent ${selectedAgent.firstName}`
        })
      });

      if (res.ok) {
        toast({
          title: 'Units Assigned',
          description: `Successfully assigned ${transferAmount} units.`,
        });
        fetchAgentInventory(selectedAgent.id);
        setTransferAmount(0);
        setTransferProductId('');
      } else {
        const error = await res.json();
        toast({
          title: 'Transfer Failed',
          description: error.details || error.error || 'Failed to assign units.',
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'An unexpected error occurred.',
        variant: 'destructive'
      });
    } finally {
      setTransferLoading(false);
    }
  };

  const handleDeleteAgent = async (agentId: string) => {
    if (!window.confirm('Are you sure you want to delete this agent? This action cannot be undone.')) {
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch(`/api/agents/${agentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: 'Agent deleted',
          description: 'The agent record has been permanently removed.',
        });
        fetchAgents();
      } else {
        throw new Error('Failed to delete agent');
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to delete agent. Ensure you have administrative privileges.',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };
  const [currentTab, setCurrentTab] = useState('personal');
  const [newAgent, setNewAgent] = useState({
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
    howDidYouHear: 'ADMIN_ENTRY',
    status: 'APPROVED',
    tradeLicense: null as File | null,
  });
  const [regions, setRegions] = useState<Region[]>([]);
  const [loadingRegions, setLoadingRegions] = useState(false);

  useEffect(() => {
    fetchAgents();
    fetchRegions();
  }, [statusFilter]);

  const fetchRegions = async () => {
    setLoadingRegions(true);
    try {
      const response = await fetch('/api/regions');
      if (response.ok) {
        const data = await response.json();
        setRegions(data);
      }
    } catch (error) {
      console.error('Failed to fetch regions:', error);
    } finally {
      setLoadingRegions(false);
    }
  };

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

  const handleAddAgent = async () => {
    setActionLoading(true);
    try {
      const form = new FormData();
      Object.entries(newAgent).forEach(([key, value]) => {
        if (value !== null) {
          if (key === 'tradeLicense') {
            form.append(key, value as File);
          } else {
            form.append(key, value.toString());
          }
        }
      });

      const response = await fetch('/api/agents', {
        method: 'POST',
        body: form,
      });

      if (response.ok) {
        toast({
          title: 'Agent added',
          description: 'The agent has been manually added to the database.',
        });
        fetchAgents();
        setShowAddDialog(false);
        setNewAgent({
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
          howDidYouHear: 'ADMIN_ENTRY',
          status: 'APPROVED',
          tradeLicense: null,
        });
        setCurrentTab('personal');
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to add agent.',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateAgent = async () => {
    if (!editAgent) return;
    setActionLoading(true);
    try {
      const response = await fetch(`/api/agents/${editAgent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editAgent),
      });

      if (response.ok) {
        toast({
          title: 'Agent updated',
          description: 'The agent information has been successfully updated.',
        });
        fetchAgents();
        setShowEditDialog(false);
        setEditAgent(null);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update agent');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update agent details.',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const exportToExcel = () => {
    const dataToExport = filteredAgents.map(a => ({
      Name: `${a.firstName} ${a.lastName}`,
      Email: a.email,
      Phone: a.phone,
      Region: a.region,
      City: a.city,
      Business: a.businessName || 'N/A',
      Status: a.status,
      AppliedAt: formatDate(a.createdAt)
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Agents");
    XLSX.writeFile(workbook, `ETUK_Agents_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("ETUK Agent List", 14, 15);
    
    const tableData = filteredAgents.map(a => [
      `${a.firstName} ${a.lastName}`,
      a.email,
      a.phone,
      `${a.city}, ${a.region}`,
      a.status,
      formatDate(a.createdAt)
    ]);

    autoTable(doc, {
      head: [['Name', 'Email', 'Phone', 'Location', 'Status', 'Date']],
      body: tableData,
      startY: 20,
    });

    doc.save(`ETUK_Agents_${new Date().toISOString().split('T')[0]}.pdf`);
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
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Agent Network</h1>
          <p className="text-sm text-gray-500 mt-1.5">Oversee and expand the ETUK distribution ecosystem.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 mr-4 px-4 py-2 bg-gray-50 rounded-lg border border-gray-100">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider leading-none">Registered Pool</span>
              <span className="text-lg font-black text-gray-900 mt-0.5">{filteredAgents.length}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={exportToExcel}
              className="h-11 px-4 border-gray-200 text-gray-600 hover:text-green-600 hover:bg-green-50 hover:border-green-100 font-bold"
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Excel
            </Button>
            <Button 
              variant="outline" 
              onClick={exportToPDF}
              className="h-11 px-4 border-gray-200 text-gray-600 hover:text-red-600 hover:bg-red-50 hover:border-red-100 font-bold"
            >
              <Download className="w-4 h-4 mr-2" />
              PDF
            </Button>
            <Button 
              onClick={() => setShowAddDialog(true)}
              className="h-11 px-6 bg-deep-sky-blue text-white hover:bg-blue-600 font-bold shadow-lg shadow-blue-100"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Agent
            </Button>
          </div>
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
                className="w-full pl-10 pr-4 h-11 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:bg-white focus:border-deep-sky-blue focus:ring-4 focus:ring-deep-sky-blue/5 outline-none transition-all"
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
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-deep-sky-blue" />
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
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-amber-600 hover:bg-amber-50 font-bold gap-2"
                            onClick={() => {
                              setSelectedAgent(agent);
                              setShowInventoryDialog(true);
                            }}
                          >
                            <Boxes className="w-4 h-4" />
                            Units
                          </Button>
                          {session?.user?.role === 'ADMIN' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-gray-600 hover:bg-gray-100 font-bold gap-2"
                              onClick={() => {
                                setEditAgent({ ...agent });
                                setShowEditDialog(true);
                                setCurrentTab('personal');
                              }}
                            >
                              <Edit className="w-4 h-4" />
                              Edit
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-deep-sky-blue hover:bg-gray-100 font-bold gap-2"
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
                          {session?.user?.role === 'ADMIN' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:bg-red-50 hover:text-red-600 font-bold"
                              onClick={() => handleDeleteAgent(agent.id)}
                              disabled={actionLoading}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
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
        <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-2xl shadow-2xl max-h-[95vh] flex flex-col">
          {selectedAgent && (
            <div className="flex flex-col flex-1 min-h-0">
              <div className="bg-gray-900 p-8 text-white">
                <DialogHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-deep-sky-blue uppercase tracking-[0.2em]">Application Details</span>
                  </div>
                  <DialogTitle className="text-3xl font-bold leading-none mb-1">
                    {selectedAgent.firstName} {selectedAgent.lastName}
                  </DialogTitle>
                  <DialogDescription className="text-gray-300 text-sm font-medium">
                    Review candidate information for Soreti agent status.
                  </DialogDescription>
                </DialogHeader>
              </div>

              <div className="p-8 space-y-8 overflow-y-auto bg-white custom-scrollbar flex-1">
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
                          <FileText className="w-5 h-5 text-deep-sky-blue" />
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
                          className="bg-white border-blue-200 text-deep-sky-blue hover:bg-blue-50 font-bold h-9"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          {previewOpen ? 'Hide Preview' : 'Preview'}
                        </Button>
                        <a 
                          href={selectedAgent.tradeLicense} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          <Button variant="ghost" size="sm" className="h-9 w-9 p-0 text-gray-400 hover:text-deep-sky-blue hover:bg-blue-50">
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
                          {selectedAgent.tradeLicense?.toLowerCase().endsWith('.pdf') ? (
                            <iframe 
                              src={selectedAgent.tradeLicense.startsWith('/api') ? selectedAgent.tradeLicense : selectedAgent.tradeLicense} 
                              className="w-full h-[500px] rounded-lg border-none shadow-sm"
                              title="License PDF"
                            />
                          ) : selectedAgent.tradeLicense ? (
                            <img 
                              src={selectedAgent.tradeLicense.startsWith('/api') ? selectedAgent.tradeLicense : selectedAgent.tradeLicense} 
                              alt="Business License" 
                              className="max-w-full h-auto rounded-lg shadow-sm cursor-zoom-in"
                              onClick={() => window.open(selectedAgent.tradeLicense!, '_blank')}
                            />
                          ) : (
                            <p className="text-sm text-gray-400 font-bold">No document available</p>
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
                    className="bg-gray-50 border-gray-200 rounded-xl p-4 text-sm focus:bg-white focus:border-deep-sky-blue focus:ring-0 transition-all resize-none shadow-none"
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

      {/* Add Agent Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden rounded-2xl shadow-2xl bg-white border-none max-h-[95vh] flex flex-col">
          <div className="bg-gray-900 p-8 text-white relative z-10 flex justify-between items-end">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Plus className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">Full Registration</span>
              </div>
              <DialogTitle className="text-3xl font-black leading-none mb-1 text-white">
                Register New Agent
              </DialogTitle>
              <DialogDescription className="text-gray-400 text-sm font-medium">
                Enter comprehensive details to onboard a new partner to the network.
              </DialogDescription>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Initial Status</Label>
              <Select 
                value={newAgent.status} 
                onValueChange={(v) => setNewAgent({ ...newAgent, status: v })}
              >
                <SelectTrigger className="h-9 w-32 bg-gray-800 border-gray-700 text-xs font-bold text-white rounded-lg">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-100">
                  <SelectItem value="PENDING">Pending Review</SelectItem>
                  <SelectItem value="APPROVED">Approved (Active)</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full flex-1 flex flex-col min-h-0">
            <div className="px-8 bg-gray-50 border-b border-gray-100">
              <TabsList className="bg-transparent gap-8 h-14 p-0">
                <TabsTrigger value="personal" className="data-[state=active]:bg-transparent data-[state=active]:text-deep-sky-blue data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-deep-sky-blue rounded-none h-full px-0 text-xs font-bold uppercase tracking-widest text-gray-400">
                  <UserIcon className="w-3.5 h-3.5 mr-2" />
                  Personal & Contact
                </TabsTrigger>
                <TabsTrigger value="business" className="data-[state=active]:bg-transparent data-[state=active]:text-deep-sky-blue data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-deep-sky-blue rounded-none h-full px-0 text-xs font-bold uppercase tracking-widest text-gray-400">
                  <Building2 className="w-3.5 h-3.5 mr-2" />
                  Business & Finance
                </TabsTrigger>
                <TabsTrigger value="logistics" className="data-[state=active]:bg-transparent data-[state=active]:text-deep-sky-blue data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-deep-sky-blue rounded-none h-full px-0 text-xs font-bold uppercase tracking-widest text-gray-400">
                  <Warehouse className="w-3.5 h-3.5 mr-2" />
                  Logistics & Location
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="overflow-y-auto custom-scrollbar flex-1">
              <TabsContent value="personal" className="p-8 m-0 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-gray-700 uppercase tracking-wider">First Name *</Label>
                    <Input
                      value={newAgent.firstName}
                      onChange={(e) => setNewAgent({ ...newAgent, firstName: e.target.value })}
                      placeholder="e.g. Abebe"
                      className="h-11 bg-white border-gray-200 rounded-lg focus:ring-0 focus:border-deep-sky-blue"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Last Name *</Label>
                    <Input
                      value={newAgent.lastName}
                      onChange={(e) => setNewAgent({ ...newAgent, lastName: e.target.value })}
                      placeholder="e.g. Bikila"
                      className="h-11 bg-white border-gray-200 rounded-lg focus:ring-0 focus:border-deep-sky-blue"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Email Address *</Label>
                  <Input
                    type="email"
                    value={newAgent.email}
                    onChange={(e) => setNewAgent({ ...newAgent, email: e.target.value })}
                    placeholder="abebe@example.com"
                    className="h-11 bg-white border-gray-200 rounded-lg focus:ring-0 focus:border-deep-sky-blue"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Primary Phone *</Label>
                    <Input
                      value={newAgent.phone}
                      onChange={(e) => setNewAgent({ ...newAgent, phone: e.target.value })}
                      placeholder="+251..."
                      className="h-11 bg-white border-gray-200 rounded-lg focus:ring-0 focus:border-deep-sky-blue"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Alt Phone</Label>
                    <Input
                      value={newAgent.alternativePhone}
                      onChange={(e) => setNewAgent({ ...newAgent, alternativePhone: e.target.value })}
                      placeholder="Optional"
                      className="h-11 bg-white border-gray-200 rounded-lg focus:ring-0 focus:border-deep-sky-blue"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Professional Experience</Label>
                  <Textarea
                    value={newAgent.experience}
                    onChange={(e) => setNewAgent({ ...newAgent, experience: e.target.value })}
                    placeholder="Briefly describe background..."
                    className="bg-white border-gray-200 rounded-lg focus:ring-0 focus:border-deep-sky-blue resize-none h-24"
                  />
                </div>
              </TabsContent>

              <TabsContent value="business" className="p-8 m-0 space-y-6">
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Business Name</Label>
                      <Input
                        value={newAgent.businessName}
                        onChange={(e) => setNewAgent({ ...newAgent, businessName: e.target.value })}
                        placeholder="Organization Name"
                        className="h-11 bg-white border-gray-200 rounded-lg"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Business Type</Label>
                      <Input
                        value={newAgent.businessType}
                        onChange={(e) => setNewAgent({ ...newAgent, businessType: e.target.value })}
                        placeholder="e.g. Retailer"
                        className="h-11 bg-white border-gray-200 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-gray-700 uppercase tracking-wider">TIN Number</Label>
                      <Input
                        value={newAgent.tinNumber}
                        onChange={(e) => setNewAgent({ ...newAgent, tinNumber: e.target.value })}
                        placeholder="Tax ID"
                        className="h-11 bg-white border-gray-200 rounded-lg"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Estimated Capital</Label>
                      <Input
                        value={newAgent.estimatedCapital}
                        onChange={(e) => setNewAgent({ ...newAgent, estimatedCapital: e.target.value })}
                        placeholder="e.g. 500,000 ETB"
                        className="h-11 bg-white border-gray-200 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Bank Name</Label>
                      <Input
                        value={newAgent.bankName}
                        onChange={(e) => setNewAgent({ ...newAgent, bankName: e.target.value })}
                        className="h-11 bg-white border-gray-200 rounded-lg"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Account Number</Label>
                      <Input
                        value={newAgent.accountNumber}
                        onChange={(e) => setNewAgent({ ...newAgent, accountNumber: e.target.value })}
                        className="h-11 bg-white border-gray-200 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="space-y-3 p-5 bg-blue-50/50 rounded-xl border border-blue-100">
                    <Label className="text-xs font-bold text-blue-700 uppercase tracking-wider flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5" />
                      Trade License / Business ID
                    </Label>
                    <div className="flex items-center gap-4">
                      <Input
                        type="file"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          setNewAgent({ ...newAgent, tradeLicense: file });
                        }}
                        className="cursor-pointer bg-white h-11 border-blue-200"
                        accept=".pdf,.jpg,.jpeg,.png,.webp"
                      />
                      {newAgent.tradeLicense && (
                        <Badge variant="secondary" className="h-11 px-4 bg-blue-600 text-white hover:bg-blue-700 border-none">
                          <Upload className="w-4 h-4 mr-2" />
                          Selected
                        </Badge>
                      )}
                    </div>
                    <p className="text-[10px] text-blue-500 font-medium">Supporting PDF and Images (Max 5MB)</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="logistics" className="p-8 m-0 space-y-8">
                <div className="space-y-6">
                  <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-xs font-bold text-gray-900 uppercase">Warehouse Facility</Label>
                      <p className="text-[10px] text-gray-500 font-medium">Does the agent have a storage warehouse?</p>
                    </div>
                    <div 
                      onClick={() => setNewAgent({ ...newAgent, hasWarehouse: !newAgent.hasWarehouse })}
                      className={`w-14 h-7 rounded-full p-1 cursor-pointer transition-all duration-300 ${newAgent.hasWarehouse ? 'bg-deep-sky-blue' : 'bg-gray-300'}`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transition-all duration-300 transform ${newAgent.hasWarehouse ? 'translate-x-7' : 'translate-x-0'}`} />
                    </div>
                  </div>

                  {newAgent.hasWarehouse && (
                    <div className="grid grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Warehouse Size (m²)</Label>
                        <Input
                          value={newAgent.warehouseSize}
                          onChange={(e) => setNewAgent({ ...newAgent, warehouseSize: e.target.value })}
                          placeholder="e.g. 100"
                          className="h-11 bg-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Staff Count</Label>
                        <Input
                          type="number"
                          value={newAgent.staffCount}
                          onChange={(e) => setNewAgent({ ...newAgent, staffCount: e.target.value })}
                          placeholder="0"
                          className="h-11 bg-white"
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Region *</Label>
                      <Select 
                        value={newAgent.region} 
                        onValueChange={(v) => setNewAgent({ ...newAgent, region: v, city: '' })}
                      >
                        <SelectTrigger className="h-11 bg-white border-gray-200">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          {regions.map((reg) => (
                            <SelectItem key={reg.id} value={reg.name}>{reg.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-gray-700 uppercase tracking-wider">City *</Label>
                      <Select 
                        value={newAgent.city} 
                        onValueChange={(v) => setNewAgent({ ...newAgent, city: v })}
                        disabled={!newAgent.region}
                      >
                        <SelectTrigger className="h-11 bg-white border-gray-200">
                          <SelectValue placeholder={newAgent.region ? "Select City" : "Choose Region"} />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          {regions
                            .find((r) => r.name === newAgent.region)
                            ?.cities?.map((city) => (
                              <SelectItem key={city.id} value={city.name}>{city.name}</SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Woreda</Label>
                      <Input
                        value={newAgent.woreda}
                        onChange={(e) => setNewAgent({ ...newAgent, woreda: e.target.value })}
                        className="h-11 bg-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Kebele</Label>
                      <Input
                        value={newAgent.kebele}
                        onChange={(e) => setNewAgent({ ...newAgent, kebele: e.target.value })}
                        className="h-11 bg-white"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Exact Address / Office</Label>
                    <Input
                      value={newAgent.address}
                      onChange={(e) => setNewAgent({ ...newAgent, address: e.target.value })}
                      className="h-11 bg-white"
                    />
                  </div>
                </div>
              </TabsContent>
            </div>

            <DialogFooter className="p-8 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                {currentTab === 'personal' ? 'Step 1 of 3: Identity' : currentTab === 'business' ? 'Step 2 of 3: Profile' : 'Step 3 of 3: Fulfillment'}
              </div>
              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  onClick={() => {
                    if (currentTab === 'personal') setShowAddDialog(false);
                    else if (currentTab === 'business') setCurrentTab('personal');
                    else setCurrentTab('business');
                  }}
                  className="h-12 font-bold text-gray-500 hover:bg-white"
                >
                  {currentTab === 'personal' ? 'Cancel' : (
                    <>
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </>
                  )}
                </Button>
                
                {currentTab !== 'logistics' ? (
                  <Button
                    onClick={() => {
                      if (currentTab === 'personal') setCurrentTab('business');
                      else setCurrentTab('logistics');
                    }}
                    disabled={currentTab === 'personal' && (!newAgent.firstName || !newAgent.lastName || !newAgent.email || !newAgent.phone)}
                    className="h-12 px-10 bg-deep-sky-blue text-white hover:bg-deep-sky-blue/90 font-bold rounded-xl shadow-lg shadow-blue-100 transition-all flex items-center gap-2"
                  >
                    Next Step
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleAddAgent}
                    disabled={actionLoading || !newAgent.region || !newAgent.city}
                    className="h-12 px-10 bg-gray-900 text-white hover:bg-black font-bold rounded-xl shadow-lg shadow-gray-200 transition-all flex items-center gap-2"
                  >
                    {actionLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Registering...
                      </>
                    ) : (
                      'Complete Onboarding'
                    )}
                  </Button>
                )}
              </div>
            </DialogFooter>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Edit Agent Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden rounded-2xl shadow-2xl bg-white border-none max-h-[95vh] flex flex-col">
          {editAgent && (
            <>
              <div className="bg-gray-900 p-8 text-white relative z-10 flex justify-between items-end">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Edit className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">Update Agent</span>
                  </div>
                  <DialogTitle className="text-3xl font-black leading-none mb-1 text-white">
                    Edit {editAgent.firstName}'s Details
                  </DialogTitle>
                  <DialogDescription className="text-gray-400 text-sm font-medium">
                    Modify existing agent information.
                  </DialogDescription>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Application Status</Label>
                  <Select 
                    value={editAgent.status} 
                    onValueChange={(v) => setEditAgent({ ...editAgent, status: v })}
                  >
                    <SelectTrigger className="h-9 w-32 bg-gray-800 border-gray-700 text-xs font-bold text-white rounded-lg">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-100">
                      <SelectItem value="PENDING">Pending Review</SelectItem>
                      <SelectItem value="APPROVED">Approved (Active)</SelectItem>
                      <SelectItem value="REJECTED">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full flex-1 flex flex-col min-h-0">
                <div className="px-8 bg-gray-50 border-b border-gray-100">
                  <TabsList className="bg-transparent gap-8 h-14 p-0">
                    <TabsTrigger value="personal" className="data-[state=active]:bg-transparent data-[state=active]:text-deep-sky-blue data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-deep-sky-blue rounded-none h-full px-0 text-xs font-bold uppercase tracking-widest text-gray-400">
                      <UserIcon className="w-3.5 h-3.5 mr-2" />
                      Personal & Contact
                    </TabsTrigger>
                    <TabsTrigger value="business" className="data-[state=active]:bg-transparent data-[state=active]:text-deep-sky-blue data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-deep-sky-blue rounded-none h-full px-0 text-xs font-bold uppercase tracking-widest text-gray-400">
                      <Building2 className="w-3.5 h-3.5 mr-2" />
                      Business & Finance
                    </TabsTrigger>
                    <TabsTrigger value="logistics" className="data-[state=active]:bg-transparent data-[state=active]:text-deep-sky-blue data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-deep-sky-blue rounded-none h-full px-0 text-xs font-bold uppercase tracking-widest text-gray-400">
                      <Warehouse className="w-3.5 h-3.5 mr-2" />
                      Logistics & Location
                    </TabsTrigger>
                  </TabsList>
                </div>

                <div className="overflow-y-auto custom-scrollbar flex-1">
                  <TabsContent value="personal" className="p-8 m-0 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-gray-700 uppercase tracking-wider">First Name *</Label>
                        <Input
                          value={editAgent.firstName}
                          onChange={(e) => setEditAgent({ ...editAgent, firstName: e.target.value })}
                          className="h-11 bg-white border-gray-200 rounded-lg"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Last Name *</Label>
                        <Input
                          value={editAgent.lastName}
                          onChange={(e) => setEditAgent({ ...editAgent, lastName: e.target.value })}
                          className="h-11 bg-white border-gray-200 rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Email Address *</Label>
                      <Input
                        type="email"
                        value={editAgent.email}
                        onChange={(e) => setEditAgent({ ...editAgent, email: e.target.value })}
                        className="h-11 bg-white border-gray-200 rounded-lg"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Primary Phone *</Label>
                        <Input
                          value={editAgent.phone}
                          onChange={(e) => setEditAgent({ ...editAgent, phone: e.target.value })}
                          className="h-11 bg-white border-gray-200 rounded-lg"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Alt Phone</Label>
                        <Input
                          value={editAgent.alternativePhone || ''}
                          onChange={(e) => setEditAgent({ ...editAgent, alternativePhone: e.target.value })}
                          className="h-11 bg-white border-gray-200 rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Professional Experience</Label>
                      <Textarea
                        value={editAgent.experience || ''}
                        onChange={(e) => setEditAgent({ ...editAgent, experience: e.target.value })}
                        className="bg-white border-gray-200 rounded-lg focus:ring-0 focus:border-deep-sky-blue resize-none h-24"
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="business" className="p-8 m-0 space-y-6">
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Business Name</Label>
                          <Input
                            value={editAgent.businessName || ''}
                            onChange={(e) => setEditAgent({ ...editAgent, businessName: e.target.value })}
                            className="h-11 bg-white border-gray-200 rounded-lg"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Business Type</Label>
                          <Input
                            value={editAgent.businessType || ''}
                            onChange={(e) => setEditAgent({ ...editAgent, businessType: e.target.value })}
                            className="h-11 bg-white border-gray-200 rounded-lg"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-xs font-bold text-gray-700 uppercase tracking-wider">TIN Number</Label>
                          <Input
                            value={editAgent.tinNumber || ''}
                            onChange={(e) => setEditAgent({ ...editAgent, tinNumber: e.target.value })}
                            className="h-11 bg-white border-gray-200 rounded-lg"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Estimated Capital</Label>
                          <Input
                            value={editAgent.estimatedCapital || ''}
                            onChange={(e) => setEditAgent({ ...editAgent, estimatedCapital: e.target.value })}
                            className="h-11 bg-white border-gray-200 rounded-lg"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Bank Name</Label>
                          <Input
                            value={editAgent.bankName || ''}
                            onChange={(e) => setEditAgent({ ...editAgent, bankName: e.target.value })}
                            className="h-11 bg-white border-gray-200 rounded-lg"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Account Number</Label>
                          <Input
                            value={editAgent.accountNumber || ''}
                            onChange={(e) => setEditAgent({ ...editAgent, accountNumber: e.target.value })}
                            className="h-11 bg-white border-gray-200 rounded-lg"
                          />
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="logistics" className="p-8 m-0 space-y-8">
                    <div className="space-y-6">
                      <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-xs font-bold text-gray-900 uppercase">Warehouse Facility</Label>
                        </div>
                        <div 
                          onClick={() => setEditAgent({ ...editAgent, hasWarehouse: !editAgent.hasWarehouse })}
                          className={`w-14 h-7 rounded-full p-1 cursor-pointer transition-all duration-300 ${editAgent.hasWarehouse ? 'bg-deep-sky-blue' : 'bg-gray-300'}`}
                        >
                          <div className={`w-5 h-5 bg-white rounded-full transition-all duration-300 transform ${editAgent.hasWarehouse ? 'translate-x-7' : 'translate-x-0'}`} />
                        </div>
                      </div>

                      {editAgent.hasWarehouse && (
                        <div className="grid grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2 duration-300">
                          <div className="space-y-2">
                            <Label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Warehouse Size (m²)</Label>
                            <Input
                              value={editAgent.warehouseSize || ''}
                              onChange={(e) => setEditAgent({ ...editAgent, warehouseSize: e.target.value })}
                              className="h-11 bg-white"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Staff Count</Label>
                            <Input
                              type="number"
                              value={editAgent.staffCount || 0}
                              onChange={(e) => setEditAgent({ ...editAgent, staffCount: parseInt(e.target.value) || 0 })}
                              className="h-11 bg-white"
                            />
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Region *</Label>
                          <Select 
                            value={editAgent.region} 
                            onValueChange={(v) => setEditAgent({ ...editAgent, region: v, city: '' })}
                          >
                            <SelectTrigger className="h-11 bg-white border-gray-200">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                              {regions.map((reg) => (
                                <SelectItem key={reg.id} value={reg.name}>{reg.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-bold text-gray-700 uppercase tracking-wider">City *</Label>
                          <Select 
                            value={editAgent.city} 
                            onValueChange={(v) => setEditAgent({ ...editAgent, city: v })}
                            disabled={!editAgent.region}
                          >
                            <SelectTrigger className="h-11 bg-white border-gray-200">
                              <SelectValue placeholder={editAgent.region ? "Select City" : "Choose Region"} />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                              {regions
                                .find((r) => r.name === editAgent.region)
                                ?.cities?.map((city) => (
                                  <SelectItem key={city.id} value={city.name}>{city.name}</SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Woreda</Label>
                          <Input
                            value={editAgent.woreda || ''}
                            onChange={(e) => setEditAgent({ ...editAgent, woreda: e.target.value })}
                            className="h-11 bg-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Kebele</Label>
                          <Input
                            value={editAgent.kebele || ''}
                            onChange={(e) => setEditAgent({ ...editAgent, kebele: e.target.value })}
                            className="h-11 bg-white"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Exact Address / Office</Label>
                        <Input
                          value={editAgent.address || ''}
                          onChange={(e) => setEditAgent({ ...editAgent, address: e.target.value })}
                          className="h-11 bg-white"
                        />
                      </div>
                    </div>
                  </TabsContent>
                </div>

                <DialogFooter className="p-8 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                    {currentTab === 'personal' ? 'Step 1 of 3: Identity' : currentTab === 'business' ? 'Step 2 of 3: Profile' : 'Step 3 of 3: Fulfillment'}
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        if (currentTab === 'personal') setShowEditDialog(false);
                        else if (currentTab === 'business') setCurrentTab('personal');
                        else setCurrentTab('business');
                      }}
                      className="h-12 font-bold text-gray-500 hover:bg-white"
                    >
                      {currentTab === 'personal' ? 'Cancel' : (
                        <>
                          <ArrowLeft className="w-4 h-4 mr-2" />
                          Back
                        </>
                      )}
                    </Button>
                    
                    {currentTab !== 'logistics' ? (
                      <Button
                        onClick={() => {
                          if (currentTab === 'personal') setCurrentTab('business');
                          else setCurrentTab('logistics');
                        }}
                        disabled={currentTab === 'personal' && (!editAgent.firstName || !editAgent.lastName || !editAgent.email || !editAgent.phone)}
                        className="h-12 px-10 bg-deep-sky-blue text-white hover:bg-deep-sky-blue/90 font-bold rounded-xl shadow-lg shadow-blue-100 transition-all flex items-center gap-2"
                      >
                        Next Step
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    ) : (
                      <Button
                        onClick={handleUpdateAgent}
                        disabled={actionLoading || !editAgent.region || !editAgent.city}
                        className="h-12 px-10 bg-gray-900 text-white hover:bg-black font-bold rounded-xl shadow-lg shadow-gray-200 transition-all flex items-center gap-2"
                      >
                        {actionLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          'Save Changes'
                        )}
                      </Button>
                    )}
                  </div>
                </DialogFooter>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Agent Inventory Dialog */}
      <Dialog open={showInventoryDialog} onOpenChange={setShowInventoryDialog}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden rounded-2xl shadow-2xl bg-white border-none max-h-[90vh] flex flex-col">
          {selectedAgent && (
            <div className="flex flex-col h-full overflow-hidden">
              <div className="bg-gray-900 p-8 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Boxes className="w-4 h-4 text-blue-400" />
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">Unit Management</span>
                    </div>
                    <DialogTitle className="text-3xl font-black leading-none mb-1 text-white">
                      {selectedAgent.firstName}'s Inventory
                    </DialogTitle>
                    <DialogDescription className="text-gray-400 text-sm font-medium">
                      Track and assign units for this agent.
                    </DialogDescription>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Total Held</p>
                    <p className="text-3xl font-black text-white">
                      {agentInventory.reduce((acc, item) => acc + item.quantity, 0)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                {/* Current Holding Table */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <Boxes className="w-4 h-4 text-gray-400" />
                    Current Units
                  </h4>
                  {agentInventory.length === 0 ? (
                    <div className="p-8 border-2 border-dashed border-gray-100 rounded-xl text-center">
                      <p className="text-sm text-gray-400">No units currently assigned.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {agentInventory.map((item) => (
                        <div key={item.id} className="p-4 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-between">
                          <div>
                            <p className="text-sm font-bold text-gray-900">{item.product.name}</p>
                            <p className="text-[10px] text-gray-500 font-bold uppercase">{item.product.category}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-black text-deep-sky-blue">{item.quantity}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <hr className="border-gray-100" />

                {/* Transfer Section */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <ArrowRightLeft className="w-4 h-4 text-gray-400" />
                    Assign New Units
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold text-gray-500 uppercase">Product</Label>
                      <Select value={transferProductId} onValueChange={setTransferProductId}>
                        <SelectTrigger className="bg-white border-blue-200">
                          <SelectValue placeholder="Select Product" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((p) => {
                            const whItem = warehouseInventory.find(i => i.productId === p.id && i.agentId === null);
                            const whStock = whItem ? whItem.quantity : 0;
                            return (
                              <SelectItem key={p.id} value={p.id} disabled={whStock <= 0}>
                                {p.name} ({whStock} in WH)
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold text-gray-500 uppercase">Quantity</Label>
                      <Input 
                        type="number" 
                        value={transferAmount || ''} 
                        onChange={(e) => setTransferAmount(parseInt(e.target.value) || 0)}
                        className="bg-white border-blue-200"
                        placeholder="0"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button 
                        onClick={handleTransfer} 
                        disabled={transferLoading || !transferProductId || transferAmount <= 0}
                        className="w-full bg-gray-900 text-white font-bold h-10 hover:bg-black"
                      >
                        {transferLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Assign Units'}
                      </Button>
                    </div>
                  </div>
                </div>

                <hr className="border-gray-100" />

                {/* Transaction History */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <History className="w-4 h-4 text-gray-400" />
                    Recent Activity
                  </h4>
                  <div className="space-y-3">
                    {inventoryHistory.length === 0 ? (
                      <p className="text-xs text-center py-8 text-gray-400">No recent transactions.</p>
                    ) : (
                      inventoryHistory.map((tx) => (
                        <div key={tx.id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:shadow-sm transition-shadow">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${tx.toAgentId === selectedAgent.id ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                              {tx.toAgentId === selectedAgent.id ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-900">{tx.product.name}</p>
                              <p className="text-[10px] text-gray-400 font-medium uppercase">{tx.type} • {new Date(tx.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <p className={`font-black ${tx.toAgentId === selectedAgent.id ? 'text-green-600' : 'text-red-600'}`}>
                            {tx.toAgentId === selectedAgent.id ? '+' : '-'}{tx.quantity}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
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
        {icon && <div className="text-deep-sky-blue">{icon}</div>}
        <p className="text-sm font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}
