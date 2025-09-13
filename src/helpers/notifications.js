// utils/notifications.js
export const requestNotificationPermission = async () => {
  if (!("Notification" in window)) {
    alert("This browser does not support notifications.");
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === "granted";
};

export const showNotification = (title, options = {}) => {
  if (Notification.permission === "granted") {
    new Notification(title, {
      body: options.body || "This is a notification",
      icon: options.icon || "/logo192.png", // replace with your app logo
      ...options,
    });
  }
};
