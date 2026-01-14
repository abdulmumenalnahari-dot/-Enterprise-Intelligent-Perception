export const normalizeSpaces = (value: string) => value.replace(/\s+/g, ' ').trim();

export const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

export const isNonEmpty = (value: string) => normalizeSpaces(value).length > 0;

export const isStrongPassword = (value: string) => value.trim().length >= 8;

export const clampNumber = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export const parseNumber = (value: string, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};
