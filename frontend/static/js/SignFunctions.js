// ANIMATION FOR FORMS
const tabs = document.querySelectorAll(".auth__tab");
    const forms = document.querySelectorAll(".auth__form");
  
    tabs.forEach(tab => {
      tab.addEventListener("click", () => {
        const targetForm = document.getElementById(tab.dataset.tab + "-form");
  
        // оновлюємо вкладки
        tabs.forEach(t => t.classList.remove("is-active"));
        tab.classList.add("is-active");
  
        // оновлюємо форми
        forms.forEach(f => {
          if (f === targetForm) {
            
            f.classList.add("is-active");
            f.classList.remove("is-instant");
            
          } else {
              f.classList.remove("is-active");
              f.classList.add("is-instant");
          }
        });
      });
    });


  // VALIDATION AND REQUEST FORMS


  document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");
  
    // --- Login ---
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
  
      const email = loginForm.querySelector('input[type="email"]').value.trim();
      const password = loginForm.querySelector('input[type="password"]').value.trim();
  
      // Валідація
      if (!validateEmail(email)) {
        showToast("Будь ласка, введіть коректний email.", "error");
        return;
      }
      if (!password) {
        showToast("Будь ласка, введіть пароль.", "error");
        return;
      }
  
      try {
        const res = await fetch("http://localhost:8000/api/user/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include", // щоб cookie зберігалася автоматично
          body: JSON.stringify({ email, password })
        });
  
        const data = await res.json();
  
        if (!res.ok) {
          showToast(data.message || "Помилка логіна", "error");
          return;
        }
  
        showToast("Успішний логін!", "success");
        setTimeout(() => {
            window.location.replace("/home");
        }, 3500)
      } catch (err) {
        console.error(err);
        showToast("Помилка з сервером. Спробуйте пізніше.", "error");
      }
    });
  
    // --- Register ---
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
  
      const fullName = registerForm.querySelector('input[type="text"]').value.trim();
      const email = registerForm.querySelector('input[type="email"]').value.trim();
      const password = registerForm.querySelectorAll('input[type="password"]')[0].value.trim();
      const confirmPassword = registerForm.querySelectorAll('input[type="password"]')[1].value.trim();
  
      // Валідація як у Pydantic
      if (fullName.length < 2 || fullName.length > 100) {
        showToast("Повне ім'я має бути від 2 до 100 символів.", "error");
        return;
      }
      if (!validateEmail(email)) {
        showToast("Будь ласка, введіть коректний email.", "error");
        return;
      }
      if (password.length < 6 ) {
        showToast("Пароль має бути мінімум 6 символів.", "error");
        return;
      }
      if (password[0] == password[0].toUpperCase()) {
        showToast("Пароль має починатись з великої літери.", "error");
        return;
      }
      if (password !== confirmPassword) {
        showToast("Паролі не співпадають.", "error");
        return;
      }
  
      try {
        const res = await fetch("http://localhost:8000/api/user/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include", // cookie для JWT
          body: JSON.stringify({ full_name: fullName, email, password })
        });
  
        const data = await res.json();
  
        if (!res.ok) {
          showToast(data.message || "Помилка реєстрації", "error");
          return;
        }
  
        showToast("Успішна реєстрація! Тепер можете увійти.", "success");
        // показати логін форму
        registerForm.classList.remove("is-active");
        registerForm.classList.add("is-instant");
        registerForm.classList.remove("is-instant");
        loginForm.classList.add("is-active");
      } catch (err) {
        console.error(err);
        showToast("Помилка з сервером. Спробуйте пізніше.", "error");
      }
    });
  
    // --- Функція для перевірки email ---
    function validateEmail(email) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(email);
    }
  
    // --- Toast Notifications ---
    function showToast(message, type = "success") {
      const container = document.getElementById("toast-container");
      const toast = document.createElement("div");
      toast.className = `toast toast--${type}`;
      toast.innerHTML = `
        <i class="${type === 'success' ? 'fa fa-check-circle' : 'fa fa-exclamation-circle'}"></i>
        <span>${message}</span>
      `;
  
      container.appendChild(toast);
  
      // Автоматично видаляємо toast через 3.5 секунд
      setTimeout(() => {
        toast.remove();
      }, 3500);
    }
  });



  