// Globalny licznik oparty na darmowym API Abacus: https://abacus.jasoncameron.dev
// Limit: 30 zapytań / 10 s na IP. Licznik wygasa po 6 miesiącach bez żadnego odczytu ani zapisu.
const COUNTER_API = 'https://abacus.jasoncameron.dev';
const COUNTER_NAMESPACE = 'regulamin-newsletter-4d3ae0c1';

const pad = n => String(n).padStart(2, '0');

function dayKey(date = new Date()) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function monthKey(date = new Date()) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
}

function counterUrl(action, key) {
  return `${COUNTER_API}/${action}/${COUNTER_NAMESPACE}/${key}`;
}

// Zwiększa licznik łączny, dzienny i miesięczny. type: 'views' | 'downloads'
function trackEvent(type) {
  for (const key of [type, `${type}-${dayKey()}`, `${type}-${monthKey()}`]) {
    fetch(counterUrl('hit', key), { cache: 'no-store', keepalive: true }).catch(() => {});
  }
}

async function counterGet(key, retries = 2) {
  const res = await fetch(counterUrl('info', key), { cache: 'no-store' });
  // przekroczony limit zapytań – odczekaj pełne okno limitu (10 s) i spróbuj ponownie
  if (res.status === 429 && retries > 0) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    return counterGet(key, retries - 1);
  }
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return data.exists ? data.value : 0;
}
