import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDebounce } from '../hooks/useDebounce';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Filter,
  Link as LinkIcon,
  Users
} from 'lucide-react';
import toast from 'react-hot-toast';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import api from '../utils/api';
import { formatDate } from '../utils/formatters';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [urlAnalytics, setUrlAnalytics] = useState([]);
  const [clickAnalytics, setClickAnalytics] = useState({});
  const [selectedUrl, setSelectedUrl] = useState('');
  const [startDate, setStartDate] = useState(
    new Date(new Date().setDate(new Date().getDate() - 30))
  );
  const [endDate, setEndDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState('click');
  const [stats, setStats] = useState([]);
  const debouncedSelectedUrl = useDebounce(selectedUrl, 500);

  /* ---------------- DATE RANGE NORMALIZATION ---------------- */
  const generateCompleteDateRange = useCallback(
    (apiData, startDate, endDate, isUrlAnalytics = false) => {
      const result = {};
      const current = new Date(startDate);
      const end = new Date(endDate);

      current.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);

      while (current <= end) {
        const key = current.toLocaleDateString('en-CA'); // YYYY-MM-DD
        result[key] = 0;
        current.setDate(current.getDate() + 1);
      }

      if (isUrlAnalytics) {
        apiData.forEach(({ clickDate, count }) => {
          if (result[clickDate] !== undefined) {
            result[clickDate] = count;
          }
        });
      } else {
        Object.entries(apiData).forEach(([date, count]) => {
          if (result[date] !== undefined) {
            result[date] = count;
          }
        });
      }

      return result;
    },
    []
  );

  /* ---------------- FETCH ANALYTICS ---------------- */
  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);

      if (activeTab === 'url') {
        if (!debouncedSelectedUrl) {
          // Toast suppressed on initial load if no URL selected, usually user selects first
          if (debouncedSelectedUrl === '' && !loading) {
            // passive
          } else {
            // toast.error('Please select a URL');
          }
          // But if we want to show empty state, we can just return
          // Or we could fetch empty if we want
        }

        // Only fetch if a URL is actually provided (or handle the empty case gracefully UI side)
        if (debouncedSelectedUrl) {
          const res = await api.get(`urls/analytics/${debouncedSelectedUrl}`, {
            params: {
              startDate: formatDate(startDate),
              endDate: formatDate(endDate)
            }
          });

          const filled = generateCompleteDateRange(
            res.data?.data || [],
            startDate,
            endDate,
            true
          );

          setUrlAnalytics(
            Object.entries(filled).map(([date, clicks]) => ({
              date,
              clicks
            }))
          );
        } else {
          setUrlAnalytics([]);
        }

      } else {
        const res = await api.get('/urls/analytics', {
          params: {
            startDate: formatDate(startDate),
            endDate: formatDate(endDate)
          }
        });

        const filled = generateCompleteDateRange(
          res.data?.data || {},
          startDate,
          endDate
        );

        setClickAnalytics(filled);
      }
    } catch (e) {
      console.error(e);
      // toast.error('Failed to fetch analytics'); 
      // Silent fail or improved error handling
    } finally {
      setLoading(false);
    }
  }, [activeTab, debouncedSelectedUrl, startDate, endDate, generateCompleteDateRange]);

  /* ---------------- FETCH STATS ---------------- */
  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get('/urls/analytics/summary');
      const d = res.data?.data || {};

      setStats([
        {
          label: 'Total URLs',
          value: d.totalShortUrls || 0,
          icon: LinkIcon,
          color: 'bg-blue-500'
        },
        {
          label: 'Total Clicks',
          value: d.totalClicks || 0,
          icon: TrendingUp,
          color: 'bg-green-500'
        },
        {
          label: 'Avg. Clicks/Day',
          value: Math.round(d.avgClicksPerDay || 0),
          icon: Users,
          color: 'bg-purple-500'
        }
      ]);
    } catch {
      setStats([]);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  /* ---------------- CHART DATA ---------------- */
  const chartData = useMemo(() => {
    const raw =
      activeTab === 'url'
        ? urlAnalytics
        : Object.entries(clickAnalytics).map(([date, clicks]) => ({
          date,
          clicks
        }));

    return raw.sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [activeTab, urlAnalytics, clickAnalytics]);


  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-slate-800 text-white text-xs px-3 py-2 rounded-lg shadow-xl">
        <p className="opacity-70 mb-1">{label}</p>
        <p className="font-bold text-lg">{payload[0].value} <span className="text-xs font-normal opacity-70">clicks</span></p>
      </div>
    );
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Analytics Overview</h1>
        <p className="text-gray-600 mt-2">Insights into your link performance</p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {stats.map((s, index) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:border-indigo-200 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-2xl ${s.color} text-white shadow-lg shadow-current/20`}>
                  <s.icon size={24} />
                </div>
                <div>
                  <p className="text-gray-500 text-sm font-medium">{s.label}</p>
                  <h3 className="text-3xl font-bold text-gray-800">{s.value}</h3>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Controls & Chart */}
      <Card className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          {/* Tabs */}
          <div className="p-1 bg-gray-100/80 rounded-xl flex gap-1 w-full md:w-auto">
            {['click', 'url'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                    px-6 py-2.5 rounded-lg text-sm font-semibold transition-all w-full md:w-auto
                    ${activeTab === tab
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-black/5'}
                  `}
              >
                {tab === 'click' ? 'Global Clicks' : 'Per URL'}
              </button>
            ))}
          </div>

          {/* Date Filters */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3 py-1">
              <Calendar size={16} className="text-gray-400 mr-2" />
              <DatePicker
                selected={startDate}
                onChange={setStartDate}
                endDate={endDate}
                selectsStart
                className="bg-transparent border-none text-sm text-gray-700 w-24 focus:ring-0 p-1"
              />
              <span className="text-gray-400 mx-2">to</span>
              <DatePicker
                selected={endDate}
                onChange={setEndDate}
                selectsEnd
                startDate={startDate}
                className="bg-transparent border-none text-sm text-gray-700 w-24 focus:ring-0 p-1"
              />
            </div>

            <Button onClick={fetchAnalytics} size="sm" className="h-[42px]">
              <Filter size={16} className="mr-2" /> Update
            </Button>
          </div>
        </div>

        {activeTab === 'url' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-6"
          >
            <input
              value={selectedUrl}
              onChange={(e) => setSelectedUrl(e.target.value)}
              placeholder="Enter short URL slug (e.g. 'my-link')"
              className="w-full max-w-md px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </motion.div>
        )}

        {/* Chart Area */}
        <div className="h-[400px] w-full mt-4">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
              <p>Loading analytics...</p>
            </div>
          ) : chartData.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
              <BarChart3 size={48} className="mb-2 opacity-20" />
              <p>No data available for this period</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(d) => {
                    const [, m, day] = d.split('-');
                    return `${day}/${m}`;
                  }}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F3F4F6' }} />
                <Bar
                  dataKey="clicks"
                  fill="url(#colorClicks)"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={50}
                >
                  <defs>
                    <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={1} />
                      <stop offset="100%" stopColor="#818cf8" stopOpacity={0.8} />
                    </linearGradient>
                  </defs>
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Analytics;
