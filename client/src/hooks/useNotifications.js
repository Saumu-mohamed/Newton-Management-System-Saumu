import { useEffect, useState } from "react";
import { getNotifications } from "@/services/navigationService";

export function useNotifications({ pollIntervalMs = 60000 } = {}) {
  const [notifications, setNotifications] = useState([]);
  const [notificationsError, setNotificationsError] = useState('');
  const [loadingNotifications, setLoadingNotifications] = useState(true);

  useEffect(() => {
    let ignore = false;

    const loadNotifications = async () => {
      try {
        if (!ignore) {
          setLoadingNotifications(true);
          setNotificationsError('');
        }

        const data = await getNotifications();

        if (!ignore) {
          setNotifications(Array.isArray(data?.items) ? data.items : []);
        }
      } catch (error) {
        if (!ignore) {
          setNotifications([]);
          setNotificationsError(error?.response?.data?.message || 'Failed to load notifications.');
        }
      } finally {
        if (!ignore) {
          setLoadingNotifications(false);
        }
      }
    };

    loadNotifications();
    const intervalId = window.setInterval(loadNotifications, pollIntervalMs);

    return () => {
      ignore = true;
      window.clearInterval(intervalId);
    };
  }, [pollIntervalMs]);

  return {
    notifications,
    notificationsError,
    loadingNotifications,
    unreadCount: notifications.filter((item) => item.unread).length,
  };
}
