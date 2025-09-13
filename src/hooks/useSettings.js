import { useState, useEffect } from "react";
import { loadSettings, saveSettings, defaultSettings } from "../helpers/settings";

export default useSettings() {
    const [settings, setSettings] = useState(defaultSettings);

    useEffect(() => {
        setSettings(loadSettings());
    }, []);

    const updateSetting = (key, value) => {
        const updated = { ...settings, [key]: value };
        setSettings(updated);
        saveSettings(updated);
    };

    const toggleSetting = (key) => {
        if (typeof settings[key] === 'boolean') {
            updateSetting(key, !settings[key]);
        }
    };

    return { settings, updateSetting, toggleSetting };
}
