const defaultDigits = [2, 4, 7, 7, 8, 9, 1, 2, 4, 5, 8, 9, 6, 3, 5, 9, 2, 7, 4, 1];

const elements = {
  digitInput: document.getElementById('digitInput'),
  analyzeBtn: document.getElementById('analyzeBtn'),
  randomizeBtn: document.getElementById('randomizeBtn'),
  hotDigit: document.getElementById('hotDigit'),
  coldDigit: document.getElementById('coldDigit'),
  lastDigit: document.getElementById('lastDigit'),
  trendValue: document.getElementById('trendValue'),
  prediction: document.getElementById('prediction'),
  patternList: document.getElementById('patternList'),
  installBtn: document.getElementById('installBtn')
};

let deferredPrompt = null;

function parseDigits(value) {
  const numbers = value
    .split(/[\s,]+/)
    .map(item => Number(item.trim()))
    .filter(item => Number.isFinite(item));

  return numbers.map(num => Math.min(9, Math.max(0, Math.round(num))));
}

function getFrequencyTable(digits) {
  const table = Array.from({ length: 10 }, (_, index) => ({ digit: index, count: 0 }));

  digits.forEach(digit => {
    table[digit].count += 1;
  });

  return table;
}

function getHotColdDigits(digits) {
  const table = getFrequencyTable(digits);
  const ordered = [...table].sort((a, b) => b.count - a.count || a.digit - b.digit);
  const hot = ordered[0];
  const cold = ordered[ordered.length - 1];
  return { hot, cold };
}

function getTrend(digits) {
  if (digits.length < 2) return 'Flat';

  const firstHalf = digits.slice(0, Math.ceil(digits.length / 2));
  const secondHalf = digits.slice(Math.ceil(digits.length / 2));
  const firstAvg = firstHalf.reduce((sum, value) => sum + value, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, value) => sum + value, 0) / secondHalf.length;

  if (secondAvg > firstAvg) return 'Up';
  if (secondAvg < firstAvg) return 'Down';
  return 'Flat';
}

function getLikelyNextDigit(digits) {
  if (digits.length === 0) return '—';

  const lastThree = digits.slice(-3);
  const frequencyTable = getFrequencyTable(digits);
  const hot = frequencyTable.reduce((best, current) => (current.count > best.count ? current : best), { digit: digits[0], count: 0 });

  const recentBias = lastThree.reduce((acc, value) => acc + value, 0) / lastThree.length;

  let suggested = hot.digit;
  if (recentBias >= 5) suggested = Math.round(recentBias);

  const normalized = Math.min(9, Math.max(0, suggested));
  return normalized;
}

function renderPatternTable(digits) {
  const table = getFrequencyTable(digits);
  const maxCount = Math.max(...table.map(item => item.count), 1);

  elements.patternList.innerHTML = table
    .map(item => {
      const width = (item.count / maxCount) * 100;
      return `
        <div class="pattern-row">
          <span class="digit">${item.digit}</span>
          <div class="bar"><div class="bar-fill" style="width: ${width}%"></div></div>
          <span class="pattern-value">${item.count}</span>
        </div>
      `;
    })
    .join('');
}

function analyze() {
  const digits = parseDigits(elements.digitInput.value);

  if (!digits.length) {
    elements.prediction.textContent = 'Enter at least one digit to begin analysis.';
    return;
  }

  const { hot, cold } = getHotColdDigits(digits);
  const trend = getTrend(digits);
  const likelyNext = getLikelyNextDigit(digits);
  const lastDigit = digits[digits.length - 1];

  elements.hotDigit.textContent = String(hot.digit);
  elements.coldDigit.textContent = String(cold.digit);
  elements.lastDigit.textContent = String(lastDigit);
  elements.trendValue.textContent = trend;

  const patternText = `The strongest recurring value is ${hot.digit}, with a recent bias leaning toward ${likelyNext}. ${trend === 'Up' ? 'Momentum is rising.' : trend === 'Down' ? 'Momentum is softening.' : 'Movement is balanced.'}`;
  elements.prediction.textContent = patternText;

  renderPatternTable(digits);
}

function randomizeData() {
  const digits = Array.from({ length: 20 }, () => Math.floor(Math.random() * 10));
  elements.digitInput.value = digits.join(', ');
  analyze();
}

function setupInstallPrompt() {
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    deferredPrompt = event;
    elements.installBtn.classList.remove('hidden');
  });

  window.addEventListener('appinstalled', () => {
    elements.installBtn.classList.add('hidden');
  });

  elements.installBtn.addEventListener('click', async () => {
    if (!deferredPrompt) {
      elements.prediction.textContent = 'This browser may not support installation from the web app yet.';
      return;
    }

    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    elements.installBtn.classList.add('hidden');
  });
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(console.error);
    });
  }
}

elements.analyzeBtn.addEventListener('click', analyze);
elements.randomizeBtn.addEventListener('click', randomizeData);

setupInstallPrompt();
registerServiceWorker();
analyze();
