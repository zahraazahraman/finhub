import { useState, useEffect, useRef } from "react";
import ChatBLL from "../../bll/ChatsBLL.js";
import Spinner from "../ui/Spinner.jsx";
import { stripMarkdown } from "../../utils/stripMarkdown.js";

// ── Renders a single chat bubble ──
function ChatBubble({ message }) {
  const isUser = message.sender_type === "user";
  // AI replies are shown as plain text; strip any markdown the model emits so
  // raw symbols (**bold**, tables, #) never reach the user. User text is left as-is.
  const text = isUser ? message.message_text : stripMarkdown(message.message_text);

  return (
    <div className={`flex items-end gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}>

      {/* AI avatar */}
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-skin-brand-subtle flex items-center justify-center flex-shrink-0 mb-0.5">
          <svg className="w-4 h-4 text-brand" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
          </svg>
        </div>
      )}

      {/* Bubble */}
      <div
        className={`
          max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words
          ${isUser
            ? "bg-brand text-white rounded-br-sm"
            : "bg-skin-card border border-skin-border text-skin-text rounded-bl-sm"
          }
        `}
      >
        {text}
      </div>
    </div>
  );
}

// ── Typing indicator ──
function TypingIndicator() {
  return (
    <div className="flex items-end gap-2.5">
      <div className="w-7 h-7 rounded-full bg-skin-brand-subtle flex items-center justify-center flex-shrink-0 mb-0.5">
        <svg className="w-4 h-4 text-brand" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09 3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
        </svg>
      </div>
      <div className="bg-skin-card border border-skin-border px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-skin-text-muted animate-bounce [animation-delay:0ms]" />
        <span className="w-1.5 h-1.5 rounded-full bg-skin-text-muted animate-bounce [animation-delay:150ms]" />
        <span className="w-1.5 h-1.5 rounded-full bg-skin-text-muted animate-bounce [animation-delay:300ms]" />
      </div>
    </div>
  );
}

// ── Suggested prompts shown on empty state ──
const SUGGESTED_PROMPTS = [
  "How is my portfolio performing overall?",
  "Am I spending more than I earn this month?",
  "Which of my goals should I focus on first?",
  "What's a good saving strategy for my current balance?",
];

function EmptyState({ onPrompt }) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-6 px-4 py-10">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="w-14 h-14 rounded-full bg-skin-brand-subtle flex items-center justify-center">
          <svg className="w-7 h-7 text-brand" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09 3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
          </svg>
        </div>
        <div>
          <p className="text-skin-text font-semibold text-lg">FinHub AI Consultant</p>
          <p className="text-skin-text-secondary text-sm mt-1 max-w-xs">
            Ask me anything about your finances. I can see your accounts, goals, and investments.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-xl">
        {SUGGESTED_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            onClick={() => onPrompt(prompt)}
            className="text-left px-4 py-3 rounded-xl border border-skin-border bg-skin-card hover:bg-skin-hover text-sm text-skin-text-secondary hover:text-skin-text transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── History: session list ──
function HistoryList({ sessions = [], loading, onSelect }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center flex-1">
        <Spinner size="lg" />
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-3 text-center px-6">
        <div className="w-12 h-12 rounded-full bg-skin-brand-subtle flex items-center justify-center">
          <svg className="w-6 h-6 text-brand" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        </div>
        <p className="text-skin-text font-medium">No past chats yet</p>
        <p className="text-skin-text-secondary text-sm">
          Start a conversation and it will appear here after you begin a new chat.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2.5">
      {sessions.map((s) => {
        const date = new Date(s.started_at);
        const dateLabel = date.toLocaleDateString(undefined, {
          month: "short", day: "numeric", year: "numeric",
        });
        const timeLabel = date.toLocaleTimeString(undefined, {
          hour: "2-digit", minute: "2-digit",
        });
        const count = parseInt(s.message_count, 10);

        const isActive = s.ended_at === null;

        return (
          <button
            key={s.chat_session_id}
            onClick={() => onSelect(s.chat_session_id, isActive)}
            className="w-full text-left px-4 py-3.5 rounded-xl border border-skin-border bg-skin-card hover:bg-skin-hover transition-colors group"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  {isActive && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-brand bg-skin-brand-subtle px-1.5 py-0.5 rounded-full flex-shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
                      Current
                    </span>
                  )}
                  <p className="text-sm text-skin-text truncate">
                    {s.snippet ?? <span className="text-skin-text-muted italic">Empty session</span>}
                  </p>
                </div>
                <p className="text-xs text-skin-text-muted mt-0.5">
                  {dateLabel} at {timeLabel} · {count} {count === 1 ? "message" : "messages"}
                </p>
              </div>
              <svg
                className="w-4 h-4 text-skin-text-muted group-hover:text-skin-text flex-shrink-0 mt-0.5 transition-colors"
                fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ── History: single session detail (read-only) ──
function SessionDetail({ session, messages = [], loading, onBack, onResume, resuming }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "instant" });
  }, [messages]);

  if (loading) {
    return (
      <div className="flex items-center justify-center flex-1">
        <Spinner size="lg" />
      </div>
    );
  }

  const date = session
    ? new Date(session.started_at).toLocaleDateString(undefined, {
        weekday: "long", month: "long", day: "numeric", year: "numeric",
      })
    : "";

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Sub-header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-skin-border bg-skin-base flex-shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-skin-text-secondary hover:text-skin-text transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
          All chats
        </button>
        <span className="text-xs text-skin-text-muted">{date}</span>
        <button
          onClick={onResume}
          disabled={resuming}
          className="flex items-center gap-1.5 text-xs font-medium text-brand hover:underline disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {resuming ? <Spinner size="xs" /> : (
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
            </svg>
          )}
          Continue this chat
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-4 scroll-smooth">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center flex-1">
            <p className="text-sm text-skin-text-muted">No messages in this session.</p>
          </div>
        ) : (
          messages.map((msg) => <ChatBubble key={msg.message_id} message={msg} />)
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

// ── Main chat panel ──
export default function AIChatPanel() {
  // Active chat state
  const [sessionId,      setSessionId]      = useState(null);
  const [messages,       setMessages]       = useState([]);
  const [input,          setInput]          = useState("");
  const [loading,        setLoading]        = useState(true);
  const [sending,        setSending]        = useState(false);
  const [error,          setError]          = useState("");
  const [newChatConfirm, setNewChatConfirm] = useState(false);

  // History state
  const [view,            setView]            = useState("chat");   // "chat" | "history" | "session"
  const [historyList,     setHistoryList]     = useState([]);
  const [historyLoading,  setHistoryLoading]  = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessionMessages, setSessionMessages] = useState([]);
  const [sessionLoading,  setSessionLoading]  = useState(false);
  const [resuming,        setResuming]        = useState(false);

  const bottomRef   = useRef(null);
  const inputRef    = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      const result = await ChatBLL.getSession();
      if (result.success) {
        setSessionId(result.sessionId);
        setMessages(result.messages);
      } else {
        setError(result.error);
      }
      setLoading(false);
    };
    load();
  }, []);

  useEffect(() => {
    if (view === "chat") {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, sending, view]);

  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px";
  }, [input]);

  const handleSend = async (text) => {
    const content = (text ?? input).trim();
    if (!content || sending) return;

    setInput("");
    setSending(true);
    setError("");

    const optimisticUserMsg = {
      message_id:   Date.now(),
      sender_type:  "user",
      message_text: content,
      sent_at:      new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticUserMsg]);

    const result = await ChatBLL.sendMessage(sessionId, content);

    if (result.success) {
      setMessages((prev) => [...prev, result.message]);
    } else {
      setError(result.error);
      setMessages((prev) => prev.filter((m) => m.message_id !== optimisticUserMsg.message_id));
      setInput(content);
    }
    setSending(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewChat = async () => {
    setNewChatConfirm(false);
    setLoading(true);
    setError("");
    const result = await ChatBLL.newSession();
    if (result.success) {
      setSessionId(result.sessionId);
      setMessages([]);
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  // ── History handlers ──

  const handleOpenHistory = async () => {
    setView("history");
    setHistoryLoading(true);
    const result = await ChatBLL.getHistory();
    setHistoryList(result.sessions ?? []);
    setHistoryLoading(false);
  };

  const handleSelectSession = async (id, isActive = false) => {
    if (isActive) { setView("chat"); return; }
    setView("session");
    setSessionLoading(true);
    const result = await ChatBLL.getSessionMessages(id);
    setSelectedSession(result.session ?? null);
    setSessionMessages(result.messages ?? []);
    setSessionLoading(false);
  };

  const handleResumeSession = async () => {
    if (!selectedSession) return;
    setResuming(true);
    const result = await ChatBLL.resumeSession(selectedSession.chat_session_id);
    if (result.success) {
      setSessionId(result.sessionId);
      setMessages(result.messages);
      setView("chat");
      setSelectedSession(null);
      setSessionMessages([]);
    } else {
      setError(result.error);
    }
    setResuming(false);
  };

  const handleBackToList = () => {
    setView("history");
    setSelectedSession(null);
    setSessionMessages([]);
  };

  const handleBackToChat = () => {
    setView("chat");
    setSelectedSession(null);
    setSessionMessages([]);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <Spinner size="lg" />
    </div>
  );

  const hasMessages = messages.length > 0;

  return (
    <div
      className="flex flex-col bg-skin-base border border-skin-border rounded-2xl overflow-hidden"
      style={{ height: "calc(100vh - 13rem)", minHeight: "480px" }}
    >

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-skin-border bg-skin-card flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-brand" />
          <span className="text-sm font-medium text-skin-text">
            {view === "history" ? "Chat History" : view === "session" ? "Chat History" : "AI Financial Consultant"}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Back to chat — shown in history/session views */}
          {view !== "chat" && (
            <button
              onClick={handleBackToChat}
              className="flex items-center gap-1.5 text-xs text-skin-text-secondary hover:text-skin-text transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
              </svg>
              Back to chat
            </button>
          )}

          {/* History button — shown in chat view */}
          {view === "chat" && (
            <button
              onClick={handleOpenHistory}
              className="flex items-center gap-1.5 text-xs text-skin-text-secondary hover:text-skin-text transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              History
            </button>
          )}

          {/* New Chat — shown in chat view only */}
          {view === "chat" && hasMessages && (
            newChatConfirm ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-skin-text-secondary">Start fresh?</span>
                <button
                  onClick={handleNewChat}
                  className="text-xs font-medium text-red-600 hover:underline"
                >
                  Yes, clear chat
                </button>
                <button
                  onClick={() => setNewChatConfirm(false)}
                  className="text-xs text-skin-text-secondary hover:text-skin-text"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setNewChatConfirm(true)}
                className="flex items-center gap-1.5 text-xs text-skin-text-secondary hover:text-skin-text transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
                New Chat
              </button>
            )
          )}
        </div>
      </div>

      {/* ── History: session list ── */}
      {view === "history" && (
        <HistoryList
          sessions={historyList}
          loading={historyLoading}
          onSelect={handleSelectSession}
        />
      )}

      {/* ── History: session detail ── */}
      {view === "session" && (
        <SessionDetail
          session={selectedSession}
          messages={sessionMessages}
          loading={sessionLoading}
          onBack={handleBackToList}
          onResume={handleResumeSession}
          resuming={resuming}
        />
      )}

      {/* ── Active chat ── */}
      {view === "chat" && (
        <>
          {/* Messages area */}
          <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-4 scroll-smooth">
            {!hasMessages ? (
              <EmptyState onPrompt={(p) => handleSend(p)} />
            ) : (
              <>
                {messages.map((msg) => (
                  <ChatBubble key={msg.message_id} message={msg} />
                ))}
                {sending && <TypingIndicator />}
              </>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Error banner */}
          {error && (
            <div className="px-5 py-2.5 bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-800 flex-shrink-0">
              <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Input bar */}
          <div className="px-4 py-3.5 border-t border-skin-border bg-skin-card flex-shrink-0">
            <div className="flex items-end gap-2.5 bg-skin-base border border-skin-border rounded-xl px-3.5 py-2.5 focus-within:ring-2 focus-within:ring-[var(--brand-subtle)] focus-within:border-brand transition-all">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about your finances…"
                rows={1}
                disabled={sending}
                className="flex-1 bg-transparent text-sm text-skin-text placeholder-skin-text-muted resize-none outline-none leading-relaxed disabled:opacity-50"
                style={{ minHeight: "24px", maxHeight: "120px" }}
              />
              <button
                ref={inputRef}
                onClick={() => handleSend()}
                disabled={!input.trim() || sending}
                className="flex-shrink-0 w-8 h-8 rounded-lg bg-skin-text hover:bg-skin-text-secondary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                aria-label="Send message"
              >
                {sending ? (
                  <Spinner size="xs" className="text-white" />
                ) : (
                  <svg className="w-4 h-4 text-white translate-x-px" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                  </svg>
                )}
              </button>
            </div>
            <p className="text-xs text-skin-text-muted mt-1.5 px-1">
              Press Enter to send · Shift+Enter for new line
            </p>
          </div>
        </>
      )}
    </div>
  );
}
