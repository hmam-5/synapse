import { BarChart3, TrendingUp, Users, CheckCircle2 } from 'lucide-react'

export default function DashboardPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
        <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium shadow-sm hover:bg-primary/90 transition-colors">
          New Project
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Total Projects" value="12" icon={<BarChart3 className="w-4 h-4 text-muted-foreground" />} trend="+2 this week" />
        <StatCard title="Active Tasks" value="48" icon={<CheckCircle2 className="w-4 h-4 text-muted-foreground" />} trend="-5 this week" />
        <StatCard title="Team Members" value="24" icon={<Users className="w-4 h-4 text-muted-foreground" />} trend="Stable" />
        <StatCard title="Completion Rate" value="84%" icon={<TrendingUp className="w-4 h-4 text-muted-foreground" />} trend="+12% from last month" />
      </div>

      {/* Recent Activity & Quick Tasks */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 border border-border bg-card rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Recent Projects</h3>
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-border/50 hover:bg-muted/50 transition-colors cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${i % 2 === 0 ? 'bg-blue-500/10 text-blue-500' : 'bg-purple-500/10 text-purple-500'}`}>
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">Project Alpha {i}</h4>
                    <p className="text-sm text-muted-foreground">Updated 2 hours ago</p>
                  </div>
                </div>
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full border-2 border-background bg-secondary" />
                  <div className="w-8 h-8 rounded-full border-2 border-background bg-secondary" />
                  <div className="w-8 h-8 rounded-full border-2 border-background bg-secondary" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-border bg-card rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Priority Tasks</h3>
          <div className="space-y-4">
             {[1, 2, 3, 4, 5].map(i => (
               <div key={i} className="flex items-start gap-3">
                 <div className="mt-0.5 w-4 h-4 rounded border border-border flex-shrink-0" />
                 <div>
                   <p className="text-sm font-medium leading-none mb-1">Finalize database schema</p>
                   <p className="text-xs text-muted-foreground">Due Tomorrow</p>
                 </div>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon, trend }: { title: string, value: string, icon: React.ReactNode, trend: string }) {
  return (
    <div className="p-6 border border-border bg-card rounded-2xl shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        {icon}
      </div>
      <div className="text-3xl font-bold mb-1">{value}</div>
      <p className="text-xs text-muted-foreground">{trend}</p>
    </div>
  )
}
