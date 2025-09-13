import { useState } from 'react';
import { Dialog, Separator, Select, Switch } from 'radix-ui';
import { 
  Settings as SettingsIcon, 
  Moon, 
  Sun, 
  Globe, 
  Bell, 
  DollarSign,
  Volume2,
  Palette,
  Zap,
  RotateCcw,
  X,
  ChevronDown,
  Check
} from 'lucide-react';
import useSettings from '../hooks/useSettings';


const Settings = () => {
  const { settings, updateSetting, toggleSettings, resetSettings } = useSettings();
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'fil', label: 'Filipino' },
  ];

  const handleReset = () => {
    resetSettings();
    setIsResetDialogOpen(false);
  };

  return (
    <div className="hide-mobile-scrollbar min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-8 pb-[6.5rem]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#ee4d2d] to-[#ff6b47] rounded-xl flex items-center justify-center">
              <SettingsIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
              <p className="text-gray-600 dark:text-gray-400">Customize your Budget Buddy experience</p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Appearance Section */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <Palette className="w-5 h-5 mr-2 text-[#ee4d2d]" />
              Appearance
            </h2>
            <div className="space-y-4">
              <SettingItem
                icon={settings.theme === 'dark' ? Moon : Sun}
                title="Theme"
                description="Switch between light and dark mode"
              >
                <CustomSwitch
                  checked={settings.theme === 'dark'}
                  onCheckedChange={(checked) => updateSetting('theme', checked ? 'dark' : 'light')}
                />
              </SettingItem>

              <SettingItem
                icon={Globe}
                title="Right-to-Left (RTL)"
                description="Enable RTL layout for Arabic, Hebrew, and other RTL languages"
              >
                <CustomSwitch
                  checked={settings.rightToLeft}
                  onCheckedChange={(checked) => updateSetting('rightToLeft', checked)}
                />
              </SettingItem>

              <SettingItem
                icon={Zap}
                title="Compact Mode"
                description="Use a more compact layout by hiding the photos to fit more content"
              >
                <CustomSwitch
                  checked={settings.hidePhotos}
                  onCheckedChange={(checked) => updateSetting('hidePhotos', checked)}
                />
              </SettingItem>
            </div>
          </section>

          <Separator.Root className="h-px bg-gray-200 dark:bg-gray-700" />

          {/* Notifications Section */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <Bell className="w-5 h-5 mr-2 text-[#ee4d2d]" />
              Notifications
            </h2>
            <div className="space-y-4">
              <SettingItem
                icon={Bell}
                title="Push Notifications"
                description="Receive notifications about budget alerts and updates"
              >
                <CustomSwitch
                  checked={settings.notifications}
                  onCheckedChange={(checked) => updateSetting('notifications', checked)}
                />
              </SettingItem>

              <SettingItem
                icon={DollarSign}
                title="Budget Alerts"
                description="Get notified when approaching your budget limit"
              >
                <CustomSwitch
                  checked={settings.budgetAlerts}
                  onCheckedChange={(checked) => updateSetting('budgetAlerts', checked)}
                  disabled={!settings.notifications}
                />
              </SettingItem>

              <SettingItem
                icon={Volume2}
                title="Sound Effects"
                description="Play sounds for notifications and interactions"
              >
                <CustomSwitch
                  checked={settings.soundEffects}
                  onCheckedChange={(checked) => updateSetting('soundEffects', checked)}
                />
              </SettingItem>
            </div>
          </section>

          {/* Preferences Section
          <Separator.Root className="h-px bg-gray-200 dark:bg-gray-700" />

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <SettingsIcon className="w-5 h-5 mr-2 text-[#ee4d2d]" />
              Preferences
            </h2>
            <div className="space-y-4">
              <SettingItem
                icon={Save}
                title="Auto Save"
                description="Automatically save your budget data as you make changes"
              >
                <CustomSwitch
                  checked={settings.autoSave}
                  onCheckedChange={(checked) => updateSetting('autoSave', checked)}
                />
              </SettingItem>

              <SettingItem
                icon={DollarSign}
                title="Currency"
                description="Choose your preferred currency for displaying prices"
              >
                <CustomSelect
                  value={settings.currency}
                  onValueChange={(value) => updateSetting('currency', value)}
                  options={currencyOptions}
                  placeholder="Select currency"
                />
              </SettingItem>

              <SettingItem
                icon={Globe}
                title="Language"
                description="Select your preferred language"
              >
                <CustomSelect
                  value={settings.language}
                  onValueChange={(value) => updateSetting('language', value)}
                  options={languageOptions}
                  placeholder="Select language"
                />
              </SettingItem>
            </div>
          </section>
          */}

          <Separator.Root className="h-px bg-gray-200 dark:bg-gray-700" />

          {/* Reset Section */}
          <section>
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
                    Reset Settings
                  </h3>
                  <p className="text-red-700 dark:text-red-300">
                    This will restore all settings to their default values. This action cannot be undone.
                  </p>
                </div>
                <Dialog.Root open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
                  <Dialog.Trigger asChild>
                    <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors duration-300 hover:scale-105 transform flex items-center space-x-2">
                      <RotateCcw className="w-4 h-4" />
                      <span>Reset All</span>
                    </button>
                  </Dialog.Trigger>
                  
                  <Dialog.Portal>
                    <Dialog.Overlay className="bg-black/50 fixed inset-0 z-50" />
                    <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-xl border border-gray-200 dark:border-gray-700 max-w-md w-full mx-4 z-50">
                      <Dialog.Title className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                        Reset All Settings?
                      </Dialog.Title>
                      <Dialog.Description className="text-gray-600 dark:text-gray-400 mb-6">
                        This will restore all settings to their default values. This action cannot be undone.
                      </Dialog.Description>
                      
                      <div className="flex space-x-3 justify-end">
                        <Dialog.Close asChild>
                          <button className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-300">
                            Cancel
                          </button>
                        </Dialog.Close>
                        <button
                          onClick={handleReset}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-300"
                        >
                          Reset Settings
                        </button>
                      </div>
                      
                      <Dialog.Close asChild>
                        <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                          <X className="w-5 h-5" />
                        </button>
                      </Dialog.Close>
                    </Dialog.Content>
                  </Dialog.Portal>
                </Dialog.Root>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

const SettingItem = ({ icon: Icon, title, description, children, className = "" }) => (
  <div className={`flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-[#ee4d2d]/20 dark:hover:border-[#ee4d2d]/30 transition-all duration-300 hover:shadow-md group ${className}`}>
    <div className="flex items-center space-x-4 flex-1">
      <div className="w-10 h-10 bg-gradient-to-br from-[#ee4d2d] to-[#ff6b47] rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-[#ee4d2d] dark:group-hover:text-[#ff6b47] transition-colors duration-300">
          {title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {description}
        </p>
      </div>
    </div>
    <div className="ml-4">
      {children}
    </div>
  </div>
);

const CustomSwitch = ({ checked, onCheckedChange, disabled = false }) => (
  <Switch.Root
    checked={checked}
    onCheckedChange={onCheckedChange}
    disabled={disabled}
    className="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full relative data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-[#ee4d2d] data-[state=checked]:to-[#ff6b47] outline-none cursor-pointer transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
  >
    <Switch.Thumb className="block w-5 h-5 bg-white rounded-full shadow-lg transform transition-transform duration-300 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[22px]" />
  </Switch.Root>
);

const CustomSelect = ({ value, onValueChange, options, placeholder }) => (
  <Select.Root value={value} onValueChange={onValueChange}>
    <Select.Trigger className="inline-flex items-center justify-between px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-900 dark:text-white hover:border-[#ee4d2d]/50 focus:border-[#ee4d2d] focus:outline-none transition-colors duration-300 min-w-[120px]">
      <Select.Value placeholder={placeholder} />
      <Select.Icon>
        <ChevronDown className="w-4 h-4" />
      </Select.Icon>
    </Select.Trigger>
    
    <Select.Portal>
      <Select.Content className="overflow-hidden bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
        <Select.Viewport className="p-1">
          {options.map((option) => (
            <Select.Item
              key={option.value}
              value={option.value}
              className="relative flex items-center px-8 py-2 text-sm text-gray-900 dark:text-white rounded-md cursor-pointer hover:bg-[#ee4d2d]/10 dark:hover:bg-[#ee4d2d]/20 focus:bg-[#ee4d2d]/10 dark:focus:bg-[#ee4d2d]/20 outline-none transition-colors duration-200"
            >
              <Select.ItemText>{option.label}</Select.ItemText>
              <Select.ItemIndicator className="absolute left-2 w-4 h-4">
                <Check className="w-4 h-4 text-[#ee4d2d]" />
              </Select.ItemIndicator>
            </Select.Item>
          ))}
        </Select.Viewport>
      </Select.Content>
    </Select.Portal>
  </Select.Root>
);

export default Settings;
