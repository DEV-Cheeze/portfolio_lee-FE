"use client";

import { Bell, Info, CheckCircle2, MessageSquare, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";

type NotificationItem = {
  id: number;
  type: "info" | "message" | "success" | "warning";
  title: string;
  message: string;
  date: string;
  isRead: boolean;
  icon: typeof Info;
};

const initialNotifications: NotificationItem[] = [];

export function NotificationsContent() {
  const [notifications, setNotifications] = useState(initialNotifications);

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-muted-foreground" />
          <span className="text-muted-foreground text-sm font-medium">
            새 알림 <span className="text-primary font-bold">{unreadCount}</span>건
          </span>
        </div>
        {unreadCount > 0 && (
          <button 
            onClick={markAllAsRead}
            className="text-xs text-primary hover:text-primary/80 transition-colors"
          >
            모두 읽음 처리
          </button>
        )}
      </div>

      <div className="space-y-4">
        {notifications.map((notification) => {
          const Icon = notification.icon;
          return (
            <Card 
              key={notification.id} 
              className={`transition-all duration-300 hover:shadow-md border-glass-border ${
                !notification.isRead ? "bg-primary/10 border-primary/20" : "bg-white/5 dark:bg-black/5"
              }`}
              onClick={() => markAsRead(notification.id)}
            >
              <CardContent className="p-5 flex gap-4 items-start cursor-pointer">
                <div className={`p-2 rounded-full mt-0.5 ${
                  notification.type === 'info' ? 'bg-blue-500/10 text-blue-500' :
                  notification.type === 'message' ? 'bg-purple-500/10 text-purple-500' :
                  notification.type === 'success' ? 'bg-green-500/10 text-green-500' :
                  'bg-orange-500/10 text-orange-500'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className={`font-semibold text-base ${!notification.isRead ? 'text-foreground' : 'text-foreground/80'}`}>
                      {notification.title}
                    </h3>
                    <span className="text-xs text-muted-foreground">{notification.date}</span>
                  </div>
                  <p className={`text-sm ${!notification.isRead ? 'text-foreground/90' : 'text-muted-foreground'}`}>
                    {notification.message}
                  </p>
                </div>
                {!notification.isRead && (
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {notifications.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          <Bell className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p>새로운 알림이 없습니다.</p>
        </div>
      )}
    </div>
  );
}