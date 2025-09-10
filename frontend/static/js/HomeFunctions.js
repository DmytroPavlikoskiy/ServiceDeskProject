// ==== CHAT FUNCTIONS ====
// ==== DOM елементи ====
const chatWidget = document.getElementById("chatWidget");
const chatToggle = document.getElementById("chatToggle");
const chatMessages = document.getElementById("chatMessages");
const chatHeader = document.getElementById("chatHeader");
const chatTopbar = document.getElementById("chatTopbar");

let selectedChatId = null;
let ws = null; // WebSocket
let currentUserId = null; // Буде з /api/auth/user

// ==== МОКИ ====
let chatsMock = [
  { id: 1, name: "Максим Пилипович", unread: 2 },
  { id: 2, name: "Олег Сидоренко", unread: 0 },
  { id: 3, name: "Андрій Коваленко", unread: 5 },
];

let messagesMock = {
  1: [
    { author: "master", text: "Привіт! Як можу допомогти?" },
    { author: "client", text: "Доброго дня! Потрібна допомога." },
  ],
  2: [
    { author: "master", text: "Вітаю, чим можу допомогти?" },
  ],
  3: [],
};

// ==== Початковий стан ====
chatWidget.style.display = "none"; // чат прихований

// ==== Відкриття чату ====
function openChat() {
  chatWidget.style.display = "block";
}

// ==== Закриття чату ====
function closeChat() {
  chatWidget.style.display = "none";
}

// ==== Toggle чату (не обов'язково, залишив для прикладу) ====
function toggleChat() {
  if (chatWidget.style.display === "block") {
    closeChat();
  } else {
    openChat();
  }
}

// ==== Кнопка закриття ✖ ====
document.querySelectorAll(".chat-close").forEach(btn => {
  btn.addEventListener("click", closeChat);
});

// ==== Кнопка клієнта "Відкрити чат" ====
chatToggle.addEventListener("click", openChat);

// ==== Функції для роботи з чатами ====
async function fetchCurrentUser() {
  try {
    const res = await fetch("/api/auth/user");
    if (!res.ok) throw new Error("Помилка при отриманні користувача");
    const data = await res.json();
    currentUserId = data.id;

  } catch (err) {
    console.warn("Мок user:", err);
    showToast("Не вдалося отримати користувача. Використовується мок.", "error");
    currentUserId = 1; // Мок
  }
}

async function fetchChats() {
  try {
    const res = await fetch("/api/chats");
    if (!res.ok) throw new Error("Помилка при отриманні чатів");
    const data = await res.json();
    chatsMock = data;
  } catch (err) {
    console.warn("Мок chats:", err);
    showToast("Не вдалося отримати чати. Використовуються мокані дані.", "error");
  }
}

async function fetchMessages(chatId) {
  try {
    const res = await fetch(`/api/chats/${chatId}/messages`);
    if (!res.ok) throw new Error("Помилка при отриманні повідомлень");
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn("Мок messages:", err);
    showToast("Не вдалося отримати повідомлення. Використовуються мокані дані.", "error");
    return messagesMock[chatId] || [];
  }
}

function getInitials(name) {
  return name
    .split(" ")
    .map(word => word[0])
    .join("")
    .toUpperCase();
}

function renderTopbar() {
  chatTopbar.innerHTML = "";
  chatsMock.forEach(chat => {
    const div = document.createElement("div");
    div.className = "chat-avatar";
    div.textContent = getInitials(chat.name);

    let color = localStorage.getItem(`chat-color-${chat.id}`);
    if (!color) {
      const colors = ["#4f46e5", "#10b981", "#f59e0b", "#ef4444", "#6366f1"];
      color = colors[Math.floor(Math.random() * colors.length)];
      localStorage.setItem(`chat-color-${chat.id}`, color);
    }
    div.style.background = color;

    if (chat.unread > 0) {
      const badge = document.createElement("span");
      badge.className = "chat-unread";
      badge.textContent = chat.unread;
      div.appendChild(badge);
    }

    div.onclick = async () => await selectChat(chat.id, chat.name, div);

    chatTopbar.appendChild(div);
  });
}

async function selectChat(id, name, avatar) {
  selectedChatId = id;
  document.querySelectorAll(".chat-avatar").forEach(el => el.classList.remove("active"));
  avatar.classList.add("active");
  chatHeader.textContent = `Чат з ${name}`;

  const messages = await fetchMessages(id);
  renderMessages(messages);

  const chat = chatsMock.find(c => c.id === id);
  if (chat) chat.unread = 0;
  renderTopbar();

  connectWebSocket(id);
}

function renderMessages(messages) {
  chatMessages.innerHTML = "";
  messages.forEach(msg => {
    const div = document.createElement("div");
    div.className = `message ${msg.author}`;

    if (msg.text) div.textContent = msg.text;
    if (msg.file) {
      const img = document.createElement("img");
      img.src = msg.file;
      img.style.maxWidth = "200px";
      img.style.maxHeight = "200px";
      img.style.display = "block";
      img.style.marginTop = "5px";
      div.appendChild(img);
    }

    chatMessages.appendChild(div);
  });
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function sendMessage(event) {
  event.preventDefault();
  if (!selectedChatId) {
    showToast("Оберіть чат спочатку.", "error");
    return;
  }

  const textInput = document.getElementById("messageInput");
  const fileInput = document.getElementById("fileInput");

  if (!textInput.value.trim() && !fileInput.files.length) {
    showToast("Введіть текст або виберіть файл для відправки.", "error");
    return;
  }

  const msg = { author: "client", text: textInput.value };

  if (fileInput.files.length) {
    const file = fileInput.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      msg.file = reader.result;
      sendToServer(msg);
      addMessage(msg);
      showToast("Повідомлення надіслано.", "success");
    };
    reader.readAsDataURL(file);
  } else {
    sendToServer(msg);
    addMessage(msg);
    showToast("Повідомлення надіслано.", "success");
  }

  textInput.value = "";
  fileInput.value = "";
}

function sendToServer(msg) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ chat_id: selectedChatId, ...msg }));
  } else {
    if (!messagesMock[selectedChatId]) messagesMock[selectedChatId] = [];
    messagesMock[selectedChatId].push(msg);
  }
}

function addMessage(msg) {
  const div = document.createElement("div");
  div.className = `message ${msg.author}`;

  if (msg.text) div.textContent = msg.text;
  if (msg.file) {
    const img = document.createElement("img");
    img.src = msg.file;
    img.style.maxWidth = "200px";
    img.style.maxHeight = "200px";
    img.style.display = "block";
    img.style.marginTop = "5px";
    div.appendChild(img);
  }

  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function connectWebSocket(chatId) {
  if (!currentUserId) {
    showToast("Користувач не авторизований.", "error");
    return;
  }

  if (ws) ws.close();

  ws = new WebSocket(`ws://localhost:8000/ws/${currentUserId}`);

  ws.onopen = () => console.log("WebSocket connected for chat", chatId);

  ws.onmessage = event => {
    const data = JSON.parse(event.data);
    if (data.chat_id === selectedChatId) {
      addMessage({ author: data.author, text: data.text, file: data.file });
    } else {
      const chat = chatsMock.find(c => c.id === data.chat_id);
      if (chat) chat.unread = (chat.unread || 0) + 1;
      renderTopbar();
      showToast(`Нове повідомлення в чаті "${chat?.name}"`, "info");
    }
  };

  ws.onclose = () => console.log("WebSocket closed");
  ws.onerror = e => showToast("Помилка WebSocket", "error");
}

// ==== Ініціалізація ====
async function initChat() {
  await fetchCurrentUser();
  await fetchChats();
  renderTopbar();
}

initChat();

// ==== USER MENU ====

const userMenuBtn = document.getElementById("userMenuBtn");
const userMenu = document.getElementById("userMenu");

// Відкриття / закриття меню
userMenuBtn.addEventListener("click", () => {
  const isOpen = userMenu.classList.toggle("open");
  userMenuBtn.setAttribute("aria-expanded", isOpen);
});

// Закриття меню, якщо клік поза меню
document.addEventListener("click", (event) => {
  if (!userMenu.contains(event.target) && !userMenuBtn.contains(event.target)) {
    userMenu.classList.remove("open");
    userMenuBtn.setAttribute("aria-expanded", false);
  }
});

// ==== CREATE TICKET MODAL WINDOW ====

const openModalBtn = document.getElementById("openTicketModal");
const ticketModal = document.getElementById("ticketModal");
const closeModalBtn = document.getElementById("closeTicketModal");
const ticketForm = document.getElementById("ticketForm");

// Відкриття модалки
openModalBtn.addEventListener("click", (e) => {
  e.preventDefault();
  ticketModal.classList.add("open");
});

// Закриття модалки
closeModalBtn.addEventListener("click", () => {
  ticketModal.classList.remove("open");
});

// Закриття по кліку поза модалкою
ticketModal.addEventListener("click", (e) => {
  if (e.target === ticketModal) {
    ticketModal.classList.remove("open");
  }
});

function RenderFiles() {

  let FileControl = document.querySelector(".files_control");

}

// Обробка форми
ticketForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const title = ticketForm.title.value.trim();
  const description = ticketForm.description.value.trim();
  const files = ticketForm.files.files;

  if (!title || !description) {
    showToast("Заповніть всі поля!", "error");
    return;
  }

  // Тут можна відправити на бекенд
  console.log("Заявка:", { title, description, files });

  showToast("Заявка створена!", "success");
  ticketModal.classList.remove("open");
  ticketForm.reset();
});


document.addEventListener("DOMContentLoaded", () => {
  const ticketForm = document.getElementById("ticketForm");
  const ticketFiles = document.getElementById("ticketFiles");

  ticketForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = document.getElementById("ticketTitle").value.trim();
    const description = document.getElementById("ticketDescription").value.trim();

    // --- Валідація ---
    if (title.length < 3) {
      alert("Тема має містити мінімум 3 символи");
      return;
    }

    if (description.length < 10) {
      alert("Опис має містити мінімум 10 символів");
      return;
    }

    try {
      // --- 1. Створюємо заявку ---
      const payload = {
        title,
        description,
        priority: "medium"
      };

      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + localStorage.getItem("token")
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert("Помилка створення заявки: " + (errorData.detail || response.status));
        return;
      }

      const { ticket } = await response.json();
      console.log("✅ Заявка створена:", ticket);

      // --- 2. Завантажуємо файли (якщо є) ---
      if (ticketFiles.files.length > 0) {
        for (const file of ticketFiles.files) {
          const formData = new FormData();
          formData.append("ticket_id", ticket.id);
          formData.append("file", file);

          const uploadResp = await fetch("/api/files/upload", {
            method: "POST",
            headers: {
              "Authorization": "Bearer " + localStorage.getItem("token")
            },
            body: formData
          });

          if (!uploadResp.ok) {
            const err = await uploadResp.json();
            console.error("❌ Помилка при завантаженні файлу:", err);
          } else {
            const fileData = await uploadResp.json();
            console.log("📂 Файл завантажений:", fileData);
          }
        }
      }

      alert("✅ Заявка успішно створена!");
      ticketForm.reset();
      document.getElementById("ticketModal").classList.remove("open");

    } catch (err) {
      console.error("Fetch error:", err);
      alert("Сталася помилка при створенні заявки");
    }
  });
});

async function fetchTickets(clientId) {
  try {
    const response = await fetch(`/api/ticket/${clientId}`);
    const result = await response.json();

    const ticketsContainer = document.getElementById("ticketsList");
    ticketsContainer.innerHTML = "";

    if (result.data.status === 200 && result.data.ticket) {
      const tickets = Array.isArray(result.data.ticket) ? result.data.ticket : [result.data.ticket];

      tickets.forEach(ticket => {
        const ticketCard = document.createElement("div");
        ticketCard.classList.add("ticket-card");

        ticketCard.innerHTML = `
          <h3>${ticket.title}</h3>
          <p>${ticket.description || "Без опису"}</p>
          <span class="status">Статус: ${ticket.status}</span>
        `;

        ticketsContainer.appendChild(ticketCard);
      });
    } else {
      ticketsContainer.innerHTML = `<p>У вас поки що немає заявок.</p>`;
    }
  } catch (error) {
    console.error("Помилка при отриманні тікетів:", error);
  }
}

fetchTickets(currentUserId)