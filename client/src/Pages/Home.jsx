import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  const features = [
    {
      title: "Instant Summaries",
      description:
        "Turn long YouTube videos and articles into a clear content summary with key bullet points and insights in seconds.",
      icon: (
        <svg
          className="w-6 h-6 text-cyan-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
    },
    {
      title: "Ask Questions",
      description:
        "Chat directly with the content. Ask follow-ups, clarify concepts, and get precise, context-aware answers instantly.",
      icon: (
        <svg
          className="w-6 h-6 text-cyan-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
          />
        </svg>
      ),
    },
    {
      title: "Multi-URL Workspace",
      description:
        "Combine multiple sources into one workspace. Merge insights across videos and articles for unified research.",
      icon: (
        <svg
          className="w-6 h-6 text-cyan-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      ),
    },
    {
      title: "Sentiment & Topics",
      description:
        "Automatically detect the main topics, sentiment, and tone of any content to quickly grasp its intent and relevance.",
      icon: (
        <svg
          className="w-6 h-6 text-cyan-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
          />
        </svg>
      ),
    },
    {
      title: "Cited Responses",
      description:
        "Every answer includes references back to the source, so you can verify facts and explore deeper without guesswork.",
      icon: (
        <svg
          className="w-6 h-6 text-cyan-400"
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
      ),
    },
    {
      title: "Any Device, Anytime",
      description:
        "Access your workspaces and summaries from any device. Your content and chats are always synced and ready.",
      icon: (
        <svg
          className="w-6 h-6 text-cyan-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
      ),
    },
  ];

  const steps = [
    {
      step: "01",
      title: "Paste a URL",
      description:
        "Drop in any YouTube video or online article link. Brieflab extracts and cleans the content automatically.",
    },
    {
      step: "02",
      title: "Get Your Summary",
      description:
        "A complete content summary is generated automatically. Key insights and topics appear in seconds.",
    },
    {
      step: "03",
      title: "Ask Anything",
      description:
        "Use the chat interface to ask questions, request clarifications, or explore ideas grounded in the source.",
    },
    {
      step: "04",
      title: "Build Workspaces",
      description:
        "Add multiple URLs to a single workspace to cross-reference sources and build a unified knowledge base.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-cyan-500 selection:text-slate-900">
      {/* Hero Section */}
      <section className="relative px-6 pt-28 pb-24 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center overflow-hidden">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-cyan-400 to-blue-600 opacity-25 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
        </div>
        <div className="absolute inset-x-0 top-60 -z-10 transform-gpu overflow-hidden blur-3xl">
          <div className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-blue-600 to-cyan-400 opacity-20 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"></div>
        </div>

        <div className="inline-flex items-center rounded-full px-4 py-1.5 text-sm font-medium text-cyan-300 bg-cyan-950/40 border border-cyan-800/50 mb-8 animate-fade-in">
          <span className="relative flex h-2 w-2 mr-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
          </span>
          New: Multi-URL workspaces now live
        </div>

        <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl mb-6">
          Understand Any Content{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            in Seconds
          </span>
        </h1>

        <p className="mt-4 text-lg leading-8 text-slate-400 max-w-2xl mx-auto">
          Paste a YouTube or article URL. Brieflab extracts the text, generates
          concise insights, and lets you ask questions directly to the content.
        </p>

        <div className="mt-10 flex items-center justify-center gap-x-4">
          <Link to="/ask">
            <button className="rounded-lg bg-cyan-500 px-7 py-3.5 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 hover:bg-cyan-400 hover:shadow-cyan-400/30 transition-all duration-200">
              Start Your Workspace
            </button>
          </Link>
          <a
            href="#tutorial"
            className="rounded-lg px-7 py-3.5 text-sm font-semibold text-slate-300 ring-1 ring-slate-700 hover:ring-slate-500 hover:text-white transition-all duration-200"
          >
            See How It Works
          </a>
        </div>

        <div className="mt-16 w-full max-w-4xl">
          <div className="relative rounded-2xl border border-slate-800 bg-slate-900/60 p-2 shadow-2xl shadow-black/50">
            <div className="absolute -top-px left-10 right-10 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
            <div className="rounded-xl bg-slate-950 p-6 sm:p-8 text-left">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-3 w-3 rounded-full bg-red-500/80"></div>
                <div className="h-3 w-3 rounded-full bg-yellow-500/80"></div>
                <div className="h-3 w-3 rounded-full bg-green-500/80"></div>
                <div className="ml-auto text-xs text-slate-500 font-mono">
                  brieflab.ai/ask
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="h-8 w-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 text-xs font-bold">
                    B
                  </div>
                  <div className="flex-1 rounded-lg bg-slate-900 border border-slate-800 p-3 text-sm text-slate-300">
                    <span className="text-cyan-400 font-semibold">
                      Summary:
                    </span>{" "}
                    This article discusses the impact of AI on modern education,
                    highlighting 3 key trends: personalized learning, automated
                    grading, and virtual tutoring...
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 text-xs font-bold">
                    U
                  </div>
                  <div className="flex-1 rounded-lg bg-slate-900 border border-slate-800 p-3 text-sm text-slate-300">
                    What are the main challenges mentioned?
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="h-8 w-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 text-xs font-bold">
                    B
                  </div>
                  <div className="flex-1 rounded-lg bg-slate-900 border border-slate-800 p-3 text-sm text-slate-300">
                    The article identifies{" "}
                    <span className="text-cyan-400">data privacy</span>,{" "}
                    <span className="text-cyan-400">digital divide</span>, and{" "}
                    <span className="text-cyan-400">teacher training</span> as
                    the primary challenges facing AI adoption in schools
                    [Section 4].
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What You Can Do */}
      <section className="py-24 px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-16 text-center">
          <h2 className="text-sm font-semibold leading-7 text-cyan-400 uppercase tracking-wider mb-2">
            What You Can Do
          </h2>
          <p className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Everything you need to process information faster
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative rounded-2xl border border-slate-800 bg-slate-900/40 p-8 hover:bg-slate-800/60 hover:border-slate-700 transition-all duration-300"
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 ring-1 ring-cyan-500/20">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold leading-7 text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-base leading-7 text-slate-400">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tutorial / How to Use */}
      <section
        id="tutorial"
        className="py-24 px-6 lg:px-8 border-y border-slate-800/50 bg-slate-900/20"
      >
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 text-center">
            <h2 className="text-sm font-semibold leading-7 text-cyan-400 uppercase tracking-wider mb-2">
              Tutorial
            </h2>
            <p className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Get started in four simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((item, index) => (
              <div key={index} className="relative">
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 left-[60%] w-[80%] h-px bg-gradient-to-r from-slate-700 to-transparent"></div>
                )}
                <div className="text-5xl font-bold text-slate-800 mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {item.title}
                </h3>
                <p className="text-slate-400 leading-7">{item.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 flex justify-center">
            <Link to="/ask">
              <button className="rounded-lg bg-cyan-500 px-8 py-4 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 hover:bg-cyan-400 hover:shadow-cyan-400/30 transition-all duration-200">
                Try It Now — Paste Your First URL
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-24 px-6 lg:px-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[500px] bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-cyan-500/5 blur-3xl"></div>
        </div>
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl mb-6">
            Ready to enhance your productivity?
          </h2>
          <p className="text-slate-400 mb-10 text-lg">
            Join researchers, students, and professionals who use{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              Brieflab
            </span>{" "}
            to turn hours of reading and watching into minutes of understanding.
          </p>
          <div className="flex w-full max-w-md mx-auto items-center gap-2">
            <input
              type="text"
              placeholder="Paste a YouTube or Article URL..."
              className="flex-1 rounded-lg border-0 bg-slate-900 py-3.5 px-4 text-white shadow-sm ring-1 ring-inset ring-slate-800 focus:ring-2 focus:ring-inset focus:ring-cyan-500 sm:text-sm sm:leading-6 placeholder:text-slate-500 transition-all"
            />
            <Link to="/ask">
              <button className="rounded-lg bg-cyan-500 px-5 py-3.5 text-sm font-semibold text-slate-950 shadow-sm hover:bg-cyan-400 transition-all duration-200 flex-shrink-0">
                Analyze
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
