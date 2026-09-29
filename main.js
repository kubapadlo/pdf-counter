const PDF_URL = 'regulamin_newsletter.pdf';

const landing = document.getElementById('landing');
const viewer = document.getElementById('viewer');
const frame = document.getElementById('pdf-frame');

// PDF ładuje się dopiero po kliknięciu "Otwórz PDF"
document.getElementById('open-btn').addEventListener('click', () => {
  frame.innerHTML = `
    <object data="${PDF_URL}" type="application/pdf">
      <div class="fallback">
        <p>Twoja przeglądarka nie wyświetla PDF bezpośrednio na stronie.</p>
        <a class="btn btn-primary" href="${PDF_URL}" target="_blank" rel="noopener">Otwórz PDF w nowej karcie</a>
      </div>
    </object>`;
  landing.hidden = true;
  viewer.hidden = false;
  trackEvent('views');
});

document.getElementById('close-btn').addEventListener('click', () => {
  frame.innerHTML = '';
  viewer.hidden = true;
  landing.hidden = false;
});

document.querySelectorAll('[data-download]').forEach(link => {
  link.addEventListener('click', () => trackEvent('downloads'));
});
