import React from "react";
import { CheckCircle, RefreshCw, Trash2 } from "lucide-react";
import { Notification } from "@/types/notification";

interface NotificationActionsProps {
  notification: Notification;
  onToggleRead: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
}

const NotificationActions = ({ 
  notification, 
  onToggleRead, 
  onDelete 
}: NotificationActionsProps) => (
  <div className="absolute top-2 right-2 flex gap-1">
    <button
      onClick={onToggleRead}
      className="p-1 rounded-full bg-black-1/50 hover:bg-orange-1/20 transition-colors"
      title={notification.isRead ? "Mark as unread" : "Mark as read"}
    >
      {notification.isRead ? (
        <RefreshCw size={18} className="text-orange-1" />
      ) : (
        <CheckCircle size={18} className="text-orange-1" />
      )}
    </button>
    <button
      onClick={onDelete}
      className="p-1 rounded-full bg-black-1/50 hover:bg-red-500/20 transition-colors"
      title="Delete notification"
    >
      <Trash2 size={18} className="text-red-500" />
    </button>
  </div>
);

export default NotificationActions;