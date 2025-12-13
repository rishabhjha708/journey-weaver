import { motion } from 'framer-motion';
import { Copy, Trash2, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContextMenuProps {
  x: number;
  y: number;
  nodeId?: string;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onClose: () => void;
}

export function ContextMenu({
  x,
  y,
  nodeId,
  onEdit,
  onDuplicate,
  onDelete,
  onClose,
}: ContextMenuProps) {
  const menuItems = [
    { label: 'Edit Node', icon: Settings, action: onEdit },
    { label: 'Duplicate', icon: Copy, action: onDuplicate },
    { label: 'Delete', icon: Trash2, action: onDelete, destructive: true },
  ];

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50" onClick={onClose} />
      
      {/* Menu */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.1 }}
        style={{ left: x, top: y }}
        className="fixed z-50 min-w-[160px] rounded-lg border border-border bg-popover p-1 shadow-lg"
      >
        {menuItems.map((item) => (
          <button
            key={item.label}
            onClick={() => {
              item.action();
              onClose();
            }}
            className={cn(
              'flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
              item.destructive
                ? 'text-destructive hover:bg-destructive/10'
                : 'text-popover-foreground hover:bg-accent'
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </button>
        ))}
      </motion.div>
    </>
  );
}
