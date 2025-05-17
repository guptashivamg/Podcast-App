import React from "react";
import Image from "next/image";
import Link from "next/link";
import { User } from "lucide-react";

interface UserCardProps {
  user: {
    clerkId: string;
    name: string;
    imageUrl?: string;
    isVerified?: boolean;
    totalPodcasts?: number;
    followersCount?: number;
    averageRating?: number;
    followedAt?: number;
  };
  activeTab: "followers" | "following" | "topPodcasters";
}

const UserCard = ({ user, activeTab }: UserCardProps) => {
  return (
    <Link
      href={`/profile/${user.clerkId}`}
      className="bg-black-1/30 border border-gray-800 rounded-xl p-4 transition-all hover:bg-black-1/50 flex items-center gap-4"
    >
      {/* User avatar */}
      <div className="flex-shrink-0">
        {user.imageUrl ? (
          <Image
            src={user.imageUrl}
            alt={user.name}
            width={56}
            height={56}
            className="rounded-full"
          />
        ) : (
          <div className="w-14 h-14 bg-black-1/50 rounded-full flex items-center justify-center">
            <User size={24} className="text-orange-1" />
          </div>
        )}
      </div>

      {/* User info */}
      <div className="flex-1">
        <h3 className="font-semibold text-white-1 text-lg flex items-center gap-1">
          {user.name}
          {user.isVerified && (
            <Image 
              src="/icons/verified.svg"
              alt="Verified"
              width={16}
              height={16}
              className="inline-block"
              title="Verified Podcaster"
            />
          )}
        </h3>
        {activeTab === "topPodcasters" ? (
          <div className="flex flex-col">
            <p className="text-white-3 text-sm">
              {user.totalPodcasts} podcasts • {user.followersCount || 0} followers
            </p>
            {user.averageRating > 0 && (
              <p className="text-orange-1 text-sm">
                Rating: {user.averageRating.toFixed(1)} ★
              </p>
            )}
          </div>
        ) : (
          <p className="text-white-3 text-sm">
            {/* {user.followedAt && new Date(user.followedAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })} */}
          </p>
        )}
      </div>
    </Link>
  );
};

export default UserCard;