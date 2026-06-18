export function formatCredits(val: number): string {
  return val.toString().replace('.', ',');
}

export function getCreditNoun(val: number): string {
  if (val % 1 !== 0) {
    return 'кредита'; // Fractional numbers (e.g., 0,5) always govern genitive singular in Russian
  }
  const absVal = Math.abs(val);
  const lastDigit = absVal % 10;
  const lastTwoDigits = absVal % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
    return 'кредитов';
  }
  if (lastDigit === 1) {
    return 'кредит';
  }
  if (lastDigit >= 2 && lastDigit <= 4) {
    return 'кредита';
  }
  return 'кредитов';
}

export function formatCreditsWithLabel(val: number): string {
  return `${formatCredits(val)} ${getCreditNoun(val)}`;
}
