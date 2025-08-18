// components/ChatHistory.tsx
import React, { useState, useEffect } from 'react';
import { X, MessageCircle, Scan, Heart, AlertTriangle, Calendar, Search } from 'lucide-react';
import { firebaseService, type ChatData } from '../services/firebaseService';
import { NavigationTab } from '../types';
import { LoadingSpinner } from './LoadingSpinner';
import { Alert } from './Alert';

interface ChatHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  onChatSelect?: (chat: ChatData) => void;
}

export const ChatHistory: React.FC<ChatHistoryProps> = ({ isOpen, onClose, onChatSelect }) => {
  const [chats, setChats] = useState<ChatData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<NavigationTab | 'all'>('all');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadChatHistory = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const chatHistory = await firebaseService.getChatHistory(50);
        setChats(chatHistory);
      } catch (err) {
        setError('Failed to load chat history');
        console.error('Error loading chat history:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (isOpen) {
      loadChatHistory();
    }
  }, [isOpen]);

  const getTypeIcon = (type: NavigationTab) => {
    switch (type) {
      case NavigationTab.DRUG_INFO:
        return <MessageCircle className="w-4 h-4 text-blue-500" />;
      case NavigationTab.IMAGE_ANALYSIS:
        return <Scan className="w-4 h-4 text-purple-500" />;
      case NavigationTab.HEALTH_MANAGEMENT:
        return <Heart className="w-4 h-4 text-pink-500" />;
      case NavigationTab.EMERGENCY_AID:
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <MessageCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTypeLabel = (type: NavigationTab) => {
    switch (type) {
      case NavigationTab.DRUG_INFO:
        return 'Medical Consultation';
      case NavigationTab.IMAGE_ANALYSIS:
        return 'Image Analysis';
      case NavigationTab.HEALTH_MANAGEMENT:
        return 'Wellness Planning';
      case NavigationTab.EMERGENCY_AID:
        return 'Emergency Guidance';
      default:
        return 'Unknown';
    }
  };

  const filteredChats = chats.filter(chat => {
    const matchesSearch = chat.query.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (chat.response && chat.response.title && chat.response.title.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === 'all' || chat.type === filterType;
    return matchesSearch && matchesType;
  });
  
  const formatDate = (date: Date) => {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
        return 'Invalid date';
    }
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const groupChatsByDate = (chats: ChatData[]) => {
    return chats.reduce((acc, chat) => {
      const dateKey = formatDate(chat.timestamp);
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(chat);
      return acc;
    }, {} as { [key: string]: ChatData[] });
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-lg">
              <MessageCircle className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Chat History</h2>
              <p className="text-gray-600 dark:text-gray-400">Your previous conversations with VitaShifa</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full"><LoadingSpinner size="lg" /></div>
          ) : error ? (
            <div className="p-6"><Alert type="error" title="Error" message={error} /></div>
          ) : filteredChats.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <MessageCircle className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">No Conversations Found</h3>
              <p className="text-gray-600 dark:text-gray-400">Your chat history will appear here.</p>
            </div>
          ) : (
            <div className="p-4 space-y-6">
              {Object.entries(groupChatsByDate(filteredChats)).map(([dateGroup, groupChats]) => (
                <div key={dateGroup}>
                  <div className="flex items-center space-x-2 mb-3 px-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{dateGroup}</span>
                  </div>
                  <div className="space-y-2">
                    {groupChats.map((chat) => (
                      <div
                        key={chat.id}
                        onClick={() => onChatSelect?.(chat)}
                        className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer group"
                      >
                        <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 mt-1">{getTypeIcon(chat.type)}</div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center">
                                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{chat.response.title}</p>
                                    <p className="text-xs text-gray-400 flex-shrink-0 ml-2">{chat.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">{chat.query}</p>
                            </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};