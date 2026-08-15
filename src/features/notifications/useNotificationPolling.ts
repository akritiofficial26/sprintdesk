import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchNotificationPosts } from "./notificationApi";
import { useNotificationStore, NOTIFICATION_PAGE_SIZE } from "../../store/notificationStore";
import { useToast } from "../../components/ui/useToast";

const POLL_INTERVAL_MS = 15_000;

/**
 * Polls JSONPlaceholder for "new" notifications. `refetchIntervalInBackground: false`
 * is what pauses/resumes polling with tab visibility — TanStack Query's focus manager
 * already listens for `visibilitychange`, so no manual listener is needed.
 *
 * The pool of 100 posts is paged through 5 at a time each poll (rather than always
 * re-requesting the same first 5), so "new post IDs" actually keeps producing new
 * notifications across a demo session instead of going stale after the first fetch.
 */
export function useNotificationPolling(isPanelOpen: boolean) {
  const ingestPosts = useNotificationStore((s) => s.ingestPosts);
  const advanceCursor = useNotificationStore((s) => s.advanceCursor);
  const { showToast } = useToast();

  const isPanelOpenRef = useRef(isPanelOpen);
  useEffect(() => {
    isPanelOpenRef.current = isPanelOpen;
  }, [isPanelOpen]);

  const { data } = useQuery({
    queryKey: ["notifications-poll"],
    queryFn: async () => {
      const cursor = useNotificationStore.getState().cursor;
      const posts = await fetchNotificationPosts(cursor, NOTIFICATION_PAGE_SIZE);
      advanceCursor();
      return posts;
    },
    refetchInterval: POLL_INTERVAL_MS,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,
    staleTime: 0,
  });

  useEffect(() => {
    if (!data) return;
    const added = ingestPosts(data);
    if (added.length > 0 && !isPanelOpenRef.current) {
      const message = added.length === 1 ? added[0].title : `${added.length} new notifications`;
      showToast(message, "info");
    }
  }, [data, ingestPosts, showToast]);
}
