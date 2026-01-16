import { useState, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { Calculator, Users, Sparkles, Star, Download, Share2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

interface EarningsCalculatorProps {
  isPro: boolean;
}

type EarningsPeriod = 'month' | 'quarter' | 'year';

// Affiliate 2.0 Commission Structure (MONTHLY calculations)
// Level 1 (1-50): 20% + milestone bonuses (500₽ at 10,20,30,40; 1000₽ at 50)
// Level 2 (51+): 30% + 1000₽ every 25 referrals
// VIP (200+): One-time 5000₽ bonus

function calculateMonthlyAffiliateEarnings(paidReferrals: number, avgPayment: number) {
  // Calculate monthly commissions in rubles
  let commissions = 0;
  
  // Level 1: first 50 referrals at 20%
  const level1Count = Math.min(paidReferrals, 50);
  commissions += level1Count * avgPayment * 0.20;
  
  // Level 2: referrals after 50 at 30%
  if (paidReferrals > 50) {
    const level2Count = paidReferrals - 50;
    commissions += level2Count * avgPayment * 0.30;
  }
  
  // Calculate milestone bonuses in rubles (cumulative, one-time)
  let milestones = 0;
  if (paidReferrals >= 10) milestones += 500;
  if (paidReferrals >= 20) milestones += 500;
  if (paidReferrals >= 30) milestones += 500;
  if (paidReferrals >= 40) milestones += 500;
  if (paidReferrals >= 50) milestones += 1000;
  
  // Level 2 milestones: +1000₽ for every 25 referrals after 50
  if (paidReferrals > 50) {
    const level2Milestones = Math.floor((paidReferrals - 50) / 25);
    milestones += level2Milestones * 1000;
  }
  
  // VIP bonus at 200+ referrals
  if (paidReferrals >= 200) {
    milestones += 5000;
  }
  
  const totalRubles = Math.round(commissions) + milestones;
  
  return {
    commissions: Math.round(commissions),
    milestones,
    total: totalRubles,
    level: paidReferrals <= 50 ? 1 : 2,
    commissionPercent: paidReferrals <= 50 ? 20 : 30,
    isVIP: paidReferrals >= 200
  };
}

export function EarningsCalculator({ isPro }: EarningsCalculatorProps) {
  const { language } = useTranslation();
  const isRussian = language === 'ru';
  const calculatorRef = useRef<HTMLDivElement>(null);
  
  const [referralCount, setReferralCount] = useState([25]);
  const [paidPercent, setPaidPercent] = useState([60]);
  const [selectedPeriod, setSelectedPeriod] = useState<EarningsPeriod>('month');

  // Fixed average payment for annual subscription
  const avgPayment = 2988;

  // Period multipliers
  const periodMultipliers: Record<EarningsPeriod, number> = {
    month: 1,
    quarter: 3,
    year: 12,
  };

  const periodLabels: Record<EarningsPeriod, { ru: string; en: string }> = {
    month: { ru: 'Месяц', en: 'Month' },
    quarter: { ru: 'Квартал', en: 'Quarter' },
    year: { ru: 'Год', en: 'Year' },
  };

  const calculations = useMemo(() => {
    const total = referralCount[0];
    const paid = Math.floor(total * (paidPercent[0] / 100));
    const multiplier = periodMultipliers[selectedPeriod];
    
    // For monthly calculation, divide annual payment by 12
    const monthlyPayment = avgPayment / 12;
    const monthlyEarnings = calculateMonthlyAffiliateEarnings(paid, monthlyPayment);
    
    return {
      paid,
      total,
      commissions: Math.round(monthlyEarnings.commissions * multiplier),
      milestones: monthlyEarnings.milestones, // Milestones are one-time, not multiplied
      totalEarnings: Math.round(monthlyEarnings.commissions * multiplier) + monthlyEarnings.milestones,
      level: monthlyEarnings.level,
      commissionPercent: monthlyEarnings.commissionPercent,
      isVIP: monthlyEarnings.isVIP,
      multiplier,
    };
  }, [referralCount, paidPercent, selectedPeriod]);

  // Export to image
  const handleExportImage = async () => {
    if (!calculatorRef.current) return;
    
    try {
      // Create canvas from the calculator card
      const canvas = document.createElement('canvas');
      const rect = calculatorRef.current.getBoundingClientRect();
      canvas.width = rect.width * 2;
      canvas.height = rect.height * 2;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Create a simple styled export
      ctx.scale(2, 2);
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, rect.width, rect.height);
      
      // Title
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px system-ui';
      ctx.fillText(isRussian ? 'Калькулятор Affiliate 2.0' : 'Affiliate 2.0 Calculator', 20, 40);
      
      // Stats
      ctx.font = '14px system-ui';
      ctx.fillStyle = '#a0a0a0';
      ctx.fillText(`${isRussian ? 'Приглашённых' : 'Invited'}: ${referralCount[0]}`, 20, 80);
      ctx.fillText(`${isRussian ? 'Оплатят PRO' : 'Will pay PRO'}: ${paidPercent[0]}%`, 20, 105);
      
      // Results
      ctx.font = 'bold 16px system-ui';
      ctx.fillStyle = '#8b5cf6';
      ctx.fillText(`${isRussian ? 'Комиссии' : 'Commissions'}: ${calculations.commissions.toLocaleString()}₽`, 20, 150);
      ctx.fillStyle = '#f59e0b';
      ctx.fillText(`${isRussian ? 'Бонусы за вехи' : 'Milestone bonuses'}: +${calculations.milestones.toLocaleString()}₽`, 20, 180);
      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 24px system-ui';
      ctx.fillText(`${isRussian ? 'Итого' : 'Total'}: ${calculations.totalEarnings.toLocaleString()}₽`, 20, 230);
      
      // Period
      ctx.font = '12px system-ui';
      ctx.fillStyle = '#a0a0a0';
      const periodText = isRussian 
        ? `за ${periodLabels[selectedPeriod].ru.toLowerCase()}`
        : `for ${periodLabels[selectedPeriod].en.toLowerCase()}`;
      ctx.fillText(periodText, 20, 255);
      
      // Download
      const link = document.createElement('a');
      link.download = `affiliate-calculator-${selectedPeriod}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      toast.success(isRussian ? 'Изображение сохранено!' : 'Image saved!');
    } catch (error) {
      toast.error(isRussian ? 'Ошибка экспорта' : 'Export failed');
    }
  };

  // Share
  const handleShare = async () => {
    const shareText = isRussian 
      ? `💰 Affiliate 2.0 - потенциальный доход:\n\n👥 ${referralCount[0]} приглашённых (${paidPercent[0]}% оплатят)\n💜 Комиссии: ${calculations.commissions.toLocaleString()}₽\n🌟 Бонусы: +${calculations.milestones.toLocaleString()}₽\n✅ Итого за ${periodLabels[selectedPeriod].ru.toLowerCase()}: ${calculations.totalEarnings.toLocaleString()}₽\n\nПрисоединяйся: ${window.location.origin}`
      : `💰 Affiliate 2.0 - potential earnings:\n\n👥 ${referralCount[0]} invited (${paidPercent[0]}% will pay)\n💜 Commissions: ${calculations.commissions.toLocaleString()}₽\n🌟 Bonuses: +${calculations.milestones.toLocaleString()}₽\n✅ Total for ${periodLabels[selectedPeriod].en.toLowerCase()}: ${calculations.totalEarnings.toLocaleString()}₽\n\nJoin: ${window.location.origin}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: isRussian ? 'Калькулятор Affiliate 2.0' : 'Affiliate 2.0 Calculator',
          text: shareText,
        });
      } catch (error) {
        // User cancelled or error
        await navigator.clipboard.writeText(shareText);
        toast.success(isRussian ? 'Скопировано!' : 'Copied!');
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      toast.success(isRussian ? 'Скопировано!' : 'Copied!');
    }
  };

  return (
    <Card ref={calculatorRef}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Calculator className="w-4 h-4 text-purple-500" />
          {isRussian ? 'Калькулятор Affiliate 2.0' : 'Affiliate 2.0 Calculator'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Sliders */}
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-500" />
                {isRussian ? 'Приглашённых друзей' : 'Invited friends'}
              </label>
              <Badge variant="outline" className="text-lg font-bold">
                {referralCount[0]}
              </Badge>
            </div>
            <Slider
              value={referralCount}
              onValueChange={setReferralCount}
              max={250}
              min={1}
              step={1}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text-sm font-medium text-foreground">
                {isRussian ? 'Оплатят PRO (%)' : 'Will pay for PRO (%)'}
              </label>
              <Badge variant="outline" className="text-lg font-bold">
                {paidPercent[0]}%
              </Badge>
            </div>
            <Slider
              value={paidPercent}
              onValueChange={setPaidPercent}
              max={100}
              min={0}
              step={5}
              className="w-full"
            />
          </div>
        </div>

        {/* Level indicator */}
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Badge 
            variant={calculations.level === 1 ? "default" : "outline"} 
            className={calculations.level === 1 ? "bg-purple-500" : ""}
          >
            {isRussian ? 'Уровень 1: 20%' : 'Level 1: 20%'}
          </Badge>
          <Badge 
            variant={calculations.level === 2 ? "default" : "outline"}
            className={calculations.level === 2 ? "bg-amber-500 text-black" : ""}
          >
            {isRussian ? 'Уровень 2: 30%' : 'Level 2: 30%'}
          </Badge>
          {calculations.isVIP && (
            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
              <Star className="w-3 h-3 mr-1" />
              VIP
            </Badge>
          )}
        </div>

        {/* Results */}
        <motion.div
          key={`${referralCount[0]}-${paidPercent[0]}-${selectedPeriod}`}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-orange-500/10 border border-purple-500/20"
        >
          {/* Title with period */}
          <div className="text-center mb-3">
            <Sparkles className="w-6 h-6 text-purple-500 mx-auto mb-2" />
            <div className="text-sm text-muted-foreground">
              {isRussian ? 'Ваш потенциальный доход за:' : 'Your potential earnings for:'}
            </div>
          </div>

          {/* Period Toggle */}
          <div className="flex justify-center gap-2 mb-4">
            {(['month', 'quarter', 'year'] as EarningsPeriod[]).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedPeriod === period
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-muted/50 hover:bg-muted text-muted-foreground'
                }`}
              >
                {isRussian ? periodLabels[period].ru : periodLabels[period].en}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 rounded-lg bg-background/50">
              <div className="text-xl font-bold text-purple-500">
                {calculations.commissions.toLocaleString()}₽
              </div>
              <div className="text-xs text-muted-foreground">
                {isRussian ? 'Комиссии' : 'Commissions'}
              </div>
              <div className="text-xs text-purple-500 mt-1">
                {calculations.commissionPercent}% × {calculations.paid} × {calculations.multiplier}
              </div>
            </div>

            <div className="text-center p-3 rounded-lg bg-background/50">
              <div className="text-xl font-bold text-amber-500">
                +{calculations.milestones.toLocaleString()}₽
              </div>
              <div className="text-xs text-muted-foreground">
                {isRussian ? 'Бонусы за вехи' : 'Milestone bonuses'}
              </div>
              <div className="text-xs text-amber-500 mt-1">
                × {calculations.multiplier} {isRussian ? 'мес.' : 'mo.'}
              </div>
            </div>
          </div>

          <div className="mt-3 p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-center">
            <div className="text-2xl font-bold text-green-500">
              {calculations.totalEarnings.toLocaleString()}₽
            </div>
            <div className="text-xs text-muted-foreground">
              {isRussian 
                ? `Итого за ${periodLabels[selectedPeriod].ru.toLowerCase()}`
                : `Total for ${periodLabels[selectedPeriod].en.toLowerCase()}`
              }
            </div>
          </div>
        </motion.div>

        {/* Export Buttons */}
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportImage}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            {isRussian ? 'Скачать' : 'Download'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="gap-2"
          >
            <Share2 className="w-4 h-4" />
            {isRussian ? 'Поделиться' : 'Share'}
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          {isRussian 
            ? '* Расчёт на основе средней стоимости годового тарифа (2 988 ₽)'
            : '* Based on average annual plan cost (2,988 ₽)'}
        </p>
      </CardContent>
    </Card>
  );
}
