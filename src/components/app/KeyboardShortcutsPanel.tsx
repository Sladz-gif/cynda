import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Keyboard, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useShortcuts } from '@/lib/useShortcuts';

const shortcutGroups = [
  {
    title: 'Global Navigation',
    items: [
      { keys: ['Cmd', 'K'], label: 'Toggle Cyndi Assistant' },
      { keys: ['Cmd', 'F'], label: 'Global Search' },
      { keys: ['Cmd', 'H'], label: 'Go to Dashboard' },
      { keys: ['Cmd', '/'], label: 'Show/Hide this menu' },
    ]
  },
  {
    title: 'Workspace',
    items: [
      { keys: ['Cmd', 'S'], label: 'Open Settings' },
      { keys: ['Cmd', 'P'], label: 'User Profile' },
      { keys: ['Cmd', 'B'], label: 'Toggle Sidebar' },
      { keys: ['Esc'], label: 'Close Active Panel' },
    ]
  }
];

export const KeyboardShortcutsPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { shortcuts } = useShortcuts(); // Setup listeners

  useEffect(() => {
    const handleToggle = () => setIsOpen(prev => !prev);
    window.addEventListener('toggle-shortcuts', handleToggle);
    return () => window.removeEventListener('toggle-shortcuts', handleToggle);
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-card border-2 border-border rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
          >
            <div className="p-6 border-b border-border flex items-center justify-between pb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Keyboard className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tight">Keyboard Shortcuts</h2>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">Work at the speed of thought</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="rounded-xl">
                <X className="w-5 h-5 text-muted-foreground" />
              </Button>
            </div>

            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {shortcutGroups.map((group, idx) => (
                  <div key={idx} className="space-y-4">
                    <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest">{group.title}</h3>
                    <div className="space-y-3">
                      {group.items.map((item, i) => (
                        <div key={i} className="flex flex-col gap-2 p-3 rounded-2xl bg-secondary/30 border border-border/50">
                          <p className="text-sm font-bold">{item.label}</p>
                          <div className="flex gap-1.5 flex-wrap">
                            {item.keys.map((k, j) => (
                              <kbd key={j} className="px-2 py-1 bg-background border border-border rounded shadow-sm text-[10px] font-black uppercase tracking-wider text-foreground">
                                {k === 'Cmd' ? (navigator.platform.toUpperCase().indexOf('MAC') >= 0 ? '⌘' : 'Ctrl') : k}
                              </kbd>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-4 bg-muted/50 border-t border-border text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">More shortcuts coming in V1.2</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default KeyboardShortcutsPanel;
