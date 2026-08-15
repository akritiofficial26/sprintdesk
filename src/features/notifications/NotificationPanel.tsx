import { useNotificationStore } from "../../store/notificationStore";

function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

interface NotificationPanelProps {
  onClose: () => void;
}

export function NotificationPanel({ onClose }: NotificationPanelProps) {
  const notifications = useNotificationStore((s) => s.notifications);
  const markAsRead = useNotificationStore((s) => s.markAsRead);
  const markAllAsRead = useNotificationStore((s) => s.markAllAsRead);
  const hasUnread = notifications.some((n) => !n.read);

  return (
    <div
      role="dialog"
      aria-label="Notifications"
      className="absolute right-0 top-[calc(100%+8px)] z-50 flex max-h-[70vh] w-[320px] flex-col overflow-hidden rounded-lg border border-outline-variant bg-surface-bright shadow-subtle"
    >
      <div className="flex items-center justify-between gap-sm border-b border-outline-variant p-md">
        <h2 className="text-body-md font-semibold text-on-surface">Notifications</h2>
        <div className="flex items-center gap-md">
          <button
            onClick={markAllAsRead}
            disabled={!hasUnread}
            className="text-body-sm text-primary hover:underline disabled:cursor-not-allowed disabled:text-on-surface-variant disabled:no-underline"
          >
            Mark all as read
          </button>
          <button
            onClick={onClose}
            aria-label="Close notifications"
            className="text-on-surface-variant transition-colors hover:text-on-surface"
          >
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
              close
            </span>
          </button>
        </div>
      </div>

      <ul className="flex-1 divide-y divide-outline-variant overflow-y-auto">
        {notifications.length === 0 && (
          <li className="p-lg text-center text-body-sm text-on-surface-variant">No notifications yet</li>
        )}
        {notifications.map((notification) => (
          <li key={notification.id}>
            <button
              onClick={() => markAsRead(notification.id)}
              className={[
                "flex w-full flex-col gap-xs p-md text-left transition-colors hover:bg-surface-container",
                !notification.read && "bg-primary-container/10",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <div className="flex items-center gap-sm">
                {!notification.read && (
                  <span className="h-2 w-2 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                )}
                <span className="line-clamp-1 text-body-sm font-semibold text-on-surface">
                  {notification.title}
                </span>
              </div>
              <p className="line-clamp-2 text-body-sm text-on-surface-variant">{notification.body}</p>
              <span className="text-label-md text-on-surface-variant">
                {formatRelativeTime(notification.createdAt)}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
