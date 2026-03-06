import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatMessage } from '@shared/types';
import { useGameStore } from '../store/gameStore';
import { playClick } from '../utils/sounds';

interface ChatProps {
  messages: ChatMessage[];
  myId: string | null;
}

export default function Chat({ messages, myId }: ChatProps) {
  const [input, setInput] = useState('');
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const sendChat = useGameStore((s) => s.sendChat);
  const endRef = useRef<HTMLDivElement>(null);
  const prevLen = useRef(messages.length);

  useEffect(() => {
    if (!open && messages.length > prevLen.current) {
      setUnread((u) => u + (messages.length - prevLen.current));
    }
    prevLen.current = messages.length;
    if (open) endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const handleOpen = () => { setOpen(true); setUnread(0); playClick(); };

  const send = () => {
    if (!input.trim()) return;
    sendChat(input);
    setInput('');
  };

  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fixed bottom-4 right-4 z-30 flex flex-col items-end gap-2">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 20, originY: 1 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20, transition: { duration: 0.2 } }}
            className="w-72 h-80 flex flex-col overflow-hidden rounded-3xl shadow-2xl"
            style={{
              background: 'rgba(15,13,26,0.95)',
              border: '1px solid rgba(255,255,255,0.12)',
              backdropFilter: 'blur(16px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/8">
              <span className="text-sm font-black text-white/80 font-nunito">💬 Chat</span>
              <motion.button
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setOpen(false)}
                className="text-white/40 hover:text-white text-xl leading-none"
              >×</motion.button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {messages.length === 0 && (
                <div className="text-center text-white/20 text-xs font-nunito mt-8">
                  Aucun message… soyez le premier ! 👋
                </div>
              )}
              {messages.map((msg) => {
                const isMe = msg.playerId === myId;
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, x: isMe ? 20 : -20, scale: 0.9 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    {!isMe && (
                      <span className="text-[10px] text-white/40 mb-0.5 font-nunito font-bold">{msg.playerName}</span>
                    )}
                    <div
                      className={`px-3 py-1.5 rounded-2xl text-sm max-w-[90%] break-words font-nunito font-semibold ${
                        isMe
                          ? 'text-black rounded-br-none'
                          : 'bg-white/10 text-white/90 rounded-bl-none'
                      }`}
                      style={isMe ? {
                        background: 'linear-gradient(135deg, #a78bfa, #8b5cf6)',
                        boxShadow: '0 2px 8px rgba(167,139,250,0.4)',
                      } : {}}
                    >
                      {msg.message}
                    </div>
                    <span className="text-[9px] text-white/20 mt-0.5 font-nunito">{formatTime(msg.timestamp)}</span>
                  </motion.div>
                );
              })}
              <div ref={endRef} />
            </div>

            {/* Input */}
            <div className="p-2.5 border-t border-white/8 flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && send()}
                placeholder="Message… (Entrée pour envoyer)"
                maxLength={200}
                className="flex-1 bg-white/8 text-white text-xs font-nunito font-semibold px-3 py-2 rounded-xl outline-none focus:ring-1 focus:ring-amber-500 placeholder-white/25"
              />
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={send}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-black font-black"
                style={{ background: 'linear-gradient(135deg, #fbbf24, #f97316)' }}
              >
                →
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle button */}
      <motion.button
        onClick={handleOpen}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="relative w-14 h-14 rounded-2xl shadow-xl flex items-center justify-center text-2xl"
        style={{
          background: 'linear-gradient(135deg, #a78bfa, #8b5cf6)',
          border: '1px solid rgba(255,255,255,0.2)',
          boxShadow: '0 4px 0 rgba(0,0,0,0.3), 0 0 20px rgba(167,139,250,0.3)',
        }}
      >
        💬
        <AnimatePresence>
          {unread > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-2 -right-2 min-w-[22px] h-[22px] bg-red-500 rounded-full text-xs text-white flex items-center justify-center font-black px-1 border-2 border-felt-dark font-nunito"
            >
              {unread > 9 ? '9+' : unread}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
