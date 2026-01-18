type Locale = 'ja' | 'en' | 'th';

const PLAN_CONFIG = {
  'token-a': {
    price: { en: '$9.99', ja: '$9.99', th: '฿350' },
    color: 'bg-blue-100 text-blue-800',
    labels: {
      en: 'Token A',
      ja: 'トークンA',
      th: 'โทเคน A',
    },
  },
  'token-b': {
    price: { en: '$19.99', ja: '$19.99', th: '฿700' },
    color: 'bg-green-100 text-green-800',
    labels: {
      en: 'Token B',
      ja: 'トークンB',
      th: 'โทเคน B',
    },
  },
  premium: {
    price: { en: '$39.99', ja: '$39.99', th: '฿1,400' },
    color: 'bg-purple-100 text-purple-800',
    labels: {
      en: 'Premium',
      ja: 'プレミアム',
      th: 'พรีเมียม',
    },
  },
  admin: {
    price: { en: '-', ja: '-', th: '-' },
    color: 'bg-orange-100 text-orange-800',
    labels: {
      en: 'Admin',
      ja: '管理者',
      th: 'ผู้ดูแล',
    },
  },
} as const;

const DEFAULT_DETAILS = {
  name: 'N/A',
  price: 'N/A',
  color: 'bg-gray-100 text-gray-800',
};

export const normalizePlanKey = (plan?: string | null) => {
  if (!plan) return undefined;
  const value = plan.toLowerCase();
  if (value.includes('token-a') || value.includes('token a')) return 'token-a';
  if (value.includes('token-b') || value.includes('token b')) return 'token-b';
  if (value.includes('premium')) return 'premium';
  if (value.includes('admin')) return 'admin';
  return plan;
};

export const getPlanDetails = (plan?: string | null, language: Locale = 'ja') => {
  const normalized = normalizePlanKey(plan);
  if (!normalized) {
    return { ...DEFAULT_DETAILS };
  }

  const config = PLAN_CONFIG[normalized as keyof typeof PLAN_CONFIG];
  if (!config) {
    return {
      name: plan ?? DEFAULT_DETAILS.name,
      price: DEFAULT_DETAILS.price,
      color: DEFAULT_DETAILS.color,
    };
  }

  return {
    name: config.labels[language],
    price: config.price[language],
    color: config.color,
  };
};
