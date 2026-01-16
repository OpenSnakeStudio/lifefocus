import { useState } from 'react';
import { Plus, Trash2, User, Phone, Mail, MessageCircle, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from '@/contexts/LanguageContext';
import { GoalContact } from '@/types/goal';

interface GoalContactsManagerProps {
  contacts: GoalContact[];
  goalId: string;
  onAddContact: (contact: Omit<GoalContact, 'id' | 'user_id' | 'created_at'>) => Promise<any>;
  onDeleteContact: (id: string) => Promise<void>;
}

const CONTACT_TYPES = [
  { value: 'mentor', labelRu: 'Ментор', labelEn: 'Mentor', icon: User },
  { value: 'partner', labelRu: 'Партнёр', labelEn: 'Partner', icon: Briefcase },
  { value: 'expert', labelRu: 'Эксперт', labelEn: 'Expert', icon: User },
  { value: 'support', labelRu: 'Поддержка', labelEn: 'Support', icon: MessageCircle },
  { value: 'other', labelRu: 'Другое', labelEn: 'Other', icon: User },
];

export function GoalContactsManager({ contacts, goalId, onAddContact, onDeleteContact }: GoalContactsManagerProps) {
  const { language } = useTranslation();
  const isRussian = language === 'ru';
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [name, setName] = useState('');
  const [contactType, setContactType] = useState('mentor');
  const [contactInfo, setContactInfo] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    try {
      await onAddContact({
        goal_id: goalId,
        contact_name: name.trim(),
        contact_type: contactType,
        contact_info: contactInfo.trim() || null,
        notes: notes.trim() || null,
      });
      
      setName('');
      setContactType('mentor');
      setContactInfo('');
      setNotes('');
      setDialogOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const getContactTypeLabel = (type: string) => {
    const found = CONTACT_TYPES.find(t => t.value === type);
    return found ? (isRussian ? found.labelRu : found.labelEn) : type;
  };

  const getContactIcon = (info: string | null) => {
    if (!info) return null;
    if (info.includes('@')) return <Mail className="w-3.5 h-3.5" />;
    if (info.match(/^\+?\d/)) return <Phone className="w-3.5 h-3.5" />;
    if (info.includes('t.me') || info.startsWith('@')) return <MessageCircle className="w-3.5 h-3.5" />;
    return null;
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">
              {isRussian ? 'Контакты' : 'Contacts'}
            </CardTitle>
            <Button size="sm" variant="outline" onClick={() => setDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-1" />
              {isRussian ? 'Добавить' : 'Add'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {contacts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              {isRussian 
                ? 'Добавьте людей, которые помогут достичь цели'
                : 'Add people who can help achieve the goal'}
            </p>
          ) : (
            <div className="space-y-3">
              {contacts.map((contact) => (
                <div 
                  key={contact.id} 
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 group"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{contact.contact_name}</span>
                      {contact.contact_type && (
                        <Badge variant="secondary" className="text-xs">
                          {getContactTypeLabel(contact.contact_type)}
                        </Badge>
                      )}
                    </div>
                    {contact.contact_info && (
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-0.5">
                        {getContactIcon(contact.contact_info)}
                        <span className="truncate">{contact.contact_info}</span>
                      </div>
                    )}
                    {contact.notes && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {contact.notes}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                    onClick={() => onDeleteContact(contact.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add contact dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isRussian ? 'Добавить контакт' : 'Add Contact'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>{isRussian ? 'Имя' : 'Name'} *</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={isRussian ? 'Иван Иванов' : 'John Doe'}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>{isRussian ? 'Роль' : 'Role'}</Label>
              <Select value={contactType} onValueChange={setContactType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONTACT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {isRussian ? type.labelRu : type.labelEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{isRussian ? 'Контактная информация' : 'Contact Info'}</Label>
              <Input
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                placeholder={isRussian ? 'Телефон, email или Telegram' : 'Phone, email or Telegram'}
              />
            </div>

            <div className="space-y-2">
              <Label>{isRussian ? 'Заметки' : 'Notes'}</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={isRussian ? 'Как этот человек может помочь?' : 'How can this person help?'}
                rows={2}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1" 
                onClick={() => setDialogOpen(false)}
              >
                {isRussian ? 'Отмена' : 'Cancel'}
              </Button>
              <Button type="submit" className="flex-1" disabled={saving || !name.trim()}>
                {saving 
                  ? (isRussian ? 'Сохранение...' : 'Saving...')
                  : (isRussian ? 'Добавить' : 'Add')
                }
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
