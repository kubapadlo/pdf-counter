// Jedno odświeżenie = 2 + 7×2 + 6×2 = 28 zapytań (limit API: 30 / 10 s)
const REFRESH_MS = 60000;
const RECENT_DAYS = 7;
const RECENT_MONTHS = 6;

const $ = id => document.getElementById(id);
const numberFmt = new Intl.NumberFormat('pl-PL');
const dayFmt = new Intl.DateTimeFormat('pl-PL', { weekday: 'short', day: 'numeric', month: 'short' });
const monthFmt = new Intl.DateTimeFormat('pl-PL', { month: 'long', year: 'numeric' });
const timeFmt = new Intl.DateTimeFormat('pl-PL', { timeStyle: 'medium' });

const capitalize = s => s.charAt(0).toUpperCase() + s.slice(1);

function setStatus(online) {
  const el = $('status');
  el.textContent = online ? 'połączono' : 'brak połączenia';
  el.className = `status ${online ? 'online' : 'offline'}`;
}

function lastDays() {
  return Array.from({ length: RECENT_DAYS }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date;
  });
}

function lastMonths() {
  const now = new Date();
  return Array.from({ length: RECENT_MONTHS }, (_, i) => new Date(now.getFullYear(), now.getMonth() - i, 1));
}

// wejścia i pobrania dla okresu, np. '2026-09-29' albo '2026-09'
async function getPeriod(period) {
  const [views, downloads] = await Promise.all([
    counterGet(`views-${period}`),
    counterGet(`downloads-${period}`),
  ]);
  return { views, downloads };
}

function renderTable(id, rows) {
  const cell = n => `<td${n === 0 ? ' class="zero"' : ''}>${numberFmt.format(n)}</td>`;
  $(id).innerHTML = rows
    .map(([label, stats]) => `<tr><td>${label}</td>${cell(stats.views)}${cell(stats.downloads)}</tr>`)
    .join('');
}

async function refresh() {
  const days = lastDays();
  const months = lastMonths();
  try {
    const [views, downloads, daily, monthly] = await Promise.all([
      counterGet('views'),
      counterGet('downloads'),
      Promise.all(days.map(d => getPeriod(dayKey(d)))),
      Promise.all(months.map(m => getPeriod(monthKey(m)))),
    ]);

    $('views').textContent = numberFmt.format(views);
    $('downloads').textContent = numberFmt.format(downloads);
    $('views-today').textContent = numberFmt.format(daily[0].views);
    $('downloads-today').textContent = numberFmt.format(daily[0].downloads);
    $('views-month').textContent = numberFmt.format(monthly[0].views);
    $('downloads-month').textContent = numberFmt.format(monthly[0].downloads);

    renderTable('recent-days', days.map((d, i) => [i === 0 ? 'Dziś' : dayFmt.format(d), daily[i]]));
    renderTable('recent-months', months.map((m, i) => [capitalize(monthFmt.format(m)), monthly[i]]));

    $('updated').textContent = timeFmt.format(new Date());
    setStatus(true);
  } catch {
    setStatus(false);
  }
}

refresh();
setInterval(refresh, REFRESH_MS);
