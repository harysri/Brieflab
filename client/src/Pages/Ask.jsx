// import React, { useState, useRef, useEffect } from "react";
// import { Link } from "react-router-dom";

// const Ask = () => {
//   const [urls, setUrls] = useState([""]);
//   const [activeUrlIndex, setActiveUrlIndex] = useState(0);
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [isSending, setIsSending] = useState(false);
//   const [showChat, setShowChat] = useState(false);
//   const [error, setError] = useState(null);
//   const [messages, setMessages] = useState([]);
//   const [inputMessage, setInputMessage] = useState("");
//   const [sidebarOpen, setSidebarOpen] = useState(true);
//   const chatEndRef = useRef(null);

//   const scrollToBottom = () => {
//     chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   };

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   const handleAddUrl = () => {
//     setUrls([...urls, ""]);
//   };

//   const handleUrlChange = (index, value) => {
//     const newUrls = [...urls];
//     newUrls[index] = value;
//     setUrls(newUrls);
//   };

//   const handleRemoveUrl = (index) => {
//     if (urls.length > 1) {
//       const newUrls = urls.filter((_, i) => i !== index);
//       setUrls(newUrls);
//       if (activeUrlIndex >= index && activeUrlIndex > 0) {
//         setActiveUrlIndex(activeUrlIndex - 1);
//       }
//     }
//   };

//   const handleAnalyze = async () => {
//     const validUrls = urls.filter((u) => u.trim());
//     if (!validUrls.length) return;
//     setError(null);
//     setIsProcessing(true);
//     try {
//       const sources = await analyzeUrls(validUrls);
//       const summaries = sources.map((s) => ({
//         url: s.url || "",
//         summary: s.summary || "",
//       }));
//       const combined = summaries
//         .map((s) =>
//           summaries.length > 1 ? `**${s.url}**\n${s.summary}` : s.summary,
//         )
//         .join("\n\n---\n\n");
//       setMessages([
//         {
//           id: Date.now(),
//           role: "assistant",
//           content: combined,
//           citations: [],
//         },
//       ]);
//       setShowChat(true);
//     } catch (err) {
//       setError(err.message || String(err));
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   // POST /api/analyze -> { sources: [ { source, summary, ... } ] }
//   const analyzeUrls = async (validUrls) => {
//     const res = await fetch("http://localhost:8000/api/analyze", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ urls: validUrls }),
//     });
//     if (!res.ok) {
//       const text = await res.text();
//       throw new Error(`Analyze failed: ${res.status} ${text}`);
//     }
//     const data = await res.json();
//     return data.sources || [];
//   };

//   // POST /api/ask -> { answer, citations }
//   const sendChatMessage = async (question, history) => {
//     const validUrls = urls.filter((u) => u.trim());
//     const payload = { urls: validUrls, question };

//     const res = await fetch("http://localhost:8000/api/ask", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(payload),
//     });
//     if (!res.ok) {
//       const text = await res.text();
//       throw new Error(`Ask failed: ${res.status} ${text}`);
//     }
//     const data = await res.json();
//     return { answer: data.answer || "", citations: data.citations || [] };
//   };

//   const handleSendMessage = async (e) => {
//     e.preventDefault();
//     if (!inputMessage.trim() || isSending) return;

//     const userMsg = {
//       id: Date.now(),
//       role: "user",
//       content: inputMessage,
//       citations: [],
//     };

//     const updatedMessages = [...messages, userMsg];
//     setMessages(updatedMessages);
//     setInputMessage("");
//     setIsSending(true);
//     setError(null);

//     try {
//       const history = updatedMessages.map(({ role, content }) => ({
//         role,
//         content,
//       }));
//       const result = await sendChatMessage(inputMessage, history);
//       const assistantMsg = {
//         id: Date.now() + 1,
//         role: "assistant",
//         content: result.answer,
//         citations: result.citations || [],
//       };
//       setMessages((prev) => [...prev, assistantMsg]);
//     } catch (err) {
//       setMessages((prev) => [
//         ...prev,
//         {
//           id: Date.now() + 1,
//           role: "assistant",
//           content: `Error: ${err.message}`,
//           citations: [],
//         },
//       ]);
//     } finally {
//       setIsSending(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-cyan-500 selection:text-slate-900">
//       <div className="flex max-w-7xl mx-auto">
//         {/* Sidebar - URL Workspace */}
//         <aside
//           className={`${
//             sidebarOpen ? "translate-x-0" : "-translate-x-full"
//           } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-80 bg-slate-900/50 border-r border-slate-800/50 backdrop-blur-sm transition-transform duration-300 lg:duration-0 pt-20 lg:pt-0`}
//         >
//           <div className="p-6 h-full flex flex-col">
//             <div className="flex items-center justify-between mb-6">
//               <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
//                 Workspace
//               </h2>
//               <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded-full">
//                 {urls.filter((u) => u).length} source
//                 {urls.filter((u) => u).length !== 1 ? "s" : ""}
//               </span>
//             </div>

//             <div className="flex-1 overflow-y-auto space-y-3">
//               {urls.map((url, index) => (
//                 <div
//                   key={index}
//                   onClick={() => setActiveUrlIndex(index)}
//                   className={`group relative rounded-xl border p-4 cursor-pointer transition-all duration-200 ${
//                     activeUrlIndex === index
//                       ? "border-cyan-500/50 bg-cyan-500/5"
//                       : "border-slate-800 bg-slate-900/40 hover:border-slate-700"
//                   }`}
//                 >
//                   <div className="flex items-start gap-3">
//                     <div
//                       className={`mt-0.5 h-2 w-2 rounded-full flex-shrink-0 ${
//                         url ? "bg-green-400" : "bg-slate-600"
//                       }`}
//                     ></div>
//                     <div className="flex-1 min-w-0">
//                       <div className="text-xs text-slate-500 mb-1">
//                         Source {index + 1}
//                       </div>
//                       <input
//                         type="text"
//                         value={url}
//                         onChange={(e) => handleUrlChange(index, e.target.value)}
//                         placeholder="Paste URL here..."
//                         className="w-full bg-transparent text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none"
//                         onClick={(e) => e.stopPropagation()}
//                       />
//                     </div>
//                     {urls.length > 1 && (
//                       <button
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           handleRemoveUrl(index);
//                         }}
//                         className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-slate-800 text-slate-500 hover:text-red-400 transition-all"
//                       >
//                         <svg
//                           className="w-4 h-4"
//                           fill="none"
//                           stroke="currentColor"
//                           viewBox="0 0 24 24"
//                         >
//                           <path
//                             strokeLinecap="round"
//                             strokeLinejoin="round"
//                             strokeWidth={2}
//                             d="M6 18L18 6M6 6l12 12"
//                           />
//                         </svg>
//                       </button>
//                     )}
//                   </div>
//                 </div>
//               ))}
//             </div>

//             <button
//               onClick={handleAddUrl}
//               className="mt-4 w-full flex items-center justify-center gap-2 rounded-lg border border-dashed border-slate-700 py-3 text-sm text-slate-500 hover:text-cyan-400 hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all duration-200"
//             >
//               <svg
//                 className="w-4 h-4"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M12 4v16m8-8H4"
//                 />
//               </svg>
//               Add Another URL
//             </button>

//             <button
//               onClick={handleAnalyze}
//               disabled={isProcessing || !urls[0]}
//               className="mt-4 w-full rounded-lg bg-cyan-500 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
//             >
//               {isProcessing ? (
//                 <>
//                   <svg
//                     className="animate-spin h-4 w-4"
//                     fill="none"
//                     viewBox="0 0 24 24"
//                   >
//                     <circle
//                       className="opacity-25"
//                       cx="12"
//                       cy="12"
//                       r="10"
//                       stroke="currentColor"
//                       strokeWidth="4"
//                     ></circle>
//                     <path
//                       className="opacity-75"
//                       fill="currentColor"
//                       d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                     ></path>
//                   </svg>
//                   Processing...
//                 </>
//               ) : (
//                 <>
//                   <svg
//                     className="w-4 h-4"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M13 10V3L4 14h7v7l9-11h-7z"
//                     />
//                   </svg>
//                   Analyze Content
//                 </>
//               )}
//             </button>
//           </div>
//         </aside>

//         {/* Overlay for mobile sidebar */}
//         {sidebarOpen && (
//           <div
//             className="fixed inset-0 bg-black/50 z-30 lg:hidden"
//             onClick={() => setSidebarOpen(false)}
//           ></div>
//         )}

//         {/* Main Content */}
//         <main className="flex-1 min-w-0">
//           {error && (
//             <div className="mx-6 mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3">
//               <svg
//                 className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
//                 />
//               </svg>
//               <div className="flex-1 text-sm text-red-300">{error}</div>
//               <button
//                 onClick={() => setError(null)}
//                 className="text-red-400 hover:text-red-300"
//               >
//                 <svg
//                   className="w-4 h-4"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M6 18L18 6M6 6l12 12"
//                   />
//                 </svg>
//               </button>
//             </div>
//           )}
//           {!showChat ? (
//             /* Empty State */
//             <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-6 py-20">
//               <div className="relative mb-8">
//                 <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 blur-3xl rounded-full"></div>
//                 <div className="relative h-20 w-20 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center">
//                   <svg
//                     className="w-10 h-10 text-cyan-400"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={1.5}
//                       d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
//                     />
//                   </svg>
//                 </div>
//               </div>
//               <h2 className="text-2xl font-bold text-white mb-3">
//                 Ready to Analyze
//               </h2>
//               <p className="text-slate-400 text-center max-w-md mb-8">
//                 Add one or more URLs to your workspace, then click{" "}
//                 <span className="text-cyan-400">Analyze</span> to extract
//                 summaries and start chatting with the content.
//               </p>
//               <div className="flex flex-col gap-3 text-sm text-slate-500">
//                 <div className="flex items-center gap-3">
//                   <div className="h-6 w-6 rounded-full bg-slate-800 flex items-center justify-center text-xs">
//                     1
//                   </div>
//                   Paste a YouTube or article URL
//                 </div>
//                 <div className="flex items-center gap-3">
//                   <div className="h-6 w-6 rounded-full bg-slate-800 flex items-center justify-center text-xs">
//                     2
//                   </div>
//                   Click Analyze to process
//                 </div>
//                 <div className="flex items-center gap-3">
//                   <div className="h-6 w-6 rounded-full bg-slate-800 flex items-center justify-center text-xs">
//                     3
//                   </div>
//                   Chat with your content
//                 </div>
//               </div>
//             </div>
//           ) : (
//             /* Content Area with Chat */
//             <div className="flex flex-col h-[calc(100vh-4rem)]">
//               {/* Chat Section */}
//               <div className="flex-1 flex flex-col min-h-0">
//                 {/* Messages */}
//                 <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
//                   {messages.map((message) => (
//                     <div
//                       key={message.id}
//                       className={`flex gap-4 ${message.role === "user" ? "flex-row-reverse" : ""}`}
//                     >
//                       <div
//                         className={`h-8 w-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${
//                           message.role === "assistant"
//                             ? "bg-cyan-500/20 text-cyan-400"
//                             : "bg-slate-700 text-slate-300"
//                         }`}
//                       >
//                         {message.role === "assistant" ? "B" : "U"}
//                       </div>
//                       <div
//                         className={`flex-1 max-w-3xl ${message.role === "user" ? "text-right" : ""}`}
//                       >
//                         <div
//                           className={`inline-block rounded-2xl px-5 py-3 text-base leading-relaxed whitespace-pre-wrap break-words ${
//                             message.role === "assistant"
//                               ? "bg-slate-900 border border-slate-800 text-slate-300 text-left"
//                               : "bg-cyan-500 text-slate-950 text-left"
//                           }`}
//                         >
//                           {message.content}
//                         </div>
//                         {message.citations && message.citations.length > 0 && (
//                           <div className="flex flex-wrap gap-2 mt-2">
//                             {message.citations.map((citation, idx) => (
//                               <span
//                                 key={idx}
//                                 className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${
//                                   citation.highlight
//                                     ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400"
//                                     : "bg-slate-800/50 border-slate-700 text-slate-400"
//                                 }`}
//                               >
//                                 <svg
//                                   className="w-3 h-3"
//                                   fill="none"
//                                   stroke="currentColor"
//                                   viewBox="0 0 24 24"
//                                 >
//                                   <path
//                                     strokeLinecap="round"
//                                     strokeLinejoin="round"
//                                     strokeWidth={2}
//                                     d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
//                                   />
//                                 </svg>
//                                 {citation.text}
//                               </span>
//                             ))}
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   ))}
//                   {isSending && (
//                     <div className="flex gap-4">
//                       <div className="h-8 w-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold bg-cyan-500/20 text-cyan-400">
//                         B
//                       </div>
//                       <div className="flex-1 max-w-3xl">
//                         <div className="inline-block rounded-2xl px-5 py-3 bg-slate-900 border border-slate-800">
//                           <div className="flex gap-1.5">
//                             <span
//                               className="w-2 h-2 rounded-full bg-slate-500 animate-bounce"
//                               style={{ animationDelay: "0ms" }}
//                             ></span>
//                             <span
//                               className="w-2 h-2 rounded-full bg-slate-500 animate-bounce"
//                               style={{ animationDelay: "150ms" }}
//                             ></span>
//                             <span
//                               className="w-2 h-2 rounded-full bg-slate-500 animate-bounce"
//                               style={{ animationDelay: "300ms" }}
//                             ></span>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   )}
//                   <div ref={chatEndRef} />
//                 </div>

//                 {/* Input Area */}
//                 <div className="border-t border-slate-800/50 bg-slate-950/50 px-6 py-4">
//                   <form
//                     onSubmit={handleSendMessage}
//                     className="max-w-4xl mx-auto"
//                   >
//                     <div className="relative flex items-end gap-2 rounded-2xl border border-slate-800 bg-slate-900 p-2 focus-within:border-cyan-500/50 focus-within:ring-1 focus-within:ring-cyan-500/20 transition-all duration-200">
//                       <textarea
//                         value={inputMessage}
//                         onChange={(e) => setInputMessage(e.target.value)}
//                         onKeyDown={(e) => {
//                           if (e.key === "Enter" && !e.shiftKey) {
//                             e.preventDefault();
//                             handleSendMessage(e);
//                           }
//                         }}
//                         placeholder="Ask anything about the content..."
//                         rows={1}
//                         disabled={isSending}
//                         className="flex-1 bg-transparent px-3 py-2.5 text-sm text-white placeholder:text-slate-500 resize-none focus:outline-none max-h-32 disabled:opacity-50"
//                         style={{ minHeight: "44px" }}
//                       />
//                       <button
//                         type="submit"
//                         disabled={!inputMessage.trim() || isSending}
//                         className="mb-1 p-2.5 rounded-xl bg-cyan-500 text-slate-950 hover:bg-cyan-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 flex-shrink-0"
//                       >
//                         <svg
//                           className="w-4 h-4"
//                           fill="none"
//                           stroke="currentColor"
//                           viewBox="0 0 24 24"
//                         >
//                           <path
//                             strokeLinecap="round"
//                             strokeLinejoin="round"
//                             strokeWidth={2}
//                             d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
//                           />
//                         </svg>
//                       </button>
//                     </div>
//                     <p className="text-xs text-slate-600 mt-2 text-center">
//                       Press Enter to send, Shift+Enter for new line
//                     </p>
//                   </form>
//                 </div>
//               </div>
//             </div>
//           )}
//         </main>
//       </div>
//     </div>
//   );
// };

// export default Ask;

//new code with formatresponse

import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import "katex/dist/katex.min.css";

const Ask = () => {
  const [urls, setUrls] = useState([""]);
  const [activeUrlIndex, setActiveUrlIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [copiedId, setCopiedId] = useState(null);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleCopy = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const handleEdit = (text) => {
    setInputMessage(text);
  };

  const handleAddUrl = () => {
    setUrls([...urls, ""]);
  };

  const handleUrlChange = (index, value) => {
    const newUrls = [...urls];
    newUrls[index] = value;
    setUrls(newUrls);
  };

  const handleRemoveUrl = (index) => {
    if (urls.length > 1) {
      const newUrls = urls.filter((_, i) => i !== index);
      setUrls(newUrls);
      if (activeUrlIndex >= index && activeUrlIndex > 0) {
        setActiveUrlIndex(activeUrlIndex - 1);
      }
    }
  };

  const handleAnalyze = async () => {
    const validUrls = urls.filter((u) => u.trim());
    if (!validUrls.length) return;
    setError(null);
    setIsProcessing(true);
    try {
      const sources = await analyzeUrls(validUrls);
      const summaries = sources.map((s) => ({
        url: s.url || "",
        summary: s.summary || "",
      }));
      const combined = summaries
        .map((s) =>
          summaries.length > 1 ? `**${s.url}**\n${s.summary}` : s.summary,
        )
        .join("\n\n---\n\n");
      setMessages([
        {
          id: Date.now(),
          role: "assistant",
          content: combined,
          citations: [],
        },
      ]);
      setShowChat(true);
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setIsProcessing(false);
    }
  };

  const analyzeUrls = async (validUrls) => {
    const res = await fetch("http://localhost:8000/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ urls: validUrls }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Analyze failed: ${res.status} ${text}`);
    }
    const data = await res.json();
    return data.sources || [];
  };

  const sendChatMessage = async (question, history) => {
    const validUrls = urls.filter((u) => u.trim());
    const payload = { urls: validUrls, question };

    const res = await fetch("http://localhost:8000/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Ask failed: ${res.status} ${text}`);
    }
    const data = await res.json();
    return { answer: data.answer || "", citations: data.citations || [] };
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isSending) return;

    const userMsg = {
      id: Date.now(),
      role: "user",
      content: inputMessage,
      citations: [],
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputMessage("");
    setIsSending(true);
    setError(null);

    try {
      const history = updatedMessages.map(({ role, content }) => ({
        role,
        content,
      }));
      const result = await sendChatMessage(userMsg.content, history);
      const assistantMsg = {
        id: Date.now() + 1,
        role: "assistant",
        content: result.answer,
        citations: result.citations || [],
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: `Error: ${err.message}`,
          citations: [],
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  // Custom renderer for ReactMarkdown to handle Tailwind styling gracefully
  const MarkdownComponents = {
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || "");
      return !inline && match ? (
        <SyntaxHighlighter
          style={vscDarkPlus}
          language={match[1]}
          PreTag="div"
          className="rounded-lg my-2 !bg-slate-950 border border-slate-800"
          {...props}
        >
          {String(children).replace(/\n$/, "")}
        </SyntaxHighlighter>
      ) : (
        <code
          className="bg-slate-800 px-1.5 py-0.5 rounded text-cyan-300 text-sm font-mono"
          {...props}
        >
          {children}
        </code>
      );
    },
    h1: ({ node, ...props }) => (
      <h1 className="text-2xl font-bold mt-4 mb-2 text-slate-100" {...props} />
    ),
    h2: ({ node, ...props }) => (
      <h2 className="text-xl font-bold mt-4 mb-2 text-slate-100" {...props} />
    ),
    h3: ({ node, ...props }) => (
      <h3 className="text-lg font-bold mt-3 mb-2 text-slate-100" {...props} />
    ),
    ul: ({ node, ...props }) => (
      <ul className="list-disc list-inside my-2 space-y-1" {...props} />
    ),
    ol: ({ node, ...props }) => (
      <ol className="list-decimal list-inside my-2 space-y-1" {...props} />
    ),
    a: ({ node, ...props }) => (
      <a
        className="text-cyan-400 hover:underline"
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      />
    ),
    p: ({ node, ...props }) => (
      <p className="mb-2 last:mb-0 leading-relaxed" {...props} />
    ),
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-cyan-500 selection:text-slate-900">
      <div className="flex max-w-7xl mx-auto">
        {/* Sidebar - URL Workspace */}
        <aside
          className={`${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-80 bg-slate-900/50 border-r border-slate-800/50 backdrop-blur-sm transition-transform duration-300 lg:duration-0 pt-20 lg:pt-0`}
        >
          <div className="p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                Workspace
              </h2>
              <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded-full">
                {urls.filter((u) => u).length} source
                {urls.filter((u) => u).length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3">
              {urls.map((url, index) => (
                <div
                  key={index}
                  onClick={() => setActiveUrlIndex(index)}
                  className={`group relative rounded-xl border p-4 cursor-pointer transition-all duration-200 ${
                    activeUrlIndex === index
                      ? "border-cyan-500/50 bg-cyan-500/5"
                      : "border-slate-800 bg-slate-900/40 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-0.5 h-2 w-2 rounded-full flex-shrink-0 ${
                        url ? "bg-green-400" : "bg-slate-600"
                      }`}
                    ></div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-slate-500 mb-1">
                        Source {index + 1}
                      </div>
                      <input
                        type="text"
                        value={url}
                        onChange={(e) => handleUrlChange(index, e.target.value)}
                        placeholder="Paste URL here..."
                        className="w-full bg-transparent text-base text-slate-300 placeholder:text-slate-600 focus:outline-none"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    {urls.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveUrl(index);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-slate-800 text-slate-500 hover:text-red-400 transition-all"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleAddUrl}
              className="mt-4 w-full flex items-center justify-center gap-2 rounded-lg border border-dashed border-slate-700 py-3 text-base text-slate-500 hover:text-cyan-400 hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all duration-200"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Another URL
            </button>

            <button
              onClick={handleAnalyze}
              disabled={isProcessing || !urls[0]}
              className="mt-4 w-full rounded-lg bg-cyan-500 py-3 text-base font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  Analyze Content
                </>
              )}
            </button>
          </div>
        </aside>

        {/* Overlay for mobile sidebar */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {error && (
            <div className="mx-6 mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3">
              <svg
                className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="flex-1 text-sm text-red-300">{error}</div>
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-300"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          )}
          {!showChat ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-6 py-20">
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 blur-3xl rounded-full"></div>
                <div className="relative h-20 w-20 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center">
                  <svg
                    className="w-10 h-10 text-cyan-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">
                Ready to Analyze
              </h2>
              <p className="text-slate-400 text-center max-w-md mb-8">
                Add one or more URLs to your workspace, then click{" "}
                <span className="text-cyan-400">Analyze</span> to extract
                summaries and start chatting with the content.
              </p>
              <div className="flex flex-col gap-3 text-sm text-slate-500">
                <div className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-full bg-slate-800 flex items-center justify-center text-xs">
                    1
                  </div>
                  Paste a YouTube or article URL
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-full bg-slate-800 flex items-center justify-center text-xs">
                    2
                  </div>
                  Click Analyze to process
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-full bg-slate-800 flex items-center justify-center text-xs">
                    3
                  </div>
                  Chat with your content
                </div>
              </div>
            </div>
          ) : (
            /* Content Area with Chat */
            <div className="flex flex-col h-[calc(100vh-4rem)]">
              {/* Chat Section */}
              <div className="flex-1 flex flex-col min-h-0">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`group flex gap-4 ${message.role === "user" ? "flex-row-reverse" : ""}`}
                    >
                      {/* Only render Avatar for assistant */}
                      {message.role === "assistant" && (
                        <div className="h-8 w-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold bg-cyan-500/20 text-cyan-400">
                          B
                        </div>
                      )}

                      <div
                        className={`flex-1 max-w-3xl flex flex-col ${message.role === "user" ? "items-end" : "items-start"}`}
                      >
                        <div
                          className={`inline-block rounded-2xl px-5 py-3 text-base leading-relaxed break-words ${
                            message.role === "assistant"
                              ? "bg-slate-900 border border-slate-800 text-slate-300 w-full"
                              : "bg-cyan-500 text-slate-950 whitespace-pre-wrap"
                          }`}
                        >
                          {message.role === "assistant" ? (
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm, remarkMath]}
                              rehypePlugins={[rehypeKatex]}
                              components={MarkdownComponents}
                            >
                              {message.content}
                            </ReactMarkdown>
                          ) : (
                            message.content
                          )}
                        </div>

                        {/* Action Buttons Container */}
                        <div
                          className={`flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                        >
                          {/* Copy Button */}
                          <button
                            onClick={() =>
                              handleCopy(message.content, message.id)
                            }
                            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-cyan-400 transition-colors"
                          >
                            {copiedId === message.id ? (
                              <>
                                <svg
                                  className="w-3.5 h-3.5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                                Copied!
                              </>
                            ) : (
                              <>
                                <svg
                                  className="w-3.5 h-3.5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                  />
                                </svg>
                                Copy
                              </>
                            )}
                          </button>

                          {/* Edit Button (User Only) */}
                          {message.role === "user" && (
                            <button
                              onClick={() => handleEdit(message.content)}
                              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-cyan-400 transition-colors mr-2"
                            >
                              <svg
                                className="w-3.5 h-3.5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                              Edit
                            </button>
                          )}
                        </div>

                        {/* Citations */}
                        {message.citations && message.citations.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {message.citations.map((citation, idx) => (
                              <span
                                key={idx}
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${
                                  citation.highlight
                                    ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400"
                                    : "bg-slate-800/50 border-slate-700 text-slate-400"
                                }`}
                              >
                                <svg
                                  className="w-3 h-3"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                                  />
                                </svg>
                                {citation.text}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {isSending && (
                    <div className="flex gap-4">
                      <div className="h-8 w-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold bg-cyan-500/20 text-cyan-400">
                        B
                      </div>
                      <div className="flex-1 max-w-3xl">
                        <div className="inline-block rounded-2xl px-5 py-3 bg-slate-900 border border-slate-800">
                          <div className="flex gap-1.5">
                            <span
                              className="w-2 h-2 rounded-full bg-slate-500 animate-bounce"
                              style={{ animationDelay: "0ms" }}
                            ></span>
                            <span
                              className="w-2 h-2 rounded-full bg-slate-500 animate-bounce"
                              style={{ animationDelay: "150ms" }}
                            ></span>
                            <span
                              className="w-2 h-2 rounded-full bg-slate-500 animate-bounce"
                              style={{ animationDelay: "300ms" }}
                            ></span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Input Area */}
                <div className="border-t border-slate-800/50 bg-slate-950/50 px-6 py-4">
                  <form
                    onSubmit={handleSendMessage}
                    className="max-w-4xl mx-auto"
                  >
                    <div className="relative flex items-end gap-2 rounded-2xl border border-slate-800 bg-slate-900 p-2 focus-within:border-cyan-500/50 focus-within:ring-1 focus-within:ring-cyan-500/20 transition-all duration-200">
                      <textarea
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage(e);
                          }
                        }}
                        placeholder="Ask anything about the content..."
                        rows={1}
                        disabled={isSending}
                        className="flex-1 bg-transparent px-3 py-2.5 text-base text-white placeholder:text-slate-500 resize-none focus:outline-none max-h-32 disabled:opacity-50"
                        style={{ minHeight: "44px" }}
                      />
                      <button
                        type="submit"
                        disabled={!inputMessage.trim() || isSending}
                        className="mb-1 p-2.5 rounded-xl bg-cyan-500 text-slate-950 hover:bg-cyan-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 flex-shrink-0"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                          />
                        </svg>
                      </button>
                    </div>
                    <p className="text-xs text-slate-600 mt-2 text-center">
                      Press Enter to send, Shift+Enter for new line
                    </p>
                  </form>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Ask;
