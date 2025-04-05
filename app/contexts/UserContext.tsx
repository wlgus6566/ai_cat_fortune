"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useSession, signOut } from "next-auth/react";
import { v4 as uuidv4 } from "uuid";
import { UserProfile, Gender, CalendarType, BirthTime } from "../type/types";
import { createSupabaseClient } from "../lib/supabase";

interface UserContextType {
  userProfile: UserProfile | null;
  isProfileComplete: boolean;
  isLoaded: boolean;
  isAuthenticated: boolean;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  createUserProfile: (
    data: Omit<UserProfile, "id" | "createdAt" | "updatedAt">
  ) => Promise<void>;
  clearUserProfile: () => Promise<void>;
  logout: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const USER_PROFILE_KEY = "ai_fortune_user_profile";

export function UserProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const isAuthenticated = status === "authenticated";

  // 사용자 프로필 로드
  useEffect(() => {
    const loadUserProfile = async () => {
      if (status === "loading") return;

      try {
        if (session?.user) {
          // 인증된 사용자가 있으면 Supabase에서 프로필 가져오기 시도
          try {
            const supabase = createSupabaseClient();
            const { data, error } = await supabase
              .from("user_profiles")
              .select("*")
              .eq("id", session.user.id)
              .single();

            if (error) {
              // 테이블이 없는 경우 (42P01 에러)
              if (error.code === "42P01") {
                console.warn(
                  "user_profiles 테이블이 존재하지 않습니다. 기본 프로필로 진행합니다."
                );
              } else {
                console.warn(
                  "사용자 프로필을 로드하는 중 오류가 발생했습니다:",
                  error
                );
              }
              return;
            }

            if (data) {
              setUserProfile({
                id: data.id as string,
                userId: data.id as string,
                name:
                  (data.name as string) || (session.user.name as string) || "",
                gender: (data.gender as Gender) || null,
                birthDate: (data.birth_date as string) || "",
                calendarType: (data.calendar_type as CalendarType) || null,
                birthTime: (data.birth_time as BirthTime) || "모름",
                profileImageUrl: (data.profile_image_url as string) || "",
                createdAt: data.created_at as string,
                updatedAt: data.updated_at as string,
              });
            }
          } catch (error) {
            // Supabase 연결 오류 발생 시 기본 프로필로 진행
            console.error("Supabase 연결 중 오류가 발생했습니다:", error);
            // const now = new Date().toISOString();
            // setUserProfile({
            //   id: session.user.id as string,
            //   userId: session.user.id as string,
            //   name: session.user.name || "",
            //   gender: null as Gender,
            //   birthDate: "",
            //   calendarType: null as CalendarType,
            //   birthTime: "모름" as BirthTime,
            //   profileImageUrl: session.user.image || "",
            //   createdAt: now,
            //   updatedAt: now,
            // });
          }
        } else {
          // 세션이 없으면 로컬 스토리지에서 프로필 확인
          if (typeof window !== "undefined") {
            try {
              const savedProfile = localStorage.getItem(USER_PROFILE_KEY);
              if (savedProfile) {
                const parsed = JSON.parse(savedProfile);
                setUserProfile(parsed);
              } else {
                setUserProfile(null);
              }
            } catch (error) {
              console.error(
                "로컬 스토리지에서 프로필을 로드하는 중 오류가 발생했습니다:",
                error
              );
              setUserProfile(null);
            }
          }
        }
      } catch (error) {
        console.error(
          "사용자 프로필을 로드하는 중 오류가 발생했습니다:",
          error
        );
        setIsLoaded(true);
      } finally {
        setIsLoaded(true);
      }
    };

    loadUserProfile();
  }, [session, status]);

  // 세션이 없을 때 로컬 스토리지에 프로필 저장
  useEffect(() => {
    if (
      isLoaded &&
      userProfile &&
      !isAuthenticated &&
      typeof window !== "undefined"
    ) {
      localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(userProfile));
    }
  }, [userProfile, isLoaded, isAuthenticated]);

  // 사용자 프로필 생성
  const createUserProfile = async (
    data: Omit<UserProfile, "id" | "createdAt" | "updatedAt">
  ) => {
    try {
      const now = new Date().toISOString();
      let newProfile: UserProfile;

      if (session?.user?.id) {
        // 인증된 사용자의 경우 Supabase에 저장
        newProfile = {
          ...data,
          id: session.user.id as string,
          userId: session.user.id as string,
          createdAt: now,
          updatedAt: now,
        };

        // Supabase에 저장 시도
        try {
          const supabase = createSupabaseClient();

          // 테이블 존재 확인 또는 생성
          const { error: checkError } = await supabase
            .from("user_profiles")
            .select("id")
            .limit(1);

          if (checkError && checkError.code === "42P01") {
            console.warn(
              "user_profiles 테이블이 존재하지 않습니다. 로컬 스토리지에만 저장합니다."
            );

            // 로컬 스토리지에 저장
            if (typeof window !== "undefined") {
              localStorage.setItem(
                USER_PROFILE_KEY,
                JSON.stringify(newProfile)
              );
            }
          } else {
            // 테이블 존재하면 저장 시도
            const { error } = await supabase.from("user_profiles").insert({
              id: newProfile.id,
              name: newProfile.name,
              gender: newProfile.gender,
              birth_date: newProfile.birthDate,
              calendar_type: newProfile.calendarType,
              birth_time: newProfile.birthTime,
              profile_image_url: newProfile.profileImageUrl,
              created_at: newProfile.createdAt,
              updated_at: newProfile.updatedAt,
            });

            if (error) {
              console.warn(
                "Supabase에 프로필 저장 실패, 로컬 스토리지에만 저장합니다:",
                error
              );
              // 로컬 스토리지에 저장
              if (typeof window !== "undefined") {
                localStorage.setItem(
                  USER_PROFILE_KEY,
                  JSON.stringify(newProfile)
                );
              }
            }
          }
        } catch (error) {
          console.warn(
            "Supabase 연결 실패, 로컬 스토리지에만 저장합니다:",
            error
          );
          // 로컬 스토리지에 저장
          if (typeof window !== "undefined") {
            localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(newProfile));
          }
        }
      } else {
        // 인증되지 않은 사용자의 경우 로컬 스토리지에만 저장
        newProfile = {
          ...data,
          id: uuidv4(),
          createdAt: now,
          updatedAt: now,
        };

        // 로컬 스토리지에 저장
        if (typeof window !== "undefined") {
          localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(newProfile));
        }
      }

      setUserProfile(newProfile);
      return;
    } catch (error) {
      console.error("사용자 프로필을 생성하는 중 오류가 발생했습니다:", error);
      throw error;
    }
  };

  // 사용자 프로필 업데이트
  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!userProfile) return;

    try {
      const now = new Date().toISOString();

      const updatedProfile: UserProfile = {
        ...userProfile,
        ...data,
        updatedAt: now,
      };

      if (session?.user?.id) {
        // 인증된 사용자의 경우 Supabase에 업데이트 시도
        try {
          const supabase = createSupabaseClient();

          // 테이블 존재 확인
          const { error: checkError } = await supabase
            .from("user_profiles")
            .select("id")
            .limit(1);

          if (checkError) {
            // 42P01 에러는 테이블이 없음을 의미
            if (checkError.code === "42P01") {
              console.warn(
                "user_profiles 테이블이 존재하지 않습니다. 로컬 스토리지에만 저장합니다."
              );
            } else {
              console.warn(
                "Supabase 접근 오류, 로컬 스토리지에만 저장합니다:",
                checkError
              );
            }

            // 로컬 스토리지에 저장
            if (typeof window !== "undefined") {
              localStorage.setItem(
                USER_PROFILE_KEY,
                JSON.stringify(updatedProfile)
              );
            }
          } else {
            // 테이블 존재하면 업데이트 시도
            const { error } = await supabase
              .from("user_profiles")
              .update({
                name: updatedProfile.name,
                gender: updatedProfile.gender,
                birth_date: updatedProfile.birthDate,
                calendar_type: updatedProfile.calendarType,
                birth_time: updatedProfile.birthTime,
                profile_image_url: updatedProfile.profileImageUrl,
                updated_at: updatedProfile.updatedAt,
              })
              .eq("id", session.user.id);

            if (error) {
              console.warn(
                "Supabase에 프로필 업데이트 실패, 로컬 스토리지에만 저장합니다:",
                error
              );
              // 로컬 스토리지에 저장
              if (typeof window !== "undefined") {
                localStorage.setItem(
                  USER_PROFILE_KEY,
                  JSON.stringify(updatedProfile)
                );
              }
            }
          }
        } catch (error) {
          console.warn(
            "Supabase 연결 실패, 로컬 스토리지에만 저장합니다:",
            error
          );
          // 로컬 스토리지에 저장
          if (typeof window !== "undefined") {
            localStorage.setItem(
              USER_PROFILE_KEY,
              JSON.stringify(updatedProfile)
            );
          }
        }
      } else {
        // 로컬 스토리지에 저장
        if (typeof window !== "undefined") {
          localStorage.setItem(
            USER_PROFILE_KEY,
            JSON.stringify(updatedProfile)
          );
        }
      }

      setUserProfile(updatedProfile);
    } catch (error) {
      console.error(
        "사용자 프로필을 업데이트하는 중 오류가 발생했습니다:",
        error
      );
      throw error;
    }
  };

  // 사용자 프로필 삭제
  const clearUserProfile = async () => {
    try {
      console.log("프로필 삭제 시작:", { userId: session?.user?.id });

      // 로컬 상태 초기화
      setUserProfile(null);

      // 로컬 스토리지에서 삭제
      if (typeof window !== "undefined") {
        localStorage.removeItem(USER_PROFILE_KEY);
        console.log("로컬 스토리지에서 프로필 삭제 완료");
      }

      // Supabase에서 프로필 삭제 (인증된 사용자인 경우)
      if (session?.user?.id) {
        try {
          const supabase = createSupabaseClient();

          // 데이터베이스에서 프로필 삭제
          const { error } = await supabase
            .from("user_profiles")
            .delete()
            .eq("id", session.user.id);

          if (error) {
            console.warn("Supabase에서 프로필 삭제 실패:", error);
          } else {
            console.log("Supabase에서 프로필 삭제 성공");
          }
        } catch (error) {
          console.warn(
            "Supabase 연결 실패, 로컬에서만 프로필이 삭제됩니다:",
            error
          );
        }
      } else {
        console.log("인증된 사용자가 아니므로 Supabase 삭제 과정 건너뜀");
      }

      // 추가 확인: 상태가 정확히 초기화되었는지 확인
      console.log("프로필 삭제 완료, 최종 상태:", {
        userProfile: null,
        isAuthenticated: isAuthenticated,
      });
    } catch (error) {
      console.error("사용자 프로필을 삭제하는 중 오류가 발생했습니다:", error);
      throw error;
    }
  };

  // 로그아웃
  const logout = async () => {
    try {
      if (isAuthenticated) {
        await signOut({ callbackUrl: "/" });
      }
      await clearUserProfile();
    } catch (error) {
      console.error("로그아웃 중 오류가 발생했습니다:", error);
      throw error;
    }
  };

  // 사용자 프로필 완성 여부 확인
  const isProfileComplete =
    !!userProfile &&
    !!userProfile.name &&
    userProfile.name.length > 0 &&
    !!userProfile.birthDate &&
    userProfile.birthDate.length > 0;

  const value = {
    userProfile,
    isProfileComplete,
    isLoaded,
    isAuthenticated,
    updateUserProfile,
    createUserProfile,
    clearUserProfile,
    logout,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);

  if (context === undefined) {
    throw new Error("useUser는 UserProvider 내부에서 사용해야 합니다");
  }
  return context;
}
