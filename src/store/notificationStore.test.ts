import { describe, it, expect, beforeEach } from "vitest";
import { useNotificationStore } from "./notificationStore";

const posts = [
  { id: 1, title: "First post", body: "First body" },
  { id: 2, title: "Second post", body: "Second body" },
];

describe("notificationStore", () => {
  beforeEach(() => {
    localStorage.clear();
    useNotificationStore.setState({ notifications: [], seenIds: [], cursor: 0 });
  });

  it("starts with no notifications", () => {
    expect(useNotificationStore.getState().notifications).toHaveLength(0);
  });

  it("ingestPosts turns unseen posts into unread notifications", () => {
    const added = useNotificationStore.getState().ingestPosts(posts);

    expect(added).toHaveLength(2);
    expect(useNotificationStore.getState().notifications).toHaveLength(2);
    expect(useNotificationStore.getState().notifications.every((n) => !n.read)).toBe(true);
  });

  it("ingestPosts ignores post IDs already seen", () => {
    useNotificationStore.getState().ingestPosts(posts);
    const secondBatch = useNotificationStore.getState().ingestPosts(posts);

    expect(secondBatch).toHaveLength(0);
    expect(useNotificationStore.getState().notifications).toHaveLength(2);
  });

  it("keeps only the latest 20 notifications", () => {
    const manyPosts = Array.from({ length: 25 }, (_, i) => ({
      id: i + 1,
      title: `Post ${i + 1}`,
      body: "Body",
    }));

    useNotificationStore.getState().ingestPosts(manyPosts);

    expect(useNotificationStore.getState().notifications).toHaveLength(20);
    expect(useNotificationStore.getState().notifications[0].id).toBe(25);
  });

  it("markAsRead marks only the matching notification as read", () => {
    useNotificationStore.getState().ingestPosts(posts);
    useNotificationStore.getState().markAsRead(1);

    const { notifications } = useNotificationStore.getState();
    expect(notifications.find((n) => n.id === 1)?.read).toBe(true);
    expect(notifications.find((n) => n.id === 2)?.read).toBe(false);
  });

  it("markAllAsRead marks every notification as read", () => {
    useNotificationStore.getState().ingestPosts(posts);
    useNotificationStore.getState().markAllAsRead();

    expect(useNotificationStore.getState().notifications.every((n) => n.read)).toBe(true);
  });

  it("advanceCursor steps forward and wraps around the post pool", () => {
    useNotificationStore.setState({ cursor: 95 });
    useNotificationStore.getState().advanceCursor();

    expect(useNotificationStore.getState().cursor).toBe(0);
  });
});
