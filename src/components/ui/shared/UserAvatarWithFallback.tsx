"use client";
import React, { useState } from "react";
import Image from "next/image";

interface UserAvatarProps {
  initialImageUrl?: string | null;
  fullName: string;
  w?: number;
  h?: number;
}
const DEFAULT_AVATAR_URL = process.env.NEXT_PUBLIC_DEFAULT_AVATAR_URL || "/default-avatar.png";

const UserAvatarWithFallback: React.FC<UserAvatarProps> = ({
  initialImageUrl,
  fullName,
  w = 32,
  h = 32,
}) => {
  const [imageSrc, setImageSrc] = useState(initialImageUrl || DEFAULT_AVATAR_URL);

  return (
    <Image
      src={imageSrc}
      alt={`${fullName}'s Profile`}
      width={w}
      height={h}
      className="rounded-full object-cover"
      onError={() => {
        if (imageSrc !== DEFAULT_AVATAR_URL) {
          setImageSrc(DEFAULT_AVATAR_URL);
        }
      }}
    />
  );
};

export default UserAvatarWithFallback;
