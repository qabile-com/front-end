const FA = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'] as const;

export function toPersianDigits(input: string | number): string {
  return String(input).replace(/\d/g, (d) => FA[Number(d)]!);
}

export function formatPersianNumber(value: number): string {
  const grouped = Math.round(value).toLocaleString('en-US').replace(/,/g, '٬');
  return toPersianDigits(grouped);
}
