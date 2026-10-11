import { format, isToday, isYesterday, isThisWeek } from 'date-fns';

export const formatMessageTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  
  if (isToday(date)) return format(date, 'HH:mm');
  if (isYesterday(date)) return 'Yesterday';
  if (isThisWeek(date)) return format(date, 'EEEE');
  
  return format(date, 'dd.MM.yyyy');
};