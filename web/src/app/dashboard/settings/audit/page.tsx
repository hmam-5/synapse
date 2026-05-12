import { ScrollText, Clock, User, Activity } from 'lucide-react'
import { getAuditLogs } from '../actions'

export default async function AuditLogPage() {
  let logs: Awaited<ReturnType<typeof getAuditLogs>> = []

  try {
    logs = await getAuditLogs()
  } catch {
    // Table might not exist yet
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold">Audit Log</h2>
        <p className="text-sm text-muted-foreground mt-1">Track all actions across your organization</p>
      </div>

      {logs.length === 0 ? (
        <div className="border border-dashed border-border rounded-2xl p-16 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-muted flex items-center justify-center">
            <ScrollText className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold">No audit logs yet</h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Actions performed in your organization will appear here for compliance tracking.
          </p>
        </div>
      ) : (
        <div className="border border-border bg-card rounded-2xl shadow-sm overflow-hidden">
          <div className="divide-y divide-border">
            {logs.map((log) => (
              <div key={log.id} className="flex items-start gap-4 p-4 px-6 hover:bg-muted/30 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mt-0.5 shrink-0">
                  <Activity className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-medium">{log.action}</span>
                    <span className="text-xs bg-secondary px-2 py-0.5 rounded-md text-muted-foreground">
                      {log.resource_type}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {log.actor?.full_name || log.actor?.email || 'System'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(log.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
