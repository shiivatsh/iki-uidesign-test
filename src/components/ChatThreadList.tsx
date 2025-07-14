import React, { memo } from 'react';
import { MessageCircle, Clock, CheckCircle, Archive, MoreHorizontal } from 'lucide-react';
import { ChatThread, ChatStatus } from '@/services/chatApi';
import { formatDistanceToNow } from 'date-fns';

interface ChatThreadListProps {
  threads: ChatThread[];
  activeThreadId?: string;
  onThreadSelect: (thread: ChatThread) => void;
  onThreadArchive?: (threadId: string) => void;
  isLoading?: boolean;
  showArchived?: boolean;
}

const getStatusIcon = (status: ChatStatus) => {
  switch (status) {
    case ChatStatus.DRAFT:
      return <Clock className="w-3 h-3" />;
    case ChatStatus.PENDING_CONFIRMATION:
      return <MessageCircle className="w-3 h-3" />;
    case ChatStatus.CONFIRMED:
      return <CheckCircle className="w-3 h-3" />;
    case ChatStatus.COMPLETED:
      return <CheckCircle className="w-3 h-3 text-green-500" />;
    case ChatStatus.ARCHIVED:
      return <Archive className="w-3 h-3" />;
    default:
      return <MessageCircle className="w-3 h-3" />;
  }
};

const getStatusColor = (status: ChatStatus) => {
  switch (status) {
    case ChatStatus.DRAFT:
      return 'text-muted-foreground';
    case ChatStatus.ACTIVE:
      return 'text-blue-500';
    case ChatStatus.PENDING_CONFIRMATION:
      return 'text-yellow-500';
    case ChatStatus.CONFIRMED:
      return 'text-green-500';
    case ChatStatus.COMPLETED:
      return 'text-green-600';
    case ChatStatus.ARCHIVED:
      return 'text-muted-foreground';
    default:
      return 'text-muted-foreground';
  }
};

const getStatusText = (status: ChatStatus) => {
  switch (status) {
    case ChatStatus.DRAFT:
      return 'Draft';
    case ChatStatus.ACTIVE:
      return 'Active';
    case ChatStatus.PENDING_CONFIRMATION:
      return 'Pending';
    case ChatStatus.CONFIRMED:
      return 'Confirmed';
    case ChatStatus.COMPLETED:
      return 'Completed';
    case ChatStatus.ARCHIVED:
      return 'Archived';
    default:
      return 'Unknown';
  }
};

export const ChatThreadItem = memo<{
  thread: ChatThread;
  isActive: boolean;
  onSelect: () => void;
  onArchive?: () => void;
}>(({ thread, isActive, onSelect, onArchive }) => {
  const timeAgo = formatDistanceToNow(new Date(thread.updatedAt), { addSuffix: true });
  
  return (
    <div
      className={`group relative p-4 border-l-2 cursor-pointer transition-all duration-200 hover:bg-muted/50 ${
        isActive 
          ? 'border-l-primary bg-primary/5 hover:bg-primary/10' 
          : 'border-l-transparent hover:border-l-muted-foreground/20'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className={`text-sm font-medium truncate ${
              isActive ? 'text-primary' : 'text-foreground'
            }`}>
              {thread.title || 'Untitled Chat'}
            </h4>
            <div className={`flex items-center gap-1 ${getStatusColor(thread.status)}`}>
              {getStatusIcon(thread.status)}
            </div>
          </div>
          
          {thread.lastMessage && (
            <p className="text-xs text-muted-foreground truncate mb-2">
              {thread.lastMessage}
            </p>
          )}
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{timeAgo}</span>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(thread.status)}`}>
                {getStatusText(thread.status)}
              </span>
              {thread.messageCount > 0 && (
                <span className="bg-muted text-muted-foreground px-2 py-1 rounded-full text-xs">
                  {thread.messageCount}
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Actions */}
        {onArchive && thread.status !== ChatStatus.ARCHIVED && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onArchive();
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-muted rounded"
            title="Archive chat"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
});

ChatThreadItem.displayName = 'ChatThreadItem';

export const ChatThreadList: React.FC<ChatThreadListProps> = ({
  threads,
  activeThreadId,
  onThreadSelect,
  onThreadArchive,
  isLoading = false,
  showArchived = false,
}) => {
  const filteredThreads = showArchived 
    ? threads 
    : threads.filter(thread => thread.status !== ChatStatus.ARCHIVED);

  if (isLoading && threads.length === 0) {
    return (
      <div className="space-y-4 p-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-4 bg-muted rounded w-3/4 mb-2" />
            <div className="h-3 bg-muted/50 rounded w-1/2 mb-1" />
            <div className="h-3 bg-muted/30 rounded w-1/4" />
          </div>
        ))}
      </div>
    );
  }

  if (filteredThreads.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">
          {showArchived ? 'No archived chats' : 'No active chats'}
        </p>
        <p className="text-xs mt-1">
          {showArchived 
            ? 'Archived conversations will appear here' 
            : 'Start a new conversation to see it here'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {filteredThreads.map((thread) => (
        <ChatThreadItem
          key={thread.id}
          thread={thread}
          isActive={activeThreadId === thread.id}
          onSelect={() => onThreadSelect(thread)}
          onArchive={onThreadArchive ? () => onThreadArchive(thread.id) : undefined}
        />
      ))}
      
      {isLoading && (
        <div className="p-4 text-center">
          <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-xs text-muted-foreground mt-2">Loading more chats...</p>
        </div>
      )}
    </div>
  );
};

export default ChatThreadList;