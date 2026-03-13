import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { BookOpen, User, Sparkles, Send, UserCircle2, Bot, Menu, X, Plus, MessageSquare } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Chat {
  id: string;
  title: string;
  personaId: string;
  messages: Message[];
  updatedAt: number;
}

const personas = [
  { id: 'study', name: 'Study Buddy', icon: <BookOpen size={20} /> },
  { id: 'friend_boy', name: 'Friend (Boy)', icon: <User size={20} /> },
  { id: 'friend_girl', name: 'Friend (Girl)', icon: <UserCircle2 size={20} /> },
  { id: 'genius', name: 'Genius Logic', icon: <Sparkles size={20} /> },
];

function App() {
  const [chats, setChats] = useState<Chat[]>([
    {
      id: 'default',
      title: 'New Chat',
      personaId: 'study',
      messages: [],
      updatedAt: Date.now()
    }
  ]);
  const [activeChatId, setActiveChatId] = useState<string>('default');
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeChat = chats.find(c => c.id === activeChatId) || chats[0];
  const activePersonaId = activeChat?.personaId || 'study';
  const activePersona = personas.find(p => p.id === activePersonaId) || personas[0];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeChat?.messages, isLoading, activeChatId]);

  const getMockResponse = (personaId: string, input: string) => {
    const mocks: Record<string, string> = {
      study: `Here are the key points to understand "${input}":\n\n- **Concept:** It's a way to organize your thoughts.\n- **Application:** Try applying it in your next study session.\n\nKeep up the great work!`,
      friend_boy: `Hey man, I hear you. "${input}" sounds rough. Take a deep breath. We'll get through this together. You're stronger than you think. Let's go grab a burger or play some games to clear your head.`,
      friend_girl: `Oh honey, I'm so sorry you're feeling that way about "${input}". Your feelings are completely valid! I'm here for you no matter what. Let's talk it out and find a way to make you feel better. 💖`,
      genius: `Analyzing input: "${input}".\n\n**Variables Identified:**\n1. Primary subject\n2. Contextual nuance\n\n**Logical Conclusion:**\nBased on a multi-factorial analysis, the most efficient path forward requires systemic reorganization of priorities. Emotion is irrelevant. Proceed with calculated action.`,
    };
    return mocks[personaId] || mocks['study'];
  };

  const createNewChat = () => {
    const newId = Date.now().toString();
    const newChat: Chat = {
      id: newId,
      title: 'New Chat',
      personaId: activePersonaId,
      messages: [],
      updatedAt: Date.now()
    };
    // Add new chat to the beginning of the list
    setChats(prev => [newChat, ...prev]);
    setActiveChatId(newId);
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  const handlePersonaChange = (personaId: string) => {
    setChats(prevChats => prevChats.map(c => 
      c.id === activeChatId
        ? { ...c, personaId }
        : c
    ));
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  const sendMessage = async () => {
    if (!input.trim() || !activeChat) return;

    const userMsg: Message = { role: 'user', content: input };
    const currentChatId = activeChat.id;
    
    // Auto-generate title if this is the first message
    let newTitle = activeChat.title;
    if (activeChat.messages.length === 0) {
      newTitle = input.length > 24 ? input.substring(0, 24) + '...' : input;
    }

    const updatedMessages = [...activeChat.messages, userMsg];

    setChats(prevChats => prevChats.map(c => 
      c.id === currentChatId 
        ? { ...c, messages: updatedMessages, title: newTitle, updatedAt: Date.now() } 
        : c
    ));
    
    setInput('');
    setIsLoading(true);

    try {
      // Trying to reach the local backend (proxied in Vite config for both Local and Codespaces)
      const res = await axios.post('/api/chat', {
        message: input,
        personaId: activeChat.personaId,
        chatHistory: activeChat.messages.map(m => ({ role: m.role, content: m.content }))
      });

      const aiMsg: Message = { role: 'assistant', content: res.data.reply };
      
      setChats(prevChats => prevChats.map(c => 
        c.id === currentChatId 
          ? { ...c, messages: [...c.messages, aiMsg], updatedAt: Date.now() } 
          : c
      ));
    } catch (error) {
      console.warn("Could not connect to localhost backend. Falling back to mock responses for demo purposes.");
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockMsg = getMockResponse(activeChat.personaId, input);
      const aiMsg: Message = { 
        role: 'assistant', 
        content: mockMsg + "\n\n*(Note: This is a demo response. Run the Node.js backend and Ollama on your local machine to get real AI replies!)*" 
      };
      
      setChats(prevChats => prevChats.map(c => 
        c.id === currentChatId 
          ? { ...c, messages: [...c.messages, aiMsg], updatedAt: Date.now() } 
          : c
      ));
    }
    setIsLoading(false);
  };

  // Sort chats by updatedAt descending (newest first)
  const sortedChats = [...chats].sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <div className="flex h-screen bg-[#131314] text-gray-200 font-sans overflow-hidden">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Gemini Style */}
      <div className={cn(
        "fixed md:static inset-y-0 left-0 w-72 bg-[#1e1e20] flex flex-col z-50 transform transition-transform duration-300 ease-in-out md:translate-x-0 border-r border-gray-800/50",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between mb-6 p-4 pb-0">
          <h1 className="text-xl font-bold tracking-wide flex items-center gap-2 text-gray-100">
            <Bot className="text-blue-400" />
            My AI Agent
          </h1>
          <button className="md:hidden text-gray-400 hover:text-white" onClick={() => setIsSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="px-4 mb-6">
          <button 
            onClick={createNewChat} 
            className="flex items-center gap-3 bg-[#282a2c] hover:bg-[#343638] text-gray-200 w-full px-4 py-3 rounded-xl transition-all border border-gray-700/50 shadow-sm"
          >
            <Plus size={20} className="text-blue-400" />
            <span className="font-medium">New Chat</span>
          </button>
        </div>

        {/* Personas */}
        <div className="mb-6 flex-shrink-0">
          <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider font-semibold px-6">Select Persona</p>
          <div className="flex flex-col space-y-1 px-4">
            {personas.map(p => (
              <button
                key={p.id}
                onClick={() => handlePersonaChange(p.id)}
                className={cn(
                  "flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 group",
                  activePersonaId === p.id 
                    ? 'bg-blue-500/10 text-blue-400' 
                    : 'text-gray-400 hover:bg-[#282a2c] hover:text-gray-200'
                )}
              >
                <div className={cn(
                  "p-1.5 rounded-lg transition-colors",
                  activePersonaId === p.id ? "bg-blue-500/20" : "bg-transparent group-hover:bg-[#343638]"
                )}>
                  {p.icon}
                </div>
                <span className="font-medium text-sm">{p.name}</span>
              </button>
            ))}
          </div>
        </div>
        
        {/* Chat History */}
        <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar">
          <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider font-semibold px-6">Recent Chats</p>
          <div className="flex flex-col space-y-1 px-4 pb-4">
            {sortedChats.map(chat => (
              <button
                key={chat.id}
                onClick={() => {
                  setActiveChatId(chat.id);
                  if (window.innerWidth < 768) setIsSidebarOpen(false);
                }}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl transition-all text-left w-full group",
                  activeChatId === chat.id
                    ? 'bg-[#282a2c] text-white'
                    : 'text-gray-400 hover:bg-[#282a2c]/50 hover:text-gray-200'
                )}
              >
                <MessageSquare size={18} className={cn(
                  "shrink-0",
                  activeChatId === chat.id ? "text-blue-400" : "text-gray-500 group-hover:text-gray-400"
                )} />
                <div className="truncate text-sm font-medium">
                  {chat.title}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-auto pt-4 pb-4 border-t border-gray-800 text-xs text-gray-500 px-6 shrink-0">
          Running locally via Ollama
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative w-full h-full min-w-0">
        
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 bg-[#1e1e20] border-b border-gray-800 z-30">
          <div className="flex items-center gap-2">
            <button className="text-gray-400 hover:text-white" onClick={() => setIsSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <span className="font-semibold text-gray-200">
              {activePersona.name}
            </span>
          </div>
        </div>

        {/* Chat History Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scroll-smooth">
          {activeChat?.messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center max-w-lg mx-auto">
              <div className="w-16 h-16 bg-[#1e1e20] rounded-2xl flex items-center justify-center mb-6 text-blue-400 shadow-lg border border-gray-800/50">
                {activePersona.icon}
              </div>
              <h2 className="text-2xl font-semibold text-gray-200 mb-2">
                Talk to {activePersona.name}
              </h2>
              <p className="text-gray-500">
                Send a message to start the conversation. The AI will respond in character based on the selected persona.
              </p>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-6 pb-20">
              {activeChat?.messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 mr-3 mt-1 shrink-0 border border-blue-500/20">
                      {activePersona.icon}
                    </div>
                  )}
                  <div className={cn(
                    "max-w-[85%] md:max-w-[75%] px-5 py-4 rounded-2xl leading-relaxed shadow-sm",
                    msg.role === 'user' 
                      ? 'bg-[#282a2c] text-white rounded-tr-sm' 
                      : 'bg-[#1e1e20] text-gray-200 rounded-tl-sm border border-gray-800/50'
                  )}>
                    {msg.role === 'assistant' ? (
                      <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-[#131314] prose-pre:border prose-pre:border-gray-800">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    )}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 mr-3 shrink-0 border border-blue-500/20">
                    {activePersona.icon}
                  </div>
                  <div className="bg-[#1e1e20] text-gray-400 px-5 py-4 rounded-2xl rounded-tl-sm border border-gray-800/50 flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area - Gemini Style rounded floating box */}
        <div className="p-4 md:p-6 bg-gradient-to-t from-[#131314] via-[#131314] to-transparent shrink-0">
          <div className="max-w-4xl mx-auto relative flex items-center bg-[#1e1e20] rounded-full pl-6 pr-2 py-2 shadow-xl border border-gray-700/50 focus-within:border-gray-600 focus-within:ring-1 focus-within:ring-gray-600 transition-all">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder={`Message ${activePersona.name}...`}
              className="flex-1 bg-transparent border-none outline-none text-gray-200 placeholder-gray-500 text-[15px] py-3"
            />
            <button 
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              className={cn(
                "ml-2 p-3 rounded-full transition-all flex items-center justify-center",
                input.trim() && !isLoading
                  ? "bg-gray-700 text-white hover:bg-gray-600"
                  : "bg-transparent text-gray-500"
              )}
            >
              <Send size={18} className={input.trim() && !isLoading ? "ml-0.5" : ""} />
            </button>
          </div>
          <div className="text-center mt-3 text-[11px] text-gray-500 font-medium tracking-wide">
            Powered by local, unlimited AI (Ollama). Free forever.
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;