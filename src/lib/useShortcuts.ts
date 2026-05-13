import { useHotkeys } from 'react-hotkeys-hook';
import { useIndustryStore } from './industry-store';
import { useNavigate } from 'react-router-dom';

export interface ShortcutMap {
  [key: string]: {
    keys: string; // e.g., 'mod+k'
    description: string;
    action: () => void;
  };
}

export function useShortcuts() {
  const { cyndiOpen, setCyndiOpen } = useIndustryStore();
  const navigate = useNavigate();

  const shortcuts: ShortcutMap = {
    toggleCyndi: {
      keys: 'mod+k',
      description: 'Toggle Cyndi Assistant',
      action: () => setCyndiOpen(!cyndiOpen),
    },
    openSearch: {
      keys: 'mod+f',
      description: 'Global Search',
      action: () => console.log('Open search... (mocked)'),
    },
    goHome: {
      keys: 'mod+h',
      description: 'Go to Dashboard',
      action: () => navigate('/app/dashboard'),
    },
    showShortcuts: {
      keys: 'mod+/',
      description: 'Show Keyboard Shortcuts Panel',
      action: () => {
        window.dispatchEvent(new CustomEvent('toggle-shortcuts'));
      },
    },
    toggleSidebar: {
      keys: 'mod+b',
      description: 'Toggle Sidebar',
      action: () => {
        // Toggle the data-state attribute or trigger the button
        const trigger = document.querySelector('[data-sidebar="trigger"]') as HTMLButtonElement;
        trigger?.click();
      },
    },
    openSettings: {
      keys: 'mod+s',
      description: 'Open Settings',
      action: () => navigate('/app/settings'),
    },
    openProfile: {
      keys: 'mod+p',
      description: 'Open Profile',
      action: () => navigate('/app/profile'),
    }
  };

  // Register all hotkeys individually to satisfy the Rules of Hooks
  useHotkeys('mod+k', (e) => { e.preventDefault(); shortcuts.toggleCyndi.action(); }, { enableOnFormTags: false });
  useHotkeys('mod+f', (e) => { e.preventDefault(); shortcuts.openSearch.action(); }, { enableOnFormTags: false });
  useHotkeys('mod+h', (e) => { e.preventDefault(); shortcuts.goHome.action(); }, { enableOnFormTags: false });
  useHotkeys('mod+/', (e) => { e.preventDefault(); shortcuts.showShortcuts.action(); }, { enableOnFormTags: false });
  useHotkeys('mod+b', (e) => { e.preventDefault(); shortcuts.toggleSidebar.action(); }, { enableOnFormTags: false });
  useHotkeys('mod+s', (e) => { e.preventDefault(); shortcuts.openSettings.action(); }, { enableOnFormTags: false });
  useHotkeys('mod+p', (e) => { e.preventDefault(); shortcuts.openProfile.action(); }, { enableOnFormTags: false });

  return { shortcuts };
}
