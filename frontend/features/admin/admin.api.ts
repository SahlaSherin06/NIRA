import { api } from "@/lib/axios";

export interface RegistrationDay {
  date: string;
  day: string;
  count: number;
}

export interface AdminActivityItem {
  id: string;
  type: "signup" | "report" | "premium";
  title: string;
  description: string;
  timestamp: string;
}

export interface AdminStats {
  totalUsers: number;
  activeUsersToday: number;
  premiumUsers: number;
  totalMatches: number;
  bannedUsers: number;
  reportsCount: number;
  revenue: {
    monthlyRevenue: number;
    totalSubscriptions: number;
    planPrice: number;
  };
  genderRatio: {
    male: number;
    female: number;
    other: number;
  };
  registrationGrowth: RegistrationDay[];
  recentActivities: AdminActivityItem[];
}

export interface AdminUserProfile {
  dob?: string;
  height?: string;
  weight?: string;
  bloodGroup?: string;
  maritalStatus?: string;
  haveChildren?: string;
  numberOfChildren?: string;
  city?: string;
  state?: string;
  country?: string;
  religion?: string;
  caste?: string;
  motherTongue?: string;
  educationLevel?: string;
  profession?: string;
  annualIncome?: string;
  diet?: string;
  dressingSense?: string;
  smoke?: string;
  drink?: string;
  personality?: string[];
  interests?: string[];
  bio?: string;
  whatBringsYouHere?: string;
  marryWithin?: string;
  mainPhoto?: string;
  galleryPhotos?: string[];
}

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  gender?: string;
  createdFor?: string;
  isEmailVerified: boolean;
  isOnboardingComplete: boolean;
  isBanned?: boolean;
  photo?: string | null;
  galleryPhotos?: string[];
  profile?: AdminUserProfile | null;
  subscription?: {
    plan: "free" | "premium";
    expiresAt?: string;
  };
  createdAt: string;
}

export interface AdminUsersResponse {
  users: AdminUser[];
  total: number;
  page: number;
  pages: number;
  metrics?: {
    total: number;
    premium: number;
    banned: number;
  };
}

export interface AdminReport {
  _id: string;
  actorId: {
    _id: string;
    name: string;
    email: string;
  };
  targetId: {
    _id: string;
    name: string;
    email: string;
    isBanned?: boolean;
    subscription?: {
      plan: string;
    };
  };
  action: string;
  reason?: string;
  createdAt: string;
}

export const getAdminStatsApi = async (): Promise<AdminStats> => {
  const res = await api.get("/admin/stats");
  return res.data;
};

export const getAdminUsersApi = async (params: {
  page?: number;
  search?: string;
  filter?: string;
  gender?: string;
}): Promise<AdminUsersResponse> => {
  const res = await api.get("/admin/users", { params });
  return res.data;
};

export const toggleBanUserApi = async (id: string): Promise<{ message: string; isBanned: boolean }> => {
  const res = await api.patch(`/admin/users/${id}/ban`);
  return res.data;
};

export const togglePremiumUserApi = async (id: string): Promise<{ message: string; plan: string }> => {
  const res = await api.patch(`/admin/users/${id}/premium`);
  return res.data;
};

export const getAdminReportsApi = async (): Promise<{ reports: AdminReport[] }> => {
  const res = await api.get("/admin/reports");
  return res.data;
};
