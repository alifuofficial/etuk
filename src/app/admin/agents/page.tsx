'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  Calendar,
  Eye,
  CheckCircle,
  XCircle,
  FileText,
  Building2,
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
      const data = await response.json();
      setAgents(data);
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
          description: 'The agent application has been updated.',
        });
        fetchAgents();
        setShowDialog(false);
        setSelectedAgent(null);
        setReviewNotes('');
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <Badge className="bg-green-500">Approved</Badge>;
      case 'PENDING':
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case 'REJECTED':
        return <Badge className="bg-red-500">Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const filteredAgents = agents.filter((agent) => {
    const searchLower = search.toLowerCase();
    return (
      agent.firstName.toLowerCase().includes(searchLower) ||
      agent.lastName.toLowerCase().includes(searchLower) ||
      agent.email.toLowerCase().includes(searchLower) ||
      agent.region.toLowerCase().includes(searchLower) ||
      agent.city.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agent Applications</h1>
          <p className="text-gray-600">Manage and review agent applications</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            {filteredAgents.length} applications
          </span>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by name, email, or location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Agents Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500" />
            </div>
          ) : filteredAgents.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No applications found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Business</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Applied</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAgents.map((agent) => (
                    <TableRow key={agent.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{agent.firstName} {agent.lastName}</p>
                          <p className="text-sm text-gray-500">{agent.email}</p>
                          <p className="text-sm text-gray-500">{agent.phone}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span>{agent.city}, {agent.region}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{agent.businessName || 'N/A'}</p>
                          <p className="text-sm text-gray-500">{agent.businessType || 'Individual'}</p>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(agent.status)}</TableCell>
                      <TableCell className="text-gray-500">
                        {formatDate(agent.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedAgent(agent);
                            setReviewNotes(agent.reviewNotes || '');
                            setShowDialog(true);
                          }}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
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

      {/* Agent Detail Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Agent Application Details</DialogTitle>
            <DialogDescription>
              Review and manage this agent application
            </DialogDescription>
          </DialogHeader>

          {selectedAgent && (
            <div className="space-y-6">
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                {getStatusBadge(selectedAgent.status)}
                <span className="text-sm text-gray-500">
                  Applied: {formatDate(selectedAgent.createdAt)}
                </span>
              </div>

              {/* Personal Info */}
              <div className="space-y-3">
                <h4 className="font-semibold text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5 text-sky-500" />
                  Personal Information
                </h4>
                <div className="grid md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="font-medium">{selectedAgent.firstName} {selectedAgent.lastName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium flex items-center gap-1">
                      <Mail className="w-4 h-4 text-gray-400" />
                      {selectedAgent.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium flex items-center gap-1">
                      <Phone className="w-4 h-4 text-gray-400" />
                      {selectedAgent.phone}
                    </p>
                  </div>
                  {selectedAgent.alternativePhone && (
                    <div>
                      <p className="text-sm text-gray-500">Alternative Phone</p>
                      <p className="font-medium">{selectedAgent.alternativePhone}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Business Info */}
              <div className="space-y-3">
                <h4 className="font-semibold text-lg flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-sky-500" />
                  Business Information
                </h4>
                <div className="grid md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-500">Business Name</p>
                    <p className="font-medium">{selectedAgent.businessName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Business Type</p>
                    <p className="font-medium">{selectedAgent.businessType || 'Individual'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Experience</p>
                    <p className="font-medium">{selectedAgent.experience || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Warehouse</p>
                    <p className="font-medium">
                      {selectedAgent.hasWarehouse 
                        ? `Yes (${selectedAgent.warehouseSize || 'Size not specified'})` 
                        : 'No'}
                    </p>
                  </div>
                  {selectedAgent.staffCount && (
                    <div>
                      <p className="text-sm text-gray-500">Staff Count</p>
                      <p className="font-medium">{selectedAgent.staffCount}</p>
                    </div>
                  )}
                  {selectedAgent.existingBrands && (
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-500">Existing Brands</p>
                      <p className="font-medium">{selectedAgent.existingBrands}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Location */}
              <div className="space-y-3">
                <h4 className="font-semibold text-lg flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-sky-500" />
                  Location
                </h4>
                <div className="grid md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-500">Region</p>
                    <p className="font-medium">{selectedAgent.region}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">City</p>
                    <p className="font-medium">{selectedAgent.city}</p>
                  </div>
                  {selectedAgent.woreda && (
                    <div>
                      <p className="text-sm text-gray-500">Woreda</p>
                      <p className="font-medium">{selectedAgent.woreda}</p>
                    </div>
                  )}
                  {selectedAgent.kebele && (
                    <div>
                      <p className="text-sm text-gray-500">Kebele</p>
                      <p className="font-medium">{selectedAgent.kebele}</p>
                    </div>
                  )}
                  {selectedAgent.address && (
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-500">Address</p>
                      <p className="font-medium">{selectedAgent.address}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Financial Info */}
              <div className="space-y-3">
                <h4 className="font-semibold text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-sky-500" />
                  Additional Information
                </h4>
                <div className="grid md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  {selectedAgent.estimatedCapital && (
                    <div>
                      <p className="text-sm text-gray-500">Estimated Capital</p>
                      <p className="font-medium">{selectedAgent.estimatedCapital}</p>
                    </div>
                  )}
                  {selectedAgent.bankName && (
                    <div>
                      <p className="text-sm text-gray-500">Bank</p>
                      <p className="font-medium">{selectedAgent.bankName}</p>
                    </div>
                  )}
                  {selectedAgent.tinNumber && (
                    <div>
                      <p className="text-sm text-gray-500">TIN Number</p>
                      <p className="font-medium">{selectedAgent.tinNumber}</p>
                    </div>
                  )}
                  {selectedAgent.howDidYouHear && (
                    <div>
                      <p className="text-sm text-gray-500">How did they hear about us?</p>
                      <p className="font-medium">{selectedAgent.howDidYouHear}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Message */}
              {selectedAgent.message && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-lg">Additional Message</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700">{selectedAgent.message}</p>
                  </div>
                </div>
              )}

              {/* Review Notes */}
              <div className="space-y-3">
                <Label htmlFor="reviewNotes">Review Notes</Label>
                <Textarea
                  id="reviewNotes"
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Add notes about this application..."
                  rows={3}
                />
              </div>

              {/* Review Info */}
              {selectedAgent.reviewedAt && (
                <div className="text-sm text-gray-500">
                  Reviewed on {formatDate(selectedAgent.reviewedAt)} by {selectedAgent.reviewer?.name || 'Unknown'}
                </div>
              )}

              {/* Action Buttons */}
              {selectedAgent.status === 'PENDING' && (
                <DialogFooter className="flex gap-2">
                  <Button
                    variant="outline"
                    className="text-red-600 border-red-600 hover:bg-red-50"
                    onClick={() => handleStatusUpdate(selectedAgent.id, 'REJECTED')}
                    disabled={actionLoading}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                  <Button
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => handleStatusUpdate(selectedAgent.id, 'APPROVED')}
                    disabled={actionLoading}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                </DialogFooter>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
