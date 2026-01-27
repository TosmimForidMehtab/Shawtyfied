import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Link as LinkIcon,
  BarChart3,
  PlusCircle,
  Clock,
  TrendingUp,
  Users,
  Zap,
  Copy,
  Check,
  ArrowRight
} from 'lucide-react';
import api from '../utils/api';
import { formatDateToDistance, formatShortUrl } from '../utils/formatters';
import { copyToClipboard } from '../utils/copyToClipboard';
import toast from 'react-hot-toast';
import { QuickActions } from '../components/QuickActions';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const Dashboard = () => {
  const [recentUrls, setRecentUrls] = useState([]);
  const [copiedId, setCopiedId] = useState(null);

  const fetchRecentUrls = async () => {
    try {
      const response = await api.get('/urls/my?limit=3');
      setRecentUrls(response.data?.data?.data || []);
    } catch (error) {
      console.error('Failed to fetch recent URLs:', error);
    }
  };

  useEffect(() => {
    fetchRecentUrls();
  }, []);

  const handleCopy = (shortUrl, id) => {
    copyToClipboard(formatShortUrl(shortUrl));
    setCopiedId(id);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const quickActions = [
    { title: 'Shorten URL', description: 'Create a new shortened link instantly', icon: PlusCircle, path: '/shorten', color: 'bg-gradient-to-r from-indigo-500 to-purple-600' },
    { title: 'View Analytics', description: 'Track clicks and audience insights', icon: BarChart3, path: '/analytics', color: 'bg-gradient-to-r from-teal-400 to-emerald-500' },
    { title: 'Manage Links', description: 'Edit, delete and organize your URLs', icon: LinkIcon, path: '/my-urls', color: 'bg-gradient-to-r from-orange-400 to-pink-500' },
  ];

  return (
    <div className="space-y-12 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <span className="inline-block py-1 px-3 rounded-full bg-indigo-100 text-indigo-700 text-sm font-semibold mb-4">
          Dashboard Overview
        </span>
        <h1 className="text-5xl font-bold text-slate-800 mb-4 tracking-tight">
          Welcome back!
        </h1>
        <p className="text-slate-500 text-xl max-w-2xl mx-auto">
          Manage your links, track performance, and grow your reach from one central hub.
        </p>
      </motion.div>

      {/* Quick Actions */}
      <QuickActions quickActions={quickActions} />

      {/* Recent URLs */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-2xl font-bold text-slate-800">Recent Activity</h2>
          <Link to="/my-urls">
            <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-700">
              View All <ArrowRight size={16} className="ml-1" />
            </Button>
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="grid gap-4"
        >
          {recentUrls && recentUrls.length > 0 ? (
            recentUrls.map((url, index) => (
              <motion.div
                key={url.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.5 }}
              >
                <Card className="hover:border-indigo-200 transition-colors group">
                  <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                      <LinkIcon size={24} />
                    </div>

                    <div className="flex-1 min-w-0 text-center md:text-left w-full">
                      <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1">
                        <a
                          href={formatShortUrl(url.shortUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-lg font-bold text-indigo-600 hover:underline truncate"
                        >
                          {formatShortUrl(url.shortUrl)}
                        </a>
                        <span className="hidden md:inline text-gray-300">•</span>
                        <span className="text-sm text-gray-500 truncate">{url.originalUrl}</span>
                      </div>

                      <div className="flex items-center justify-center md:justify-start gap-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Clock size={14} className="mr-1" />
                          {formatDateToDistance(url.createdAt)}
                        </div>
                        <div className="flex items-center">
                          <BarChart3 size={14} className="mr-1" />
                          <span className="font-semibold text-gray-700 mr-1">{url.clickCount}</span> visits
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 w-full md:w-auto">
                      <Button
                        onClick={() => handleCopy(url.shortUrl, url.id)}
                        variant={copiedId === url.id ? "secondary" : "outline"}
                        size="sm"
                        className="flex-1 md:flex-none"
                      >
                        {copiedId === url.id ? (
                          <>
                            <Check size={16} className="mr-2" /> Copied
                          </>
                        ) : (
                          <>
                            <Copy size={16} className="mr-2" /> Copy
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          ) : (
            <Card className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                <LinkIcon size={32} />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No links yet</h3>
              <p className="text-gray-500 mb-4">Create your first shortened link to get started</p>
              <Link to="/shorten">
                <Button variant="primary">Create Link</Button>
              </Link>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;