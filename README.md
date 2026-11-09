<img src="https://socialify.git.ci/Qhathizwe/Celazims-AI/image?language=1&name=1&owner=1&stargazers=1&theme=Auto" alt="Celazims-AI" width="640" height="320" />

 
# Celazims-AI 🤖

### Your Personal AI Assistant

Celazims-AI is a locally running AI chatbot built with React, TypeScript, and Ollama. It uses a locally installed Qwen language model to generate intelligent responses, answer questions, assist with programming, and support everyday learning and problem-solving.

The project focuses on creating a simple, modern, and user-friendly AI chat experience without unnecessary complexity.

---

## 👨‍💻 About the Project

Celazims-AI is a personal AI assistant created by **Scelo Mike Phoswa**.

The application connects a React frontend to Ollama, which runs the AI model locally on the user's computer. This allows users to interact with an AI assistant without relying on a cloud-based AI API.

The assistant is designed to understand its identity, recognize its creator, explain its purpose, and respond to general questions.

## 🎯 Project Objectives

- Build a functional AI chatbot using React and TypeScript.
- Integrate a locally installed AI model through Ollama.
- Provide a clean and responsive chat interface.
- Maintain conversation history locally.
- Create an assistant with a defined identity and purpose.
- Demonstrate how frontend applications communicate with locally hosted AI models.

## ✨ Features

- **AI-powered conversations:** Ask questions and receive AI-generated responses.
- **Local AI integration:** Uses Ollama to run the language model locally.
- **Chat interface:** Send messages and display AI responses in a conversational layout.
- **Conversation history:** Save chat messages in browser local storage.
- **Loading indicators:** Show when the AI is generating a response.
- **Error handling:** Display helpful feedback when the AI service is unavailable.
- **Response statistics:** Display response timing and generation speed when available.
- **Clear conversation:** Start a fresh conversation.
- **Responsive design:** Adapt the interface to desktop, tablet, and mobile screens.
- **Personal AI identity:** Recognizes its name, creator, and purpose.

## 🧠 AI Identity

Celazims-AI follows three important identity instructions:

| Question | Expected response |
|---|---|
| Who are you? | I am Celazims-AI, a personal AI assistant powered by Qwen through Ollama and created by Scelo Mike Phoswa. |
| Who am I? | You are Scelo Mike Phoswa, my creator and primary user. |
| What is your purpose? | My purpose is to assist with programming, technology, education, research, creativity, problem-solving, general knowledge, and productivity. |

These identity instructions are included in the assistant's system prompt.

## 🛠️ Technologies Used

| Technology | Purpose |
|---|---|
| React | Building the user interface |
| TypeScript | Type safety and application logic |
| Vite | Development server and build tool |
| CSS3 | Styling and responsive design |
| Ollama | Running the AI model locally |
| Qwen | Generating AI responses |
| Browser Local Storage | Saving conversation history |

## 📁 Application Structure

The application code is intentionally kept in two main files.

```text
src/
│
├── App.tsx
│   ├── Chat interface
│   ├── Message handling
│   ├── Ollama API connection
│   ├── AI system instructions
│   ├── Conversation history
│   ├── Loading and error handling
│   └── Response statistics
│
└── App.css
    ├── Main layout
    ├── Header styling
    ├── Chat message bubbles
    ├── Input area
    ├── Buttons
    ├── Animations
    └── Responsive design
```

The existing Vite project entry-point and configuration files remain part of the development environment. The application itself is implemented in `App.tsx` and styled in `App.css`.

## ⚙️ How It Works

Celazims-AI uses a frontend-to-local-AI architecture.

1. The user opens the React application.
2. The user enters a question in the chat input.
3. React captures the message and updates the conversation.
4. The frontend sends the conversation to Ollama's API.
5. Ollama forwards the request to the selected local AI model.
6. The model generates a response.
7. Ollama returns the generated response.
8. React displays the response in the chat interface.
9. The conversation can be saved in browser local storage.

### Application Flow

```text
       USER
         |
         v
   React Chat Interface
         |
         v
     App.tsx
         |
         v
    Ollama API
         |
         v
    Qwen Model
         |
         v
   Generated Response
         |
         v
   React Chat Interface
         |
         v
       USER
```

## 🚀 Getting Started

Follow these instructions to run Celazims-AI locally.

### 1. Prerequisites

Install the following:

- Node.js
- npm
- Git
- Ollama

### 2. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

Navigate into the project:

```bash
cd Celazims-AI
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Install and Run Ollama

Download Ollama from:

https://ollama.com/

Open Command Prompt and check the installed models:

```bash
ollama list
```

Pull the Qwen model if it is not already installed:

```bash
ollama pull qwen3:4b
```

Start the model:

```bash
ollama run qwen3:4b
```

Keep Ollama available while using the application.

### 5. Start the React Application

Open a separate terminal in the project directory:

```bash
npm run dev
```

Vite will provide a local development URL, usually:

```text
http://localhost:5173
```

Open that address in your browser.

## 🔌 Ollama API Integration

Celazims-AI communicates with Ollama through its local API.

Default Ollama address:

```text
http://localhost:11434
```

Chat API endpoint:

```text
/api/chat
```

The application uses the following request structure:

```json
{
  "model": "qwen3:4b",
  "messages": [
    {
      "role": "user",
      "content": "Who are you?"
    }
  ],
  "stream": false
}
```

The frontend receives the generated response and displays it in the conversation.

The development setup uses the `/ollama` Vite proxy route to forward requests to Ollama's local server.

## 🧪 Testing the Application

After starting the application, test the following:

- Ask: "Who are you?"
- Ask: "Who am I?"
- Ask: "What is your purpose?"
- Ask a general knowledge question.
- Ask a programming-related question.
- Send multiple messages in the same conversation.
- Refresh the browser and check whether saved conversation history remains.
- Test the clear conversation functionality.
- Stop Ollama temporarily and check the application's error handling.

## 🔒 Privacy and Local Processing

The AI model runs locally through Ollama. This reduces dependence on external AI services and avoids requiring a third-party cloud AI API for model inference.

Conversation history stored in browser local storage remains in that browser's storage unless the user clears it.

Local processing does not automatically guarantee complete privacy: browser storage, application logs, and any external services used by the wider application should still be considered.

## 🔮 Future Improvements

Potential improvements include:

- Support for multiple locally installed AI models.
- Streaming responses as the AI generates them.
- Improved conversation management.
- Exporting conversations.
- Voice input and text-to-speech.
- File upload and document analysis.
- More advanced AI personalization.
- Improved error diagnostics and connection status.

## 👨‍💻 Developer

**Scelo Mike Phoswa**

Creator and developer of Celazims-AI.

- GitHub: [Qhathizwe](https://github.com/Qhathizwe)
- Project: Celazims-AI

---

*Celazims-AI — Intelligent assistance, powered locally.* 
