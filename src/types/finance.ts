export interface FinanceTransaction {
  id: string;
  name: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  completedAt?: string;
  createdAt: string;
}

export const FINANCE_CATEGORIES = [
  { id: 'salary', name: 'Зарплата', icon: '💵', type: 'income' },
  { id: 'freelance', name: 'Фриланс', icon: '💻', type: 'income' },
  { id: 'investment', name: 'Инвестиции', icon: '📈', type: 'income' },
  { id: 'gift', name: 'Подарок', icon: '🎁', type: 'income' },
  { id: 'food', name: 'Еда', icon: '🍔', type: 'expense' },
  { id: 'transport', name: 'Транспорт', icon: '🚗', type: 'expense' },
  { id: 'entertainment', name: 'Развлечения', icon: '🎬', type: 'expense' },
  { id: 'bills', name: 'Счета', icon: '📄', type: 'expense' },
  { id: 'shopping', name: 'Покупки', icon: '🛒', type: 'expense' },
  { id: 'health', name: 'Здоровье', icon: '💊', type: 'expense' },
];
