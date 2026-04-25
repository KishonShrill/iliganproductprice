"use client";

import { useState } from "react";
import { saveSettings, defaultSettings, type AppSettings } from "@/helpers/settings";
import { requestNotificationPermission, showNotification } from "@/helpers/notifications";

export default function useSettings() {
    // Type the state with the interface
    const [settings, setSettings] = useState<AppSettings>(defaultSettings as AppSettings);


    // 2. Use `keyof AppSettings` to strictly type the keys
    const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
        switch (key) {
            case 'notifications': {
                // Fixed the async permission bug here!
                if (value === true) {
                    requestNotificationPermission().then((granted) => {
                        if (granted) {
                            showNotification("Hello 👋", {
                                body: "This came from your Budget Buddy app!",
                                icon: "https://cdn-icons-png.flaticon.com/512/1827/1827370.png",
                            });
                        } else {
                            // If they denied it, force the setting back to false
                            const reverted = { ...settings, notifications: false };
                            setSettings(reverted);
                            saveSettings(reverted);
                        }
                    });
                }
                break;
            }
        }

        // Apply the update
        const updated = { ...settings, [key]: value };
        setSettings(updated);
        saveSettings(updated);
    };

    const toggleSetting = (key: keyof AppSettings) => {
        if (typeof settings[key] === 'boolean') {
            // TypeScript needs a little assurance here that the boolean inversion is safe
            updateSetting(key, !settings[key] as AppSettings[typeof key]);
        }
    };

    const resetSettings = () => {
        setSettings(defaultSettings as AppSettings);
        saveSettings(defaultSettings);
        document.documentElement.classList.remove("dark");
    };

    return { settings, updateSetting, toggleSetting, resetSettings };
}
