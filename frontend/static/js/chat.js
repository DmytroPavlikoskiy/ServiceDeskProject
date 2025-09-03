const form = document.getElementById("chatForm");
    const input = document.getElementById("messageInput");
    const messages = document.getElementById("messages");
    const chatHeader = document.getElementById("chatHeader");

    let activeChat = "ivan"; // активний майстер

    // Відправка повідомлення клієнтом
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const text = input.value.trim();
      if (text) {
        addMessage("client", text);
        input.value = "";
      }
    });

    // Додає повідомлення
    function addMessage(sender, text) {
      const msg = document.createElement("div");
      msg.classList.add("message", sender);
      msg.textContent = text;
      messages.appendChild(msg);
      messages.scrollTop = messages.scrollHeight;

      if (sender === "master") {
        addNotification(activeChat);
      }
    }

    // Badge для непрочитаних
    function addNotification(user) {
      const badge = document.getElementById(`badge-${user}`);
      let count = parseInt(badge.textContent);
      count++;
      badge.textContent = count;
      badge.style.display = "inline-block";
    }

    // Клік по контакту
    document.querySelectorAll(".contact").forEach(contact => {
      contact.addEventListener("click", () => {
        activeChat = contact.dataset.user;
        chatHeader.textContent = "Чат з " + contact.textContent.trim();
        
        // скидаємо badge
        const badge = document.getElementById(`badge-${activeChat}`);
        badge.textContent = 0;
        badge.style.display = "none";
      });
    });

    // Демонстрація приходу нового повідомлення від майстра
    setTimeout(() => {
      addMessage("master", "Є нове повідомлення від майстра!");
    }, 5000);