'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
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
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Shield,
  Users,
  ShieldAlert,
  UserPlus
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  phone: string | null;
  isActive: boolean;
  createdAt: string;
}

export default function UsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/admin');
    }
  }, [session, status, router]);

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [showDialog, setShowDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'MARKETING_OFFICER',
    phone: '',
    isActive: true,
  });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setUsers(data);
        } else {
          console.error('API response is not an array:', data);
          setUsers([]);
        }
      } else {
        const errorData = await response.json();
        console.error('Failed to fetch users:', errorData);
        setUsers([]);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      const url = editingUser ? `/api/users/${editingUser.id}` : '/api/users';
      const method = editingUser ? 'PUT' : 'POST';
      
      const body: Record<string, unknown> = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        phone: formData.phone || null,
        isActive: formData.isActive,
      };
      
      if (formData.password) {
        body.password = formData.password;
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        toast({
          title: editingUser ? 'User updated' : 'User created',
          description: `User account has been ${editingUser ? 'updated' : 'created'} successfully.`,
        });
        fetchUsers();
        setShowDialog(false);
        resetForm();
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.error || 'Failed to save user.',
          variant: 'destructive',
        });
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to communicate with the server.',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: 'User deleted',
          description: 'User has been removed from the system.',
        });
        fetchUsers();
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.error || 'Failed to delete user.',
          variant: 'destructive',
        });
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to delete user.',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'MARKETING_OFFICER',
      phone: '',
      isActive: true,
    });
    setEditingUser(null);
  };

  const openEditDialog = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      phone: user.phone || '',
      isActive: user.isActive,
    });
    setShowDialog(true);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'text-red-700 bg-red-50 border-red-100';
      case 'MARKETING_MANAGER':
        return 'text-purple-700 bg-purple-50 border-purple-100';
      case 'MARKETING_OFFICER':
        return 'text-blue-700 bg-blue-50 border-blue-100';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-100';
    }
  };

  const filteredUsers = Array.isArray(users) ? users.filter((user) => {
    const searchLower = search.toLowerCase();
    const nameStr = user.name || '';
    const emailStr = user.email || '';
    const matchesSearch =
      nameStr.toLowerCase().includes(searchLower) ||
      emailStr.toLowerCase().includes(searchLower);
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  }) : [];

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-deepSkyBlue" />
        <p className="text-sm text-gray-600">Verifying access...</p>
      </div>
    );
  }

  if (session?.user?.role !== 'ADMIN') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8 text-red-500" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Access Denied</h2>
          <p className="text-gray-500 text-sm max-w-xs mx-auto mt-1">Only administrative users can manage user permissions.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-5 h-5 text-deepSkyBlue" />
            <h1 className="text-2xl font-bold text-gray-900">User Accounts</h1>
          </div>
          <p className="text-sm text-gray-500">Manage administrative access and system staff roles.</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setShowDialog(true);
          }}
          className="bg-gray-900 hover:bg-black text-white font-bold h-12 px-8 rounded-xl shadow-lg shadow-gray-200 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Add New User
        </Button>
      </div>

      {/* Filters Bar */}
      <Card className="border-gray-200 shadow-sm rounded-xl">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 h-11 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:bg-white focus:border-deepSkyBlue focus:ring-4 focus:ring-deepSkyBlue/5 outline-none transition-all"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-56 h-11 bg-gray-50 border-gray-200 rounded-lg text-sm font-medium">
                <SelectValue placeholder="System Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="MARKETING_MANAGER">Marketing Manager</SelectItem>
                <SelectItem value="MARKETING_OFFICER">Marketing Officer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="border-gray-200 shadow-sm rounded-xl overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
             <div className="flex flex-col items-center justify-center py-24 gap-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-deepSkyBlue" />
                <p className="text-sm text-gray-600">Syncing directory...</p>
             </div>
          ) : filteredUsers.length === 0 ? (
             <div className="text-center py-24">
              <Users className="w-12 h-12 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">No users found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50/50">
                  <TableRow>
                    <TableHead className="px-6 py-4 font-bold text-xs uppercase text-gray-600">User</TableHead>
                    <TableHead className="px-6 py-4 font-bold text-xs uppercase text-gray-600">Role</TableHead>
                    <TableHead className="px-6 py-4 font-bold text-xs uppercase text-gray-600">Phone</TableHead>
                    <TableHead className="px-6 py-4 font-bold text-xs uppercase text-gray-600">Status</TableHead>
                    <TableHead className="px-6 py-4 font-bold text-xs uppercase text-gray-600">Created</TableHead>
                    <TableHead className="px-6 py-4 text-right"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} className="hover:bg-gray-50/50 transition-colors border-gray-100">
                      <TableCell className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10 border border-gray-100 border-dashed">
                            <AvatarFallback className="bg-amber-50 text-amber-600 font-bold text-xs">
                              {user.name ? user.name[0] : '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-900">{user.name}</span>
                            <span className="text-xs text-gray-500">{user.email}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-5">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getRoleBadge(user.role)}`}>
                          {user.role.replace('_', ' ')}
                        </span>
                      </TableCell>
                      <TableCell className="px-6 py-5 text-sm text-gray-600 font-medium">
                        {user.phone || '-'}
                      </TableCell>
                      <TableCell className="px-6 py-5">
                        <div className="flex items-center gap-2">
                           <div className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
                           <span className={`text-[11px] font-bold uppercase ${user.isActive ? 'text-green-600' : 'text-gray-400'}`}>
                             {user.isActive ? 'Active' : 'Inactive'}
                           </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-5 text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-400 hover:text-deepSkyBlue hover:bg-blue-50 h-9 w-9 p-0 rounded-lg"
                            onClick={() => openEditDialog(user)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`h-9 w-9 p-0 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 ${user.id === session?.user?.id ? 'opacity-20 cursor-not-allowed' : ''}`}
                            onClick={() => handleDelete(user.id)}
                            disabled={user.id === session?.user?.id}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
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

      {/* User Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-xl p-0 overflow-hidden rounded-2xl border-none shadow-2xl">
          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-8 py-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-deepSkyBlue/10 rounded-full -translate-y-16 translate-x-16 blur-2xl" />
            <DialogHeader className="relative z-10 flex flex-row items-center gap-5">
                <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10 shrink-0">
                    <UserPlus className="w-7 h-7 text-deepSkyBlue" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold tracking-tight">
                      {editingUser ? 'Update Employee Account' : 'Onboard New User'}
                  </DialogTitle>
                  <DialogDescription className="text-gray-400 text-xs font-medium mt-1">
                      {editingUser
                          ? `Modify credentials for ${editingUser.name}.`
                          : 'Set up a new administrative account with specific system permissions.'}
                  </DialogDescription>
                </div>
            </DialogHeader>
          </div>

          <form onSubmit={handleSubmit} className="p-8 bg-white space-y-8">
            <div className="space-y-6">
                {/* Identity Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                      <Label htmlFor="name" className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] pl-1">Full Identity</Label>
                      <Input
                          id="name"
                          placeholder="e.g. John Doe"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="h-12 bg-gray-50/50 border-gray-200 rounded-xl font-medium px-4 focus:bg-white focus:border-deepSkyBlue focus:ring-4 focus:ring-deepSkyBlue/5 transition-all shadow-none"
                          required
                      />
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="role" className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] pl-1">System Privilege</Label>
                      <Select
                          value={formData.role}
                          onValueChange={(value) => setFormData({ ...formData, role: value })}
                      >
                          <SelectTrigger className="h-12 bg-gray-50/50 border-gray-200 rounded-xl font-medium px-4 focus:ring-4 focus:ring-deepSkyBlue/5 transition-all">
                              <SelectValue placeholder="Assign Role" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-gray-200 shadow-xl mt-2">
                              <SelectItem value="ADMIN" className="py-3 font-medium">Administrator</SelectItem>
                              <SelectItem value="MARKETING_MANAGER" className="py-3 font-medium">Marketing Manager</SelectItem>
                              <SelectItem value="MARKETING_OFFICER" className="py-3 font-medium">Marketing Officer</SelectItem>
                          </SelectContent>
                      </Select>
                  </div>
                </div>

                {/* Contact Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                      <Label htmlFor="email" className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] pl-1">Contact Email</Label>
                      <Input
                          id="email"
                          type="email"
                          placeholder="name@company.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="h-12 bg-gray-50/50 border-gray-200 rounded-xl font-medium px-4 focus:bg-white focus:border-deepSkyBlue focus:ring-4 focus:ring-deepSkyBlue/5 transition-all shadow-none"
                          required
                      />
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="phone" className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] pl-1">Phone Number</Label>
                      <Input
                          id="phone"
                          type="tel"
                          placeholder="+251 ..."
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="h-12 bg-gray-50/50 border-gray-200 rounded-xl font-medium px-4 focus:bg-white focus:border-deepSkyBlue focus:ring-4 focus:ring-deepSkyBlue/5 transition-all shadow-none"
                      />
                  </div>
                </div>

                {/* Security Section */}
                <div className="space-y-2">
                    <Label htmlFor="password" className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] pl-1">
                        Security Phrase {editingUser && <span className="text-deepSkyBlue lowercase font-medium ml-1 bg-blue-50 px-2 py-0.5 rounded-full">(leave blank to keep current)</span>}
                    </Label>
                    <Input
                        id="password"
                        type="password"
                        placeholder={editingUser ? "••••••••" : "Require 8+ characters"}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="h-12 bg-gray-50/50 border-gray-200 rounded-xl font-medium px-4 focus:bg-white focus:border-deepSkyBlue focus:ring-4 focus:ring-deepSkyBlue/5 transition-all shadow-none"
                        required={!editingUser}
                    />
                </div>

                {/* Status Section */}
                <div className="flex items-center justify-between p-5 bg-gray-50/50 rounded-2xl border border-gray-100 group transition-all hover:bg-gray-50">
                    <div className="flex flex-col">
                        <Label htmlFor="isActive" className="text-sm font-bold text-gray-800 cursor-pointer mb-0.5">Account Status</Label>
                        <p className="text-[10px] text-gray-500 font-medium">Control if this user can currently sign in.</p>
                    </div>
                    <div className="relative inline-flex items-center cursor-pointer">
                      <input
                          type="checkbox"
                          id="isActive"
                          checked={formData.isActive}
                          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                          className="w-6 h-6 rounded-lg border-gray-300 text-deepSkyBlue focus:ring-deepSkyBlue transition-all cursor-pointer accent-deepSkyBlue translate-y-[-1px]"
                      />
                    </div>
                </div>
            </div>

            <DialogFooter className="gap-3 sm:gap-2 sm:flex-row flex-col pt-2">
              <Button 
                type="button" 
                variant="ghost" 
                className="h-13 min-h-[52px] flex-1 rounded-xl text-gray-500 font-bold hover:bg-gray-100 transition-all sm:order-1" 
                onClick={() => setShowDialog(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="h-13 min-h-[52px] flex-[1.5] rounded-xl bg-gray-900 text-white hover:bg-black font-bold shadow-xl shadow-gray-200 transition-all hover:scale-[1.02] active:scale-[0.98] sm:order-2"
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Synchronizing...</span>
                  </div>
                ) : editingUser ? 'Apply Changes' : 'Confirm & Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
