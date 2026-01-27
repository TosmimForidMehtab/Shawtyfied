import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDebounce } from '../hooks/useDebounce';
import {
  Link as LinkIcon,
  Copy,
  Trash2,
  ExternalLink,
  Calendar,
  BarChart3,
  Search,
  Filter,
  ChevronRight,
  ChevronLeft,
  ChevronDown
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { formatDateToHumanReadable, formatShortUrl } from '../utils/formatters';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const MyUrls = () => {
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortDir, setSortDir] = useState('desc');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalRecords: 0,
    hasNextPage: false,
    hasPreviousPage: false
  });

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    fetchUrls();
  }, [debouncedSearchTerm, sortBy, sortDir, pagination.page]);

  const fetchUrls = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...(debouncedSearchTerm && { search: debouncedSearchTerm }),
        sortBy: sortBy === 'date' ? 'createdAt' : 'clickCount',
        sortDir: sortDir
      };

      const response = await api.get('/urls/my', { params });

      if (response.data.success) {
        setUrls(response.data.data.data || []);
        setPagination(response.data.data.pagination || {
          page: 1,
          limit: 10,
          totalRecords: 0,
          hasNextPage: false,
          hasPreviousPage: false
        });
      }
    } catch (error) {
      console.error('Failed to fetch URLs:', error);
      toast.error('Failed to fetch URLs');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const deleteUrl = async (shortUrl) => {
    if (window.confirm('Are you sure you want to delete this URL?')) {
      try {
        await api.delete(`/urls/${shortUrl}`);
        setUrls(urls.filter(url => url.shortUrl !== shortUrl));
        toast.success('URL deleted successfully');

        if (urls.length === 1 && pagination.page > 1) {
          setPagination(prev => ({ ...prev, page: prev.page - 1 }));
        } else {
          fetchUrls();
        }
      } catch (error) {
        console.error('Failed to delete URL:', error);
        toast.error('Failed to delete URL');
      }
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-800">My URLs</h1>
          <p className="text-gray-600 mt-2">Manage and track your shortened links</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Input
              icon={Search}
              placeholder="Search URLs..."
              value={searchTerm}
              onChange={handleSearch}
              containerClassName="mb-0"
            />
          </div>

          <div className="flex gap-2">
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
                className="appearance-none pl-10 pr-8 py-2.5 h-[42px] border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white text-gray-700 shadow-sm"
              >
                <option value="date">Sort by Date</option>
                <option value="clicks">Sort by Clicks</option>
              </select>
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            </div>

            <Button
              variant="outline"
              onClick={() => {
                setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className="h-[42px] w-[42px] p-0 flex items-center justify-center !rounded-xl"
              title={`Sort ${sortDir === 'asc' ? 'ascending' : 'descending'}`}
            >
              {sortDir === 'asc' ? '↑' : '↓'}
            </Button>
          </div>
        </div>
      </motion.div>

      {loading && urls.length === 0 ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <AnimatePresence>
          {urls.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 bg-white/50 rounded-3xl border border-dashed border-gray-300"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-50 rounded-2xl mb-6 text-indigo-300">
                <LinkIcon size={40} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {searchTerm ? 'No URLs found' : 'No URLs yet'}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchTerm ? 'Try a different search term' : 'Start by shortening your first URL'}
              </p>
            </motion.div>
          ) : (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 gap-4"
              >
                {urls.map((url, index) => (
                  <motion.div
                    key={url.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="hover:border-indigo-200 transition-colors group p-5">
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex-1 min-w-0 w-full">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                              <LinkIcon size={20} />
                            </div>
                            <div className="min-w-0">
                              <h3 className="text-lg font-bold text-gray-800 truncate">
                                {formatShortUrl(url.shortUrl)}
                              </h3>
                            </div>
                          </div>

                          <p className="text-gray-500 truncate text-sm mb-3 pl-[3.25rem]" title={url.originalUrl}>
                            {url.originalUrl}
                          </p>

                          <div className="flex items-center gap-4 pl-[3.25rem] text-sm text-gray-500">
                            <div className="flex items-center bg-gray-50 px-2 py-1 rounded-md">
                              <BarChart3 size={14} className="mr-1.5 text-gray-400" />
                              <span className="font-semibold text-gray-700 mr-1">{url.clickCount}</span> visits
                            </div>
                            <div className="flex items-center">
                              <Calendar size={14} className="mr-1.5 text-gray-400" />
                              {formatDateToHumanReadable(url.createdAt)}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 w-full md:w-auto pl-[3.25rem] md:pl-0 mt-2 md:mt-0">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => copyToClipboard(formatShortUrl(url.shortUrl))}
                            className="flex-1 md:flex-none justify-center"
                          >
                            <Copy size={16} className="mr-2" /> Copy
                          </Button>

                          <a
                            href={formatShortUrl(url.shortUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors border border-transparent hover:border-indigo-100"
                            title="Open URL"
                          >
                            <ExternalLink size={20} />
                          </a>

                          <button
                            onClick={() => deleteUrl(url.shortUrl)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-transparent hover:border-red-100"
                            title="Delete URL"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>

              {/* Pagination */}
              {pagination.totalRecords > pagination.limit && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-between border-t border-gray-200/50 pt-6 px-2"
                >
                  <div className="text-sm text-gray-500">
                    Showing <span className="font-semibold text-gray-800">{((pagination.page - 1) * pagination.limit) + 1}</span> to{' '}
                    <span className="font-semibold text-gray-800">{Math.min(pagination.page * pagination.limit, pagination.totalRecords)}</span> of{' '}
                    <span className="font-semibold text-gray-800">{pagination.totalRecords}</span> URLs
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                      disabled={!pagination.hasPreviousPage}
                      className="!px-3"
                    >
                      <ChevronLeft size={18} />
                    </Button>

                    <div className="hidden sm:flex items-center gap-1">
                      {[...Array(Math.ceil(pagination.totalRecords / pagination.limit))].map((_, i) => (
                        <button
                          key={i + 1}
                          onClick={() => setPagination(prev => ({ ...prev, page: i + 1 }))}
                          className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${pagination.page === i + 1
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                            : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                      disabled={!pagination.hasNextPage}
                      className="!px-3"
                    >
                      <ChevronRight size={18} />
                    </Button>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};

export default MyUrls;