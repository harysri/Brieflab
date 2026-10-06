const SENTIMENT_STYLES = {
  positive: {
    label: "Positive",
    badge: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
    bar: "bg-emerald-400",
  },
  negative: {
    label: "Negative",
    badge: "bg-red-500/10 border-red-500/30 text-red-400",
    bar: "bg-red-400",
  },
  neutral: {
    label: "Neutral",
    badge: "bg-slate-700/40 border-slate-600 text-slate-300",
    bar: "bg-slate-400",
  },
  mixed: {
    label: "Mixed",
    badge: "bg-amber-500/10 border-amber-500/30 text-amber-400",
    bar: "bg-amber-400",
  },
};

const SourceInsights = ({ sources = [] }) => {
  const analyzed = sources.filter(
    (source) => source.sentiment || (source.topics && source.topics.length)
  );

  if (!analyzed.length) return null;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
      <div className="flex items-center gap-2 mb-4">
        <svg
          className="w-4 h-4 text-cyan-400"
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
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
          Content Insights
        </h3>
      </div>

      <div className="space-y-4">
        {analyzed.map((source, index) => {
          const style = SENTIMENT_STYLES[source.sentiment] || SENTIMENT_STYLES.neutral;
          const hasScore = typeof source.sentiment_score === "number";
          const score = hasScore ? source.sentiment_score : 0;
          const width = Math.round(((score + 1) / 2) * 100);

          return (
            <div
              key={source.url || index}
              className="rounded-xl border border-slate-800 bg-slate-950/40 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-slate-200 hover:text-cyan-400 break-all"
                >
                  {source.title || source.url || `Source ${index + 1}`}
                </a>
                {source.sentiment && (
                  <span
                    className={`flex-shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${style.badge}`}
                  >
                    {style.label}
                    {hasScore && (
                      <span className="ml-1 opacity-70">
                        {score > 0 ? "+" : ""}
                        {score.toFixed(2)}
                      </span>
                    )}
                  </span>
                )}
              </div>

              {hasScore && (
                <div className="mt-3 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div className={`h-full ${style.bar}`} style={{ width: `${width}%` }} />
                </div>
              )}

              {source.topics && source.topics.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {source.topics.map((topic, i) => (
                    <span
                      key={`${topic}-${i}`}
                      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs bg-cyan-500/10 border border-cyan-500/20 text-cyan-300"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SourceInsights;
