import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { BarChart2 } from 'lucide-react';

interface BreakdownData {
  category: string;
  count: number;
  color: string;
}

interface DifficultyData {
  difficulty: string;
  count: number;
  color: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  DSA: '#00d4ff',
  'System Design': '#a855f7',
  HR: '#f59e0b',
};

const DIFFICULTY_COLORS: Record<string, string> = {
  Easy: '#22c55e',
  Medium: '#f59e0b',
  Hard: '#ef4444',
};

const CategoryBreakdown = () => {
  const { user, getToken } = useAuth();
  const [categoryData, setCategoryData] = useState<BreakdownData[]>([]);
  const [difficultyData, setDifficultyData] = useState<DifficultyData[]>([]);
  const [totalSaved, setTotalSaved] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'category' | 'difficulty'>('category');
  const [animateBars, setAnimateBars] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user?.id) fetchBreakdown();
  }, [user?.id]);

  useEffect(() => {
    // Trigger bar animation after data loads
    if (!loading) {
      const timer = setTimeout(() => setAnimateBars(true), 100);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  const fetchBreakdown = async () => {
    try {
      const token = await getToken();
      const res = await fetch('/api/saved', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Saved fetch failed');
      const { saved } = await res.json();

      const catMap = new Map<string, number>();
      const diffMap = new Map<string, number>();

      (saved || []).forEach((s: any) => {
        const q = s.question;
        if (!q) return;
        catMap.set(q.category, (catMap.get(q.category) || 0) + 1);
        diffMap.set(q.difficulty, (diffMap.get(q.difficulty) || 0) + 1);
      });

      const catArr: BreakdownData[] = Array.from(catMap.entries())
        .map(([category, count]) => ({
          category,
          count,
          color: CATEGORY_COLORS[category] || '#6b7280',
        }))
        .sort((a, b) => b.count - a.count);

      const diffArr: DifficultyData[] = ['Easy', 'Medium', 'Hard']
        .filter((d) => diffMap.has(d))
        .map((difficulty) => ({
          difficulty,
          count: diffMap.get(difficulty) || 0,
          color: DIFFICULTY_COLORS[difficulty],
        }));

      setCategoryData(catArr);
      setDifficultyData(diffArr);
      setTotalSaved(saved?.length || 0);
    } catch (err) {
      console.error('Error fetching category breakdown:', err);
    } finally {
      setLoading(false);
    }
  };

  const maxCount = Math.max(
    ...(activeTab === 'category'
      ? categoryData.map((d) => d.count)
      : difficultyData.map((d) => d.count)),
    1
  );

  const items =
    activeTab === 'category'
      ? categoryData.map((d) => ({ label: d.category, count: d.count, color: d.color }))
      : difficultyData.map((d) => ({ label: d.difficulty, count: d.count, color: d.color }));

  // Donut chart logic
  const buildDonut = () => {
    const total = items.reduce((s, i) => s + i.count, 0);
    if (total === 0) return [];

    const radius = 40;
    const cx = 60;
    const cy = 60;
    const circumference = 2 * Math.PI * radius;

    let offset = 0;
    return items.map((item) => {
      const pct = item.count / total;
      const strokeLen = circumference * pct;
      const strokeOffset = circumference - offset;
      offset += strokeLen;
      return { ...item, strokeLen, strokeOffset, pct, radius, cx, cy, circumference };
    });
  };

  const donutSegments = buildDonut();

  return (
    <div ref={containerRef} className="w-full">
      {/* Tab switcher */}
      <div className="flex bg-gray-900/60 rounded-xl p-1 mb-4 gap-1">
        {(['category', 'difficulty'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setAnimateBars(false); setTimeout(() => setAnimateBars(true), 50); }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all duration-200 ${
              activeTab === tab
                ? 'bg-gray-700 text-white shadow'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : totalSaved === 0 ? (
        <div className="text-center py-8 text-gray-500 text-sm">
          <BarChart2 className="w-8 h-8 mx-auto mb-2 opacity-30" />
          Save questions (swipe ↑) to see your analytics
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Donut chart */}
          <div className="relative flex-shrink-0">
            <svg width={120} height={120} className="rotate-[-90deg]">
              {donutSegments.map((seg, i) => (
                <circle
                  key={i}
                  cx={seg.cx}
                  cy={seg.cy}
                  r={seg.radius}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth={18}
                  strokeDasharray={`${animateBars ? seg.strokeLen : 0} ${seg.circumference}`}
                  strokeDashoffset={seg.strokeOffset}
                  style={{
                    transition: `stroke-dasharray 0.8s ease ${i * 0.15}s`,
                    filter: `drop-shadow(0 0 4px ${seg.color}88)`,
                  }}
                />
              ))}
            </svg>
            <div
              className="absolute inset-0 flex flex-col items-center justify-center"
              style={{ transform: 'rotate(0deg)' }}
            >
              <div className="text-xl font-bold text-white">{totalSaved}</div>
              <div className="text-[10px] text-gray-400">saved</div>
            </div>
          </div>

          {/* Bars */}
          <div className="flex-1 w-full space-y-3">
            {items.map((item, i) => (
              <div key={item.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-300 font-medium">{item.label}</span>
                  <span className="text-gray-400">
                    {item.count} ({Math.round((item.count / totalSaved) * 100)}%)
                  </span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    style={{
                      width: animateBars ? `${(item.count / maxCount) * 100}%` : '0%',
                      background: `linear-gradient(90deg, ${item.color}aa, ${item.color})`,
                      height: '100%',
                      borderRadius: 9999,
                      transition: `width 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 0.1}s`,
                      boxShadow: `0 0 6px ${item.color}66`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryBreakdown;
