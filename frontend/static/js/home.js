// Мобільне меню
const navToggle = document.querySelector('.nav__toggle');
const navList = document.querySelector('.nav__list');
if (navToggle && navList) {
  navToggle.addEventListener('click', () => {
    const open = navList.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(open));
  });
}

// Дропменю користувача
const userBtn = document.getElementById('userMenuBtn');
const userMenu = document.getElementById('userMenu');

function closeUserMenu() {
  if (userMenu.classList.contains('is-open')) {
    userMenu.classList.remove('is-open');
    userBtn.setAttribute('aria-expanded', 'false');
  }
}

if (userBtn && userMenu) {
  userBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = userMenu.classList.toggle('is-open');
    userBtn.setAttribute('aria-expanded', String(open));
    // позиціонування (на випадок, якщо треба)
    // можна додати логіку обчислення координат
  });

  // Закрити при кліку поза
  document.addEventListener('click', (e) => {
    if (!userMenu.contains(e.target) && e.target !== userBtn) {
      closeUserMenu();
    }
  });

  // Закрити по Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeUserMenu();
  });
}