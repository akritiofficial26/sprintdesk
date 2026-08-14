export type StrengthLevel = "empty" | "weak" | "fair" | "strong";

export interface StrengthResult {
  level: StrengthLevel;
  score: number; 
  label: string;
}

export function getPasswordStrength(password: string): StrengthResult {
  if (!password) return { level: "empty", score: 0, label: "" };

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { level: "weak", score, label: "Weak" };
  if (score <= 3) return { level: "fair", score, label: "Fair" };
  return { level: "strong", score, label: "Strong" };
}
