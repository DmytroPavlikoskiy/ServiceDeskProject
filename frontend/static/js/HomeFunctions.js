// // // ==== INIT USER CHECK ====
// // async function fetchCurrentUser() {
// //   try {
// //     const res = await fetch("http://localhost:8000/api/user/auth/user", {
// //       method: "GET",
// //       credentials: "include"
// //     });

// //     if (!res.ok) throw new Error("Unauthorized");

// //     const data = await res.json();
// //     currentUserId = data.id;
// //     return data;
// //   } catch (err) {
// //     console.warn("❌ Користувач не авторизований:", err);
// //     // редірект на логін
// //     // window.location.replace("/");
    
// //   }
// // }

// // // ==== INIT APP ====
// // document.addEventListener("DOMContentLoaded", async () => {
// //   const user = await fetchCurrentUser();
// //   if (!user) return; // зупиняєм, бо редіректнувся

// //   // Ініціалізація чату
// //   await initChat();

// //   // Завантаження тікетів
// //   fetchTickets(user.id);
// // });


// // // ==== CHAT FUNCTIONS ====
// // // (тут залишаємо твої функції, але прибрав дублікати і виправив порядок)
// // async function initChat() {
// //   await fetchChats();
// //   renderTopbar();
// // }

// // // ==== FETCH TICKETS ====
// // async function fetchTickets(clientId) {
// //   try {
// //     const response = await fetch(`/api/ticket/${clientId}`, {
// //       method: "GET",
// //       credentials: "include"
// //     });

// //     if (!response.ok) throw new Error("Помилка при отриманні тікетів");

// //     const result = await response.json();
// //     const ticketsContainer = document.getElementById("ticketsList");
// //     ticketsContainer.innerHTML = "";

// //     if (result.data?.status === 200 && result.data.ticket) {
// //       const tickets = Array.isArray(result.data.ticket)
// //         ? result.data.ticket
// //         : [result.data.ticket];

// //       tickets.forEach(ticket => {
// //         const ticketCard = document.createElement("div");
// //         ticketCard.classList.add("ticket-card");
// //         ticketCard.innerHTML = `
// //           <h3>${ticket.title}</h3>
// //           <p>${ticket.description || "Без опису"}</p>
// //           <span class="status">Статус: ${ticket.status}</span>
// //         `;
// //         ticketsContainer.appendChild(ticketCard);
// //       });
// //     } else {
// //       ticketsContainer.innerHTML = `<p>У вас поки що немає заявок.</p>`;
// //     }
// //   } catch (error) {
// //     console.error("❌ Помилка при отриманні тікетів:", error);
// //     document.getElementById("ticketsList").innerHTML = `<p>Не вдалося завантажити заявки.</p>`;
// //   }
// // }


// // // ==== TICKET MODAL ====
// // const openModalBtn = document.getElementById("openTicketModal");
// // const ticketModal = document.getElementById("ticketModal");
// // const closeModalBtn = document.getElementById("closeTicketModal");
// // const ticketForm = document.getElementById("ticketForm");

// // openModalBtn.addEventListener("click", e => {
// //   e.preventDefault();
// //   ticketModal.classList.add("open");
// // });

// // closeModalBtn.addEventListener("click", () => {
// //   ticketModal.classList.remove("open");
// // });

// // ticketModal.addEventListener("click", e => {
// //   if (e.target === ticketModal) {
// //     ticketModal.classList.remove("open");
// //   }
// // });

// // ticketForm.addEventListener("submit", async e => {
// //   e.preventDefault();

// //   const title = ticketForm.title.value.trim();
// //   const description = ticketForm.description.value.trim();
// //   const files = ticketForm.files.files;

// //   if (title.length < 3 || description.length < 10) {
// //     showToast("Заповніть правильно всі поля!", "error");
// //     return;
// //   }

// //   try {
// //     // 1. створення заявки
// //     const payload = { title, description, priority: "medium" };
// //     const res = await fetch("/api/tickets", {
// //       method: "POST",
// //       headers: { "Content-Type": "application/json" },
// //       credentials: "include",
// //       body: JSON.stringify(payload)
// //     });

// //     if (!res.ok) {
// //       const err = await res.json();
// //       throw new Error(err.detail || "Не вдалося створити заявку");
// //     }

// //     const { ticket } = await res.json();

// //     // 2. завантаження файлів
// //     if (files.length > 0) {
// //       for (const file of files) {
// //         const formData = new FormData();
// //         formData.append("ticket_id", ticket.id);
// //         formData.append("file", file);

// //         await fetch("/api/files/upload", {
// //           method: "POST",
// //           credentials: "include",
// //           body: formData
// //         });
// //       }
// //     }

// //     showToast("✅ Заявка успішно створена!", "success");
// //     ticketForm.reset();
// //     ticketModal.classList.remove("open");
// //     fetchTickets(currentUserId);

// //   } catch (err) {
// //     console.error("❌ Помилка при створенні заявки:", err);
// //     showToast(err.message, "error");
// //   }
// // });

// let currentUserId;
// let chatSocket;
// let currentChatId;

// // ==== INIT USER CHECK ====
// async function fetchCurrentUser() {
//   try {
//     const res = await fetch("http://localhost:8000/api/user/auth/user", {
//       method: "GET",
//       credentials: "include"
//     });

//     if (!res.ok) {
//       // користувач не авторизований або токен недійсний
//       throw new Error("Unauthorized");
//     }

//     const data = await res.json();
//     currentUserId = data.id;
//     return data;
//   } catch (err) {
//     console.warn("❌ Користувач не авторизований:", err);
//     // редірект на логін
//     window.location.replace("http://localhost:3000/"); 
//   }
// }

// // ==== LOGOUT ====



// // ==== INIT APP ====
// document.addEventListener("DOMContentLoaded", async () => {
//   // перевірка користувача
//   const user = await fetchCurrentUser();
//   if (!user) return; // якщо редіректнувся, далі код не виконується

//   // Ініціалізація чату
//   await initChat();

//   // Завантаження тікетів
//   await fetchTickets(user.id);
// });

// // ==== CHAT FUNCTIONS ====
// async function initChat() {
//   await fetchChats();
//   renderTopbar();
// }

// // ==== FETCH TICKETS ====
// async function fetchTickets(clientId) {
//   try {
//     const response = await fetch(`http://localhost:8000/api/ticket/${clientId}`, {
//       method: "GET",
//       credentials: "include"
//     });

//     if (!response.ok) throw new Error("Помилка при отриманні тікетів");

//     const result = await response.json();
//     const ticketsContainer = document.getElementById("ticketsList");
//     ticketsContainer.innerHTML = "";

//     if (result.data?.status === 200 && result.data.ticket) {
//       const tickets = Array.isArray(result.data.ticket)
//         ? result.data.ticket
//         : [result.data.ticket];

//       tickets.forEach(ticket => {
//         const ticketCard = document.createElement("div");
//         ticketCard.classList.add("ticket-card");
//         ticketCard.innerHTML = `
//           <h3>${ticket.title}</h3>
//           <p>${ticket.description || "Без опису"}</p>
//           <span class="status">Статус: ${ticket.status}</span>
//         `;
//         ticketsContainer.appendChild(ticketCard);
//       });
//     } else {
//       ticketsContainer.innerHTML = `<p>У вас поки що немає заявок.</p>`;
//     }
//   } catch (error) {
//     console.error("❌ Помилка при отриманні тікетів:", error);
//     document.getElementById("ticketsList").innerHTML = `<p>Не вдалося завантажити заявки.</p>`;
//   }
// }

// // ==== TICKET MODAL ====
// const openModalBtn = document.getElementById("openTicketModal");
// const ticketModal = document.getElementById("ticketModal");
// const closeModalBtn = document.getElementById("closeTicketModal");
// const ticketForm = document.getElementById("ticketForm");

// openModalBtn.addEventListener("click", e => {
//   e.preventDefault();
//   ticketModal.classList.add("open");
// });

// closeModalBtn.addEventListener("click", () => {
//   ticketModal.classList.remove("open");
// });

// ticketModal.addEventListener("click", e => {
//   if (e.target === ticketModal) {
//     ticketModal.classList.remove("open");
//   }
// });

// ticketForm.addEventListener("submit", async e => {
//   e.preventDefault();

//   const title = ticketForm.title.value.trim();
//   const description = ticketForm.description.value.trim();
//   const files = ticketForm.files.files;

//   if (title.length < 3 || description.length < 10) {
//     showToast("Заповніть правильно всі поля!", "error");
//     return;
//   }

//   try {
//     // 1. створення заявки
//     const payload = { title, description, priority: "medium" };
//     const res = await fetch("http://localhost:8000/api/tickets", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       credentials: "include",
//       body: JSON.stringify(payload)
//     });

//     if (!res.ok) {
//       const err = await res.json();
//       throw new Error(err.detail || "Не вдалося створити заявку");
//     }

//     const { ticket } = await res.json();

//     // 2. завантаження файлів
//     if (files.length > 0) {
//       for (const file of files) {
//         const formData = new FormData();
//         formData.append("ticket_id", ticket.id);
//         formData.append("file", file);

//         await fetch("http://localhost:8000/api/files/upload", {
//           method: "POST",
//           credentials: "include",
//           body: formData
//         });
//       }
//     }

//     showToast("✅ Заявка успішно створена!", "success");
//     ticketForm.reset();
//     ticketModal.classList.remove("open");
//     await fetchTickets(currentUserId);

//   } catch (err) {
//     console.error("❌ Помилка при створенні заявки:", err);
//     showToast(err.message, "error");
//   }
// });


// // ==== USER MENU ====
// function initUserMenu(user) {
//   const btn = document.getElementById("userMenuBtn");
//   const menu = document.getElementById("userMenu");
//   const avatar = document.querySelector(".user__avatar");

//   // Встановлюємо ініціали користувача
//   if (user?.full_name) {
//     const parts = user.full_name.trim().split(" ");
//     let initials = parts.map(p => p[0].toUpperCase()).join("");
//     if (initials.length > 2) initials = initials.slice(0, 2); // максимум 2 літери
//     avatar.textContent = initials;
//   }

//   // Клік по кнопці -> відкриваємо/закриваємо меню
//   btn.addEventListener("click", (e) => {
//     e.stopPropagation();
//     const isOpen = menu.classList.contains("open");
//     menu.classList.toggle("open", !isOpen);
//     btn.setAttribute("aria-expanded", String(!isOpen));
//   });

//   // Клік поза меню -> закриваємо
//   document.addEventListener("click", (e) => {
//     if (!btn.contains(e.target) && !menu.contains(e.target)) {
//       menu.classList.remove("open");
//       btn.setAttribute("aria-expanded", "false");
//     }
//   });
// }

// // ==== INIT APP ====
// document.addEventListener("DOMContentLoaded", async () => {
//   // перевірка користувача
//   const user = await fetchCurrentUser();
//   if (!user) return;

//   // Ініціалізація меню користувача
//   initUserMenu(user);

//   // Ініціалізація чату
//   await initChat();

//   // Завантаження тікетів
//   await fetchTickets(user.id);
// });


// // ----------------- CHAT =====================


// // === Відкриття/закриття чату ===
// const chatToggle = document.getElementById("chatToggle");
// const chatWidget = document.getElementById("chatWidget");

// function toggleChat() {
//   chatWidget.style.display = chatWidget.style.display === "none" ? "block" : "none";
// }

// chatToggle.addEventListener("click", toggleChat);

// // === Ініціалізація WebSocket ===
// async function connectChat(chatId) {
//   currentChatId = chatId;
//   chatSocket = new WebSocket(`ws://localhost:8000/api/chats/ws/${chatId}/${currentUserId}`);

//   chatSocket.onmessage = function(event) {
//     const message = JSON.parse(event.data);
//     addMessageToUI(message);
//   };

//   chatSocket.onclose = function() {
//     console.warn("WebSocket закритий");
//   };
// }

// // === Відправка повідомлення ===
// function sendMessage(text, fileUrl = null) {
//   if (!chatSocket || chatSocket.readyState !== WebSocket.OPEN) return;

//   const payload = {
//     text: text || (fileUrl ? "📎 Файл" : ""),
//     author_id: currentUserId,
//     is_file: !!fileUrl,
//     file_url: fileUrl
//   };
//   chatSocket.send(JSON.stringify(payload));
// }

// // === Додавання повідомлення на UI ===
// function addMessageToUI(message) {
//   const messagesContainer = document.getElementById("chatMessages");
//   const el = document.createElement("div");
//   el.classList.add("chat-message");
//   el.innerHTML = message.is_file
//     ? `<a href="${message.file_url}" target="_blank">📎 Файл</a>`
//     : message.text;
//   messagesContainer.appendChild(el);
//   messagesContainer.scrollTop = messagesContainer.scrollHeight;
// }

// // === Обробник форми відправки тексту ===
// document.getElementById("chatForm").addEventListener("submit", async (e) => {
//   e.preventDefault();
//   const input = document.getElementById("messageInput");
//   if (input.value.trim() !== "") {
//     sendMessage(input.value.trim());
//     input.value = "";
//   }
// });

// // === Обробник вибору файлу ===
// document.getElementById("fileInput").addEventListener("change", async (e) => {
//   const file = e.target.files[0];
//   if (!file) return;

//   const formData = new FormData();
//   formData.append("file", file);
//   formData.append("author_id", currentUserId);

//   const res = await fetch(`http://localhost:8000/api/chats/${currentChatId}/upload`, {
//     method: "POST",
//     body: formData
//   });

//   const message = await res.json();
//   // надсилаємо через WebSocket для всіх у чаті
//   sendMessage(null, message.file_url);
// });

// // === Завантаження попередніх повідомлень ===
// async function loadMessages(chatId) {
//   currentChatId = chatId;
//   const res = await fetch(`http://localhost:8000/api/chats/${chatId}/messages?user_id=${currentUserId}`);
//   const messages = await res.json();
//   const messagesContainer = document.getElementById("chatMessages");
//   messagesContainer.innerHTML = "";
//   messages.forEach(msg => addMessageToUI(msg));
// }

// // === Динамічний topbar із чатами ===
// async function renderTopbar() {
//   const topbar = document.getElementById("chatTopbar");
//   const res = await fetch(`http://localhost:8000/api/chats/${currentUserId}`);
//   const chats = await res.json();

//   topbar.innerHTML = "";
//   chats.forEach(chat => {
//     const div = document.createElement("div");
//     div.classList.add("chat-topbar-item");
//     const initials = chat.client_id === currentUserId ? chat.master_id : chat.client_id;
//     div.textContent = initials;
//     div.addEventListener("click", async () => {
//       await loadMessages(chat.id);
//       connectChat(chat.id);
//       document.getElementById("chatHeader").textContent = `Чат #${chat.id}`;
//     });
//     topbar.appendChild(div);
//   });
// }



let currentUserId;
let chatSocket;
let currentChatId;

const API_BASE = "http://localhost:8000/api";

// ==== HELPERS ====
function getInitials(name) {
  if (!name) return "";
  const parts = name.trim().split(" ");
  let initials = parts.map(p => p[0].toUpperCase()).join("");
  return initials.length > 2 ? initials.slice(0, 2) : initials;
}

// ==== LOGOUT ====
function Logout() {
  fetch("/api/user/auth/logout", { method: "POST", credentials: "include" })
    .finally(() => window.location.replace("/"));
}

// ==== FETCH CURRENT USER ====
async function fetchCurrentUser() {
  try {
    const res = await fetch(`${API_BASE}/user/auth/user`, { method: "GET", credentials: "include" });
    if (res.status === 401 || res.status === 404) throw new Error("Unauthorized");
    const data = await res.json();
    currentUserId = data.id;
    console.log(currentUserId);
    
    return data;
  } catch (err) {
    console.warn("Користувач не авторизований:", err);
    window.location.replace("/");
    return null;
  }
}

// ==== USER MENU ====
function initUserMenu(user) {
  const btn = document.getElementById("userMenuBtn");
  const menu = document.getElementById("userMenu");
  const avatar = document.querySelector(".user__avatar");

  avatar.textContent = getInitials(user.full_name);

  btn.addEventListener("click", e => {
    e.stopPropagation();
    menu.classList.toggle("open");
    btn.setAttribute("aria-expanded", String(menu.classList.contains("open")));
  });

  document.addEventListener("click", e => {
    if (!btn.contains(e.target) && !menu.contains(e.target)) {
      menu.classList.remove("open");
      btn.setAttribute("aria-expanded", "false");
    }
  });
}

// ==== CHAT ====
function toggleChat() {
  const chatWidget = document.getElementById("chatWidget");
  chatWidget.style.display = chatWidget.style.display === "none" || !chatWidget.style.display ? "block" : "none";
}

async function connectChat(chatId) {
  if (chatSocket && chatSocket.readyState === WebSocket.OPEN) chatSocket.close();
  currentChatId = chatId;
  chatSocket = new WebSocket(`ws://localhost:8000/api/chats/ws/${chatId}/${currentUserId}`);

  chatSocket.onmessage = event => {
    const message = JSON.parse(event.data);
    addMessageToUI(message);
  };
  chatSocket.onclose = () => console.warn("WebSocket закритий");
}

function sendMessage(text, fileUrl = null) {
  if (!chatSocket || chatSocket.readyState !== WebSocket.OPEN) return;
  const payload = {
    text: text || (fileUrl ? "📎 Файл" : ""),
    author_id: currentUserId,
    is_file: !!fileUrl,
    file_url: fileUrl
  };
  chatSocket.send(JSON.stringify(payload));
}

function addMessageToUI(message) {
  const messagesContainer = document.getElementById("chatMessages");
  const el = document.createElement("div");
  el.classList.add("chat-message");
  el.innerHTML = message.is_file
    ? `<a href="${message.file_url}" target="_blank">📎 Файл</a>`
    : message.text;
  messagesContainer.appendChild(el);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

async function loadMessages(chatId) {
  currentChatId = chatId;
  const res = await fetch(`${API_BASE}/chats/${chatId}/messages?user_id=${currentUserId}`)
  const messages = await res.json();
  const messagesContainer = document.getElementById("chatMessages");
  messagesContainer.innerHTML = "";
  messages.forEach(msg => addMessageToUI(msg));
}

async function renderTopbar() {
  const topbar = document.getElementById("chatTopbar");
  const messagesContainer = document.getElementById("chatMessages");
  
  try {
    const res = await fetch(`${API_BASE}/chats/${currentUserId}`);
    if (!res.ok) throw new Error("Не вдалося завантажити чати");
    
    const chats = await res.json();
    topbar.innerHTML = "";

    chats.forEach(chat => {
      const div = document.createElement("div");
      div.classList.add("chat-topbar-item");
      const otherName = chat.client_id === currentUserId ? chat.master_name : chat.client_name;
      div.textContent = getInitials(otherName);

      div.addEventListener("click", async () => {
        await loadMessages(chat.id);
        connectChat(chat.id);
        document.getElementById("chatHeader").textContent = `Чат #${chat.id}`;
      });

      topbar.appendChild(div);
    });

  } catch (err) {
    console.error(err);
    const emptyDiv = document.createElement("div");
    emptyDiv.classList.add("chat-empty");
    emptyDiv.textContent = "Упс ¯\_(ツ)_/¯ ,у вас ще немає чату";
    messagesContainer.appendChild(emptyDiv);
  }
}

async function initChat() {
  await renderTopbar();
}

// ==== INIT PAGE ====
document.addEventListener("DOMContentLoaded", async () => {
  const user = await fetchCurrentUser();
  if (!user) return;

  initUserMenu(user);
  await initChat();

  // Chat toggle
  const chatToggleBtn = document.getElementById("chatToggle");
  chatToggleBtn?.addEventListener("click", toggleChat);

  // Chat form
  const chatForm = document.getElementById("chatForm");
  chatForm?.addEventListener("submit", async e => {
    e.preventDefault();
    const input = document.getElementById("messageInput");
    if (input.value.trim()) {
      sendMessage(input.value.trim());
      input.value = "";
    }
  });

  // Chat file upload
  const fileInput = document.getElementById("fileInput");

fileInput?.addEventListener("change", async (e) => {
  const file = e.target.files[0];

  if (!file) return;
  if (!currentChatId) {
    showToast("Спочатку оберіть чат", "error");
    return;
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("author_id", currentUserId);

  // Додатково: показати, що файл завантажується
  const messagesContainer = document.getElementById("chatMessages");
  const tempMessageEl = document.createElement("div");
  tempMessageEl.classList.add("chat-message", "loading");
  tempMessageEl.textContent = `Завантаження ${file.name}...`;
  messagesContainer.appendChild(tempMessageEl);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;

  try {
    const res = await fetch(`${API_BASE}/chats/${currentChatId}/upload`, {
      method: "POST",
      body: formData
    });

    if (!res.ok) {
      throw new Error(`Не вдалося завантажити файл (${res.status})`);
    }

    const message = await res.json();

    // Видаляємо тимчасове повідомлення і додаємо реальне
    tempMessageEl.remove();
    addMessageToUI(message);

    // Надсилаємо через WebSocket всім учасникам
    sendMessage(null, message.file_url);

  } catch (err) {
    console.error("Помилка завантаження файлу:", err);
    tempMessageEl.remove();
    showToast(err.message, "error");
  } finally {
    // Очищуємо input, щоб можна було завантажити той самий файл знову
    fileInput.value = "";
  }
});

  // Ticket modal
  const openModalBtn = document.getElementById("openTicketModal");
  const ticketModal = document.getElementById("ticketModal");
  const closeModalBtn = document.getElementById("closeTicketModal");
  const ticketForm = document.getElementById("ticketForm");

  openModalBtn?.addEventListener("click", e => {
    e.preventDefault();
    ticketModal.classList.add("open");
  });

  closeModalBtn?.addEventListener("click", () => ticketModal.classList.remove("open"));
  ticketModal?.addEventListener("click", e => {
    if (e.target === ticketModal) ticketModal.classList.remove("open");
  });

  ticketForm?.addEventListener("submit", async e => {
    e.preventDefault();
    const title = document.getElementById("ticketTitle").value.trim();
    const description = document.getElementById("ticketDescription").value.trim();
    const files = document.getElementById("ticketFiles").files;

    if (title.length < 3 || description.length < 10) {
      showToast("Заповніть правильно всі поля!", "error");
      return;
    }

    try {
      const payload = { title, description, client_id: currentUserId};
      console.log(payload);
      
      const res = await fetch(`${API_BASE}/tickets/create/ticket`, { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(payload) });
      if (!res.ok) throw new Error("Не вдалося створити заявку");
      const ticket = await res.json();

      for (const file of files) {
        const formData = new FormData();
        formData.append("ticket_id", ticket.id);
        formData.append("file", file);
        await fetch(`${API_BASE}/tickets/file/upload`, { method: "POST", credentials: "include", body: formData });
      }

      showToast("Заявка успішно створена!", "success");
      ticketForm.reset();
      ticketModal.classList.remove("open");

    } catch (err) {
      console.error("❌ Помилка при створенні заявки:", err);
      showToast(err.message, "error");
    }
  });
});


// =================== FILES PREVIEW ===================
document.addEventListener("DOMContentLoaded", () => {
  const fileInput = document.getElementById("ticketFiles");
  const filesContainer = document.querySelector(".files_control");

  // Масив вибраних файлів
  let selectedFiles = [];

  fileInput.addEventListener("change", (e) => {
    const newFiles = Array.from(e.target.files);

    // Додаємо у масив, уникаючи дублікатів по name+size
    newFiles.forEach(file => {
      if (!selectedFiles.some(f => f.name === file.name && f.size === file.size)) {
        selectedFiles.push(file);
      }
    });

    renderFiles();
  });

  // Рендер прев’ю
  function renderFiles() {
    filesContainer.innerHTML = "";

    if (selectedFiles.length === 0) {
      filesContainer.style.display = "none";
      return;
    } else {
      filesContainer.style.display = "flex";
    }

    selectedFiles.forEach((file, index) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const wrapper = document.createElement("div");
        wrapper.classList.add("file-preview");

        const img = document.createElement("img");
        img.src = e.target.result;
        img.alt = file.name;

        const removeBtn = document.createElement("button");
        removeBtn.classList.add("remove-btn");
        removeBtn.innerHTML = `<i class="fa-solid fa-xmark"></i>`;

        removeBtn.addEventListener("click", () => {
          selectedFiles.splice(index, 1);
          renderFiles();
        });

        wrapper.appendChild(img);
        wrapper.appendChild(removeBtn);
        filesContainer.appendChild(wrapper);
      };

      reader.readAsDataURL(file);
    });
  }

  // Хак — щоб при відправці форми відправлялись вибрані файли
  const ticketForm = document.getElementById("ticketForm");
  ticketForm.addEventListener("submit", (e) => {
    const dataTransfer = new DataTransfer();
    selectedFiles.forEach(f => dataTransfer.items.add(f));
    fileInput.files = dataTransfer.files;
  });
});


async function openTicketsSidebar() {
  const sidebar = document.getElementById("ticketsSidebar");
  sidebar.classList.add("open");
  const res = await fetch(`${API_BASE}/tickets/user/get_tickets/${currentUserId}`, { credentials: "include" });
  const data = await res.json();
  const tickets = data.data.tickets || [];

  const container = document.getElementById("ticketsSidebarContent");
  container.innerHTML = "";

  if (!tickets.length) {
    container.innerHTML = "<p>У вас поки що немає заявок.</p>";
    return;
  }

  tickets.forEach(ticket => {
    const div = document.createElement("div");
    div.classList.add("ticket-card-sidebar");

    const imgSrc = ticket.photos.length 
  ? `http://localhost:8000${ticket.photos[0]}` 
  : "https://via.placeholder.com/60";
    div.innerHTML = `
      <img src="${imgSrc}" alt="${ticket.title}">
      <div class="ticket-info">
        <h4>${ticket.title}</h4>
        <span class="status ${ticket.status}">${ticket.status.replace("_", " ").toUpperCase()}</span>
      </div>
    `;
    container.appendChild(div);
  });
}


document.getElementById("closeTicketsSidebar").addEventListener("click", () => {
  document.getElementById("ticketsSidebar").classList.remove("open");
});