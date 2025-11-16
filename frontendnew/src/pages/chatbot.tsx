import { useState } from "react";
import { Send, Mic, Zap } from "lucide-react";

export default function ChatBotModern() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "bot",
      text: "Hey there! Need a boost?",
    },
  ]);

  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;

    const newMessage = {
      id: Date.now(),
      sender: "user",
      text: input,
    };

    setMessages([...messages, newMessage]);
    setInput("");

    // Fake bot reply
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "bot",
          text: "Merci pour votre message ! Comment puis‑je vous aider aujourd’hui ?",
        },
      ]);
    }, 700);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-gray-100 to-blue-50 flex flex-col items-center p-4">
      {/* Header */}
      <div className="text-center mt-6 mb-10">
        <h1 className="text-3xl font-bold text-gray-800">Bienvenue 👋</h1>
        <p className="text-gray-600 text-lg font-medium">Prêt à accomplir de grandes choses ?</p>
      </div>

      {/* Bot Illustration */}
      <div className="relative mb-10">
        <div className="w-32 h-32 bg-white shadow-xl rounded-full flex items-center justify-center">
          <div className="w-20 h-20 bg-gray-900 rounded-xl flex items-center justify-center text-white text-2xl font-bold">
            🤖
          </div>
        </div>

        {/* Small floating bubbles */}
        <div className="absolute -left-20 top-10 bg-white shadow-md rounded-full px-4 py-2 text-sm font-medium text-gray-700">
          Hey there! Need a boost?
        </div>
        <div className="absolute -right-20 top-0 bg-white shadow-md rounded-full px-4 py-2 text-sm font-medium text-gray-700">
          Comment puis‑je t’aider ?
        </div>
      </div>

      {/* Chat Container */}
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl p-4 md:p-6 flex flex-col gap-4">
        <div className="flex flex-col gap-3 max-h-96 overflow-y-auto pr-2">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`max-w-[80%] px-4 py-3 rounded-xl text-sm font-medium shadow-md ${
                msg.sender === "user"
                  ? "ml-auto bg-blue-600 text-white"
                  : "mr-auto bg-gray-100 text-gray-800"
              }`}
            >
              {msg.text}
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border">
          <button className="p-2 bg-white shadow rounded-xl hover:bg-gray-100 transition">
            <Mic size={22} />
          </button>

          <input
            type="text"
            placeholder="Écrire un message…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-transparent outline-none px-2 text-gray-700"
          />

          <button
            onClick={sendMessage}
            className="p-3 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 transition"
          >
            <Send size={20} />
          </button>
        </div>

        {/* Feature Buttons */}
        <div className="flex justify-center gap-3 flex-wrap mt-3">
          {["Fichier", "Raisonnement", "Créer Image", "Recherche avancée"].map((txt) => (
            <button
              key={txt}
              className="flex items-center gap-1 bg-white shadow px-4 py-2 rounded-full text-gray-600 hover:bg-gray-100 transition text-sm"
            >
              <Zap size={16} /> {txt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
