export interface StaffPasswordRequirements {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  minSpecialChars: number;
  preventCommonPasswords: boolean;
  maxAge: number; // in days
  preventReuseCount: number;
  lockoutThreshold: number;
  lockoutDuration: number; // in minutes
  requireMFA: boolean;
  passwordHistoryDays: number;
}

// Strict password policy for staff and system accounts with Amazon data access
export const STAFF_PASSWORD_POLICY: StaffPasswordRequirements = {
  minLength: 12, // Longer than regular user passwords
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  minSpecialChars: 1, // Require at least 1 special characters
  preventCommonPasswords: true,
  maxAge: 90, // More frequent rotation than regular users
  preventReuseCount: 8, // Remember more previous passwords
  lockoutThreshold: 3, // Stricter lockout policy
  lockoutDuration: 60, // Longer lockout duration
  requireMFA: true, // Mandatory MFA for staff
  passwordHistoryDays: 365 // Keep password history for a year
};

// Role-based requirements
export const SYSTEM_ROLES = {
  ADMIN: 'admin',
  PRODUCT_MANAGER: 'product_manager'
} as const;

// Track staff password changes and MFA status
interface StaffPasswordStatus {
  userId: string;
  role: keyof typeof SYSTEM_ROLES;
  lastPasswordChange: Date;
  mfaEnabled: boolean;
  passwordHistory: string[]; // Hashed passwords
  lastPasswordAudit: Date;
}

// In-memory store for staff accounts (should be in a secure database in production)
const staffAccounts = new Map<string, StaffPasswordStatus>();

export function validateStaffPassword(
  password: string,
  role: keyof typeof SYSTEM_ROLES
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  const policy = STAFF_PASSWORD_POLICY;

  // Length check
  if (password.length < policy.minLength) {
    errors.push(`Staff passwords must be at least ${policy.minLength} characters long`);
  }

  // Character type checks
  if (policy.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain uppercase letters');
  }
  if (policy.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain lowercase letters');
  }
  if (policy.requireNumbers && !/\d/.test(password)) {
    errors.push('Password must contain numbers');
  }

  // Special character check with minimum count
  const specialChars = (password.match(/[!@#$%^&*(),.?":{}|<>]/g) || []).length;
  if (specialChars < policy.minSpecialChars) {
    errors.push(`Password must contain at least ${policy.minSpecialChars} special characters`);
  }

  // Complexity check
  const hasComplexity = 
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{16,}$/.test(password);
  if (!hasComplexity) {
    errors.push('Password must meet complexity requirements');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function isStaffPasswordExpired(userId: string): boolean {
  const account = staffAccounts.get(userId);
  if (!account) return true;

  const daysSinceChange = 
    (Date.now() - account.lastPasswordChange.getTime()) / (1000 * 60 * 60 * 24);
  return daysSinceChange > STAFF_PASSWORD_POLICY.maxAge;
}

export function requiresMFA(userId: string): boolean {
  const account = staffAccounts.get(userId);
  return !account?.mfaEnabled && STAFF_PASSWORD_POLICY.requireMFA;
}

// Add or update staff account
export function updateStaffAccount(
  userId: string,
  role: keyof typeof SYSTEM_ROLES,
  passwordHash: string,
  mfaEnabled: boolean
): void {
  const existing = staffAccounts.get(userId);
  const now = new Date();

  staffAccounts.set(userId, {
    userId,
    role,
    lastPasswordChange: now,
    mfaEnabled,
    passwordHistory: existing ? 
      [passwordHash, ...existing.passwordHistory] : 
      [passwordHash],
    lastPasswordAudit: now
  });
}

// Check if password was previously used
export function isStaffPasswordReused(userId: string, newPasswordHash: string): boolean {
  const account = staffAccounts.get(userId);
  if (!account) return false;

  return account.passwordHistory
    .slice(0, STAFF_PASSWORD_POLICY.preventReuseCount)
    .includes(newPasswordHash);
}
