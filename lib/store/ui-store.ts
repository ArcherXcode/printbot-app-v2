import { create } from "zustand";

export type ToastKind = "success" | "error" | "info";

export type ToastMessage = {
  id: string;
  title: string;
  description?: string;
  kind: ToastKind;
};

type UiStore = {
  sidebarOpen: boolean;
  mobileSidebarOpen: boolean;
  toasts: ToastMessage[];
  setSidebarOpen: (next: boolean) => void;
  toggleSidebar: () => void;
  setMobileSidebarOpen: (next: boolean) => void;
  toggleMobileSidebar: () => void;
  closeMobileSidebar: () => void;
  pushToast: (toast: Omit<ToastMessage, "id">) => void;
  dismissToast: (id: string) => void;
  isFirstLaunch: boolean | null;
  setIsFirstLaunch: (next: boolean | null) => void;
};

export const useUiStore = create<UiStore>((set, get) => ({
  sidebarOpen: false,
  mobileSidebarOpen: false,
  toasts: [],
  isFirstLaunch: null,
  setIsFirstLaunch: (next) => set({ isFirstLaunch: next }),
  setSidebarOpen: (next) => set({ sidebarOpen: next }),
  toggleSidebar: () => set({ sidebarOpen: !get().sidebarOpen }),
  setMobileSidebarOpen: (next) => set({ mobileSidebarOpen: next }),
  toggleMobileSidebar: () => set({ mobileSidebarOpen: !get().mobileSidebarOpen }),
  closeMobileSidebar: () => set({ mobileSidebarOpen: false }),
  pushToast: (toast) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

    set((state) => ({
      toasts: [...state.toasts, { id, ...toast }],
    }));

    setTimeout(() => {
      get().dismissToast(id);
    }, 3500);
  },
  dismissToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },
}));
