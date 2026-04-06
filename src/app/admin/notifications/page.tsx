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
} from 'lucide-react';

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

  // Logs state
  const [logs, setLogs] = useState<SmsLog[]>([]);
  const [logsTotal, setLogsTotal] = useState(0);
  const [logsPage, setLogsPage] = useState(1);
  const [logsStatusFilter, setLogsStatusFilter] = useState('all');
  const [loadingLogs, setLoadingLogs] = useState(true);

  const fetchAgents = useCallback(async () => {
    setLoadingAgents(true);
    try {
      const res = await fetch('/api/agents?status=APPROVED');
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
  }, [logsPage, logsStatusFilter]);

  useEffect(() => { fetchAgents(); }, [fetchAgents]);
  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const filteredAgents = agents.filter((a) => {
    const q = agentSearch.toLowerCase();
    if (recipientMode === 'region' && selectedRegion && a.region !== selectedRegion) return false;
    return (
      `${a.firstName} ${a.lastName}`.toLowerCase().includes(q) ||
      a.phone.includes(q) ||
      a.city.toLowerCase().includes(q)
    );
  });

  const effectiveRecipients = (): Agent[] => {
    if (recipientMode === 'all') return agents;
    if (recipientMode === 'region') return agents.filter((a) => a.region === selectedRegion);
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">SMS Notifications</h1>
        <p className="text-sm text-gray-500 mt-1">
          Send direct SMS messages to agents via SMSEthiopia.et
        </p>
      </div>

      {/* Compose + Recipients grid */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Message Composer */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-gray-200 shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="border-b border-gray-50 px-6 py-5">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-deep-sky-blue" />
                Compose Message
              </CardTitle>
              <CardDescription className="text-xs">Max 160 characters per SMS</CardDescription>
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
                    <SelectItem value="all">All Approved Agents ({agents.length})</SelectItem>
                    <SelectItem value="region">Agents by Region</SelectItem>
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
                {recipients.length > 0 && (
                  <span className="text-xs font-medium text-deep-sky-blue">{recipients.length} SMS</span>
                )}
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

          {/* Send Results */}
          {sendResults && (
            <Card className="border-gray-200 shadow-sm rounded-xl overflow-hidden">
              <CardContent className="p-5 space-y-3">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Last Send Results</p>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="font-bold text-sm">{sendResults.successCount} sent</span>
                  </div>
                  <div className="flex items-center gap-2 text-red-500">
                    <XCircle className="w-4 h-4" />
                    <span className="font-bold text-sm">{sendResults.failCount} failed</span>
                  </div>
                </div>
                {sendResults.results?.filter((r: any) => r.status === 'failed').map((r: any, idx: number) => (
                  <div key={idx} className="p-3 bg-red-50 rounded-lg border border-red-100">
                    <p className="text-xs font-bold text-red-700">{r.phone}</p>
                    <p className="text-xs text-red-500 mt-0.5">{r.error}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Agent Selector (custom mode) */}
        <div className="lg:col-span-3">
          <Card className="border-gray-200 shadow-sm rounded-xl overflow-hidden h-full">
            <CardHeader className="border-b border-gray-50 px-6 py-5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold">
                  {recipientMode === 'custom'
                    ? `Agent Selector`
                    : recipientMode === 'all'
                    ? `All Approved Agents`
                    : `Agents in ${selectedRegion || '...'}`}
                </CardTitle>
                {recipientMode === 'custom' && filteredAgents.length > 0 && (
                  <button
                    onClick={toggleAll}
                    className="text-xs font-bold text-deep-sky-blue hover:underline"
                  >
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
              <div className="max-h-[480px] overflow-y-auto">
                {loadingAgents ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-6 h-6 text-deep-sky-blue animate-spin" />
                  </div>
                ) : filteredAgents.length === 0 ? (
                  <div className="text-center py-16 text-gray-400">
                    <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No approved agents found</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader className="bg-gray-50/60">
                      <TableRow>
                        {recipientMode === 'custom' && (
                          <TableHead className="w-10 px-4 py-3" />
                        )}
                        <TableHead className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Agent</TableHead>
                        <TableHead className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Phone</TableHead>
                        <TableHead className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Location</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAgents.map((agent) => {
                        const selected = recipientMode === 'all' || recipientMode === 'region' || selectedAgentIds.has(agent.id);
                        return (
                          <TableRow
                            key={agent.id}
                            className={`transition-colors cursor-pointer ${
                              selected && recipientMode === 'custom' ? 'bg-deep-sky-blue/5' : 'hover:bg-gray-50'
                            }`}
                            onClick={() => recipientMode === 'custom' && toggleAgent(agent.id)}
                          >
                            {recipientMode === 'custom' && (
                              <TableCell className="px-4 py-3 w-10">
                                <Checkbox
                                  checked={selectedAgentIds.has(agent.id)}
                                  onCheckedChange={() => toggleAgent(agent.id)}
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </TableCell>
                            )}
                            <TableCell className="px-4 py-3">
                              <span className="text-sm font-semibold text-gray-900">
                                {agent.firstName} {agent.lastName}
                              </span>
                            </TableCell>
                            <TableCell className="px-4 py-3">
                              <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                <Phone className="w-3 h-3 text-gray-400" />
                                {agent.phone}
                              </div>
                            </TableCell>
                            <TableCell className="px-4 py-3">
                              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                <MapPin className="w-3 h-3 text-gray-400" />
                                {agent.city}, {agent.region}
                              </div>
                            </TableCell>
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

      {/* SMS Logs */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Notification History</h2>
            <p className="text-xs text-gray-500 mt-0.5">{logsTotal} messages sent total</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={logsStatusFilter} onValueChange={(v) => { setLogsStatusFilter(v); setLogsPage(1); }}>
              <SelectTrigger className="w-40 h-9 bg-gray-50 border-gray-200 rounded-lg text-xs font-medium">
                <Filter className="w-3 h-3 mr-2 text-gray-400" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchLogs}
              className="h-9 border-gray-200 text-gray-600 font-bold"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        <Card className="border-gray-200 shadow-sm rounded-xl overflow-hidden">
          <CardContent className="p-0">
            {loadingLogs ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 text-deep-sky-blue animate-spin" />
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No messages sent yet</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-gray-50/60">
                      <TableRow>
                        <TableHead className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Recipient</TableHead>
                        <TableHead className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Message</TableHead>
                        <TableHead className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Status</TableHead>
                        <TableHead className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Sent At</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {logs.map((log) => (
                        <TableRow key={log.id} className="hover:bg-gray-50/50 transition-colors">
                          <TableCell className="px-6 py-4">
                            <div className="flex flex-col">
                              {log.agentName && (
                                <span className="text-sm font-semibold text-gray-900">{log.agentName}</span>
                              )}
                              <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                                <Phone className="w-3 h-3" />
                                {log.recipient}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="px-6 py-4">
                            <p className="text-sm text-gray-700 max-w-xs truncate" title={log.message}>
                              {log.message}
                            </p>
                          </TableCell>
                          <TableCell className="px-6 py-4">
                            {log.status === 'success' ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-100">
                                <CheckCircle2 className="w-3 h-3" />
                                Delivered
                              </span>
                            ) : (
                              <div>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-100">
                                  <XCircle className="w-3 h-3" />
                                  Failed
                                </span>
                                {log.errorMessage && (
                                  <p className="text-xs text-red-400 mt-1">{log.errorMessage}</p>
                                )}
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="px-6 py-4 text-sm text-gray-500">
                            {new Date(log.createdAt).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      Page {logsPage} of {totalPages} · {logsTotal} total
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={logsPage === 1}
                        onClick={() => setLogsPage((p) => p - 1)}
                        className="h-8 px-3 border-gray-200 text-gray-600"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={logsPage === totalPages}
                        onClick={() => setLogsPage((p) => p + 1)}
                        className="h-8 px-3 border-gray-200 text-gray-600"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

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
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-amber-400" />
                {recipients.length} SMS credit{recipients.length !== 1 ? 's' : ''} will be consumed
              </p>
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
    </div>
  );
}
