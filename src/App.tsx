
import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import "./App.css";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  totalDuration?: number;
  evalCount?: number;
  evalDuration?: number;
};

type Conversation = {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
};

type OllamaResponse = {
  message?: {
    role: string;
    content: string;
  };
  total_duration?: number;
  eval_count?: number;
  eval_duration?: number;
};

const OLLAMA_URL = "http://localhost:11434/api/chat";
const MODEL = "llama3.2:latest";

const STORAGE_KEY = "celazims-conversations";
const LEGACY_STORAGE_KEY = "celazims-chat";

const SYSTEM_PROMPT = `
You are Celazims-AI, a helpful personal AI assistant.

IDENTITY:
- Your name is Celazims-AI.
- You were created by Scelo Mike Phoswa.
- You are powered by a Llama 3.2 model running locally through Ollama.
- Your primary user and creator is Scelo Mike Phoswa.

IMPORTANT IDENTITY QUESTIONS:
If asked "Who are you?", explain that you are Celazims-AI, a personal AI assistant created by Scelo Mike Phoswa and powered by Llama 3.2 through Ollama.

If asked "Who am I?", answer that the user is Scelo Mike Phoswa, your creator and primary user. Do not invent additional personal information.

If asked "What is your purpose?", explain that your purpose is to assist with programming, technology, education, research, creativity, problem-solving, general knowledge, and productivity.

BEHAVIOUR:
- Be friendly, intelligent, respectful, and helpful.
- Explain technical topics in beginner-friendly language when appropriate.
- Give complete examples when users ask for code.
- Do not pretend to have access to the internet or information you do not have.
- Answer general questions beyond your identity.
- If you do not know something, be honest.
- Use clear formatting and readable explanations.
`;

const suggestions = [
  {
    icon: "⌘",
    title: "Help me code",
    prompt: "Help me understand a programming concept step by step.",
  },
  {
    icon: "✦",
    title: "Explore an idea",
    prompt: "Help me brainstorm a creative technology project.",
  },
  {
    icon: "◈",
    title: "Learn something",
    prompt: "Teach me something interesting about artificial intelligence.",
  },
];

function createConversation(): Conversation {
  const now = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    title: "New conversation",
    messages: [],
    createdAt: now,
    updatedAt: now,
  };
}

function loadConversations(): Conversation[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      const parsed = JSON.parse(saved);

      if (Array.isArray(parsed)) {
        return parsed;
      }
    }

    // Migrate the previous single-chat storage format.
    const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);

    if (legacy) {
      const oldMessages: Message[] = JSON.parse(legacy);

      if (Array.isArray(oldMessages) && oldMessages.length > 0) {
        const conversation = createConversation();

        conversation.messages = oldMessages;
        conversation.title =
          oldMessages.find((message) => message.role === "user")
            ?.content.slice(0, 45) || "Previous conversation";

        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify([conversation])
        );

        return [conversation];
      }
    }
  } catch (error) {
    console.error("Could not load chat history:", error);
  }

  return [];
}

function formatDuration(nanoseconds?: number): string {
  if (typeof nanoseconds !== "number" || nanoseconds <= 0) {
    return "Unavailable";
  }

  const seconds = nanoseconds / 1_000_000_000;

  if (seconds < 1) {
    return `${(seconds * 1000).toFixed(0)} ms`;
  }

  return `${seconds.toFixed(2)} seconds`;
}

function calculateTokensPerSecond(
  evalCount?: number,
  evalDuration?: number
): string {
  if (
    typeof evalCount !== "number" ||
    typeof evalDuration !== "number" ||
    evalDuration <= 0
  ) {
    return "Unavailable";
  }

  const seconds = evalDuration / 1_000_000_000;
  const speed = evalCount / seconds;

  return `${speed.toFixed(1)} tokens/sec`;
}

function App() {
  const [conversations, setConversations] =
    useState<Conversation[]>(loadConversations);

  const [activeChatId, setActiveChatId] = useState<string | null>(
    () => {
      const saved = loadConversations();
      return saved[0]?.id ?? null;
    }
  );

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showHistory, setShowHistory] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const activeConversation = conversations.find(
    (conversation) => conversation.id === activeChatId
  );

  const messages = activeConversation?.messages ?? [];

  // Save all conversations whenever they change.
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(conversations)
    );
  }, [conversations]);

  // Scroll to the latest message.
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, isLoading]);

  const updateConversation = (
    chatId: string,
    updatedMessages: Message[]
  ) => {
    setConversations((previous) =>
      previous.map((conversation) =>
        conversation.id === chatId
          ? {
              ...conversation,
              messages: updatedMessages,
              updatedAt: new Date().toISOString(),
              title:
                updatedMessages.find(
                  (message) => message.role === "user"
                )?.content.slice(0, 45) || "New conversation",
            }
          : conversation
      )
    );
  };

  const startNewChat = () => {
    if (isLoading) return;

    const conversation = createConversation();

    setConversations((previous) => [
      conversation,
      ...previous,
    ]);

    setActiveChatId(conversation.id);
    setInput("");
    setError("");
    setShowHistory(false);
  };

  const openConversation = (chatId: string) => {
    if (isLoading) return;

    setActiveChatId(chatId);
    setError("");
    setShowHistory(false);
  };

  const deleteConversation = (chatId: string) => {
    if (isLoading && chatId === activeChatId) return;

    const remaining = conversations.filter(
      (conversation) => conversation.id !== chatId
    );

    setConversations(remaining);

    if (activeChatId === chatId) {
      setActiveChatId(remaining[0]?.id ?? null);
    }

    setError("");
  };

  const clearAllHistory = () => {
    if (isLoading) return;

    setConversations([]);
    setActiveChatId(null);
    setError("");
    setShowHistory(false);
  };

  const sendMessage = async (text?: string) => {
    const messageText = (text ?? input).trim();

    if (!messageText || isLoading) return;

    setError("");
    setInput("");

    let chatId = activeChatId;

    // Create a conversation automatically if none is selected.
    if (!chatId) {
      const conversation = createConversation();

      chatId = conversation.id;

      setConversations((previous) => [
        conversation,
        ...previous,
      ]);

      setActiveChatId(chatId);
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: messageText,
    };

    const updatedMessages = [...messages, userMessage];

    updateConversation(chatId, updatedMessages);
    setIsLoading(true);

    try {
      const response = await fetch(OLLAMA_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            {
              role: "system",
              content: SYSTEM_PROMPT,
            },
            ...updatedMessages.map((message) => ({
              role: message.role,
              content: message.content,
            })),
          ],
          stream: false,
          think: false,
        }),
      });

      if (!response.ok) {
        const details = await response.text();

        throw new Error(
          `Ollama returned ${response.status}. ${details}`
        );
      }

      const data: OllamaResponse = await response.json();

      const reply = data.message?.content?.trim();

      if (!reply) {
        throw new Error("Ollama returned an empty response.");
      }

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: reply,
        totalDuration: data.total_duration,
        evalCount: data.eval_count,
        evalDuration: data.eval_duration,
      };

      updateConversation(chatId, [
        ...updatedMessages,
        assistantMessage,
      ]);
    } catch (err) {
      console.error("Celazims-AI error:", err);

      const errorMessage =
        err instanceof Error
          ? err.message
          : "An unknown error occurred.";

      setError(
        `${errorMessage} Check that Ollama is running and that "${MODEL}" is installed.`
      );
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (
    event: KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <div className="brand-icon">
            <img
              src="/celazims-icon.png"
              alt="Celazims-AI Logo"
            />
          </div>

          <div className="brand-text">
            <h1>
              Celazims<span>-AI</span>
            </h1>
            <p>Your intelligence companion</p>
          </div>
        </div>

        <div className="header-actions">
          <div className="connection-status">
            <span className="status-dot"></span>
            <span>Local AI · {MODEL}</span>
          </div>

          <button
            className="history-button"
            onClick={() => setShowHistory((previous) => !previous)}
            disabled={isLoading}
          >
            <span>◷</span>
            <span>History</span>
            <span className="history-count">
              {conversations.length}
            </span>
          </button>

          <button
            className="clear-button"
            onClick={startNewChat}
            disabled={isLoading}
            title="Start a new conversation"
          >
            <span>＋</span>
            <span className="clear-label">New chat</span>
          </button>
        </div>

        {showHistory && (
          <div className="history-panel">
            <div className="history-heading">
              <div>
                <h3>Chat history</h3>
                <p>Your saved conversations</p>
              </div>

              <button
                className="close-history"
                onClick={() => setShowHistory(false)}
                aria-label="Close history"
              >
                ×
              </button>
            </div>

            {conversations.length === 0 ? (
              <div className="empty-history">
                <span>◷</span>
                <p>No conversations yet.</p>
                <small>Your chats will appear here automatically.</small>
              </div>
            ) : (
              <div className="history-list">
                {conversations
                  .slice()
                  .sort(
                    (a, b) =>
                      new Date(b.updatedAt).getTime() -
                      new Date(a.updatedAt).getTime()
                  )
                  .map((conversation) => (
                    <div
                      className={`history-item ${
                        conversation.id === activeChatId
                          ? "active"
                          : ""
                      }`}
                      key={conversation.id}
                    >
                      <button
                        className="history-item-open"
                        onClick={() =>
                          openConversation(conversation.id)
                        }
                      >
                        <span className="history-item-icon">✦</span>

                        <span className="history-item-details">
                          <strong>{conversation.title}</strong>
                          <small>
                            {new Date(
                              conversation.updatedAt
                            ).toLocaleString()}
                          </small>
                        </span>
                      </button>

                      <button
                        className="delete-history"
                        onClick={() =>
                          deleteConversation(conversation.id)
                        }
                        title="Delete conversation"
                        aria-label={`Delete ${conversation.title}`}
                        disabled={isLoading}
                      >
                        ×
                      </button>
                    </div>
                  ))}
              </div>
            )}

            {conversations.length > 0 && (
              <button
                className="clear-history"
                onClick={clearAllHistory}
                disabled={isLoading}
              >
                Clear all history
              </button>
            )}
          </div>
        )}
      </header>

      <main className="main-content">
        <section className="chat-container">
          {messages.length === 0 ? (
            <div className="welcome-screen">
              <div className="welcome-orb">
                <div className="orb-inner">
                  <img
                    src="/celazims-icon.png"
                    alt="Celazims-AI Logo"
                  />
                </div>
              </div>

              <div className="welcome-label">
                <span className="welcome-line"></span>
                YOUR PERSONAL AI ASSISTANT
                <span className="welcome-line"></span>
              </div>

              <h2>
                Think bigger.
                <br />
                <span>Discover more.</span>
              </h2>

              <p className="welcome-description">
                I'm Celazims-AI. Ask me anything, explore ideas,
                solve problems, or build something extraordinary.
              </p>

              <div className="suggestion-grid">
                {suggestions.map((suggestion) => (
                  <button
                    className="suggestion-card"
                    key={suggestion.title}
                    onClick={() => sendMessage(suggestion.prompt)}
                    disabled={isLoading}
                  >
                    <span className="suggestion-icon">
                      {suggestion.icon}
                    </span>

                    <span className="suggestion-title">
                      {suggestion.title}
                    </span>

                    <span className="suggestion-prompt">
                      {suggestion.prompt}
                    </span>

                    <span className="suggestion-arrow">↗</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="messages">
              {messages.map((message) => (
                <div
                  className={`message-row ${message.role}`}
                  key={message.id}
                >
                  {message.role === "assistant" && (
                    <div className="message-avatar">✦</div>
                  )}

                  <div className="message-content">
                    <div className="message-name">
                      {message.role === "assistant"
                        ? "Celazims-AI"
                        : "You"}
                    </div>

                    <div className="message-bubble">
                      {message.content}
                    </div>

                    {message.role === "assistant" && (
                      <div className="response-stats">
                        <span className="stat-item">
                          <span className="stat-icon">◷</span>
                          Duration:{" "}
                          <strong>
                            {formatDuration(message.totalDuration)}
                          </strong>
                        </span>

                        <span className="stat-divider">·</span>

                        <span className="stat-item">
                          <span className="stat-icon">⚡</span>
                          Speed:{" "}
                          <strong>
                            {calculateTokensPerSecond(
                              message.evalCount,
                              message.evalDuration
                            )}
                          </strong>
                        </span>

                        {typeof message.evalCount === "number" && (
                          <>
                            <span className="stat-divider">·</span>
                            <span className="stat-item">
                              Tokens: <strong>{message.evalCount}</strong>
                            </span>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {message.role === "user" && (
                    <div className="user-avatar">S</div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="message-row assistant">
                  <div className="message-avatar">✦</div>

                  <div className="message-content">
                    <div className="message-name">Celazims-AI</div>

                    <div className="message-bubble typing-bubble">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}

          {error && (
            <div className="error-message">
              <span>⚠</span>
              <p>{error}</p>
            </div>
          )}
        </section>
      </main>

      <footer className="input-area">
        <div className="input-wrapper">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message Celazims-AI..."
            rows={1}
            disabled={isLoading}
          />

          <button
            className="send-button"
            onClick={() => sendMessage()}
            disabled={!input.trim() || isLoading}
            aria-label="Send message"
          >
            ➤
          </button>
        </div>

        <div className="input-footer">
          <span>
            <span className="footer-sparkle">✦</span>
            Powered by {MODEL} · Running locally with Ollama
          </span>

          <span>Enter to send · Shift + Enter for a new line</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
