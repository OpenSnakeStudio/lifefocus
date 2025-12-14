export interface FinanceTransaction {
  id: string;
  name: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  date: string; // YYYY-MM-DD
  description?: string;
  completed: boolean;
  completedAt?: string;
  createdAt: string;
}

export const FINANCE_CATEGORIES = [
  // Income categories
  { id: 'salary', name: 'Зарплата', icon: '💰', type: 'income' as const },
  { id: 'freelance', name: 'Фриланс', icon: '💼', type: 'income' as const },
  { id: 'investment', name: 'Инвестиции', icon: '📈', type: 'income' as const },
  { id: 'gift', name: 'Подарок', icon: '🎁', type: 'income' as const },
  { id: 'other_income', name: 'Другое', icon: '📦', type: 'income' as const },
  // Expense categories
  { id: 'food', name: 'Еда', icon: '🍔', type: 'expense' as const },
  { id: 'transport', name: 'Транспорт', icon: '🚗', type: 'expense' as const },
  { id: 'entertainment', name: 'Развлечения', icon: '🎬', type: 'expense' as const },
  { id: 'bills', name: 'Счета', icon: '📄', type: 'expense' as const },
  { id: 'shopping', name: 'Покупки', icon: '🛒', type: 'expense' as const },
  { id: 'health', name: 'Здоровье', icon: '🏥', type: 'expense' as const },
  { id: 'home', name: 'Дом', icon: '🏠', type: 'expense' as const },
  { id: 'other_expense', name: 'Другое', icon: '📦', type: 'expense' as const },
];

export const getCategoryById = (id: string) => {
  return FINANCE_CATEGORIES.find(c => c.id === id);
};
