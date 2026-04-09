// Polaris Fire Protection

document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('header');
  const hamburger = document.querySelector('.hamburger');
  const mobileNav = document.querySelector('.mobile-nav');

  // Hamburger toggle
  if (hamburger) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      mobileNav.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', hamburger.classList.contains('open'));
    });

    // Close on link click
    mobileNav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileNav.classList.remove('open');
      });
    });
  }

  // Scroll: transparent header > solid
  function onScroll() {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
      header.classList.remove('transparent');
    } else {
      header.classList.remove('scrolled');
      if (header.dataset.transparent === 'true') {
        header.classList.add('transparent');
      }
    }
  }

  if (header.dataset.transparent === 'true') {
    header.classList.add('transparent');
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Reveal on scroll
  const reveals = document.querySelectorAll('.reveal-up');
  if (reveals.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(el => io.observe(el));
  }

  // Contact form (on contact.html and index.html)
  const form = document.querySelector('.contact-form');
  if (form && !document.getElementById('applicationForm')) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }

      const btn = form.querySelector('.submit-btn');
      const orig = btn.textContent;
      btn.disabled = true;
      btn.textContent = 'Sending...';

      try {
        await emailjs.send('service_zxp2mjk', 'template_2sjv97i', {
          from_name: (form.querySelector('#firstName')?.value || '') + ' ' + (form.querySelector('#lastName')?.value || ''),
          from_email: form.querySelector('#email')?.value || '',
          phone: form.querySelector('#phone')?.value || '',
          subject: form.querySelector('#subject')?.value || 'Website Contact',
          message: form.querySelector('#message')?.value || ''
        });

        btn.textContent = 'Message Sent!';
        btn.style.background = '#059669';
        btn.style.borderColor = '#059669';
        setTimeout(() => {
          btn.textContent = orig;
          btn.style.background = '';
          btn.style.borderColor = '';
          btn.disabled = false;
          form.reset();
        }, 3000);
      } catch (err) {
        console.error('EmailJS error:', err);
        btn.textContent = orig;
        btn.disabled = false;
        alert('There was an error sending your message. Please try again or call us at 954-678-3934.');
      }
    });
  }
});
