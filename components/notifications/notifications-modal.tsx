"use client";

import { X } from "lucide-react";
import { NotificationsContent } from "./notifications-content";

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationsModal({ isOpen, onClose }: NotificationsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-background/60 backdrop-blur-md transition-opacity animate-in fade-in"
        onClick={onClose}
      />
      <div className="relative w-full max-w-xl max-h-[80vh] bg-background border border-border shadow-2xl rounded-3xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-300">
        <div className="p-6 border-b border-border flex items-center justify-between bg-muted">
          <h2 className="text-xl font-bold tracking-tight text-foreground">Notifications</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-background transition-colors text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 notification-scrollbar bg-background">
          <NotificationsContent />
        </div>
      </div>
    </div>
  );
}
