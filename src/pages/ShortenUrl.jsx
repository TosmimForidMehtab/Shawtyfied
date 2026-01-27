import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import {
  Link as LinkIcon,
  Copy,
  Check,
  Zap,
  Clock,
  BarChart3,
  ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { formatShortUrl } from '../utils/formatters';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const ShortenUrl = () => {
  const [shortenedUrl, setShortenedUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setShortenedUrl('');

      try {
        new URL(data.originalUrl);
      } catch (e) {
        toast.error('Please enter a valid URL');
        setLoading(false);
        return;
      }

      const response = await api.post('/urls/shorten', { originalUrl: data.originalUrl });
      setShortenedUrl(formatShortUrl(response.data?.data?.shortUrl || ''));
      toast.success('URL shortened successfully!');
      setLoading(false);
      reset();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to shorten URL');
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shortenedUrl);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const features = [
    {
      icon: Zap,
      title: 'Instant Redirection',
      description: 'Lightning-fast redirects to your destination'
    },
    {
      icon: BarChart3,
      title: 'Analytics Tracking',
      description: 'Track clicks and monitor performance'
    },
    {
      icon: Clock,
      title: 'Permanent Links',
      description: 'Your shortened URLs never expire'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-700 to-purple-600 bg-clip-text text-transparent mb-4">Shorten Your URL</h1>
        <p className="text-gray-600 text-lg">Create shortened links that are easy to share and track</p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="h-full">
            <div className="mb-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl mb-4 shadow-lg shadow-indigo-500/30">
                <LinkIcon className="text-white" size={32} />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Paste Your URL</h2>
              <p className="text-gray-500">Enter the long URL you want to shorten</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <Input
                label="Original URL"
                placeholder="https://example.com/very-long-url-path"
                type="url"
                error={errors.originalUrl?.message}
                {...register('originalUrl', {
                  required: 'URL is required',
                  pattern: {
                    value: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
                    message: 'Please enter a valid URL'
                  }
                })}
              />

              <Button
                type="submit"
                isLoading={loading}
                className="w-full justify-center"
                size="lg"
              >
                {!loading && <Zap size={20} className="mr-2" />}
                <span>{loading ? 'Shortening...' : 'Shorten URL'}</span>
              </Button>
            </form>

            {shortenedUrl && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100"
              >
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Your Shortened URL</h3>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-white border border-gray-200 rounded-lg px-4 py-3 font-mono text-gray-800 truncate">
                    {shortenedUrl}
                  </div>
                  <Button
                    onClick={copyToClipboard}
                    variant={copied ? "secondary" : "outline"}
                    className="shrink-0"
                  >
                    {copied ? <Check size={20} /> : <Copy size={20} />}
                  </Button>
                </div>
                <div className="mt-4 flex justify-end">
                  <a
                    href={shortenedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 text-sm text-indigo-600 hover:text-indigo-700 font-medium hover:underline"
                  >
                    <span>Test Link</span>
                    <ExternalLink size={14} />
                  </a>
                </div>
              </motion.div>
            )}
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-8 text-white shadow-xl shadow-indigo-500/20">
            <h2 className="text-2xl font-bold mb-6">Why Use Shawtyfied?</h2>
            <ul className="space-y-8">
              {features.map((feature, index) => (
                <motion.li
                  key={feature.title}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                  className="flex items-start space-x-4"
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                    <feature.icon size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{feature.title}</h3>
                    <p className="text-indigo-100 opacity-90 leading-relaxed">{feature.description}</p>
                  </div>
                </motion.li>
              ))}
            </ul>
          </div>

          <Card>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Tips for Better URLs</h3>
            <ul className="space-y-3">
              {[
                'Use descriptive slugs for better tracking',
                'Share shortened links in emails and messages',
                'Monitor analytics to understand your audience',
                'Custom domains available for businesses'
              ].map((tip, i) => (
                <li key={i} className="flex items-center text-gray-600">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></div>
                  {tip}
                </li>
              ))}
            </ul>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default ShortenUrl;