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
  MessageSquare,
  Send,
  ShieldCheck,
  ShieldOff,
  Lock,
  Inbox,
  CheckSquare,
  AlertCircle,
  X,
  User,
  Shield,
  Briefcase,
  Truck,
  Key,
  Package,
  UserCog
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
  userId?: string | null;
  user?: { id: string; isActive: boolean } | null;
  reviewer?: { name: string } | null;
}

interface ProductUnit {
  id: string;
  chassisNumber: string;
  status: string;
  product: {
    id: string;
    name: string;
  };
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
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Inventory State
  const [showInventoryDialog, setShowInventoryDialog] = useState(false);
  const [agentInventory, setAgentInventory] = useState<any[]>([]);
  const [inventoryHistory, setInventoryHistory] = useState<any[]>([]);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [transferAmount, setTransferAmount] = useState<number>(0);
  const [transferProductId, setTransferProductId] = useState<string>('');
  const [transferLoading, setTransferLoading] = useState(false);
  const [availableUnits, setAvailableUnits] = useState<ProductUnit[]>([]);
  const [currentAgentUnits, setCurrentAgentUnits] = useState<ProductUnit[]>([]);
  const [selectedUnitIds, setSelectedUnitIds] = useState<string[]>([]);
  const [unitsLoading, setUnitsLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [warehouseInventory, setWarehouseInventory] = useState<any[]>([]);

  // SMS Quick-send state
  const [showSmsDialog, setShowSmsDialog] = useState(false);
  const [smsAgent, setSmsAgent] = useState<Agent | null>(null);
  const [smsMessage, setSmsMessage] = useState('');
  const [smsSending, setSmsSending] = useState(false);
  
  // Portal Access state
  const [portalPassword, setPortalPassword] = useState('');
  const [portalLoading, setPortalLoading] = useState(false);
  
  // Bulk selection
  const [selectedAgentIds, setSelectedAgentIds] = useState<string[]>([]);

  useEffect(() => {
    if (transferProductId) {
      const product = products.find(p => p.id === transferProductId);
      if (product?.isSerialized) {
        fetchAvailableUnits();
      } else {
        setAvailableUnits([]);
        setSelectedUnitIds([]);
      }
    } else {
      setAvailableUnits([]);
      setSelectedUnitIds([]);
    }
  }, [transferProductId, products]);

  const fetchAvailableUnits = async () => {
    if (!transferProductId) return;
    setUnitsLoading(true);
    try {
      const res = await fetch(`/api/inventory/units?productId=${transferProductId}`);
      if (res.ok) {
        const data = await res.json();
        setAvailableUnits(data);
        setSelectedUnitIds([]);
      }
    } catch (error) {
      console.error('Failed to fetch units:', error);
    } finally {
      setUnitsLoading(false);
    }
  };

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
        setCurrentAgentUnits(data.units || []);
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
          unitIds: selectedUnitIds.length > 0 ? selectedUnitIds : undefined,
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
        setSelectedUnitIds([]);
        fetchGlobalInventory();
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

  // Reset pagination on search or status change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

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

  const toggleSelectAll = () => {
    if (selectedAgentIds.length === filteredAgents.length && filteredAgents.length > 0) {
      setSelectedAgentIds([]);
    } else {
      setSelectedAgentIds(filteredAgents.map(a => a.id));
    }
  };

  const toggleSelectAgent = (id: string) => {
    setSelectedAgentIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkPortalAction = async (isActive: boolean) => {
    if (selectedAgentIds.length === 0) return;
    
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/agents/bulk-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentIds: selectedAgentIds,
          isActive
        })
      });

      if (res.ok) {
        toast({
          title: `Portals ${isActive ? 'activated' : 'deactivated'}`,
          description: `Successfully updated ${selectedAgentIds.length} agents.`,
        });
        fetchAgents();
        setSelectedAgentIds([]);
      } else {
        throw new Error('Bulk update failed');
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to update portal access in bulk.',
        variant: 'destructive'
      });
    } finally {
      setActionLoading(false);
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
      case 'APPROVED': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'PENDING': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'REJECTED': return 'bg-rose-50 text-rose-700 border-rose-100';
      default: return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  const getFileUrl = (path: string | null) => {
    if (!path) return '';
    if (path.startsWith('http') || path.startsWith('/api')) return path;
    if (path.startsWith('/uploads')) return `/api${path}`;
    return `/api/uploads/agents/${path}`;
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

  const handleUpdatePortalAccess = async () => {
    if (!editAgent || !portalPassword) return;
    if (portalPassword.length < 6) {
      toast({
        title: 'Weak Password',
        description: 'Password must be at least 6 characters long.',
        variant: 'destructive',
      });
      return;
    }
    
    setPortalLoading(true);
    try {
      const res = await fetch(`/api/admin/agents/${editAgent.id}/portal-access`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          password: portalPassword,
          isActive: true // Always true when setting/updating password
        })
      });

      if (res.ok) {
        toast({
          title: 'Portal access updated',
          description: `Access for ${editAgent.firstName} has been updated successfully.`,
        });
        setPortalPassword('');
        fetchAgents();
      } else {
        throw new Error('Update failed');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update portal access.',
        variant: 'destructive',
      });
    } finally {
      setPortalLoading(false);
    }
  };

  const handleDeactivatePortal = async () => {
    if (!editAgent?.id || !editAgent?.userId) return;
    
    setPortalLoading(true);
    try {
      const res = await fetch(`/api/admin/agents/${editAgent.id}/portal-access`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          isActive: false 
        })
      });

      if (res.ok) {
        toast({
          title: 'Portal deactivated',
          description: `Access for ${editAgent.firstName} has been disabled.`,
        });
        fetchAgents();
      } else {
        throw new Error('Deactivation failed');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to deactivate portal.',
        variant: 'destructive',
      });
    } finally {
      setPortalLoading(false);
    }
  };

  const handleUpdateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      const formData = new FormData();
      Object.entries(editAgent).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === 'newTradeLicense') {
            formData.append('tradeLicense', value as File);
          } else if (key !== 'tradeLicense' && key !== 'reviewer') {
            formData.append(key, value.toString());
          }
        }
      });

      const response = await fetch(`/api/agents/${editAgent.id}`, {
        method: 'PUT',
        body: formData,
      });

      if (response.ok) {
        toast({
          title: 'Agent updated',
          description: 'The agent information has been successfully updated.',
        });
        fetchAgents();
        setShowEditDialog(false);
      } else {
        throw new Error('Failed to update agent');
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to update agent. Check your connection.',
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

  const totalPages = Math.ceil(filteredAgents.length / itemsPerPage);
  const paginatedAgents = filteredAgents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <>
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
            <div className="flex flex-col">
              {selectedAgentIds.length > 0 && (
                <div className="px-6 py-4 bg-blue-50/50 border-b border-blue-100 flex items-center justify-between animate-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center gap-3">
                    <div className="bg-deep-sky-blue text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                      {selectedAgentIds.length} SELECTED
                    </div>
                    <p className="text-xs font-bold text-gray-600">Apply portal actions to selected agents</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleBulkPortalAction(false)}
                      disabled={actionLoading}
                      className="h-8 bg-white text-red-600 hover:bg-red-50 border-red-100 font-bold text-[11px] gap-2 shadow-sm"
                    >
                      <ShieldOff className="w-3.5 h-3.5" />
                      Disable Portal
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleBulkPortalAction(true)}
                      disabled={actionLoading}
                      className="h-8 bg-gray-900 text-white hover:bg-black font-bold text-[11px] gap-2 shadow-sm"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Enable Portal
                    </Button>
                  </div>
                </div>
              )}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-gray-50/50">
                    <TableRow>
                      <TableHead className="w-10 px-6 py-3">
                        <Checkbox 
                          checked={selectedAgentIds.length === filteredAgents.length && filteredAgents.length > 0}
                          onCheckedChange={toggleSelectAll}
                        />
                      </TableHead>
                      <TableHead className="px-6 py-3 font-bold text-xs uppercase text-gray-600">Name</TableHead>
                      <TableHead className="px-6 py-3 font-bold text-xs uppercase text-gray-600">Location</TableHead>
                      <TableHead className="px-6 py-3 font-bold text-xs uppercase text-gray-600">Business</TableHead>
                      <TableHead className="px-6 py-3 font-bold text-xs uppercase text-gray-600">Status</TableHead>
                      <TableHead className="px-6 py-3 font-bold text-xs uppercase text-gray-600">Applied</TableHead>
                      <TableHead className="px-6 py-3 text-right"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedAgents.map((agent) => (
                      <TableRow key={agent.id} className="hover:bg-gray-50/50 transition-colors">
                        <TableCell className="px-6 py-3">
                          <Checkbox 
                            checked={selectedAgentIds.includes(agent.id)}
                            onCheckedChange={() => toggleSelectAgent(agent.id)}
                          />
                        </TableCell>
                        <TableCell className="px-6 py-3">
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-900">{agent.firstName} {agent.lastName}</span>
                            <span className="text-xs text-gray-500">{agent.email}</span>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-3">
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <MapPin className="w-3.5 h-3.5 text-gray-400" />
                            <span>{agent.city}, {agent.region}</span>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-3">
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Building2 className="w-3.5 h-3.5 text-gray-400" />
                            <span>{agent.businessName || 'Individual'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-3">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${getStatusStyle(agent.status)}`}>
                            {agent.status}
                          </span>
                        </TableCell>
                        <TableCell className="px-6 py-3 text-sm text-gray-500">
                          {formatDate(agent.createdAt)}
                        </TableCell>
                        <TableCell className="px-6 py-3 text-right">
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
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-purple-600 hover:bg-purple-50 font-bold gap-2"
                              onClick={() => {
                                setSmsAgent(agent);
                                setSmsMessage('');
                                setShowSmsDialog(true);
                              }}
                            >
                              <MessageSquare className="w-4 h-4" />
                              Notify
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
            </div>
          )}

          {/* Pagination Controls */}
          {filteredAgents.length > itemsPerPage && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              <div className="text-sm text-gray-500 font-medium">
                Showing <span className="font-bold text-gray-900">{((currentPage - 1) * itemsPerPage) + 1}</span> to <span className="font-bold text-gray-900">{Math.min(currentPage * itemsPerPage, filteredAgents.length)}</span> of <span className="font-bold text-gray-900">{filteredAgents.length}</span> agents
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="h-9 px-3 border-gray-200 text-gray-600 disabled:opacity-50 font-bold"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? 'secondary' : 'ghost'}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className={`h-9 w-9 p-0 font-bold ${currentPage === page ? 'bg-deep-sky-blue text-white hover:bg-deep-sky-blue/90' : 'text-gray-500'}`}
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="h-9 px-3 border-gray-200 text-gray-600 disabled:opacity-50 font-bold"
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      </div>

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
                          href={getFileUrl(selectedAgent.tradeLicense)} 
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
                          <span className="text-gray-400">{selectedAgent.tradeLicense?.split('/').pop() || 'document'}</span>
                        </div>
                        <div className="min-h-[300px] flex items-center justify-center p-2 bg-slate-50/50">
                          {selectedAgent.tradeLicense?.toLowerCase().endsWith('.pdf') ? (
                            <iframe 
                              src={getFileUrl(selectedAgent.tradeLicense)} 
                              className="w-full h-[500px] rounded-lg border-none shadow-sm"
                              title="License PDF"
                            />
                          ) : selectedAgent.tradeLicense ? (
                            <img 
                              src={getFileUrl(selectedAgent.tradeLicense)} 
                              alt="Business License" 
                              className="max-w-full h-auto rounded-lg shadow-sm cursor-zoom-in"
                              onClick={() => window.open(getFileUrl(selectedAgent.tradeLicense), '_blank')}
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
        <DialogContent className="max-w-4xl w-[95vw] p-0 overflow-hidden rounded-2xl shadow-2xl bg-white border-none max-h-[95vh] flex flex-col">
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
            <div className="px-8 bg-gray-50 border-b border-gray-100 overflow-x-auto custom-scrollbar-h">
              <TabsList className="bg-transparent gap-8 h-14 p-0 flex-nowrap w-max min-w-full">
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

            <DialogFooter className="p-10 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Registration Step</span>
                <p className="text-sm font-black text-slate-900 uppercase tracking-tight mt-1">
                  {currentTab === 'personal' ? '01 · Basic Profile' : 
                   currentTab === 'business' ? '02 · Commercial Info' : 
                   '03 · Geo-Logistics'}
                </p>
              </div>
              <div className="flex gap-4">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      if (currentTab === 'personal') setShowAddDialog(false);
                      else if (currentTab === 'business') setCurrentTab('personal');
                      else if (currentTab === 'logistics') setCurrentTab('business');
                      else setCurrentTab('logistics');
                    }}
                    className="h-14 px-8 border-slate-200 text-slate-600 font-black rounded-2xl hover:bg-white hover:text-slate-900 transition-all active:scale-95 uppercase text-xs tracking-widest"
                  >
                    {currentTab === 'personal' ? 'Cancel' : (
                      <>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Previous
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
                      className="h-14 px-10 bg-deep-sky-blue text-slate-950 hover:bg-deep-sky-blue/90 font-black rounded-2xl shadow-lg shadow-deep-sky-blue/20 transition-all active:scale-95 uppercase text-xs tracking-widest border-none"
                    >
                      Continue
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleAddAgent}
                      disabled={actionLoading || !newAgent.region || !newAgent.city}
                      className="h-14 px-12 bg-slate-900 text-white hover:bg-slate-800 font-black rounded-2xl shadow-xl shadow-slate-900/20 transition-all active:scale-95 uppercase text-xs tracking-widest border-none"
                    >
                      {actionLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
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

      {/* Agent Edit Dialog */}

      {showEditDialog && editAgent && (
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-5xl w-[95vw] p-0 overflow-hidden rounded-[3rem] shadow-2xl bg-white border-none max-h-[92vh] flex flex-col">
            <Tabs defaultValue="personal" onValueChange={(v) => setCurrentTab(v as any)} value={currentTab} className="w-full h-full flex flex-col">
              {/* Premium Header Section */}
              <div className="pt-10 px-10 bg-slate-950 shrink-0">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-6">
                    <div className="h-20 w-20 rounded-[2rem] bg-gradient-to-br from-deep-sky-blue to-blue-600 flex items-center justify-center shadow-2xl shadow-deep-sky-blue/20 group-hover:scale-105 transition-transform duration-500">
                      <UserCog className="w-10 h-10 text-slate-950" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h2 className="text-3xl font-black text-white tracking-tighter uppercase">Edit Master Agent</h2>
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          editAgent.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                          'bg-deep-sky-blue/10 text-deep-sky-blue border border-deep-sky-blue/20'
                        }`}>
                          {editAgent.status}
                        </span>
                      </div>
                      <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-xs mt-2 flex items-center gap-2">
                        <Shield className="w-3 h-3 text-deep-sky-blue" />
                        SECURE IDENTITY MANAGEMENT · SYSTEM ID: {editAgent.id.slice(0, 8)}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setShowEditDialog(false)}
                    className="h-14 w-14 rounded-2xl hover:bg-white/10 text-slate-400 transition-all"
                  >
                    <X className="w-8 h-8" />
                  </Button>
                </div>

                {/* Deluxe Tabs Navigation - Now Scrollable */}
                <div className="overflow-x-auto scrollbar-hide">
                  <TabsList className="bg-transparent h-auto p-0 flex gap-10 min-w-max pb-1">
                    {[
                      { id: 'personal', label: 'Personal', icon: User },
                      { id: 'business', label: 'Business', icon: Briefcase },
                      { id: 'logistics', label: 'Logistics', icon: Truck },
                      ...(editAgent.status === 'APPROVED' ? [{ id: 'portal', label: 'Security & Portal', icon: Lock }] : [])
                    ].map((tab) => (
                      <TabsTrigger
                        key={tab.id}
                        value={tab.id}
                        className="group relative pb-6 px-0 bg-transparent data-[state=active]:bg-transparent transition-all border-none"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center group-hover:bg-slate-800 group-data-[state=active]:bg-deep-sky-blue transition-all">
                            <tab.icon className="w-5 h-5 text-slate-400 group-data-[state=active]:text-slate-950" />
                          </div>
                          <span className="text-sm font-black uppercase tracking-widest text-slate-500 group-data-[state=active]:text-white transition-colors">
                            {tab.label}
                          </span>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 h-1 rounded-full bg-deep-sky-blue scale-x-0 group-data-[state=active]:scale-x-100 transition-transform duration-500 shadow-[0_0_15px_rgba(0,191,255,0.5)]" />
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                <TabsContent value="personal" className="p-10 m-0 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <div className="space-y-8">
                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <Label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Legal First Name</Label>
                        <Input
                          value={editAgent.firstName}
                          onChange={(e) => setEditAgent({ ...editAgent, firstName: e.target.value })}
                          className="h-14 bg-white border-slate-200 rounded-2xl shadow-sm focus:ring-deep-sky-blue/20 focus:border-deep-sky-blue transition-all text-slate-900 font-medium px-5"
                          placeholder="First Name"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Legal Last Name</Label>
                        <Input
                          value={editAgent.lastName}
                          onChange={(e) => setEditAgent({ ...editAgent, lastName: e.target.value })}
                          className="h-14 bg-white border-slate-200 rounded-2xl shadow-sm focus:ring-amber-500/20 focus:border-amber-500 transition-all text-slate-900 font-medium px-5"
                          placeholder="Last Name"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Primary Email Communication</Label>
                      <Input
                        type="email"
                        value={editAgent.email}
                        onChange={(e) => setEditAgent({ ...editAgent, email: e.target.value })}
                        className="h-14 bg-white border-slate-200 rounded-2xl shadow-sm focus:ring-deep-sky-blue/20 focus:border-deep-sky-blue transition-all text-slate-900 font-medium px-5"
                        placeholder="Email Address"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <Label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Verified Phone</Label>
                        <Input
                          value={editAgent.phone}
                          onChange={(e) => setEditAgent({ ...editAgent, phone: e.target.value })}
                          className="h-14 bg-white border-slate-200 rounded-2xl shadow-sm focus:ring-amber-500/20 focus:border-amber-500 transition-all text-slate-900 font-medium px-5 font-mono"
                          placeholder="+251 ..."
                        />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Secondary Contact</Label>
                        <Input
                          value={editAgent.alternativePhone || ''}
                          onChange={(e) => setEditAgent({ ...editAgent, alternativePhone: e.target.value })}
                          className="h-14 bg-white border-slate-200 rounded-2xl shadow-sm focus:ring-amber-500/20 focus:border-amber-500 transition-all text-slate-900 font-medium px-5 font-mono"
                          placeholder="Optional"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Background & Experience</Label>
                      <Textarea
                        value={editAgent.experience || ''}
                        onChange={(e) => setEditAgent({ ...editAgent, experience: e.target.value })}
                        className="bg-white border-slate-200 rounded-2xl shadow-sm focus:ring-amber-500/20 focus:border-amber-500 transition-all text-slate-900 font-medium p-5 resize-none h-32 leading-relaxed"
                        placeholder="Describe professional background..."
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="business" className="p-10 m-0 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <Label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Registered Business Name</Label>
                      <Input
                        value={editAgent.businessName || ''}
                        onChange={(e) => setEditAgent({ ...editAgent, businessName: e.target.value })}
                        className="h-14 bg-white border-slate-200 rounded-2xl shadow-sm"
                        placeholder="LLC or Trade Name"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Industry / Category</Label>
                      <Input
                        value={editAgent.businessType || ''}
                        onChange={(e) => setEditAgent({ ...editAgent, businessType: e.target.value })}
                        className="h-14 bg-white border-slate-200 rounded-2xl shadow-sm"
                        placeholder="e.g. Distribution"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <Label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">TIN Identification</Label>
                      <Input
                        value={editAgent.tinNumber || ''}
                        onChange={(e) => setEditAgent({ ...editAgent, tinNumber: e.target.value })}
                        className="h-14 bg-white border-slate-200 rounded-2xl shadow-sm"
                        placeholder="Tax Number"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Working Capital (ETB)</Label>
                      <Input
                        value={editAgent.estimatedCapital || ''}
                        onChange={(e) => setEditAgent({ ...editAgent, estimatedCapital: e.target.value })}
                        className="h-14 bg-white border-slate-200 rounded-2xl shadow-sm"
                        placeholder="e.g. 1,000,000"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <Label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Banking Partner</Label>
                      <Input
                        value={editAgent.bankName || ''}
                        onChange={(e) => setEditAgent({ ...editAgent, bankName: e.target.value })}
                        className="h-14 bg-white border-slate-200 rounded-2xl shadow-sm"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Settlement Account</Label>
                      <Input
                        value={editAgent.accountNumber || ''}
                        onChange={(e) => setEditAgent({ ...editAgent, accountNumber: e.target.value })}
                        className="h-14 bg-white border-slate-200 rounded-2xl shadow-sm"
                      />
                    </div>
                  </div>

                  <div className="p-8 bg-amber-50/50 rounded-[2rem] border border-amber-100 flex items-center justify-between group hover:bg-amber-50 transition-all duration-300">
                    <div className="flex items-center gap-6">
                      <div className="h-14 w-14 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 group-hover:scale-110 transition-transform">
                        <FileText className="w-6 h-6 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900 leading-none">Business License Document</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1.5 leading-none">Verification Status: Verified</p>
                      </div>
                    </div>
                    {editAgent.tradeLicense ? (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-11 px-6 rounded-xl border-amber-200 text-amber-700 font-bold hover:bg-amber-100 transition-all"
                        onClick={() => window.open(editAgent.tradeLicense!, '_blank')}
                      >
                        Preview License
                      </Button>
                    ) : (
                      <span className="text-xs font-bold text-slate-400 italic">No document uploaded</span>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="logistics" className="p-10 m-0 space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-xs font-black text-slate-900 uppercase">Warehouse Facility</Label>
                      <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Operational Storage Unit</p>
                    </div>
                    <div 
                      onClick={() => setEditAgent({ ...editAgent, hasWarehouse: !editAgent.hasWarehouse })}
                      className={`w-16 h-8 rounded-full p-1 cursor-pointer transition-all duration-300 ${editAgent.hasWarehouse ? 'bg-amber-500' : 'bg-slate-300'}`}
                    >
                      <div className={`w-6 h-6 bg-white rounded-full transition-all duration-300 transform ${editAgent.hasWarehouse ? 'translate-x-8' : 'translate-x-0'} shadow-sm`} />
                    </div>
                  </div>

                  {editAgent.hasWarehouse && (
                    <div className="grid grid-cols-2 gap-8 animate-in fade-in slide-in-from-top-4 duration-500">
                      <div className="space-y-3">
                        <Label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Warehouse Size (m²)</Label>
                        <Input
                          value={editAgent.warehouseSize || ''}
                          onChange={(e) => setEditAgent({ ...editAgent, warehouseSize: e.target.value })}
                          className="h-14 bg-white border-slate-200 rounded-2xl shadow-sm"
                          placeholder="e.g. 100"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">On-site Staff Count</Label>
                        <Input
                          type="number"
                          value={editAgent.staffCount || 0}
                          onChange={(e) => setEditAgent({ ...editAgent, staffCount: parseInt(e.target.value) || 0 })}
                          className="h-14 bg-white border-slate-200 rounded-2xl shadow-sm"
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <Label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Administrative Region</Label>
                      <Select 
                        value={editAgent.region} 
                        onValueChange={(v) => setEditAgent({ ...editAgent, region: v, city: '' })}
                      >
                        <SelectTrigger className="h-14 bg-white border-slate-200 rounded-2xl shadow-sm">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          {regions.map((reg) => (
                            <SelectItem key={reg.id} value={reg.name}>{reg.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Operational City</Label>
                      <Select 
                        value={editAgent.city} 
                        onValueChange={(v) => setEditAgent({ ...editAgent, city: v })}
                        disabled={!editAgent.region}
                      >
                        <SelectTrigger className="h-14 bg-white border-slate-200 rounded-2xl shadow-sm">
                          <SelectValue placeholder="Select" />
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

                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <Label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Woreda / District</Label>
                      <Input
                        value={editAgent.woreda || ''}
                        onChange={(e) => setEditAgent({ ...editAgent, woreda: e.target.value })}
                        className="h-14 bg-white border-slate-200 rounded-2xl shadow-sm"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Kebele / Locality</Label>
                      <Input
                        value={editAgent.kebele || ''}
                        onChange={(e) => setEditAgent({ ...editAgent, kebele: e.target.value })}
                        className="h-14 bg-white border-slate-200 rounded-2xl shadow-sm"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <Label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Logistics Center / Exact Address</Label>
                    <Input
                      value={editAgent.address || ''}
                      onChange={(e) => setEditAgent({ ...editAgent, address: e.target.value })}
                      className="h-14 bg-white border-slate-200 rounded-2xl shadow-sm"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="portal" className="p-10 m-0 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <div className="space-y-8">
                    <div className="p-8 bg-slate-900 rounded-[2rem] border border-slate-800 shadow-2xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Lock className="w-24 h-24 text-white" />
                      </div>
                      
                      <div className="relative z-10 space-y-6">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                            <ShieldCheck className="w-6 h-6 text-blue-400" />
                          </div>
                          <div>
                            <h3 className="text-lg font-black text-white">Security & Portal Control</h3>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Manage access credentials & permissions</p>
                          </div>
                        </div>

                        <div className="pt-6 space-y-6 border-t border-slate-800">
                          <div className="space-y-4">
                            <Label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">
                              {editAgent.userId ? 'Reset System Password' : 'Initialize Portal Password'}
                            </Label>
                            <div className="flex gap-4">
                              <div className="relative flex-1">
                                <Key className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <Input
                                  type="password"
                                  value={portalPassword}
                                  onChange={(e) => setPortalPassword(e.target.value)}
                                  placeholder="Min. 8 characters highly recommended"
                                  className="h-14 bg-slate-950 border-slate-800 rounded-2xl pl-14 text-white focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono"
                                />
                              </div>
                              <Button
                                onClick={handleUpdatePortalAccess}
                                disabled={portalLoading}
                                className="h-14 px-8 bg-blue-600 text-white hover:bg-blue-700 font-black rounded-2xl shadow-lg shadow-blue-900/20 transition-all active:scale-95"
                              >
                                {portalLoading ? (
                                  <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                  editAgent.userId ? 'Update Password' : 'Grant Portal Access'
                                )}
                              </Button>
                            </div>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest italic ml-1">
                              System Login ID: <span className="text-blue-400 underline lowercase">{editAgent.email}</span>
                            </p>
                          </div>
                        </div>

                        {editAgent.userId && (
                          <div className="pt-4 flex justify-end">
                            <Button
                              variant="ghost"
                              onClick={handleDeactivatePortal}
                              disabled={portalLoading}
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/10 font-black text-xs uppercase tracking-widest rounded-xl px-6 h-12"
                            >
                              <ShieldOff className="w-4 h-4 mr-2" />
                              Revoke Portal Access
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    {editAgent.userId && (
                      <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex items-start gap-4">
                        <CheckCircle className="w-6 h-6 text-emerald-500 shrink-0" />
                        <div className="space-y-1">
                          <p className="text-xs font-black text-emerald-400 uppercase tracking-widest">Profile Synchronized</p>
                          <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                            This agent identity is correctly linked with a system user account. All permissions and inventory data are live.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </div>

              <DialogFooter className="p-10 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Operational Step</span>
                  <p className="text-sm font-black text-slate-900 uppercase tracking-tight mt-1">
                    {currentTab === 'personal' ? '01 · Basic Profile' : 
                     currentTab === 'business' ? '02 · Commercial Info' : 
                     currentTab === 'logistics' ? '03 · Geo-Logistics' : 
                     '04 · Cyber Security'}
                  </p>
                </div>
                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (currentTab === 'personal') setShowEditDialog(false);
                      else if (currentTab === 'business') setCurrentTab('personal');
                      else if (currentTab === 'logistics') setCurrentTab('business');
                      else setCurrentTab('logistics');
                    }}
                    className="h-14 px-8 border-slate-200 text-slate-600 font-black rounded-2xl hover:bg-white hover:text-slate-900 transition-all active:scale-95 uppercase text-xs tracking-widest"
                  >
                    {currentTab === 'personal' ? 'Discard' : (
                      <>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Previous
                      </>
                    )}
                  </Button>
                  
                  {currentTab !== 'portal' && (editAgent.status !== 'APPROVED' || currentTab !== 'logistics') ? (
                    <Button
                      onClick={() => {
                        if (currentTab === 'personal') setCurrentTab('business');
                        else if (currentTab === 'business') setCurrentTab('logistics');
                        else if (currentTab === 'logistics' && editAgent.status === 'APPROVED') setCurrentTab('portal');
                      }}
                      className="h-14 px-10 bg-deep-sky-blue text-slate-950 hover:bg-deep-sky-blue-dark font-black rounded-2xl shadow-lg shadow-deep-sky-blue/20 transition-all active:scale-95 uppercase text-xs tracking-widest border-none"
                    >
                      Continue
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleUpdateAgent}
                      disabled={actionLoading || !editAgent.region || !editAgent.city}
                      className="h-14 px-12 bg-slate-900 text-white hover:bg-slate-800 font-black rounded-2xl shadow-xl shadow-slate-900/20 transition-all active:scale-95 uppercase text-xs tracking-widest border-none"
                    >
                      {actionLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Commit Changes'
                      )}
                    </Button>
                  )}
                </div>
              </DialogFooter>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}

      {/* Agent Inventory Dialog */}
      <Dialog open={showInventoryDialog} onOpenChange={setShowInventoryDialog}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden rounded-[2.5rem] shadow-2xl bg-white border-none max-h-[90vh] flex flex-col">
          {selectedAgent && (
            <div className="flex flex-col h-full overflow-hidden">
              {/* Premium Header */}
              <div className="p-8 bg-slate-900 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-6">
                  <div className="h-16 w-16 rounded-[1.5rem] bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shadow-inner">
                    <Boxes className="w-8 h-8 text-amber-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-2xl font-black text-white tracking-tight">Agent Inventory</h2>
                      <div className="px-3 py-1 bg-amber-500 rounded-full">
                        <span className="text-[10px] font-black text-slate-950 uppercase tracking-widest">Live Asset Tracking</span>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-wider">
                      {selectedAgent.firstName} {selectedAgent.lastName} · {selectedAgent.city} Hub
                    </p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setShowInventoryDialog(false)}
                  className="rounded-full hover:bg-white/10 text-slate-400"
                >
                  <X className="w-6 h-6" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto p-10 space-y-12">
                {/* Current Assets Grid */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-3">
                      <Package className="w-4 h-4 text-amber-500" />
                      Assigned Assets
                    </h4>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Last updated: Just now</span>
                  </div>

                  {agentInventory.length === 0 ? (
                    <div className="p-12 border-2 border-dashed border-slate-100 rounded-[2rem] text-center bg-slate-50/50">
                      <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm mb-4">
                        <Inbox className="w-8 h-8 text-slate-200" />
                      </div>
                      <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No assets currently assigned</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {agentInventory.map((item) => {
                        const productUnits = currentAgentUnits.filter(u => u.product.id === item.product.id);
                        return (
                          <div key={item.id} className="group p-6 bg-white border border-slate-100 rounded-[2rem] hover:border-amber-200 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
                            <div className="flex items-start justify-between mb-4">
                              <div className="space-y-1">
                                <p className="text-sm font-black text-slate-900 group-hover:text-amber-600 transition-colors uppercase tracking-tight">{item.product.name}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{item.product.category}</p>
                              </div>
                              <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-amber-50 group-hover:border-amber-200">
                                <span className="text-lg font-black text-slate-900">{item.quantity}</span>
                              </div>
                            </div>
                            
                            {item.product.isSerialized && productUnits.length > 0 && (
                              <div className="pt-4 border-t border-slate-50">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                  <ShieldCheck className="w-3 h-3" />
                                  Chassis Authentication
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {productUnits.map((unit) => (
                                    <span key={unit.id} className="px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black tabular-nums text-slate-600 shadow-sm hover:border-amber-500 hover:bg-white transition-all cursor-default">
                                      {unit.chassisNumber}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="h-px bg-slate-100" />

                {/* Transfer Section */}
                <div className="space-y-6">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-3">
                    <ArrowRightLeft className="w-4 h-4 text-amber-500" />
                    Asset Allocation
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8 bg-slate-50/50 rounded-[2.5rem] border border-slate-100">
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Stock Portfolio</Label>
                      <Select value={transferProductId} onValueChange={setTransferProductId}>
                        <SelectTrigger className="h-14 bg-white border-slate-200 rounded-2xl shadow-sm">
                          <SelectValue placeholder="Select Asset" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          {products.map((p) => {
                            const whItem = warehouseInventory.find(i => i.productId === p.id && i.agentId === null);
                            const whStock = whItem ? whItem.quantity : 0;
                            return (
                              <SelectItem key={p.id} value={p.id} disabled={whStock <= 0} className="font-bold">
                                {p.name} <span className="text-slate-400 ml-2">({whStock} Fixed)</span>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Allocation Quantity</Label>
                      <Input 
                        type="number" 
                        value={transferAmount || ''} 
                        onChange={(e) => setTransferAmount(parseInt(e.target.value) || 0)}
                        className="h-14 bg-white border-slate-200 rounded-2xl shadow-sm text-center font-black"
                        placeholder="0"
                      />
                    </div>

                    <div className="flex items-end">
                      <Button 
                        onClick={handleTransfer} 
                        disabled={transferLoading || !transferProductId || transferAmount <= 0 || (products.find(p => p.id === transferProductId)?.isSerialized && selectedUnitIds.length !== transferAmount)}
                        className="w-full h-14 bg-slate-900 text-white font-black rounded-2xl hover:bg-amber-500 hover:text-slate-950 transition-all shadow-xl shadow-slate-900/10 uppercase text-xs tracking-widest"
                      >
                        {transferLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Commit Assignment'}
                      </Button>
                    </div>

                    {/* Serialization Control */}
                    {availableUnits.length > 0 && (
                      <div className="md:col-span-3 space-y-4 pt-6 border-t border-slate-200 animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="flex items-center justify-between px-1">
                          <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            Chassis Selection Required ({selectedUnitIds.length} / {transferAmount})
                          </Label>
                          {unitsLoading && <Loader2 className="w-3 h-3 animate-spin text-amber-500" />}
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-48 overflow-y-auto p-4 bg-white rounded-2xl border border-slate-200 shadow-inner">
                          {availableUnits.map((unit) => (
                            <div 
                              key={unit.id} 
                              className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                                selectedUnitIds.includes(unit.id) 
                                  ? 'bg-amber-50 border-amber-500 shadow-sm' 
                                  : 'bg-white border-slate-100 hover:border-amber-200'
                              }`}
                              onClick={() => {
                                if (selectedUnitIds.includes(unit.id)) {
                                  setSelectedUnitIds(selectedUnitIds.filter(id => id !== unit.id));
                                } else if (selectedUnitIds.length < transferAmount) {
                                  setSelectedUnitIds([...selectedUnitIds, unit.id]);
                                }
                              }}
                            >
                              <div className={`h-4 w-4 rounded-md border flex items-center justify-center transition-all ${selectedUnitIds.includes(unit.id) ? 'bg-amber-500 border-amber-500' : 'bg-white border-slate-300'}`}>
                                {selectedUnitIds.includes(unit.id) && <CheckSquare className="w-3 h-3 text-white" />}
                              </div>
                              <span className="text-[11px] font-black tabular-nums text-slate-900 truncate">{unit.chassisNumber}</span>
                            </div>
                          ))}
                        </div>
                        {selectedUnitIds.length > 0 && selectedUnitIds.length !== transferAmount && (
                          <div className="flex items-center gap-2 px-2">
                            <AlertCircle className="w-4 h-4 text-amber-500" />
                            <p className="text-[10px] text-amber-600 font-black italic uppercase tracking-wider">
                              Selection mismatch: Please select {transferAmount} chassis numbers
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Audit Trail */}
                <div className="space-y-6">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-3">
                    <History className="w-4 h-4 text-amber-500" />
                    Transaction Ledger
                  </h4>
                  <div className="space-y-3">
                    {inventoryHistory.length === 0 ? (
                      <div className="py-12 text-center">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">No historical data found</p>
                      </div>
                    ) : (
                      inventoryHistory.map((tx) => (
                        <div key={tx.id} className="flex items-center justify-between p-6 bg-white border border-slate-100 rounded-2xl hover:bg-slate-50 transition-colors group">
                          <div className="flex items-center gap-5">
                            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center border ${tx.toAgentId === selectedAgent.id ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-red-50 border-red-100 text-red-600'}`}>
                              {tx.toAgentId === selectedAgent.id ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
                            </div>
                            <div>
                              <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{tx.product.name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${tx.type === 'TRANSFER' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                                  {tx.type}
                                </span>
                                <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">
                                  {new Date(tx.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-lg font-black ${tx.toAgentId === selectedAgent.id ? 'text-emerald-600' : 'text-red-600'}`}>
                              {tx.toAgentId === selectedAgent.id ? '+' : '-'}{tx.quantity}
                            </p>
                          </div>
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

      {/* SMS Communications Dialog */}
      <Dialog open={showSmsDialog} onOpenChange={(open) => { if (!open) { setShowSmsDialog(false); setSmsAgent(null); setSmsMessage(''); } }}>
        <DialogContent className="max-w-md p-0 overflow-hidden rounded-[2.5rem] shadow-2xl bg-white border-none">
          <div className="p-8 bg-slate-900">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-12 w-12 rounded-xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                <MessageSquare className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-black text-white tracking-tight">Direct Messaging</h3>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
              <p className="text-xs font-black text-slate-300 uppercase tracking-[0.2em]">{smsAgent?.firstName} {smsAgent?.lastName}</p>
              <p className="text-[10px] text-purple-400 font-bold mt-1 tracking-widest">{smsAgent?.phone} · Verified Contact</p>
            </div>
          </div>
          
          <div className="p-8 space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center px-1">
                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global SMS Dispatch</Label>
                <span className={`text-[10px] font-black tabular-nums transition-colors ${smsMessage.length > 150 ? 'text-red-500' : 'text-slate-400'}`}>
                  {smsMessage.length} / 160
                </span>
              </div>
              <Textarea
                value={smsMessage}
                onChange={(e) => setSmsMessage(e.target.value.slice(0, 160))}
                placeholder="Type operational notice..."
                className="bg-slate-50 border-slate-200 rounded-[1.5rem] p-5 resize-none h-32 text-sm font-medium focus:ring-purple-500/20 focus:border-purple-300 transition-all leading-relaxed"
                autoFocus
              />
            </div>
            
            <div className="flex gap-4">
              <Button 
                variant="outline" 
                onClick={() => setShowSmsDialog(false)} 
                className="h-14 flex-1 border-slate-200 text-slate-600 font-black rounded-2xl hover:bg-slate-50 uppercase text-xs tracking-widest transition-all"
              >
                Discard
              </Button>
              <Button
                onClick={async () => {
                  if (!smsAgent || !smsMessage.trim()) return;
                  setSmsSending(true);
                  try {
                    const res = await fetch('/api/sms/send', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ agentIds: [smsAgent.id], message: smsMessage }),
                    });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error);
                    if (data.successCount > 0) {
                      toast({ title: '✅ SMS DISPATCHED', description: 'Message has been securely delivered.' });
                      setShowSmsDialog(false);
                      setSmsMessage('');
                    } else {
                      toast({ title: 'Dispatch Failed', description: data.results?.[0]?.error || 'Carrier rejection', variant: 'destructive' });
                    }
                  } catch (e: any) {
                    toast({ title: 'Security Error', description: e.message, variant: 'destructive' });
                  } finally {
                    setSmsSending(false);
                  }
                }}
                disabled={!smsMessage.trim() || smsSending}
                className="h-14 flex-1 bg-purple-600 text-white font-black rounded-2xl hover:bg-purple-700 shadow-lg shadow-purple-900/20 uppercase text-xs tracking-widest transition-all active:scale-95"
              >
                {smsSending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Send Message
                    <Send className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function DataPoint({ icon, label, value }: { icon?: any, label: string, value: string }) {
  return (
    <div className="space-y-0.5">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      <div className="flex items-center gap-1.5">
        {icon && <div className="text-amber-500">{icon}</div>}
        <p className="text-sm font-black text-slate-950 uppercase tracking-tight">{value}</p>
      </div>
    </div>
  );
}
