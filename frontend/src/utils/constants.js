// User status
export const USER_STATUSES = ["active", "inactive", "suspended"];

export const USER_STATUS_STYLES = {
  active:    "success",
  inactive:  "default",
  suspended: "danger",
};

// Notification types
export const NOTIFICATION_TYPES = {
  bill:    "warning",
  goal:    "success",
  insight: "info",
  system:  "default",
};

export const NOTIFICATION_TYPE_LABELS = {
  bill:    "Bill",
  goal:    "Goal",
  insight: "Insight",
  system:  "System",
};

// Admin notification types
export const ADMIN_NOTIFICATION_TYPES = {
  user_registered:    "success",
  user_suspended:     "danger",
  consultant_added:   "info",
  consultant_deleted: "orange",
  category_added:     "purple",
  category_deleted:   "pink",
  system:             "default",
};

export const ADMIN_NOTIFICATION_TYPE_LABELS = {
  user_registered:    "User Registered",
  user_suspended:     "User Suspended",
  consultant_added:   "Consultant Added",
  consultant_deleted: "Consultant Deleted",
  category_added:     "Category Added",
  category_deleted:   "Category Deleted",
  system:             "System",
};

// Category types
export const CATEGORY_TYPES = ["income", "expense"];

export const CATEGORY_TYPE_STYLES = {
  income:  "success",
  expense: "danger",
};

// Investment types
export const INVESTMENT_TYPES = ["stock", "crypto", "real_estate", "other"];

// Goal types
export const GOAL_TYPES = ["saving", "debt_repayment"];

// Account types
export const ACCOUNT_TYPES = ["bank", "cash", "credit_card", "wallet"];

// Transaction types
export const TRANSACTION_TYPES = ["income", "expense", "transfer"];

export const TRANSACTION_SOURCE_TYPES = ["manual", "csv", "receipt"];

// Goal contribution category ID (reference from backend PHP constant)
export const GOAL_CONTRIBUTION_CATEGORY_ID = 19;