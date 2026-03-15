import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bot, MessageCircle, Send, Sparkles, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { chatWithAi } from '../utils/api';

const SEND_COOLDOWN_MS = 1200;
const MAX_MESSAGE_LENGTH = 500;
const DUPLICATE_BLOCK_WINDOW_MS = 8000;

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState([
    {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: 'Hi! Ask me anything about your URLs and analytics.',
    },
  ]);
  const [isSending, setIsSending] = useState(false);
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [cooldownNow, setCooldownNow] = useState(Date.now());
  const endOfMessagesRef = useRef(null);
  const lastSubmissionRef = useRef({ message: '', at: 0 });

  const cooldownRemaining = useMemo(
    () => Math.max(0, cooldownUntil - cooldownNow),
    [cooldownUntil, cooldownNow]
  );

  useEffect(() => {
    if (!cooldownUntil) {
      return undefined;
    }

    const intervalId = setInterval(() => {
      const current = Date.now();
      setCooldownNow(current);
      if (current >= cooldownUntil) {
        clearInterval(intervalId);
      }
    }, 200);

    return () => clearInterval(intervalId);
  }, [cooldownUntil]);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen, isSending]);

  const handleSendMessage = async () => {
    const normalizedMessage = inputValue.replace(/\s+/g, ' ').trim();

    if (!normalizedMessage || isSending) {
      return;
    }

    if (normalizedMessage.length > MAX_MESSAGE_LENGTH) {
      toast.error(`Message must be under ${MAX_MESSAGE_LENGTH} characters.`);
      return;
    }

    if (cooldownRemaining > 0) {
      toast.error(`Please wait ${Math.ceil(cooldownRemaining / 1000)} second(s) before sending again.`);
      return;
    }

    const now = Date.now();
    if (
      lastSubmissionRef.current.message === normalizedMessage &&
      now - lastSubmissionRef.current.at < DUPLICATE_BLOCK_WINDOW_MS
    ) {
      toast.error('Please avoid sending the same message repeatedly.');
      return;
    }

    const userMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: normalizedMessage,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsSending(true);
    setCooldownUntil(now + SEND_COOLDOWN_MS);
    setCooldownNow(now);
    lastSubmissionRef.current = { message: normalizedMessage, at: now };

    try {
      const response = await chatWithAi(normalizedMessage);
      const aiReply = response?.data?.data?.reply?.trim() || 'I could not generate a response right now.';

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: aiReply,
        },
      ]);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to send message right now.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-4 sm:right-6 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="w-[calc(100vw-2rem)] sm:w-[380px] h-[540px] max-h-[72vh] glass-card border border-white/60 shadow-2xl shadow-indigo-500/10 overflow-hidden flex flex-col"
          >
            <div className="px-4 py-3 border-b border-indigo-100/70 bg-white/60 backdrop-blur-sm flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30">
                  <Sparkles size={18} />
                </div>
                <div>
                  <p className="font-semibold text-slate-800 leading-tight">AI URL Assistant</p>
                  <p className="text-xs text-slate-500">Secure, account-aware answers</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="h-9 w-9 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors flex items-center justify-center"
                aria-label="Close chat"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gradient-to-b from-white/10 to-white/40">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`
                      max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm
                      ${message.role === 'user'
                        ? 'bg-indigo-600 text-white rounded-br-md'
                        : 'bg-white/85 text-slate-700 border border-indigo-100 rounded-bl-md'
                      }
                    `}
                  >
                    {message.role === 'assistant' && (
                      <span className="inline-flex items-center mr-2 text-indigo-600">
                        <Bot size={14} />
                      </span>
                    )}
                    {message.content}
                  </div>
                </div>
              ))}
              {isSending && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] rounded-2xl rounded-bl-md px-3.5 py-2.5 text-sm bg-white/85 border border-indigo-100 text-slate-500">
                    Thinking...
                  </div>
                </div>
              )}
              <div ref={endOfMessagesRef} />
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                handleSendMessage();
              }}
              className="p-3 border-t border-indigo-100/70 bg-white/70 backdrop-blur-sm"
            >
              <div className="flex items-end gap-2">
                <textarea
                  value={inputValue}
                  onChange={(event) => setInputValue(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Ask about your links, clicks, trends..."
                  rows={1}
                  maxLength={MAX_MESSAGE_LENGTH}
                  className="min-h-[44px] max-h-[120px] flex-1 resize-y rounded-xl px-3 py-2.5 text-sm glass-input"
                />
                <button
                  type="submit"
                  disabled={isSending || !inputValue.trim() || cooldownRemaining > 0}
                  className="h-11 min-w-11 px-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center shadow-lg shadow-indigo-500/30"
                  aria-label="Send message"
                >
                  <Send size={17} />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => setIsOpen((prev) => !prev)}
        className="h-14 w-14 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-xl shadow-indigo-500/40 flex items-center justify-center border border-indigo-300/40"
        aria-label={isOpen ? 'Close AI chat' : 'Open AI chat'}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </motion.button>
    </div>
  );
};

export default ChatWidget;
