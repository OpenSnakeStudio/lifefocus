import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, Star, Loader2, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useUserSearch, SearchedUser } from '@/hooks/useUserSearch';
import { useTranslation } from '@/contexts/LanguageContext';

interface UserSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectUser?: (user: SearchedUser) => void;
  selectionMode?: boolean;
}

const STATUS_LABELS: Record<string, string> = {
  student: 'Студент',
  entrepreneur: 'Предприниматель',
  employee: 'Сотрудник',
  freelancer: 'Фрилансер',
  manager: 'Менеджер',
  developer: 'Разработчик',
  designer: 'Дизайнер',
  other: 'Другое',
};

export function UserSearchDialog({ 
  open, 
  onOpenChange, 
  onSelectUser,
  selectionMode = false 
}: UserSearchDialogProps) {
  const navigate = useNavigate();
  const { language } = useTranslation();
  const isRussian = language === 'ru';
  const { query, setQuery, results, isLoading, hasMore, loadMore, reset } = useUserSearch();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    if (target.scrollHeight - target.scrollTop <= target.clientHeight + 100) {
      loadMore();
    }
  }, [loadMore]);

  const handleUserClick = (user: SearchedUser) => {
    if (selectionMode && onSelectUser) {
      onSelectUser(user);
    } else {
      navigate(`/user/${user.user_id}`);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isRussian ? 'Поиск пользователей' : 'Search Users'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={isRussian ? 'Введите имя...' : 'Enter name...'}
              className="pl-10 pr-10"
              autoFocus
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Results */}
          <ScrollArea 
            className="h-[400px] pr-4" 
            onScrollCapture={handleScroll}
            ref={scrollRef}
          >
            {!query.trim() ? (
              <div className="text-center py-12 text-muted-foreground">
                <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>{isRussian ? 'Начните вводить имя пользователя' : 'Start typing a username'}</p>
              </div>
            ) : isLoading && results.length === 0 ? (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              </div>
            ) : results.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <User className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>{isRussian ? 'Пользователи не найдены' : 'No users found'}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {results.map((user) => (
                  <button
                    key={user.user_id}
                    onClick={() => handleUserClick(user)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors text-left"
                  >
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={user.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {(user.display_name || 'U')[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">
                          {user.display_name || 'Пользователь'}
                        </p>
                        {user.total_stars && user.total_stars > 0 && (
                          <div className="flex items-center gap-1 text-yellow-500 text-sm">
                            <Star className="h-3 w-3 fill-current" />
                            {user.total_stars}
                          </div>
                        )}
                      </div>
                      {user.status_tag && (
                        <Badge variant="secondary" className="text-xs mt-1">
                          {STATUS_LABELS[user.status_tag] || user.status_tag}
                        </Badge>
                      )}
                      {user.bio && (
                        <p className="text-xs text-muted-foreground truncate mt-1">
                          {user.bio}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
                
                {isLoading && results.length > 0 && (
                  <div className="text-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin mx-auto text-primary" />
                  </div>
                )}
                
                {!hasMore && results.length > 0 && (
                  <p className="text-center text-sm text-muted-foreground py-4">
                    {isRussian ? 'Все результаты загружены' : 'All results loaded'}
                  </p>
                )}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
