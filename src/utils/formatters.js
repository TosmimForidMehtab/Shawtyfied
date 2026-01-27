import { format, formatDistanceToNow } from 'date-fns';
export const formatDateToDistance = (dateString) => {
  return formatDistanceToNow(new Date(dateString), { addSuffix: true });
};

export const formatShortUrl = (url) => {
    if (!url) return '';
  return `${import.meta.env.VITE_FRONTEND_URL}/${url}`
};

export const formatDateToHumanReadable = (dateString) => {
  return format(new Date(dateString), 'MMMM d, yyyy');
};

export const formatDate = (dateString, dateFormat = 'yyyy-MM-dd') => {
  return format(new Date(dateString), dateFormat);
}