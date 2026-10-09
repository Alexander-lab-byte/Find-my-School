export const MIN_REVIEW_LENGTH = 20;
export const MAX_REVIEW_LENGTH = 200;

/**
 * Why a review can be reported. Stored as these codes in Report.reason and
 * translated for display ("ReportReason" in messages/*.json), so the admin
 * queue reads the same in either language.
 */
export const REPORT_REASONS = ["SPAM", "ABUSIVE", "OFF_TOPIC", "PERSONAL_INFO", "OTHER"] as const;
export type ReportReason = (typeof REPORT_REASONS)[number];
