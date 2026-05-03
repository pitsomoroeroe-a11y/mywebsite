  // Toast notification helper
  function showFloatingMessage(msg, isError = false) {
    const toastDiv = document.createElement('div');
    toastDiv.className = 'toast-custom';
    toastDiv.innerHTML = `<i class="bi bi-${isError ? 'exclamation-triangle' : 'check-circle'} me-2"></i> ${msg}`;
    if(isError) toastDiv.style.backgroundColor = '#b34e3a';
    document.body.appendChild(toastDiv);
    setTimeout(() => toastDiv.remove(), 2800);
  }

  // Simple form validation + submission
  const form = document.getElementById('cateringForm');
  if(form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('fullName').value.trim();
      const email = document.getElementById('emailAddr').value.trim();
      const eventDate = document.getElementById('eventDate').value;
      const guests = document.getElementById('guests').value.trim();

      if(!name) { showFloatingMessage("Please enter your full name", true); return; }
      if(!email || !email.includes('@')) { showFloatingMessage("Valid email required", true); return; }
      if(!eventDate) { showFloatingMessage("Select event date", true); return; }
      if(!guests || guests < 1) { showFloatingMessage("Number of guests must be at least 1", true); return; }

      // successful demo action
      showFloatingMessage(`✨ Thanks ${name}! Our catering team will contact you within 24h.`);
      form.reset();
      // optional: you could store in localStorage or forward to a thank you page
    });
  }

  // Newsletter subscription
  const newsBtn = document.getElementById('newsBtn');
  if(newsBtn) {
    newsBtn.addEventListener('click', () => {
      const emailInput = document.getElementById('newsEmail');
      const val = emailInput.value.trim();
      if(!val || !val.includes('@')) {
        showFloatingMessage("Please enter a valid email address", true);
        return;
      }
      showFloatingMessage(`📧 Subscribed! ${val} will receive weekly updates.`);
      emailInput.value = '';
    });
  }

  // Back to top button
  const backBtn = document.getElementById('backToTop');
  window.addEventListener('scroll', () => {
    if(window.scrollY > 300) backBtn.classList.add('show');
    else backBtn.classList.remove('show');
  });
  backBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // Smooth anchor scrolling
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const target = document.querySelector(this.getAttribute('href'));
      if(target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });