import { create } from 'zustand'

type WorkspaceState = {
  activeOrganizationId: string | null
  setActiveOrganizationId: (id: string) => void
  isSidebarOpen: boolean
  toggleSidebar: () => void
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  activeOrganizationId: null,
  setActiveOrganizationId: (id) => set({ activeOrganizationId: id }),
  isSidebarOpen: true,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
}))
