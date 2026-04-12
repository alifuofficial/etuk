import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Boxes, TrendingUp, User, MapPin } from 'lucide-react';

export default async function AgentDashboard() {
  const session = await getServerSession(authOptions);
  
  const agent = await db.agent.findUnique({
    where: { userId: session?.user?.id },
    include: {
      units: true,
      inventory: {
        include: { product: true }
      }
    }
  });

  if (!agent) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Agent Profile Not Linked</h1>
        <p className="text-gray-500 max-w-md mx-auto mt-2">
          Your account is registered as an agent but no profile was found. Please contact support.
        </p>
      </div>
    );
  }

  const totalInventory = agent.inventory.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">
          Welcome, {agent.firstName}!
        </h1>
        <p className="text-gray-500 font-medium">Manage your inventory and track your sales from this dashboard.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={<Boxes className="w-5 h-5 text-deep-sky-blue" />}
          label="Total Inventory" 
          value={totalInventory.toString()} 
          sub="Items in stock"
        />
        <StatCard 
          icon={<TrendingUp className="w-5 h-5 text-emerald-500" />}
          label="Sales Performance" 
          value="0" 
          sub="Total sales recorded"
        />
        <StatCard 
          icon={<User className="w-5 h-5 text-amber-500" />}
          label="Status" 
          value={agent.status} 
          sub="Current account status"
        />
        <StatCard 
          icon={<MapPin className="w-5 h-5 text-purple-500" />}
          label="Active Zone" 
          value={agent.city} 
          sub={agent.region}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-none shadow-xl shadow-gray-100 rounded-3xl overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-gray-100 p-8">
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-gray-400">Inventory Status</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            {agent.inventory.length === 0 ? (
              <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-2xl">
                <p className="text-gray-400 font-bold">No inventory assigned yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {agent.inventory.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-gray-100 shadow-sm">
                        <Boxes className="w-6 h-6 text-deep-sky-blue" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-gray-900">{item.product.name}</p>
                        <p className="text-[10px] text-gray-500 font-bold uppercase">{item.product.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black text-gray-900">{item.quantity}</p>
                      <p className="text-[10px] text-gray-500 font-bold">UNITS</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl shadow-gray-100 rounded-3xl overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-gray-100 p-8">
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-gray-400">Profile Overview</CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="flex flex-col items-center py-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center border-4 border-white shadow-lg text-3xl font-black text-deep-sky-blue">
                {agent.firstName[0]}{agent.lastName[0]}
              </div>
              <h3 className="mt-4 font-black text-gray-900">{agent.firstName} {agent.lastName}</h3>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">{agent.businessName || 'Independent Agent'}</p>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-gray-400 uppercase tracking-wider">Email</span>
                <span className="font-bold text-gray-900">{agent.email}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-gray-400 uppercase tracking-wider">Phone</span>
                <span className="font-bold text-gray-900">{agent.phone}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-gray-400 uppercase tracking-wider">TIN</span>
                <span className="font-bold text-gray-900">{agent.tinNumber || 'N/A'}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, sub }: { icon: any, label: string, value: string, sub: string }) {
  return (
    <Card className="border-none shadow-xl shadow-gray-100 rounded-3xl p-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center">
          {icon}
        </div>
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
          <p className="text-2xl font-black text-gray-900">{value}</p>
          <p className="text-[10px] text-gray-500 font-medium">{sub}</p>
        </div>
      </div>
    </Card>
  );
}
