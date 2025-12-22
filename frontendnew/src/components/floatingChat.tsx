import { useState } from "react";
import { MessageSquare } from "lucide-react";

export default function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: "Bonjour ! Comment puis-je t'aider ?" },
  ]);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;

    // Ajouter le message utilisateur
    setMessages((prev) => [...prev, { from: "user", text: input }]);
    setInput("");

    // Réponse automatique du bot
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "Je suis un chatbot basique. 🤖" },
      ]);
    }, 500);
  };

  return (
    <>
      {/* Bouton flottant */}
      <button
        onClick={() => setIsOpen(true)}
        className="
          fixed bottom-6 right-6 
          bg-blue-800 hover:bg-blue-700 
          text-white 
          p-4 rounded-full 
          shadow-lg z-50
          transition-all hover:scale-110
        "
      >
        <MessageSquare className="h-6 w-6" />
      </button>

      {/* Modal Chatbot */}
      {isOpen && (
        <div className="fixed bottom-32 right-6 flex justify-end items-end z-50">
          <div className="bg-white rounded-t-2xl p-4 shadow-lg flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">ClientHub Bot</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-800"
              >
                ✕
              </button>
            </div>
            <div className="w-96 mb-4">Si vous n'êtes pas satisfait des réponses du bot, veuillez contacter <a className="text-blue-800" href="mailto:rosmeamagbegnon8@gmail.com">l'entreprise.</a> </div>

            {/* Messages */}
            <div className="flex-1 overflow-auto mb-4 flex flex-col space-y-2">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`${
                    msg.from === "user" ? "self-end bg-blue-800 text-white" : "self-start bg-gray-200 text-gray-800"
                  } px-3 py-2 rounded-lg max-w-xs`}
                >
                  {msg.text}
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="Écris un message..."
              />
              <button
                onClick={sendMessage}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                Envoyer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
