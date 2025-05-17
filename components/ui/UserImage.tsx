import Image from "next/image";
import React from "react";

interface UserImageProps {
  imageUrl: string;
  title: string;
  blurred?: boolean;
  overlay?: boolean;
  className?: string;
}

const UserImage = ({
  imageUrl,
  title,
  blurred = false,
  overlay = false,
  className = "",
}: UserImageProps) => {
  return (
    <div className={`absolute inset-0 ${className}`}>
      <Image
        src={imageUrl}
        alt={title}
        fill
        className={`object-cover ${blurred ? "opacity-60 blur-[1px]" : ""}`}
      />
      {overlay && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/70 to-black/50" />
      )}
    </div>
  );
};

export default UserImage;