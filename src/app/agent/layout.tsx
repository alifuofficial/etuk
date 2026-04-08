import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export default async function AgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin');
  }

  if (session.user.role !== 'AGENT') {
    redirect('/');
  }

  // Check if agent portal is globally enabled
  const portalSetting = await db.setting.findUnique({
    where: { key: 'isAgentPortalEnabled' }
  });
  
  if (portalSetting?.value === 'false') {
    redirect('/');
  }

  // Check if this specific agent user is active
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { isActive: true }
  });

  if (!user || !user.isActive) {
    redirect('/auth/login?error=AccountDisabled');
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Basic Sidebar or Header for Agent */}
      <header className="bg-white border-b border-gray-100 h-16 flex items-center px-8 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-deep-sky-blue rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-xs">A</span>
          </div>
          <span className="font-bold text-gray-900">Agent Portal</span>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <span className="text-sm font-medium text-gray-600">{session.user.email}</span>
        </div>
      </header>

      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
