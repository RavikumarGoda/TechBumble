import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Flame, Zap, Calendar } from 'lucide-react';

interface ActivityDay {
  date: string;
  count: number;
}

interface HeatmapProps {
  currentStreak: number;
  longestStreak: number;
  totalSwiped: number;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const getColor = (count: number): string => {
  if (count === 0) return '#1c2133';
  if (count <= 3) return '#0e3a5e';
  if (count <= 7) return '#0a6ebd';
  if (count <= 12) return '#00d4ff';
  return '#a8f0ff';
};

const getBorderColor = (count: number): string => {
  if (count === 0) return 'transparent';
  if (count <= 3) return '#0a4a7a';
  if (count <= 7) return '#0d86e0';
  if (count <= 12) return '#00badd';
  return '#72e4f5';
};

const ActivityHeatmap = ({ currentStreak, longestStreak, totalSwiped }: HeatmapProps) => {
  const { user } = useAuth();
  const [activityData, setActivityData] = useState<Map<string, number>>(new Map());
  const [loading, setLoading] = useState(true);
  const [tooltip, setTooltip] = useState<{ date: string; count: number; x: number; y: number } | null>(null);
  const [totalActiveDays, setTotalActiveDays] = useState(0);

  useEffect(() => {
    if (user?.id) fetchActivity();
  }, [user?.id]);

  const fetchActivity = async () => {
    try {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      const fromDate = oneYearAgo.toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('user_activity')
        .select('activity_date, questions_swiped')
        .eq('user_id', user?.id)
        .gte('activity_date', fromDate)
        .order('activity_date', { ascending: true });

      if (error) throw error;

      const map = new Map<string, number>();
      let activeDays = 0;
      (data || []).forEach((row) => {
        const count = row.questions_swiped || 0;
        map.set(row.activity_date, count);
        if (count > 0) activeDays++;
      });
      setActivityData(map);
      setTotalActiveDays(activeDays);
    } catch (err) {
      console.error('Error fetching activity:', err);
    } finally {
      setLoading(false);
    }
  };

  // Build a grid of 52 weeks x 7 days ending today
  const buildGrid = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Start from the most recent Sunday that is <= 52 weeks before today
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 364); // ~52 weeks
    // Align to Sunday
    startDate.setDate(startDate.getDate() - startDate.getDay());

    const weeks: { date: Date; dateStr: string }[][] = [];
    let current = new Date(startDate);

    while (current <= today) {
      const week: { date: Date; dateStr: string }[] = [];
      for (let d = 0; d < 7; d++) {
        const dateStr = current.toISOString().split('T')[0];
        week.push({ date: new Date(current), dateStr });
        current.setDate(current.getDate() + 1);
      }
      weeks.push(week);
    }
    return { weeks, startDate };
  };

  const { weeks } = buildGrid();

  // Build month labels positioned at correct week columns
  const monthLabels: { label: string; weekIdx: number }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, wIdx) => {
    const firstDayOfWeek = week[0].date;
    const month = firstDayOfWeek.getMonth();
    if (month !== lastMonth) {
      monthLabels.push({ label: MONTHS[month], weekIdx: wIdx });
      lastMonth = month;
    }
  });

  const cellSize = 11;
  const gap = 2;
  const cellStep = cellSize + gap;
  const totalWidth = weeks.length * cellStep;

  return (
    <div className="w-full">
      {/* Streak + stats row */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-gradient-to-br from-orange-900/40 to-orange-800/20 border border-orange-700/40 rounded-xl p-3 flex flex-col items-center">
          <Flame className="w-5 h-5 text-orange-400 mb-1" />
          <div className="text-xl font-bold text-orange-300">{currentStreak}</div>
          <div className="text-xs text-gray-400">day streak</div>
        </div>
        <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/20 border border-purple-700/40 rounded-xl p-3 flex flex-col items-center">
          <Zap className="w-5 h-5 text-purple-400 mb-1" />
          <div className="text-xl font-bold text-purple-300">{longestStreak}</div>
          <div className="text-xs text-gray-400">best streak</div>
        </div>
        <div className="bg-gradient-to-br from-cyan-900/40 to-cyan-800/20 border border-cyan-700/40 rounded-xl p-3 flex flex-col items-center">
          <Calendar className="w-5 h-5 text-cyan-400 mb-1" />
          <div className="text-xl font-bold text-cyan-300">{totalActiveDays}</div>
          <div className="text-xs text-gray-400">active days</div>
        </div>
      </div>

      {/* Heatmap title */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-300 font-medium">{totalSwiped} questions in the last year</span>
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <span>Less</span>
          {[0, 3, 7, 12, 15].map((v) => (
            <div
              key={v}
              style={{
                width: 10,
                height: 10,
                borderRadius: 2,
                background: getColor(v),
                border: `1px solid ${getBorderColor(v)}`,
              }}
            />
          ))}
          <span>More</span>
        </div>
      </div>

      {/* Heatmap grid */}
      {loading ? (
        <div className="flex items-center justify-center py-10">
          <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="overflow-x-auto pb-2 relative" style={{ position: 'relative' }}>
          <div style={{ position: 'relative', width: totalWidth + 22 }}>
            {/* Day labels on left */}
            <div style={{ position: 'absolute', left: 0, top: 18 }}>
              {DAYS.map((d, i) => (
                <div
                  key={i}
                  style={{
                    height: cellSize,
                    marginBottom: gap,
                    fontSize: 9,
                    color: '#6b7280',
                    display: 'flex',
                    alignItems: 'center',
                    lineHeight: 1,
                  }}
                >
                  {i % 2 === 1 ? d : ''}
                </div>
              ))}
            </div>

            {/* Month labels */}
            <div style={{ position: 'relative', paddingLeft: 16, height: 16, marginBottom: 4 }}>
              {monthLabels.map(({ label, weekIdx }) => (
                <span
                  key={`${label}-${weekIdx}`}
                  style={{
                    position: 'absolute',
                    left: 16 + weekIdx * cellStep,
                    fontSize: 10,
                    color: '#9ca3af',
                    top: 0,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {label}
                </span>
              ))}
            </div>

            {/* Grid cells */}
            <div style={{ display: 'flex', gap, paddingLeft: 16, position: 'relative' }}>
              {weeks.map((week, wIdx) => (
                <div key={wIdx} style={{ display: 'flex', flexDirection: 'column', gap }}>
                  {week.map(({ date, dateStr }) => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const isFuture = date > today;
                    const count = activityData.get(dateStr) || 0;

                    return (
                      <div
                        key={dateStr}
                        style={{
                          width: cellSize,
                          height: cellSize,
                          borderRadius: 2,
                          background: isFuture ? 'transparent' : getColor(count),
                          border: isFuture ? '1px solid #1f2937' : `1px solid ${getBorderColor(count)}`,
                          cursor: isFuture ? 'default' : 'pointer',
                          transition: 'transform 0.1s ease, filter 0.1s ease',
                          opacity: isFuture ? 0.2 : 1,
                        }}
                        onMouseEnter={(e) => {
                          if (!isFuture) {
                            const rect = (e.target as HTMLElement).getBoundingClientRect();
                            const formatted = date.toLocaleDateString('en-US', {
                              month: 'short', day: 'numeric', year: 'numeric'
                            });
                            setTooltip({ date: formatted, count, x: rect.left, y: rect.top });
                            (e.target as HTMLElement).style.transform = 'scale(1.4)';
                            (e.target as HTMLElement).style.filter = 'brightness(1.4)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          setTooltip(null);
                          (e.target as HTMLElement).style.transform = 'scale(1)';
                          (e.target as HTMLElement).style.filter = 'brightness(1)';
                        }}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Tooltip */}
          {tooltip && (
            <div
              style={{
                position: 'fixed',
                top: tooltip.y - 42,
                left: tooltip.x - 30,
                background: '#111827',
                border: '1px solid #374151',
                borderRadius: 6,
                padding: '5px 10px',
                fontSize: 11,
                color: '#f3f4f6',
                pointerEvents: 'none',
                zIndex: 9999,
                whiteSpace: 'nowrap',
                boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
              }}
            >
              <div className="font-semibold text-cyan-300">{tooltip.count} questions</div>
              <div className="text-gray-400">{tooltip.date}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ActivityHeatmap;
