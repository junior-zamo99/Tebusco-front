export type CreditType = 'earned' | 'used' | 'expired' | 'refunded';
export type CreditSource = 'referral' | 'admin_grant' | 'promotion' | 'refund' | null;
export type RelatedType = 'referral' | 'subscription' | 'extra' | 'ad_subscription' | null;


export interface CreditBalance {
  availableCredits: number;
  currency: string;
  expiringCredits: number;
  nextExpirationDate: Date | null;
}

export interface UserCredit {
  id: number;
  userId: number;
  totalCredits: number;
  availableCredits: number;
  usedCredits: number;
  currency: string;
  expiringCredits: number;
  nextExpirationDate: Date | null;
  nextExpirationAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreditRelatedInfo {
  type: RelatedType;
  id: number | null;
  description: string | null;
}

export interface CreditTransaction {
  id: number;
  type: CreditType;
  amount: number;
  source: CreditSource;
  description: string;
  relatedTo: CreditRelatedInfo;
  expiresAt: Date | null;
  isExpired: boolean;
  createdAt: Date;
}

export interface CreditTransactionList {
  total: number;
  totalEarned: number;
  totalUsed: number;
  totalExpired: number;
  transactions: CreditTransaction[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    total: number;
    limit: number;
  };
}

export interface CreditStats {
  userId: number;
  totalEarned: number;
  totalUsed: number;
  totalExpired: number;
  totalRefunded: number;
  currentBalance: number;
  currency: string;
  earnedBySource: {
    referral: number;
    adminGrant: number;
    promotion: number;
    refund: number;
  };
  usedByType: {
    subscriptions: number;
    extras: number;
    ads: number;
  };
}

export interface CreditValidation {
  valid: boolean;
  availableCredits: number;
  requestedAmount: number;
  canUse: boolean;
  reason?: string;
}

export interface CreditTransactionFilters {
  page?: number;
  limit?: number;
  type?: CreditType;
  source?: CreditSource;
  dateFrom?: string;
  dateTo?: string;
  isExpired?: boolean;
}

export interface ValidateCreditRequest {
  amount: number;
}

export interface ApiCreditBalanceResponse {
  success: boolean;
  message: string;
  data: CreditBalance;
}

export interface ApiUserCreditResponse {
  success: boolean;
  message: string;
  data: UserCredit;
}

export interface ApiCreditTransactionsResponse {
  success: boolean;
  message: string;
  data: CreditTransactionList;
}

export interface ApiCreditStatsResponse {
  success: boolean;
  message: string;
  data: CreditStats;
}

export interface ApiCreditValidationResponse {
  success: boolean;
  message: string;
  data: CreditValidation;
}
