import Swal, { SweetAlertOptions } from "sweetalert2";

export interface ConfirmDialogOptions {
  title?: string;
  text?: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
}

const getIsDark = () => {
  if (typeof document !== "undefined") {
    return document.documentElement.classList.contains("dark");
  }
  return false;
};

const getThemeStyles = () => {
  const isDark = getIsDark();
  return {
    background: isDark ? "#111827" : "#ffffff",
    color: isDark ? "#f8fafc" : "#0f172a",
    confirmButtonColor: "#2563eb",
    cancelButtonColor: "#475569",
    customClass: {
      popup: isDark ? "border border-[#2a3952] rounded-xl shadow-2xl text-sm" : "border border-slate-200 rounded-xl shadow-xl text-sm",
    },
  };
};

export const showAlert = {
  success: (title: string, text?: string) => {
    const { background, color } = getThemeStyles();
    return Swal.fire({
      icon: "success",
      title,
      text,
      background,
      color,
      confirmButtonColor: "#16a34a",
    });
  },

  toast: (title: string, text?: string) => {
    const { background, color } = getThemeStyles();
    return Swal.fire({
      icon: "success",
      title,
      text,
      background,
      color,
      timer: 1500,
      timerProgressBar: true,
      showConfirmButton: false,
    });
  },

  error: (title: string, text?: string) => {
    const { background, color } = getThemeStyles();
    return Swal.fire({
      icon: "error",
      title,
      text,
      background,
      color,
      confirmButtonColor: "#dc2626",
    });
  },

  warning: (title: string, text?: string) => {
    const { background, color } = getThemeStyles();
    return Swal.fire({
      icon: "warning",
      title,
      text,
      background,
      color,
      confirmButtonColor: "#ea580c",
    });
  },

  info: (title: string, text?: string) => {
    const { background, color } = getThemeStyles();
    return Swal.fire({
      icon: "info",
      title,
      text,
      background,
      color,
      confirmButtonColor: "#2563eb",
    });
  },

  confirm: async (options: ConfirmDialogOptions): Promise<boolean> => {
    const { background, color } = getThemeStyles();
    const result = await Swal.fire({
      title: options.title || "Are you sure?",
      text: options.text || "",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: options.confirmButtonText || "Yes, proceed",
      cancelButtonText: options.cancelButtonText || "Cancel",
      reverseButtons: true,
      background,
      color,
    });

    return result.isConfirmed;
  },

  confirmDelete: async (options?: ConfirmDialogOptions): Promise<boolean> => {
    return showAlert.confirm({
      title: options?.title || "Are you sure you want to delete?",
      text: options?.text || "This action cannot be undone.",
      confirmButtonText: options?.confirmButtonText || "Yes, delete",
      cancelButtonText: options?.cancelButtonText || "Cancel",
    });
  },

  confirmLogout: async (options?: ConfirmDialogOptions): Promise<boolean> => {
    const { background, color } = getThemeStyles();
    const result = await Swal.fire({
      title: options?.title || "Confirm Logout",
      text: options?.text || "Are you sure you want to sign out?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#6b7280",
      confirmButtonText: options?.confirmButtonText || "Yes, log out",
      cancelButtonText: options?.cancelButtonText || "Cancel",
      reverseButtons: true,
      background,
      color,
    });

    return result.isConfirmed;
  },
};
