const SETTINGS_KEY = 'budgetbuddySettings';

export const defaultSettings = {
    theme: 'light',
    photos: true,
    rightToLeft: false
};

// Load from localStorage or fallback to defaults
export function loadSettings() {
    const stored = localStorage.getItem(SETTINGS_KEY);
    return stored ? JSON.parse(stored) : defaultSettings;
}

// Save to localStorage
export function saveSettings(settings) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function toggleSetting(key) {
    const settings = loadSettings();
    if (typeof settings[key] === 'boolean') {
        settings[key] = !settings[key];
        saveSettings(settings);
    }
    return settings;
}

export function setSetting(key, value) {
    const settings = loadSettings();
    settings[key] = value;
    saveSettings(settings);
    return settings;
}
