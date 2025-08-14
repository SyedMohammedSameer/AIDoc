// components/ChatHistory.tsx
import React, { useState, useEffect } from 'react';
import { X, MessageCircle, Scan, Heart, AlertTriangle, Calendar, Search, Trash2 } from 'lucide-react';
import { firebaseService, type ChatData } from '../services/firebase';
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
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<NavigationTab | 'all'>('all');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadChatHistory();
    }
  }, [isOpen]);

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
                         chat.response.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || chat.type === filterType;
    return matchesSearch && matchesType;
  });

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const groupChatsByDate = (chats: ChatData[]) => {
    const groups: { [key: string]: ChatData[] } = {};
    
    chats.forEach(chat => {
      const dateKey = formatDate(chat.timestamp);
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(chat);
    });
    
    return groups;
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
          {/* Search */}
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

          {/* Type Filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filterType === 'all'
                  ? 'bg-teal-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              All ({chats.length})
            </button>
            {Object.values(NavigationTab).map(type => {
              const count = chats.filter(chat => chat.type === type).length;
              if (count === 0) return null;
              
              return (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors flex items-center space-x-1 ${
                    filterType === type
                      ? 'bg-teal-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {getTypeIcon(type)}
                  <span>{getTypeLabel(type)} ({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <LoadingSpinner size="lg" />
            </div>
          ) : error ? (
            <div className="p-6">
              <Alert type="error" title="Error" message={error} />
            </div>
          ) : filteredChats.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                <MessageCircle className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {searchTerm || filterType !== 'all' ? 'No matching conversations' : 'No chat history yet'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm || filterType !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Start a conversation to see your chat history here'
                }
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-6">
              {Object.entries(groupChatsByDate(filteredChats)).map(([dateGroup, groupChats]) => (
                <div key={dateGroup}>
                  {/* Date Header */}
                  <div className="flex items-center space-x-2 mb-3">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {dateGroup}
                    </span>
                    <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
                  </div>

                  {/* Chats for this date */}
                  <div className="space-y-3">
                    {groupChats.map((chat) => (
                      <div
                        key={chat.id}
                        onClick={() => onChatSelect?.(chat)}
                        className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer group"
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                            {getTypeIcon(chat.type)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                {getTypeLabel(chat.type)}
                              </span>
                              <span className="text-xs text-gray-400">
                                {chat.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            
                            <h4 className="font-medium text-gray-900 dark:text-white mb-1 truncate">
                              {chat.response.title}
                            </h4>
                            
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                              {chat.query}
                            </p>
                            
                            {chat.response.summary && (
                              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2 line-clamp-1">
                                {chat.response.summary}
                              </p>
                            )}
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

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>
              {filteredChats.length} of {chats.length} conversations
            </span>
            <span>
              {firebaseService.isEnabled() ? 'Synced to cloud' : 'Stored locally'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};