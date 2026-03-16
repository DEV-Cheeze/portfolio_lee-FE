"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const TOAST_DURATION = 3500;
const EXIT_DURATION = 400;

const TOAST_COLORS: Record<ToastType, { border: string; bar: string }> = {
  success: {
    border: "border-emerald-500/30",
    bar: "bg-emerald-500",
  },
  error: {
    border: "border-destructive/30",
    bar: "bg-destructive",
  },
  info: {
    border: "border-primary/30",
    bar: "bg-primary",
  },
};

function ToastItem({
  toast,
  onRemove,
}: {
  toast: Toast;
  onRemove: (id: string) => void;
}) {
  const [phase, setPhase] = useState<"enter" | "idle" | "exit">("enter");
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Trigger enter -> idle on next frame
    const enterFrame = requestAnimationFrame(() => {
      setPhase("idle");
    });

    // Start exit animation before removal
    const exitTimer = setTimeout(() => {
      setPhase("exit");
    }, TOAST_DURATION - EXIT_DURATION);

    // Remove from DOM
    const removeTimer = setTimeout(() => {
      onRemove(toast.id);
    }, TOAST_DURATION);

    return () => {
      cancelAnimationFrame(enterFrame);
      clearTimeout(exitTimer);
      clearTimeout(removeTimer);
    };
  }, [toast.id, onRemove]);

  // Start the progress bar shrink after mount
  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;
    // Force reflow, then animate
    bar.getBoundingClientRect();
    bar.style.transition = `width ${TOAST_DURATION - EXIT_DURATION}ms linear`;
    bar.style.width = "0%";
  }, []);

  const handleClose = () => {
    setPhase("exit");
    setTimeout(() => onRemove(toast.id), EXIT_DURATION);
  };

  const icon = {
    success: <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500" />,
    error: <XCircle className="w-5 h-5 shrink-0 text-destructive" />,
    info: <Info className="w-5 h-5 shrink-0 text-primary" />,
  }[toast.type];

  const colors = TOAST_COLORS[toast.type];

  const translateX =
    phase === "enter"
      ? "translate-x-[calc(100%+1rem)]"
      : phase === "exit"
        ? "translate-x-[calc(100%+1rem)]"
        : "translate-x-0";

  const opacity = phase === "enter" || phase === "exit" ? "opacity-0" : "opacity-100";

  return (
    <div
      className={`relative overflow-hidden flex flex-col bg-popover backdrop-blur-xl border ${colors.border} rounded-xl shadow-lg max-w-sm w-full ${translateX} ${opacity}`}
      style={{
        transition: `transform ${EXIT_DURATION}ms cubic-bezier(0.32, 0.72, 0, 1), opacity ${EXIT_DURATION}ms ease`,
      }}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        {icon}
        <p className="text-sm text-foreground flex-1 leading-relaxed">{toast.message}</p>
        <button
          type="button"
          onClick={handleClose}
          className="p-1 text-muted-foreground hover:text-foreground rounded-md transition-colors shrink-0"
          aria-label="닫기"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      {/* Progress bar */}
      <div className="h-[3px] w-full bg-muted/50">
        <div
          ref={barRef}
          className={`h-full ${colors.bar} rounded-full`}
          style={{ width: "100%" }}
        />
      </div>
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {mounted &&
        createPortal(
          <div
            className="fixed top-20 right-4 z-[9999] flex flex-col gap-2 pointer-events-none"
            aria-live="polite"
            role="status"
          >
            {toasts.map((toast) => (
              <div key={toast.id} className="pointer-events-auto">
                <ToastItem toast={toast} onRemove={removeToast} />
              </div>
            ))}
          </div>,
          document.body,
        )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
