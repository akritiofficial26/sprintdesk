import { useToastStore } from "../../store/toastStore";

export function useToast() {
  const showToast = useToastStore((s) => s.showToast);
  const dismissToast = useToastStore((s) => s.dismissToast);
  return { showToast, dismissToast };
}
