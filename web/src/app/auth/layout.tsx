export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 relative bg-background">
      {/* Sidebar/Image side */}
      <div className="hidden md:flex relative flex-col justify-between bg-muted/10 p-10 border-r border-border/50 overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 blur-[100px] rounded-full mix-blend-screen pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 font-bold text-2xl tracking-tight">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground text-lg">S</span>
            </div>
            Synapse
          </div>
        </div>
        <div className="relative z-10 space-y-4">
          <blockquote className="text-xl font-medium leading-relaxed text-foreground">
            "Synapse transformed the way our enterprise scales operations securely. The granular RBAC and true multi-tenancy are unparalleled."
          </blockquote>
          <p className="text-muted-foreground">— Enterprise IT Director</p>
        </div>
      </div>
      
      {/* Form side */}
      <div className="flex items-center justify-center p-8 relative">
        <div className="w-full max-w-[400px]">
          {children}
        </div>
      </div>
    </div>
  )
}
