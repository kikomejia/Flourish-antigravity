import { db } from "../firebase";
import { collection, query, where, getDocs, addDoc, updateDoc, doc, limit, orderBy } from "firebase/firestore";

// These are placeholder services replacing base44
export const DailyProgressService = {
  async getByDate(email: string, dateStr: string) {
    const key = `progress_${email}_${dateStr}`;
    const stored = typeof window !== "undefined" ? localStorage.getItem(key) : null;
    if (stored) return JSON.parse(stored);
    
    return {
      completed_virtues: [],
      points_earned: 0,
      is_complete: false,
      user_email: email,
      date: dateStr,
    };
  },
  async update(id: string, data: any) {
    console.log("Mock update daily progress", id, data);
    const key = `progress_${data.user_email}_${data.date}`;
    if (typeof window !== "undefined") localStorage.setItem(key, JSON.stringify(data));
    return { id, ...data };
  },
  async create(data: any) {
    console.log("Mock create daily progress", data);
    const key = `progress_${data.user_email}_${data.date}`;
    if (typeof window !== "undefined") localStorage.setItem(key, JSON.stringify({ id: "mock-id", ...data }));
    return { id: "mock-id", ...data };
  }
};

export const UserStatsService = {
  async getByEmail(email: string) {
    const key = `stats_${email}`;
    const stored = typeof window !== "undefined" ? localStorage.getItem(key) : null;
    if (stored) return JSON.parse(stored);

    return {
      total_points: 0,
      level: 1,
      current_streak: 0,
      virtue_counts: {},
    };
  },
  async update(id: string, data: any) {
    console.log("Mock update user stats", id, data);
    const key = `stats_${data.user_email || "default"}`; // approximation for mock
    if (typeof window !== "undefined") localStorage.setItem(key, JSON.stringify({ id, ...data }));
  },
  async create(data: any) {
    console.log("Mock create user stats", data);
    const key = `stats_${data.user_email}`;
    if (typeof window !== "undefined") localStorage.setItem(key, JSON.stringify({ id: "mock-id", ...data }));
  }
};

export const ActivityLogService = {
  async getByEmail(email: string, limitCount = 100) {
    const key = `activities_${email}`;
    const stored = typeof window !== "undefined" ? localStorage.getItem(key) : null;
    return stored ? JSON.parse(stored) : [];
  },
  async create(data: any) {
    console.log("Mock create activity", data);
    const key = `activities_${data.user_email}`;
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(key);
      const acts = stored ? JSON.parse(stored) : [];
      acts.unshift({ id: Date.now().toString(), created_date: new Date().toISOString(), ...data });
      localStorage.setItem(key, JSON.stringify(acts));
    }
  }
};

