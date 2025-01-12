import { useState } from 'react';

export default function ResponseList({ responses }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [sortBy, setSortBy] = useState('time');

  const sortedResponses = [...responses].sort((a, b) => {
    if (sortBy === 'time') {
      return new Date(b.timestamp) - new Date(a.timestamp);
    }
    return b.rating - a.rating;
  });

  return (
    <div className="mt-8">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 glass-card rounded-lg hover:bg-white/20 transition-all flex justify-between items-center hover-glow"
      >
        <span className="text-lg">查看所有评价 ({responses.length}条)</span>
        <svg
          className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isExpanded && (
        <div className="mt-6 space-y-6">
          <div className="flex justify-end">
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 glass-card rounded-lg bg-transparent text-white/90 focus:outline-none focus:ring-2 focus:ring-white/30"
            >
              <option value="time" className="bg-black">按时间排序</option>
              <option value="rating" className="bg-black">按评分排序</option>
            </select>
          </div>
          
          <div className="space-y-4">
            {sortedResponses.map((response, index) => (
              <div 
                key={index} 
                className="p-6 glass-card rounded-lg hover:bg-white/5 transition-all"
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="text-sm text-white/70">
                    {new Date(response.timestamp).toLocaleString()}
                  </span>
                  <div className="flex items-center">
                    <span className="text-sm text-white/70 mr-3">{response.committee}</span>
                    <span className="px-3 py-1 bg-white/10 rounded-full text-white/90">
                      {response.rating} 分
                    </span>
                  </div>
                </div>
                <p className="text-white/90 leading-relaxed whitespace-pre-wrap">{response.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
