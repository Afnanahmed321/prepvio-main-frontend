import { create } from 'zustand';
import { api } from '../lib/api';

export const useNotificationStore = create((set) => ({
  notifications: [], // All notifications (for dashboard)
  recentNotifications: [], // Only 2 most recent (for bell icon)
  unreadCount: 0,

  // Fetch recent notifications (for bell icon - 2 most recent)
  fetchRecentNotifications: async () => {
    try {
      const response = await api.get('/notifications/recent');
      // Ensure response.data is an array before filtering
      const data = Array.isArray(response.data) ? response.data : [];
      // Deduplicate fetched data
      const uniqueData = data.filter((n, i, arr) => arr.findIndex(x => x._id === n._id) === i);
      set({ recentNotifications: uniqueData });
    } catch (error) {
      console.error('Error fetching recent notifications:', error);
    }
  },

  // Fetch all notifications (for dashboard)
  fetchNotifications: async () => {
    try {
      const response = await api.get('/notifications');
      // Ensure response.data is an array before filtering
      const data = Array.isArray(response.data) ? response.data : [];
      // Deduplicate fetched data
      const uniqueData = data.filter((n, i, arr) => arr.findIndex(x => x._id === n._id) === i);
      set({ notifications: uniqueData });
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  },

  // Fetch unread count
  fetchUnreadCount: async () => {
    try {
      const response = await api.get('/notifications/unread-count');
      set({ unreadCount: response.data.count });
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  },

  // Mark single notification as read
  markAsRead: async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);

      // Update both lists
      set((state) => ({
        notifications: state.notifications.map(n =>
          n._id === id ? { ...n, isRead: true } : n
        ),
        recentNotifications: state.recentNotifications.map(n =>
          n._id === id ? { ...n, isRead: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1)
      }));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    try {
      await api.patch('/notifications/read-all');

      set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, isRead: true })),
        recentNotifications: state.recentNotifications.map(n => ({ ...n, isRead: true })),
        unreadCount: 0
      }));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  },

  // Delete a notification
  deleteNotification: async (id) => {
    try {
      await api.delete(`/notifications/${id}`);

      set((state) => {
        const deletedNotif = state.notifications.find(n => n._id === id);
        return {
          notifications: state.notifications.filter(n => n._id !== id),
          recentNotifications: state.recentNotifications.filter(n => n._id !== id),
          unreadCount: deletedNotif && !deletedNotif.isRead
            ? Math.max(0, state.unreadCount - 1)
            : state.unreadCount
        };
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  },

  // Add new notification from socket (real-time)
  addNotification: (notification) =>
    set((state) => {
      // ⛔ Prevent duplicates by ID
      if (state.notifications.some(n => n._id === notification._id)) {
        return state;
      }

      // ⛔ Prevent duplicates by Content (type, message, title)
      // EXCEPT for system notifications like ticket updates
      if (notification.type !== 'system') {
        const isDuplicateContent = state.notifications.some(n =>
          n.type === notification.type &&
          n.title === notification.title &&
          n.message === notification.message
        );

        if (isDuplicateContent) {
          return state;
        }
      }

      return {
        notifications: [notification, ...state.notifications],
        recentNotifications: [notification, ...state.recentNotifications]
          .filter((n, i, arr) => arr.findIndex(x => x._id === n._id) === i)
          .slice(0, 2),
        unreadCount: notification.isRead
          ? state.unreadCount
          : state.unreadCount + 1,
      };
    }),


}));