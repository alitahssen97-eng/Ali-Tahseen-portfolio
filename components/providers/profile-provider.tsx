"use client";

import { createContext, useContext } from "react";

const ProfileImageContext = createContext<string>("");

export function ProfileImageProvider({
  imageUrl,
  children,
}: {
  imageUrl: string;
  children: React.ReactNode;
}) {
  return (
    <ProfileImageContext.Provider value={imageUrl}>
      {children}
    </ProfileImageContext.Provider>
  );
}

export function useProfileImageUrl() {
  return useContext(ProfileImageContext);
}
