import { useState, useEffect } from "react";
import { loadSettings, saveSettings, defaultSettings } from "../helpers/settings";

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
        const updated = { ...settings, [key]: value };
        setSettings(updated);
        saveSettings(updated);

        if ('theme' === key) {
            if ('dark' === value) {
                document.documentElement.classList.add("dark");
            } else {
                document.documentElement.classList.remove("dark");
            }
        }
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
