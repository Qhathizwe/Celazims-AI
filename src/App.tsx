import { useEffect, useRef, useState } from "react";
import logo from '../public/celazims-icon.png'
import "./App.css";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const OLLAMA_URL = "http://localhost:11434/api/chat";
const MODEL = "llama3.2:latest";

const SYSTEM_PROMPT = `
You are Celazims-AI, a helpful personal AI assistant.

IDENTITY:
- Your name is Celazims-AI.
- You were created by Scelo Mike Phoswa.
- You are powered by a Llama3.2 model running locally through Ollama.
- Your primary user and creator is Scelo Mike Phoswa.

IMPORTANT IDENTITY QUESTIONS:
If asked "Who are you?", explain that you are Celazims-AI, a personal AI assistant created by Scelo Mike Phoswa and powered by Qwen through Ollama.

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

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const savedMessages = localStorage.getItem("celazims-chat");

    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch {
        localStorage.removeItem("celazims-chat");
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("celazims-chat", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const sendMessage = async (text?: string) => {
    const messageText = (text ?? input).trim();

    if (!messageText || isLoading) return;

    setError("");
    setInput("");

    const userMessage: Message = {
      id: `${Date.now()}-user`,
      role: "user",
      content: messageText,
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
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

      const data = await response.json();
      const reply = data.message?.content?.trim();

      if (!reply) {
        throw new Error("Ollama returned an empty response.");
      }

      const assistantMessage: Message = {
        id: `${Date.now()}-assistant`,
        role: "assistant",
        content: reply,
      };

      setMessages((previous) => [...previous, assistantMessage]);
    } catch (err) {
      console.error("Celazims-AI error:", err);

      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred.";

      setError(
        `${errorMessage} Check that Ollama is running and that the model "${MODEL}" is installed.`
      );
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError("");
    localStorage.removeItem("celazims-chat");
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>
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
            <span><img src={logo} alt="Celazims-AI Logo" /></span>
          </div>

          <div className="brand-text">
            <h1>Celazims<span>-AI</span></h1>
            <p>Your intelligence companion</p>
          </div>
        </div>

        <div className="header-actions">
          <div className="connection-status">
            <span className="status-dot"></span>
            <span>Local AI</span>
          </div>

          <button
            className="clear-button"
            onClick={clearChat}
            title="Clear conversation"
            aria-label="Clear conversation"
          >
            <span>↻</span>
            <span className="clear-label">New chat</span>
          </button>
        </div>
      </header>

      <main className="main-content">
        <section className="chat-container">
          {messages.length === 0 ? (
            <div className="welcome-screen">
              <div className="welcome-orb">
                <div className="orb-inner"><img src={logo} alt="Celazims-AI Logo" /></div>
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
            Powered by Qwen · Running locally with Ollama
          </span>

          <span>Enter to send · Shift + Enter for a new line</span>
        </div>
      </footer>
    </div>
  );
}

export default App;