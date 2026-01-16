import { useState } from 'react';
import { motion } from 'framer-motion';
import { Target, Plus, Tag, Tags, BarChart3 } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { AppHeader } from '@/components/AppHeader';
import { useTranslation } from '@/contexts/LanguageContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { GoalsList } from '@/components/goals/GoalsList';
import { GoalDialog } from '@/components/goals/GoalDialog';
import { TagStatistics } from '@/components/TagStatistics';
import { CommonTagsTab } from '@/components/statistics/CommonTagsTab';
import { useGoals } from '@/hooks/useGoals';

export default function Goals() {
  const { language } = useTranslation();
  const isRussian = language === 'ru';
  const [activeTab, setActiveTab] = useState('goals');
  const [dialogOpen, setDialogOpen] = useState(false);
  const { goals, loading, addGoal, updateGoal, deleteGoal, completeGoal } = useGoals();

  const handleAddGoal = async (data: any) => {
    await addGoal(data);
    setDialogOpen(false);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <AppHeader />
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <PageHeader 
            showTitle
            icon={<Target className="w-5 h-5 text-purple-500" />}
            iconBgClass="bg-purple-500/10"
            title={isRussian ? 'Цели' : 'Goals'}
            subtitle={isRussian ? 'Управляйте своими целями' : 'Manage your goals'}
          />
          <Button onClick={() => setDialogOpen(true)} size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            {isRussian ? 'Новая цель' : 'New Goal'}
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="goals" className="gap-2">
              <Target className="w-4 h-4" />
              {isRussian ? 'Цели' : 'Goals'}
            </TabsTrigger>
            <TabsTrigger value="tags" className="gap-2">
              <Tag className="w-4 h-4" />
              {isRussian ? 'Теги' : 'Tags'}
            </TabsTrigger>
            <TabsTrigger value="common" className="gap-2">
              <Tags className="w-4 h-4" />
              {isRussian ? 'Общие' : 'Common'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="goals">
            <GoalsList 
              goals={goals}
              loading={loading}
              onUpdate={updateGoal}
              onDelete={deleteGoal}
              onComplete={completeGoal}
            />
          </TabsContent>

          <TabsContent value="tags">
            <TagStatistics />
          </TabsContent>

          <TabsContent value="common">
            <CommonTagsTab />
          </TabsContent>
        </Tabs>

        <GoalDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSave={handleAddGoal}
        />
      </div>
    </div>
  );
}
