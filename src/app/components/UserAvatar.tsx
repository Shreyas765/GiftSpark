"use client";

import { useSession } from "next-auth/react";

export default function UserAvatar() {
  const { data: session } = useSession();

  if (!session?.user) return null;

  const isGoogleUser = session.user.image;
  const userName = session.user.name || session.user.email || '';
  const firstLetter = userName.charAt(0).toUpperCase();

  return (
    <div className="relative group">
      <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-r from-pink-100 to-orange-100 flex items-center justify-center ring-2 ring-orange-100">
        {isGoogleUser ? (
          <img 
            src={session.user.image!}
            alt={userName}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-lg font-semibold text-pink-600">
            {firstLetter || 'U'}
          </span>
        )}
      </div>
      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <div className="p-3 border-b border-gray-100">
          <p className="text-sm font-medium text-gray-900 truncate">{userName}</p>
          <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
        </div>
      </div>
    </div>
  );
}