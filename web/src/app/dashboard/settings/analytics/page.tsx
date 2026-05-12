import { createClient } from '@/lib/supabase/server'
import { BarChart3, TrendingUp, CheckCircle2, Clock, Users, Folder, Target, Activity } from 'lucide-react'

async function getAnalytics() {
  const supabase = await createClient()

  // Run aggregate queries in parallel for performance
  const [tasksResult, projectsResult, membersResult] = await Promise.allSettled([
    supabase.from('tasks').select('id, status, priority, created_at', { count: 'exact' }),
    supabase.from('projects').select('id, name, status', { count: 'exact' }),
    supabase.from('organization_members').select('id, role', { count: 'exact' }),
  ])

  const tasks = tasksResult.status === 'fulfilled' ? tasksResult.value.data || [] : []
  const projects = projectsResult.status === 'fulfilled' ? projectsResult.value.data || [] : []
  const members = membersResult.status === 'fulfilled' ? membersResult.value.data || [] : []

  // Task metrics
  const totalTasks = tasks.length
  const completedTasks = tasks.filter(t => t.status === 'done').length
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length
  const todoTasks = tasks.filter(t => t.status === 'todo').length
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  // Priority breakdown
  const urgentTasks = tasks.filter(t => t.priority === 'urgent').length
  const highTasks = tasks.filter(t => t.priority === 'high').length
  const mediumTasks = tasks.filter(t => t.priority === 'medium').length
  const lowTasks = tasks.filter(t => t.priority === 'low').length

  // Tasks created per day (last 7 days)
  const today = new Date()
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
  const recentTasks = tasks.filter(t => new Date(t.created_at) >= weekAgo)

  const dailyCreated: Record<string, number> = {}
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today.getTime() - i * 24 * 60 * 60 * 1000)
    const key = d.toLocaleDateString('en-US', { weekday: 'short' })
    dailyCreated[key] = 0
  }
  recentTasks.forEach(t => {
    const key = new Date(t.created_at).toLocaleDateString('en-US', { weekday: 'short' })
    if (key in dailyCreated) dailyCreated[key]++
  })

  // Role distribution
  const roleDistribution: Record<string, number> = {}
  members.forEach(m => {
    roleDistribution[m.role] = (roleDistribution[m.role] || 0) + 1
  })

  return {
    totalTasks,
    completedTasks,
    inProgressTasks,
    todoTasks,
    completionRate,
    totalProjects: projects.length,
    totalMembers: members.length,
    urgentTasks,
    highTasks,
    mediumTasks,
    lowTasks,
    dailyCreated,
    roleDistribution,
  }
}

export default async function AnalyticsPage() {
  const analytics = await getAnalytics()
  const maxDaily = Math.max(...Object.values(analytics.dailyCreated), 1)

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          Analytics
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Workspace performance and productivity insights</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard
          icon={<Target className="w-5 h-5 text-primary" />}
          label="Total Tasks"
          value={analytics.totalTasks.toString()}
          bgColor="bg-primary/10"
        />
        <KpiCard
          icon={<CheckCircle2 className="w-5 h-5 text-green-500" />}
          label="Completed"
          value={analytics.completedTasks.toString()}
          subtitle={`${analytics.completionRate}% rate`}
          bgColor="bg-green-500/10"
        />
        <KpiCard
          icon={<Folder className="w-5 h-5 text-blue-500" />}
          label="Projects"
          value={analytics.totalProjects.toString()}
          bgColor="bg-blue-500/10"
        />
        <KpiCard
          icon={<Users className="w-5 h-5 text-purple-500" />}
          label="Team Members"
          value={analytics.totalMembers.toString()}
          bgColor="bg-purple-500/10"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Task Activity Chart (CSS Bar Chart) */}
        <div className="border border-border bg-card rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold flex items-center gap-2 mb-6">
            <Activity className="w-4 h-4 text-primary" />
            Tasks Created (Last 7 Days)
          </h3>
          <div className="flex items-end gap-2 h-40">
            {Object.entries(analytics.dailyCreated).map(([day, count]) => (
              <div key={day} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">{count}</span>
                <div
                  className="w-full bg-primary/20 rounded-t-md relative overflow-hidden transition-all duration-500"
                  style={{ height: `${Math.max((count / maxDaily) * 100, 4)}%` }}
                >
                  <div
                    className="absolute inset-0 bg-primary rounded-t-md"
                    style={{ opacity: count > 0 ? 1 : 0.3 }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">{day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Task Status Breakdown */}
        <div className="border border-border bg-card rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold flex items-center gap-2 mb-6">
            <TrendingUp className="w-4 h-4 text-primary" />
            Task Status Breakdown
          </h3>
          <div className="space-y-4">
            <StatusBar label="To Do" count={analytics.todoTasks} total={analytics.totalTasks} color="bg-slate-400" />
            <StatusBar label="In Progress" count={analytics.inProgressTasks} total={analytics.totalTasks} color="bg-blue-500" />
            <StatusBar label="Completed" count={analytics.completedTasks} total={analytics.totalTasks} color="bg-green-500" />
          </div>

          {/* Completion Rate Ring */}
          <div className="mt-6 pt-6 border-t border-border flex items-center gap-4">
            <div className="relative w-16 h-16">
              <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-muted/30"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                />
                <path
                  className="text-primary"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeDasharray={`${analytics.completionRate}, 100`}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">
                {analytics.completionRate}%
              </span>
            </div>
            <div>
              <p className="font-medium text-sm">Completion Rate</p>
              <p className="text-xs text-muted-foreground">{analytics.completedTasks} of {analytics.totalTasks} tasks done</p>
            </div>
          </div>
        </div>
      </div>

      {/* Priority & Role Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Priority Breakdown */}
        <div className="border border-border bg-card rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-primary" />
            Priority Distribution
          </h3>
          <div className="space-y-3">
            <PriorityRow label="Urgent" count={analytics.urgentTasks} color="bg-red-500" />
            <PriorityRow label="High" count={analytics.highTasks} color="bg-orange-500" />
            <PriorityRow label="Medium" count={analytics.mediumTasks} color="bg-yellow-500" />
            <PriorityRow label="Low" count={analytics.lowTasks} color="bg-green-500" />
          </div>
        </div>

        {/* Team Role Distribution */}
        <div className="border border-border bg-card rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-primary" />
            Team Roles
          </h3>
          {Object.keys(analytics.roleDistribution).length === 0 ? (
            <p className="text-sm text-muted-foreground">No team members yet</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(analytics.roleDistribution).map(([role, count]) => (
                <div key={role} className="flex items-center justify-between">
                  <span className="text-sm capitalize">{role.replace('_', ' ')}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${(count / analytics.totalMembers) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-muted-foreground w-6 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function KpiCard({ icon, label, value, subtitle, bgColor }: {
  icon: React.ReactNode
  label: string
  value: string
  subtitle?: string
  bgColor: string
}) {
  return (
    <div className="border border-border bg-card rounded-2xl p-5 shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-lg ${bgColor} flex items-center justify-center`}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      {subtitle && <p className="text-xs text-green-500 font-medium mt-1">{subtitle}</p>}
    </div>
  )
}

function StatusBar({ label, count, total, color }: {
  label: string
  count: number
  total: number
  color: string
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div>
      <div className="flex justify-between text-sm mb-1.5">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">{count} ({pct}%)</span>
      </div>
      <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function PriorityRow({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
        <span className="text-sm">{label}</span>
      </div>
      <span className="text-sm font-semibold">{count}</span>
    </div>
  )
}
