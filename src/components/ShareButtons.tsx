import { UserPlus, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function ShareButtons() {
  const handleInviteFriend = () => {
    const text = 'Попробуй HabitFlow для отслеживания привычек!';
    const url = window.location.origin;
    
    if (navigator.share) {
      navigator.share({ title: 'HabitFlow', text, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${text} ${url}`);
      toast.success('Ссылка скопирована!');
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({ title: 'HabitFlow', url });
      } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      toast.success('Ссылка скопирована!');
    }
  };

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={handleInviteFriend} className="text-xs">
        <UserPlus className="h-4 w-4 mr-1.5" />
        Пригласить
      </Button>
      <Button variant="outline" size="sm" onClick={handleShare} className="text-xs">
        <Share2 className="h-4 w-4 mr-1.5" />
        Поделиться
      </Button>
    </div>
  );
}
