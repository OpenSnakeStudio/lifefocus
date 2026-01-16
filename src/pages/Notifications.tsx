import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, CheckCheck, Trash2, Heart, MessageCircle, ThumbsDown, ArrowLeft, Settings, UserPlus, Image, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ru, enUS } from 'date-fns/locale';
import { useNotifications, UserNotification } from '@/hooks/useNotifications';
import { useTranslation } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { NotificationSettingsDialog } from '@/components/NotificationSettingsDialog';

function NotificationIcon({ type }: { type: string }) {
  switch (type) {
    case 'like':
      return <Heart className="w-4 h-4 text-red-500" />;
    case 'dislike':
      return <ThumbsDown className="w-4 h-4 text-muted-foreground" />;
    case 'comment':
      return <MessageCircle className="w-4 h-4 text-blue-500" />;
    case 'new_post':
      return <Image className="w-4 h-4 text-primary" />;
    case 'new_follower':
      return <UserPlus className="w-4 h-4 text-green-500" />;
    case 'new_chat_message':
      return <MessageSquare className="w-4 h-4 text-green-500" />;
    default:
      return <Bell className="w-4 h-4 text-primary" />;
  }
}

function NotificationItem({ 
  notification, 
  onMarkAsRead, 
  onDelete,
  language 
}: { 
  notification: UserNotification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  language: string;
}) {
  const navigate = useNavigate();
  const locale = language === 'ru' ? ru : enUS;
  
  const handleClick = () => {
    if (!notification.is_read) {
      onMarkAsRead(notification.id);
    }
    if (notification.reference_type === 'post' && notification.reference_id) {
      navigate('/focus');
    } else if (notification.actor_id) {
      navigate(`/user/${notification.actor_id}`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      layout
    >
      <Card 
        className={`cursor-pointer transition-all hover:shadow-md ${
          !notification.is_read ? 'bg-primary/5 border-primary/20' : ''
        }`}
        onClick={handleClick}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="relative">
              <Avatar className="w-10 h-10">
                <AvatarImage src={notification.actor_profile?.avatar_url || undefined} />
                <AvatarFallback>
                  {notification.actor_profile?.display_name?.charAt(0) || '?'}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-background flex items-center justify-center border">
                <NotificationIcon type={notification.type} />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-sm">{notification.title}</p>
                  {notification.message && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {notification.message}
                    </p>
                  )}
                </div>
                {!notification.is_read && (
                  <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {formatDistanceToNow(new Date(notification.created_at), { 
                  addSuffix: true, 
                  locale 
                })}
              </p>
            </div>
            
            <div className="flex items-center gap-1 shrink-0">
              {!notification.is_read && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarkAsRead(notification.id);
                  }}
                >
                  <Check className="w-4 h-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(notification.id);
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function Notifications() {
  const navigate = useNavigate();
  const { language } = useTranslation();
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const isRussian = language === 'ru';
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Bell className="w-6 h-6 text-primary" />
                {isRussian ? 'Уведомления' : 'Notifications'}
              </h1>
              {unreadCount > 0 && (
                <p className="text-sm text-muted-foreground">
                  {isRussian 
                    ? `${unreadCount} непрочитанных` 
                    : `${unreadCount} unread`}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSettingsOpen(true)}
            >
              <Settings className="w-5 h-5" />
            </Button>
            
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                className="gap-2"
              >
                <CheckCheck className="w-4 h-4" />
                {isRussian ? 'Прочитать все' : 'Mark all read'}
              </Button>
            )}
          </div>
        </div>

        <NotificationSettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />

        {/* Notifications List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">
                {isRussian ? 'Нет уведомлений' : 'No notifications'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {isRussian 
                  ? 'Здесь будут появляться уведомления о лайках и комментариях'
                  : 'Notifications about likes and comments will appear here'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {notifications.map(notification => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={markAsRead}
                  onDelete={deleteNotification}
                  language={language}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
