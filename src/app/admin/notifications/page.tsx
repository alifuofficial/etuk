'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
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
import { toast } from '@/hooks/use-toast';
import {
  MessageSquare,
  Send,
  Search,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Phone,
  MapPin,
  Filter,
  RefreshCw,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Copy,
  Edit,
  Trash2,
  Power,
  PowerOff,
  LayoutTemplate
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface Agent {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  region: string;
  city: string;
  status: string;
}

interface SmsLog {
  id: string;
  agentId: string | null;
  agentName: string | null;
  recipient: string;
  message: string;
  status: 'success' | 'failed';
  errorMessage: string | null;
  sentBy: string | null;
  createdAt: string;
}

interface SmsTemplate {
  id: string;
  name: string;
  content: string;
  isActive: boolean;
  updatedAt: string;
}

export default function NotificationsPage() {
  const { data: session } = useSession();

  // Compose state
  const [message, setMessage] = useState('');
  const [selectedAgentIds, setSelectedAgentIds] = useState<Set<string>>(new Set());
  const [recipientMode, setRecipientMode] = useState<'custom' | 'all' | 'region'>('custom');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendResults, setSendResults] = useState<any>(null);

  // Agent list state
  const [agents, setAgents] = useState<Agent[]>([]);
  const [agentSearch, setAgentSearch] = useState('');
  const [loadingAgents, setLoadingAgents] = useState(true);
  const [regions, setRegions] = useState<string[]>([]);
  const [agentStatusFilter, setAgentStatusFilter] = useState<string>('all');

  // Logs state
  const [logs, setLogs] = useState<SmsLog[]>([]);
  const [logsTotal, setLogsTotal] = useState(0);
  const [logsPage, setLogsPage] = useState(1);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [logsStatusFilter, setLogsStatusFilter] = useState('all');
  const [logsSearch, setLogsSearch] = useState('');

  // Templates state
  const [templates, setTemplates] = useState<SmsTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [activeTab, setActiveTab] = useState('compose');
  const [editingTemplate, setEditingTemplate] = useState<SmsTemplate | null>(null);
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);

  const fetchAgents = useCallback(async () => {
    setLoadingAgents(true);
    try {
      const res = await fetch('/api/agents');
      if (res.ok) {
        const data = await res.json();
        const arr: Agent[] = Array.isArray(data) ? data : [];
        setAgents(arr);
        const uniqueRegions = [...new Set(arr.map((a) => a.region).filter(Boolean))].sort();
        setRegions(uniqueRegions);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAgents(false);
    }
  }, []);

  const fetchLogs = useCallback(async () => {
    setLoadingLogs(true);
    try {
      const params = new URLSearchParams({
        page: logsPage.toString(),
        limit: '20',
        status: logsStatusFilter,
        search: logsSearch,
      });
      const res = await fetch(`/api/sms/logs?${params}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs);
        setLogsTotal(data.total);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingLogs(false);
    }
  }, [logsPage, logsStatusFilter, logsSearch]);

  const fetchTemplates = useCallback(async () => {
    setLoadingTemplates(true);
    try {
      const res = await fetch('/api/sms/templates');
      if (res.ok) {
        const data = await res.json();
        setTemplates(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingTemplates(false);
    }
  }, []);

  useEffect(() => { fetchAgents(); }, [fetchAgents]);
  useEffect(() => { fetchLogs(); }, [fetchLogs]);
  useEffect(() => { fetchTemplates(); }, [fetchTemplates]);

  const saveTemplate = async (templateData: Partial<SmsTemplate>) => {
    setIsSavingTemplate(true);
    try {
      const res = await fetch('/api/sms/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templateData),
      });
      if (res.ok) {
        toast({ title: 'Success', description: 'Template saved successfully' });
        fetchTemplates();
        setShowTemplateDialog(false);
        setEditingTemplate(null);
      } else {
        const data = await res.json();
        toast({ title: 'Error', description: data.error, variant: 'destructive' });
      }
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setIsSavingTemplate(false);
    }
  };

  const toggleTemplate = async (template: SmsTemplate) => {
    await saveTemplate({ ...template, isActive: !template.isActive });
  };

  const filteredAgents = agents.filter((a) => {
    const q = agentSearch.toLowerCase();
    if (recipientMode === 'region' && selectedRegion && a.region !== selectedRegion) return false;
    if (agentStatusFilter !== 'all' && a.status !== agentStatusFilter) return false;
    return (
      `${a.firstName} ${a.lastName}`.toLowerCase().includes(q) ||
      a.phone.includes(q) ||
      a.city.toLowerCase().includes(q)
    );
  });

  const effectiveRecipients = (): Agent[] => {
    if (recipientMode === 'all') {
      return agentStatusFilter === 'all' ? agents : agents.filter(a => a.status === agentStatusFilter);
    }
    if (recipientMode === 'region') {
      const byReg = agents.filter((a) => a.region === selectedRegion);
      return agentStatusFilter === 'all' ? byReg : byReg.filter(a => a.status === agentStatusFilter);
    }
    return agents.filter((a) => selectedAgentIds.has(a.id));
  };

  const toggleAgent = (id: string) => {
    setSelectedAgentIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    const visible = filteredAgents.map((a) => a.id);
    const allSelected = visible.every((id) => selectedAgentIds.has(id));
    setSelectedAgentIds((prev) => {
      const next = new Set(prev);
      if (allSelected) visible.forEach((id) => next.delete(id));
      else visible.forEach((id) => next.add(id));
      return next;
    });
  };

  const handleSend = async () => {
    const recipients = effectiveRecipients();
    if (recipients.length === 0) {
      toast({ title: 'No recipients', description: 'Please select at least one agent.', variant: 'destructive' });
      return;
    }
    if (!message.trim()) {
      toast({ title: 'Empty message', description: 'Please write a message to send.', variant: 'destructive' });
      return;
    }
    setShowConfirm(true);
  };

  const confirmSend = async () => {
    setSending(true);
    const recipients = effectiveRecipients();
    try {
      const res = await fetch('/api/sms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          agentIds: recipients.map((a) => a.id),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: 'Send failed', description: data.error, variant: 'destructive' });
      } else {
        setSendResults(data);
        toast({
          title: `✅ Sent to ${data.successCount} agent${data.successCount !== 1 ? 's' : ''}`,
          description: data.failCount > 0 ? `${data.failCount} failed. See results below.` : 'All messages delivered successfully.',
        });
        setMessage('');
        setSelectedAgentIds(new Set());
        fetchLogs();
      }
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setSending(false);
      setShowConfirm(false);
    }
  };

  const recipients = effectiveRecipients();
  const visibleAllSelected = filteredAgents.length > 0 && filteredAgents.every((a) => selectedAgentIds.has(a.id));
  const totalPages = Math.ceil(logsTotal / 20);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">SMS Notifications</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage automated templates and send direct messages to agents.
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-gray-100/80 p-1 mb-6">
          <TabsTrigger value="compose" className="data-[state=active]:bg-white data-[state=active]:shadow-sm px-6">
            <Send className="w-4 h-4 mr-2" />
            Send SMS
          </TabsTrigger>
          <TabsTrigger value="templates" className="data-[state=active]:bg-white data-[state=active]:shadow-sm px-6">
            <LayoutTemplate className="w-4 h-4 mr-2" />
            Message Templates
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-white data-[state=active]:shadow-sm px-6">
            <Clock className="w-4 h-4 mr-2" />
            Notification History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="compose" className="space-y-6">
          <div className="grid lg:grid-cols-5 gap-6">
            {/* Message Composer */}
            <div className="lg:col-span-2 space-y-4">
              <Card className="border-gray-200 shadow-sm rounded-xl overflow-hidden">
                <CardHeader className="border-b border-gray-50 px-6 py-5">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-deep-sky-blue" />
                    Compose Message
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {/* Recipient Mode */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-600 uppercase tracking-widest">Send To</label>
                    <Select value={recipientMode} onValueChange={(v: any) => { setRecipientMode(v); setSelectedAgentIds(new Set()); }}>
                      <SelectTrigger className="h-10 bg-gray-50 border-gray-200 rounded-lg text-sm font-medium">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="custom">Custom Selection</SelectItem>
                        <SelectItem value="all">Targeted by Status</SelectItem>
                        <SelectItem value="region">Targeted by Region + Status</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-600 uppercase tracking-widest">Agent Status</label>
                    <Select value={agentStatusFilter} onValueChange={(v) => { setAgentStatusFilter(v); setSelectedAgentIds(new Set()); }}>
                      <SelectTrigger className="h-10 bg-gray-50 border-gray-200 rounded-lg text-sm font-medium">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Agents</SelectItem>
                        <SelectItem value="APPROVED">Approved Only</SelectItem>
                        <SelectItem value="PENDING">Pending Only</SelectItem>
                        <SelectItem value="REJECTED">Rejected Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {recipientMode === 'region' && (
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-600 uppercase tracking-widest">Region</label>
                      <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                        <SelectTrigger className="h-10 bg-gray-50 border-gray-200 rounded-lg text-sm font-medium">
                          <SelectValue placeholder="Select region..." />
                        </SelectTrigger>
                        <SelectContent>
                          {regions.map((r) => (
                            <SelectItem key={r} value={r}>{r}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Message textarea */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-gray-600 uppercase tracking-widest">Message</label>
                      <span className={`text-xs font-bold tabular-nums ${message.length > 150 ? 'text-red-500' : message.length > 120 ? 'text-amber-500' : 'text-gray-400'}`}>
                        {message.length}/160
                      </span>
                    </div>
                    <Textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value.slice(0, 160))}
                      placeholder="Type your notification message here..."
                      className="bg-gray-50 border-gray-200 rounded-lg focus:bg-white focus:border-deep-sky-blue transition-all min-h-[120px] resize-none text-sm"
                    />
                  </div>

                  {/* Recipient summary */}
                  <div className={`p-4 rounded-xl border flex items-center justify-between ${recipients.length > 0 ? 'bg-deep-sky-blue/5 border-deep-sky-blue/20' : 'bg-gray-50 border-gray-100'}`}>
                    <div className="flex items-center gap-2">
                      <Users className={`w-4 h-4 ${recipients.length > 0 ? 'text-deep-sky-blue' : 'text-gray-400'}`} />
                      <span className="text-sm font-bold text-gray-700">
                        {recipients.length === 0
                          ? 'No recipients selected'
                          : `${recipients.length} agent${recipients.length !== 1 ? 's' : ''} selected`}
                      </span>
                    </div>
                  </div>

                  <Button
                    onClick={handleSend}
                    disabled={!message.trim() || recipients.length === 0}
                    className="w-full h-11 bg-deep-sky-blue hover:bg-blue-600 text-white font-bold rounded-lg shadow-lg shadow-blue-100 flex items-center gap-2 transition-all"
                  >
                    <Send className="w-4 h-4" />
                    Send Notification
                  </Button>
                </CardContent>
              </Card>

              {sendResults && (
                <Card className="border-gray-200 shadow-sm rounded-xl overflow-hidden">
                  <CardContent className="p-5 space-y-3">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Last Send Results</p>
                    <div className="flex gap-4">
                      <div className="flex items-center gap-2 text-green-600 font-bold text-sm">
                        <CheckCircle2 className="w-4 h-4" /> {sendResults.successCount} sent
                      </div>
                      <div className="flex items-center gap-2 text-red-500 font-bold text-sm">
                        <XCircle className="w-4 h-4" /> {sendResults.failCount} failed
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Agent Selector (custom mode) */}
            <div className="lg:col-span-3">
              <Card className="border-gray-200 shadow-sm rounded-xl overflow-hidden h-full">
                <CardHeader className="border-b border-gray-50 px-6 py-5">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-bold">Recipients</CardTitle>
                    {recipientMode === 'custom' && filteredAgents.length > 0 && (
                      <button onClick={toggleAll} className="text-xs font-bold text-deep-sky-blue hover:underline">
                        {visibleAllSelected ? 'Deselect All' : 'Select All'}
                      </button>
                    )}
                  </div>
                  <div className="relative mt-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <Input
                      value={agentSearch}
                      onChange={(e) => setAgentSearch(e.target.value)}
                      placeholder="Search agents..."
                      className="pl-9 h-9 bg-gray-50 border-gray-200 rounded-lg text-xs"
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="max-h-[550px] overflow-y-auto">
                    {loadingAgents ? (
                      <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 text-deep-sky-blue animate-spin" /></div>
                    ) : filteredAgents.length === 0 ? (
                      <div className="text-center py-16 text-gray-400">
                        <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                        <p className="text-sm">No agents found</p>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader className="bg-gray-50/60 font-bold">
                          <TableRow>
                            {recipientMode === 'custom' && <TableHead className="w-10 px-4" />}
                            <TableHead className="px-4 py-2 text-[10px] uppercase tracking-wider text-gray-500">Agent</TableHead>
                            <TableHead className="px-4 py-2 text-[10px] uppercase tracking-wider text-gray-500">Phone</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredAgents.map((agent) => {
                            const selected = recipientMode === 'custom' ? selectedAgentIds.has(agent.id) : true;
                            return (
                              <TableRow key={agent.id} className={cn("hover:bg-gray-50 transition-colors cursor-pointer", selected && recipientMode === 'custom' && "bg-deep-sky-blue/5")} onClick={() => recipientMode === 'custom' && toggleAgent(agent.id)}>
                                {recipientMode === 'custom' && (
                                  <TableCell className="px-4 py-1.5 w-10">
                                    <Checkbox checked={selectedAgentIds.has(agent.id)} onCheckedChange={() => toggleAgent(agent.id)} onClick={(e) => e.stopPropagation()} />
                                  </TableCell>
                                )}
                                <TableCell className="px-4 py-1.5">
                                  <div className="font-semibold text-xs text-gray-900">{agent.firstName} {agent.lastName}</div>
                                  <div className={cn("text-[9px] font-bold", agent.status === 'APPROVED' ? 'text-green-500' : 'text-amber-500')}>{agent.status}</div>
                                </TableCell>
                                <TableCell className="px-4 py-1.5 text-xs text-gray-600 tabular-nums">{agent.phone}</TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900">Message Templates</h2>
            <Button 
              onClick={() => { setEditingTemplate(null); setShowTemplateDialog(true); }}
              className="bg-deep-sky-blue hover:bg-blue-600 text-white font-bold h-9 px-4 rounded-lg flex items-center gap-2 shadow-sm"
            >
              <LayoutTemplate className="w-4 h-4" />
              New Template
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loadingTemplates ? (
              <div className="col-span-full py-20 flex justify-center"><Loader2 className="w-8 h-8 text-deep-sky-blue animate-spin" /></div>
            ) : templates.length === 0 ? (
              <div className="col-span-full text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                <LayoutTemplate className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 font-medium">No templates configured yet</p>
              </div>
            ) : templates.map(template => (
              <Card key={template.id} className={cn("border-gray-200 shadow-sm rounded-xl overflow-hidden hover:border-deep-sky-blue/30 transition-all", !template.isActive && "opacity-75 grayscale-[0.5]")}>
                <CardHeader className="border-b border-gray-50 px-5 py-4 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-bold text-gray-900 truncate max-w-[150px]">{template.name}</CardTitle>
                    <CardDescription className="text-[10px] mt-0.5">Updated {new Date(template.updatedAt).toLocaleDateString()}</CardDescription>
                  </div>
                  <Switch 
                    checked={template.isActive} 
                    onCheckedChange={() => toggleTemplate(template)} 
                    className="data-[state=checked]:bg-green-500"
                  />
                </CardHeader>
                <CardContent className="p-5">
                  <p className="text-xs text-gray-600 line-clamp-3 bg-gray-50 p-3 rounded-lg min-h-[60px] italic">
                    "{template.content}"
                  </p>
                  <div className="flex items-center justify-end gap-2 mt-4">
                    <Button 
                      variant="ghost" size="sm" 
                      onClick={() => { setEditingTemplate(template); setShowTemplateDialog(true); }}
                      className="h-8 text-gray-500 hover:text-deep-sky-blue hover:bg-deep-sky-blue/5"
                    >
                      <Edit className="w-3.5 h-3.5 mr-1" /> Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex gap-3 text-amber-800">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-widest">Automatic Triggers Info</p>
              <p className="text-sm">Templates named <code className="font-bold bg-amber-100 px-1 rounded">AGENT_APPLIED</code>, <code className="font-bold bg-amber-100 px-1 rounded">AGENT_APPROVED</code>, and <code className="font-bold bg-amber-100 px-1 rounded">AGENT_REJECTED</code> are automatically sent when those events occur if active.</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Notification History</h2>
            <div className="flex items-center gap-3 flex-1 md:flex-none">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <Input
                  value={logsSearch}
                  onChange={(e) => { setLogsSearch(e.target.value); setLogsPage(1); }}
                  placeholder="Search recipient or message..."
                  className="pl-9 h-9 bg-gray-50 border-gray-200 rounded-lg text-xs"
                />
              </div>
              <Select value={logsStatusFilter} onValueChange={(v) => { setLogsStatusFilter(v); setLogsPage(1); }}>
                <SelectTrigger className="w-32 md:w-40 h-9 bg-gray-50 border-gray-200 rounded-lg text-xs font-medium">
                  <Filter className="w-3 h-3 mr-2 text-gray-400" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={fetchLogs} className="h-9 border-gray-200 font-bold"><RefreshCw className="w-3.5 h-3.5" /></Button>
            </div>
          </div>

          <Card className="border-gray-200 shadow-sm rounded-xl overflow-hidden">
            <CardContent className="p-0">
              {loadingLogs ? (
                <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 text-deep-sky-blue animate-spin" /></div>
              ) : logs.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No messages sent yet</p>
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader className="bg-gray-50/60 font-bold">
                      <TableRow>
                        <TableHead className="px-6 py-2 text-[10px] uppercase tracking-wider text-gray-500">Recipient</TableHead>
                        <TableHead className="px-6 py-2 text-[10px] uppercase tracking-wider text-gray-500">Type</TableHead>
                        <TableHead className="px-6 py-2 text-[10px] uppercase tracking-wider text-gray-500">Message</TableHead>
                        <TableHead className="px-6 py-2 text-[10px] uppercase tracking-wider text-gray-500">Status</TableHead>
                        <TableHead className="px-6 py-2 text-[10px] uppercase tracking-wider text-gray-500">Sent At</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {logs.map((log) => (
                        <TableRow key={log.id} className="hover:bg-gray-50/50 transition-colors">
                          <TableCell className="px-6 py-1.5 focus:outline-none">
                            <div className="font-semibold text-xs text-gray-900">{log.agentName || log.recipient}</div>
                            {log.agentId ? <div className="text-[9px] text-gray-500 tabular-nums">{log.recipient}</div> : <div className="text-[9px] text-deep-sky-blue font-bold uppercase tracking-wider">System / OTP</div>}
                          </TableCell>
                          <TableCell className="px-6 py-1.5">
                            {log.message.includes('verification code') ? (
                              <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-100 text-[9px] font-bold px-2 py-0 h-4">OTP</Badge>
                            ) : (
                              <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-100 text-[9px] font-bold px-2 py-0 h-4">MSG</Badge>
                            )}
                          </TableCell>
                          <TableCell className="px-6 py-1.5">
                            <p className="text-[11px] text-gray-700 max-w-xs truncate" title={log.message}>{log.message}</p>
                          </TableCell>
                          <TableCell className="px-6 py-1.5">
                            <Badge variant={log.status === 'success' ? 'default' : 'destructive'} className={cn("text-[9px] font-black h-5 px-2", log.status === 'success' ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-50' : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-50')}>
                              {log.status === 'success' ? 'DELIVERED' : 'FAILED'}
                            </Badge>
                          </TableCell>
                          <TableCell className="px-6 py-1.5 text-[10px] text-gray-500 whitespace-nowrap">
                            {new Date(log.createdAt).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100 bg-gray-50/30">
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                        Page {logsPage} of {totalPages} · {logsTotal} items
                      </p>
                      <div className="flex gap-1">
                        <Button variant="outline" size="sm" disabled={logsPage === 1} onClick={() => setLogsPage(p => p - 1)} className="h-7 px-2 border-gray-200"><ChevronLeft className="w-3 h-3" /></Button>
                        <Button variant="outline" size="sm" disabled={logsPage === totalPages} onClick={() => setLogsPage(p => p + 1)} className="h-7 px-2 border-gray-200"><ChevronRight className="w-3 h-3" /></Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Confirm Dialog */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Confirm Send</DialogTitle>
            <DialogDescription className="text-gray-500">
              Review before sending. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-deep-sky-blue" />
                <span className="font-bold text-gray-900">{recipients.length} recipient{recipients.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="p-3 bg-white border border-gray-100 rounded-lg">
                <p className="text-sm text-gray-700 italic">"{message}"</p>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowConfirm(false)} className="border-gray-200">
              Cancel
            </Button>
            <Button
              onClick={confirmSend}
              disabled={sending}
              className="bg-deep-sky-blue hover:bg-blue-600 text-white font-bold"
            >
              {sending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...</>
              ) : (
                <><Send className="w-4 h-4 mr-2" /> Confirm & Send</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Template Edit Dialog */}
      <Dialog open={showTemplateDialog} onOpenChange={(open) => {
        if (!open) { setEditingTemplate(null); }
        setShowTemplateDialog(open);
      }}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {editingTemplate?.id ? 'Edit Template' : 'Create Template'}
            </DialogTitle>
            <DialogDescription>
              Configure automated SMS notifications
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-gray-500">Template ID (System Name)</Label>
              <Input 
                value={editingTemplate?.name || ''} 
                onChange={(e) => setEditingTemplate(prev => prev ? {...prev, name: e.target.value} : {name: e.target.value} as SmsTemplate)}
                placeholder="e.g. AGENT_APPROVED"
                disabled={!!editingTemplate?.id}
                className="bg-gray-50 border-gray-200"
              />
              <p className="text-[10px] text-gray-400">Use uppercase with underscores. Systems keys: AGENT_APPLIED, AGENT_APPROVED, AGENT_REJECTED</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="text-xs font-bold uppercase tracking-widest text-gray-500">Message Content</Label>
                <span className="text-[10px] text-gray-400">{(editingTemplate?.content?.length || 0)}/160</span>
              </div>
              <Textarea 
                value={editingTemplate?.content || ''} 
                onChange={(e) => setEditingTemplate(prev => prev ? {...prev, content: e.target.value.slice(0, 160)} : {content: e.target.value.slice(0, 160)} as SmsTemplate)}
                placeholder="Type your automated message..."
                className="min-h-[120px] bg-gray-50 border-gray-200"
              />
              <p className="text-[10px] text-gray-400">Variable: [NAME] will be replaced with agent name</p>
            </div>
            <div className="flex items-center gap-2">
              <Switch 
                checked={editingTemplate?.isActive ?? true} 
                onCheckedChange={(checked) => setEditingTemplate(prev => prev ? {...prev, isActive: checked} : {isActive: checked} as SmsTemplate)}
              />
              <Label className="text-sm font-medium">Active (Automatic triggers enabled)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTemplateDialog(false)} className="border-gray-200">
              Cancel
            </Button>
            <Button 
              onClick={() => editingTemplate && saveTemplate(editingTemplate)}
              disabled={isSavingTemplate || !editingTemplate?.name || !editingTemplate?.content}
              className="bg-deep-sky-blue hover:bg-blue-600 text-white font-bold"
            >
              {isSavingTemplate ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Template'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
