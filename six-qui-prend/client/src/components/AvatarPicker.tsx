import React from 'react';
import { motion } from 'framer-motion';

const AVATARS = ['🐮', '🐂', '🐄', '🦬', '🐷', '🐑', '🦊', '🐺', '🦁', '🐯', '🐸', '🐧'];

interface AvatarPickerProps {
  selected: string;
  onSelect: (avatar: string) => void;
}

export default function AvatarPicker({ selected, onSelect }: AvatarPickerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {AVATARS.map((a) => {
        const isSelected = selected === a;
        return (
          <motion.button
            key={a}
            type="button"
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.88 }}
            onClick={() => onSelect(a)}
            className="text-2xl w-11 h-11 rounded-xl transition-colors duration-150 relative"
            style={{
              background: isSelected
                ? 'linear-gradient(135deg, #f59e0b, #f97316)'
                : 'rgba(255,255,255,0.07)',
              border: isSelected
                ? '2px solid rgba(255,255,255,0.5)'
                : '2px solid rgba(255,255,255,0.1)',
              boxShadow: isSelected
                ? '0 0 16px rgba(251,191,36,0.5)'
                : 'none',
              transform: isSelected ? 'scale(1.08)' : 'scale(1)',
            }}
          >
            {a}
            {isSelected && (
              <span
                className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full text-black flex items-center justify-center font-black border-2 border-black"
                style={{ fontSize: 9, lineHeight: 1 }}
              >
                ✓
              </span>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
