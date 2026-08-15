import { jsonPlaceholderApi } from "../../lib/axios";
import type { RawPost } from "../../store/notificationStore";

export async function fetchNotificationPosts(start: number, limit: number): Promise<RawPost[]> {
  const { data } = await jsonPlaceholderApi.get<RawPost[]>("/posts", {
    params: { _start: start, _limit: limit },
  });
  return data;
}
