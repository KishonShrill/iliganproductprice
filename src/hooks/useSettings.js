import { useState, useEffect } from "react";
import { loadSettings, saveSettings, defaultSettings } from "../helpers/settings";
import { requestNotificationPermission, showNotification } from "../helpers/notifications";

function useSettings() {
    const [settings, setSettings] = useState(defaultSettings);

    useEffect(() => {
        const saved = loadSettings();
        setSettings(saved);
        if (saved) {
            if ('dark' === saved.theme) {
                document.documentElement.classList.add("dark");
            } else {
                document.documentElement.classList.remove("dark");
            }
            console.log("triggered")
        }
    }, []);

    const updateSetting = (key, value) => {
        switch(key) {
            case 'theme': 
                if ('dark' === value) {
                    document.documentElement.classList.add("dark");
                } else {
                    document.documentElement.classList.remove("dark");
                }
                break;
            case 'notifications': {
                const askPermission = async () => {
                    const granted = await requestNotificationPermission()
                    return granted;
                }

                if (askPermission) {
                    showNotification("Hello 👋", {
                        body: "This came from your frontend app!",
                        icon: "https://cdn-icons-png.flaticon.com/512/1827/1827370.png",
                    });
                    break;
                }
                else return null;
            }

        }
        const updated = { ...settings, [key]: value };
        setSettings(updated);
        saveSettings(updated);
    };

    const toggleSetting = (key) => {
        if (typeof settings[key] === 'boolean') {
            updateSetting(key, !settings[key]);
        }
    };

    const resetSettings = () => {
        setSettings(defaultSettings);
        saveSettings(defaultSettings);
        document.documentElement.classList.remove("dark");
    }

    return { settings, updateSetting, toggleSetting, resetSettings };
}

export default useSettings
