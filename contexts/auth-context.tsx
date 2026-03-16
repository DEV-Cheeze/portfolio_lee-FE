"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { toast } from "@/hooks/use-toast";
import {
  buildUserFromToken,
  clearAccessToken,
  clearSessionMarker,
  getLoginRequiredEventName,
  hasSessionMarker,
  markSessionActive,
  setAccessToken,
  startAuthBootstrap,
  finishAuthBootstrap,
} from "@/lib/auth-client";
import { checkNicknameExistsRequest, fetchMyPage, loginRequest, logoutRequest, registerRequest, reissueRequest, updateNicknameRequest, updateProfileImageRequest } from "@/lib/api";
import { DEFAULT_PROFILE_IMAGE, resolveProfileImage } from "@/lib/image-fallbacks";

interface User {
  id: string;
  username: string;
  nickname: string;
  profileImage?: string;
  joinDate: string;
  roles?: string[];
}

interface MyPageUserData {
  username?: string;
  nickname?: string;
  profileImageUrl?: string | null;
  registered_at?: string;
}

function mergeUserWithMyPage(baseUser: User, myPageData: MyPageUserData | null): User {
  if (!myPageData) {
    return baseUser;
  }

  return {
    ...baseUser,
    username: myPageData.username || baseUser.username,
    nickname: myPageData.nickname || baseUser.nickname,
    profileImage: resolveProfileImage(myPageData.profileImageUrl ?? baseUser.profileImage),
    joinDate: myPageData.registered_at || baseUser.joinDate,
  };
}

interface LoginResult {
  success: boolean;
  message?: string;
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isAuthLoading: boolean;
  isLoginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  login: (username: string, password: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<{ success: boolean; message: string }>;
  checkNicknameDuplicate: (nickname: string) => Promise<boolean>;
  updateNickname: (nickname: string) => Promise<{ success: boolean; message: string }>;
  updateProfileImage: (file: File) => Promise<{ success: boolean; message: string; profileImageUrl?: string }>;
}

interface RegisterData {
  username: string;
  nickname: string;
  password: string;
  email?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


let sessionRestorePromise: Promise<User | null> | null = null;

async function restoreSessionUser() {
  if (!hasSessionMarker()) {
    return null;
  }

  if (!sessionRestorePromise) {
    sessionRestorePromise = (async () => {
      const nextAccessToken = await reissueRequest();
      const restoredUser =
        buildUserFromToken(nextAccessToken, { username: "user", nickname: "사용자" }) || {
          id: "authenticated-user",
          username: "user",
          nickname: "사용자",
          profileImage: DEFAULT_PROFILE_IMAGE,
          joinDate: new Date().toISOString().split("T")[0],
        };

      const myPageData = await fetchMyPage(true).catch(() => null);
      return mergeUserWithMyPage(restoredUser, myPageData);
    })().finally(() => {
      sessionRestorePromise = null;
    });
  }

  return sessionRestorePromise;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      if (!hasSessionMarker()) {
        if (isMounted) {
          setIsAuthLoading(false);
        }
        return;
      }

      startAuthBootstrap();

      try {
        const restoredUser = await restoreSessionUser();

        if (!isMounted) {
          return;
        }

        setUser(restoredUser);
      } catch (error) {
        clearAccessToken();
        clearSessionMarker();
        if (isMounted) {
          setUser(null);
        }
      } finally {
        finishAuthBootstrap();
        if (isMounted) {
          setIsAuthLoading(false);
        }
      }
    };

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const eventName = getLoginRequiredEventName();

    const handleLoginRequired = (event: Event) => {
      const customEvent = event as CustomEvent<{ message?: string; reason?: string }>;
      clearAccessToken();
      clearSessionMarker();
      setUser(null);
      setIsLoginModalOpen(true);

      const description =
        customEvent.detail?.message ||
        "로그인이 필요합니다. 로그인 후 다시 시도해주세요.";

      toast({
        variant: "destructive",
        title: "로그인이 필요합니다",
        description,
        customDuration: 4000,
        className: "custom-toast-animation",
      });
    };

    window.addEventListener(eventName, handleLoginRequired as EventListener);
    return () => window.removeEventListener(eventName, handleLoginRequired as EventListener);
  }, []);

  const openLoginModal = useCallback(() => {
    setIsLoginModalOpen(true);
  }, []);

  const closeLoginModal = useCallback(() => {
    setIsLoginModalOpen(false);
  }, []);

  const login = useCallback(async (username: string, password: string): Promise<LoginResult> => {
    try {
      const { accessToken } = await loginRequest(username, password);
      const authenticatedUser = buildUserFromToken(accessToken, { username, nickname: username }) || {
        id: username,
        username,
        nickname: username,
        profileImage: DEFAULT_PROFILE_IMAGE,
        joinDate: new Date().toISOString().split("T")[0],
      };
      const myPageData = await fetchMyPage().catch(() => null);
      const mergedUser = mergeUserWithMyPage(authenticatedUser, myPageData);

      setAccessToken(accessToken);
      markSessionActive();
      setUser(mergedUser);

      return { success: true, message: "로그인에 성공했습니다." };
    } catch (error) {
      clearAccessToken();
      clearSessionMarker();
      setUser(null);
      return {
        success: false,
        message: error instanceof Error ? error.message : "로그인 중 오류가 발생했습니다.",
      };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
      toast({
        title: "로그아웃 완료",
        description: "안전하게 로그아웃되었습니다.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "로그아웃 실패",
        description: error instanceof Error ? error.message : "로그아웃 중 오류가 발생했습니다.",
      });
    } finally {
      clearAccessToken();
      clearSessionMarker();
      setUser(null);
      setIsLoginModalOpen(false);
    }
  }, []);

  const register = useCallback(async (data: RegisterData): Promise<{ success: boolean; message: string }> => {
    try {
      await registerRequest({
        username: data.username,
        nickname: data.nickname,
        password: data.password,
        email: data.email ?? "",
      });

      toast({
        title: "회원가입 완료",
        description: "회원가입이 완료되었습니다.",
      });

      return { success: true, message: "회원가입이 완료되었습니다." };
    } catch (error) {
      const message = error instanceof Error ? error.message : "회원가입 중 오류가 발생했습니다.";
      toast({
        variant: "destructive",
        title: "회원가입 실패",
        description: message,
      });
      return { success: false, message };
    }
  }, []);

  const checkNicknameDuplicate = useCallback(async (nickname: string): Promise<boolean> => {
    return checkNicknameExistsRequest(nickname);
  }, []);

  const updateNickname = useCallback(async (nickname: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await updateNicknameRequest(nickname);
      const nextNickname = response.nickname || nickname;

      setUser((prev) => (prev ? { ...prev, nickname: nextNickname } : prev));
      toast({
        title: "닉네임 변경 완료",
        description: "닉네임을 변경하였습니다.",
      });

      return { success: true, message: "닉네임을 변경하였습니다." };
    } catch (error) {
      const message = error instanceof Error ? error.message : "닉네임 변경 중 오류가 발생했습니다.";
      toast({
        variant: "destructive",
        title: "닉네임 변경 실패",
        description: message,
      });
      return { success: false, message };
    }
  }, []);

  const updateProfileImage = useCallback(async (file: File): Promise<{ success: boolean; message: string; profileImageUrl?: string }> => {
    try {
      const response = await updateProfileImageRequest(file);
      const nextProfileImage = response.profileImageUrl;

      setUser((prev) => (prev ? { ...prev, profileImage: resolveProfileImage(nextProfileImage || prev.profileImage) } : prev));
      toast({
        title: "프로필 사진 변경 완료",
        description: "프로필 사진을 변경하였습니다.",
      });

      return { success: true, message: "프로필 사진을 변경하였습니다.", profileImageUrl: nextProfileImage };
    } catch (error) {
      const message = error instanceof Error ? error.message : "프로필 사진 변경 중 오류가 발생했습니다.";
      toast({
        variant: "destructive",
        title: "프로필 사진 변경 실패",
        description: message,
      });
      return { success: false, message };
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        isAuthLoading,
        isLoginModalOpen,
        openLoginModal,
        closeLoginModal,
        login,
        logout,
        register,
        checkNicknameDuplicate,
        updateNickname,
        updateProfileImage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
