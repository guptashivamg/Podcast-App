import React from "react";
import { Bell, Headphones, User } from "lucide-react";
import { NotificationType } from "@/types/notification";

interface NotificationIconProps {
  type: NotificationType;
}

const NotificationIcon = ({ type }: NotificationIconProps) => (
  <div className="bg-black-1/50 p-3 rounded-full">
    {type === "new_podcast" ? (
      <Headphones size={24} className="text-orange-1" />
    ) : type === "follow" ? (
      <User size={24} className="text-orange-1" />
    ) : (
      <Bell size={24} className="text-orange-1" />
    )}
  </div>
);

export default NotificationIcon;