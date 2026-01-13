'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, X, Minimize2, Maximize2 } from 'lucide-react';
import { useGameStore } from '@/stores/gameStore';
import { cn } from '@/lib/utils';

export function ChatPanel() {
    const { chatMessages, sendMessage, currentPlayer } = useGameStore();
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [hasUnread, setHasUnread] = useState(false);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
            setHasUnread(false);
        } else if (chatMessages.length > 0) {
            setHasUnread(true);
        }
    }, [chatMessages, isOpen]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (message.trim()) {
            sendMessage(message);
            setMessage('');
        }
    };

    return (
        <div className="fixed bottom-4 left-4 z-50">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="mb-4 w-80 h-96 glass-card flex flex-col overflow-hidden shadow-2xl border-neon-cyan/30"
                    >
                        {/* Header */}
                        <div className="p-3 bg-neon-cyan/20 border-b border-neon-cyan/30 flex justify-between items-center">
                            <h3 className="font-bold flex items-center gap-2 text-neon-cyan">
                                <MessageSquare className="w-4 h-4" />
                                Live Chat
                            </h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="hover:bg-white/10 p-1 rounded"
                            >
                                <Minimize2 className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                            {chatMessages.length === 0 ? (
                                <div className="text-center text-dark-500 text-sm mt-10">
                                    No messages yet. Say hi!
                                </div>
                            ) : (
                                chatMessages.map((msg) => {
                                    const isMe = msg.playerId === currentPlayer?.id;
                                    return (
                                        <div
                                            key={msg.id}
                                            className={cn(
                                                "flex flex-col text-sm max-w-[85%]",
                                                isMe ? "ml-auto items-end" : "mr-auto items-start"
                                            )}
                                        >
                                            <span className="text-[10px] text-dark-400 mb-0.5 px-1">
                                                {isMe ? 'You' : msg.playerName}
                                            </span>
                                            <div className={cn(
                                                "p-2 rounded-lg break-words",
                                                isMe
                                                    ? "bg-neon-cyan/20 text-white rounded-br-none border border-neon-cyan/30"
                                                    : "bg-dark-700 text-gray-200 rounded-bl-none border border-dark-600"
                                            )}>
                                                {msg.message}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSend} className="p-3 border-t border-dark-700 bg-dark-800/50">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 bg-dark-900 border border-dark-600 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-neon-cyan transition-colors"
                                />
                                <button
                                    type="submit"
                                    disabled={!message.trim()}
                                    className="bg-neon-cyan/20 hover:bg-neon-cyan/30 text-neon-cyan p-2 rounded border border-neon-cyan/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {!isOpen && (
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsOpen(true)}
                    className="w-12 h-12 rounded-full glass-card flex items-center justify-center border-neon-cyan/50 text-neon-cyan shadow-lg relative group"
                >
                    <MessageSquare className="w-6 h-6" />
                    {hasUnread && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                    )}
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-dark-900 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-dark-700 pointer-events-none">
                        Open Chat
                    </span>
                </motion.button>
            )}
        </div>
    );
}
