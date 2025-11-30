import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Globe, LineChart, BookOpen } from "lucide-react";

export default function ChatbotInterface() {
  return (
    <div className="w-full h-screen flex bg-white text-gray-800 flex-col md:flex-row">
      {/* Sidebar */}
      <div className="w-full md:w-64 border-r bg-gray-50 flex flex-col justify-between p-4 md:h-full h-auto">
        <div>
          <input
            placeholder="Search chat"
            className="w-full p-2 rounded-xl bg-white border mb-4"
          />

          <div className="hidden md:block space-y-3">
            <div className="text-sm font-semibold text-gray-600">Fichiers</div>
            <div className="text-sm font-semibold text-gray-600">Historique</div>
          </div>

          <div className="mt-6 text-xs text-gray-500 uppercase hidden md:block">Discussions récentes</div>
          <div className="mt-2 space-y-2 hidden md:block">
            <div className="p-2 rounded-lg bg-white border text-sm">Brainstorming small business</div>
            <div className="p-2 rounded-lg bg-white border text-sm">The history of Roman Empire</div>
            <div className="p-2 rounded-lg bg-white border text-sm">Crypto investment suggestions</div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col items-center justify-start pt-10 md:pt-24 px-4 md:px-0">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-blue-800 to-blue-500 bg-clip-text text-transparent text-center"
        >
          Hello Marcus
        </motion.h1>

        <p className="mt-2 md:mt-3 text-lg md:text-2xl text-gray-500 text-center">How can I help you today?</p>

        <div className="justify-center flex flex-col md:flex-row gap-4 md:gap-6 mt-10 md:mt-12 w-full max-w-md md:max-w-none">
          <Card className="w-full md:w-56 cursor-pointer shadow-sm hover:shadow-md transition">
            <CardContent className="p-4 text-center">
              <Globe className="mx-auto mb-3" />
              <div className="font-semibold">What's Happen in 24 hours?</div>
              <p className="text-sm text-gray-500 mt-1">See what's been happening in the world over the last 24 hours</p>
            </CardContent>
          </Card>

          <Card className="w-full md:w-56 cursor-pointer shadow-sm hover:shadow-md transition">
            <CardContent className="p-4 text-center">
              <LineChart className="mx-auto mb-3" />
              <div className="font-semibold">Stock market update</div>
              <p className="text-sm text-gray-500 mt-1">See what's happening in the stock market in real time</p>
            </CardContent>
          </Card>

          <Card className="w-full md:w-56 cursor-pointer shadow-sm hover:shadow-md transition">
            <CardContent className="p-4 text-center">
              <BookOpen className="mx-auto mb-3" />
              <div className="font-semibold">Deep economic research</div>
              <p className="text-sm text-gray-500 mt-1">See research from experts that we have simplified</p>
            </CardContent>
          </Card>
        </div>

        <div className="w-full max-w-lg md:max-w-3xl mt-12 md:mt-16 px-2 md:px-0">
          <input
            placeholder="Ask something.."
            className="w-full p-4 rounded-full border shadow-sm"
          />
        </div>

        <div className="text-xs text-gray-400 mt-4 text-center pb-6 md:pb-0">
          Join the valerius community for more insights <span className="text-purple-500 cursor-pointer">Join Discord</span>
        </div>
      </div>
    </div>
  );
}
