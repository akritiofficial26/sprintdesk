import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AppNotification } from "../types";

const MAX_NOTIFICATIONS = 20;
export const NOTIFICATION_PAGE_SIZE = 5;
export const NOTIFICATION_POOL_SIZE = 100;

export interface RawPost {
  id: number;
  title: string;
  body: string;
}

interface NotificationState {
  notifications: AppNotification[];
  seenIds: number[];
  cursor: number;
  ingestPosts: (posts: RawPost[]) => AppNotification[];
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  advanceCursor: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      seenIds: [],
      cursor: 0,

      ingestPosts: (posts) => {
        const { seenIds, notifications } = get();
        const seen = new Set(seenIds);
        const fresh = posts.filter((post) => !seen.has(post.id));
        if (fresh.length === 0) return [];

        const added: AppNotification[] = [...fresh]
          .reverse()
          .map((post) => ({
            id: post.id,
            title: post.title,
            body: post.body,
            read: false,
            createdAt: new Date().toISOString(),
          }));

        set({
          notifications: [...added, ...notifications].slice(0, MAX_NOTIFICATIONS),
          seenIds: [...seenIds, ...fresh.map((post) => post.id)],
        });

        return added;
      },

      markAsRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
        }));
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        }));
      },

      advanceCursor: () => {
        set((state) => ({ cursor: (state.cursor + NOTIFICATION_PAGE_SIZE) % NOTIFICATION_POOL_SIZE }));
      },
    }),
    {
      name: "sprintdesk_notifications",
      partialize: (state) => ({
        notifications: state.notifications,
        seenIds: state.seenIds,
        cursor: state.cursor,
      }),
    }
  )
);
