

// let currentUserId;
// let chatSocket;
// let currentChatId;
// let notificationsSocket;

// const API_BASE = "http://localhost:8000/api";

// // ==== HELPERS ====
// function getInitials(name) {
//   if (!name) return "";
//   const parts = name.trim().split(" ");
//   let initials = parts.map(p => p[0].toUpperCase()).join("");
//   return initials.length > 2 ? initials.slice(0, 2) : initials;
// }

// // ==== LOGOUT ====
// function Logout() {
//   fetch(`${API_BASE}/user/logout`, { method: "POST", credentials: "include" })
//     .finally(() => window.location.replace("/"));
// }

// // ==== FETCH CURRENT USER ====
// async function fetchCurrentUser() {
//   try {
//     const res = await fetch(`${API_BASE}/user/auth/user`, { method: "GET", credentials: "include" });
//     if (res.status === 401 || res.status === 404) throw new Error("Unauthorized");
//     const data = await res.json();
//     currentUserId = data.id;
//     console.log(currentUserId);
//     return data;
//   } catch (err) {
//     console.warn("Користувач не авторизований:", err);
//     window.location.replace("/");
//     return null;
//   }
// }

// // ==== USER MENU ====
// function initUserMenu(user) {
//   const btn = document.getElementById("userMenuBtn");
//   const menu = document.getElementById("userMenu");
//   const avatar = document.querySelector(".user__avatar");
//   avatar.textContent = getInitials(user.full_name);

//   btn.addEventListener("click", e => {
//     e.stopPropagation();
//     menu.classList.toggle("open");
//     btn.setAttribute("aria-expanded", String(menu.classList.contains("open")));
//   });

//   document.addEventListener("click", e => {
//     if (!btn.contains(e.target) && !menu.contains(e.target)) {
//       menu.classList.remove("open");
//       btn.setAttribute("aria-expanded", "false");
//     }
//   });
// }

// // ==== CHAT ====
// function toggleChat() {
//   const chatWidget = document.getElementById("chatWidget");
//   chatWidget.style.display = chatWidget.style.display === "none" || !chatWidget.style.display ? "block" : "none";
// }

// async function connectChat(chatId) {
//   if (chatSocket && chatSocket.readyState === WebSocket.OPEN) chatSocket.close();
//   currentChatId = chatId;
//   chatSocket = new WebSocket(`ws://localhost:8000/api/ws/${chatId}/${currentUserId}`);

//   chatSocket.onmessage = event => {
//     const message = JSON.parse(event.data);
//     addMessageToUI(message);
//   };
//   chatSocket.onclose = () => console.warn("WebSocket чату закритий");
// }

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

// async function loadMessages(chatId) {
//   currentChatId = chatId;
//   const res = await fetch(`${API_BASE}/chats/${chatId}/messages?user_id=${currentUserId}`);
//   const messages = await res.json();
//   const messagesContainer = document.getElementById("chatMessages");
//   messagesContainer.innerHTML = "";
//   messages.forEach(msg => addMessageToUI(msg));
// }

// async function renderTopbar() {
//   const topbar = document.getElementById("chatTopbar");
//   const messagesContainer = document.getElementById("chatMessages");
  
//   try {
//     const res = await fetch(`${API_BASE}/chats/${currentUserId}`);
//     if (!res.ok) throw new Error("Не вдалося завантажити чати");
    
//     const chats = await res.json();
//     topbar.innerHTML = "";

//     chats.forEach(chat => {
//       const div = document.createElement("div");
//       div.classList.add("chat-topbar-item");
//       const otherName = chat.client_id === currentUserId ? chat.master_name : chat.client_name;
//       div.textContent = getInitials(otherName);

//       div.addEventListener("click", async () => {
//         await loadMessages(chat.id);
//         connectChat(chat.id);
//         document.getElementById("chatHeader").textContent = `Чат #${chat.id}`;
//       });

//       topbar.appendChild(div);
//     });

//   } catch (err) {
//     console.error(err);
//     const emptyDiv = document.createElement("div");
//     emptyDiv.classList.add("chat-empty");
//     emptyDiv.textContent = "Упс ¯\\_(ツ)_/¯ ,у вас ще немає чату";
//     messagesContainer.appendChild(emptyDiv);
//   }
// }

// async function initChat() {
//   await renderTopbar();
// }

// // ==== WS NOTIFICATIONS ====
// function connectNotifications(userId) {
//   notificationsSocket = new WebSocket(`ws://localhost:8000/api/ws/notifications/${userId}`);

//   notificationsSocket.onopen = () => console.log("WS нотифікацій відкритий");
//   notificationsSocket.onerror = err => console.error("Помилка WS нотифікацій", err);

//   notificationsSocket.onmessage = async (event) => {
//     const data = JSON.parse(event.data);
//     console.log(data);
    
//     if (data.type === "chat_created") {
//       console.log("Новий чат створено:", data);
//       await loadMessages(data.chat_id);
//       connectChat(data.chat_id);

//       const chatWidget = document.getElementById("chatWidget");
//       chatWidget.style.display = "block";
//       document.getElementById("chatHeader").textContent = `Чат #${data.chat_id}`;

//       const topbar = document.getElementById("chatTopbar");
//       const div = document.createElement("div");
//       div.classList.add("chat-topbar-item");
//       const otherName = data.client_id === currentUserId ? `Майстер` : `Клієнт`;
//       div.textContent = getInitials(otherName);

//       div.addEventListener("click", async () => {
//         await loadMessages(data.chat_id);
//         connectChat(data.chat_id);
//         document.getElementById("chatHeader").textContent = `Чат #${data.chat_id}`;
//       });
//       topbar.appendChild(div);
//     }
//   };

//   notificationsSocket.onclose = () => console.warn("WS нотифікацій закритий");
// }

// // ==== TICKETS SIDEBAR ====
// async function openTicketsSidebar() {
//   const sidebar = document.getElementById("ticketsSidebar");
//   sidebar.classList.add("open");

//   try {
//     const res = await fetch(`${API_BASE}/tickets/user/get_tickets/`, { credentials: "include" });
//     const data = await res.json();
//     const tickets = data.data.tickets || [];

//     const container = document.getElementById("ticketsSidebarContent");
//     container.innerHTML = "";

//     if (!tickets.length) {
//       container.innerHTML = "<p>У вас поки що немає заявок.</p>";
//       return;
//     }

//     tickets.forEach(ticket => {
//       const div = document.createElement("div");
//       div.classList.add("ticket-card-sidebar");

//       const imgSrc = ticket.photos.length 
//         ? `http://localhost:8000${ticket.photos[0]}` 
//         : "https://via.placeholder.com/60";

//       div.innerHTML = `
//         <img src="${imgSrc}" alt="${ticket.title}">
//         <div class="ticket-info">
//           <h4>${ticket.title}</h4>
//           <span class="status ${ticket.status}">${ticket.status.replace("_", " ").toUpperCase()}</span>
//         </div>
//       `;
//       container.appendChild(div);
//     });
//   } catch (err) {
//     console.error("Не вдалося завантажити заявки:", err);
//     const container = document.getElementById("ticketsSidebarContent");
//     container.innerHTML = "<p>Помилка завантаження заявок.</p>";
//   }
// }

// // ==== INIT PAGE ====
// document.addEventListener("DOMContentLoaded", async () => {
//   const user = await fetchCurrentUser();
//   if (!user) return;

//   initUserMenu(user);
//   await initChat();
//   connectNotifications(user.id);

//   // Chat toggle
//   document.getElementById("chatToggle")?.addEventListener("click", toggleChat);

  // // ==== TICKET FORM & FILES ====
  // const ticketForm = document.getElementById("ticketForm");
  // const fileInput = document.getElementById("ticketFiles");
  // const filesContainer = document.querySelector(".files_control");
  // let selectedFiles = [];

  // fileInput?.addEventListener("change", (e) => {
  //   const newFiles = Array.from(e.target.files);
  //   newFiles.forEach(file => {
  //     if (!selectedFiles.some(f => f.name === file.name && f.size === file.size)) {
  //       selectedFiles.push(file);
  //     }
  //   });
  //   renderFiles();
  // });

  // function renderFiles() {
  //   filesContainer.innerHTML = "";
  //   if (!selectedFiles.length) {
  //     filesContainer.style.display = "none";
  //     return;
  //   }
  //   filesContainer.style.display = "flex";

  //   selectedFiles.forEach((file, index) => {
  //     const reader = new FileReader();
  //     reader.onload = e => {
  //       const wrapper = document.createElement("div");
  //       wrapper.classList.add("file-preview");

  //       const img = document.createElement("img");
  //       img.src = e.target.result;
  //       img.alt = file.name;

  //       const removeBtn = document.createElement("button");
  //       removeBtn.classList.add("remove-btn");
  //       removeBtn.innerHTML = `<i class="fa-solid fa-xmark"></i>`;
  //       removeBtn.addEventListener("click", () => {
  //         selectedFiles.splice(index, 1);
  //         renderFiles();
  //       });

  //       wrapper.appendChild(img);
  //       wrapper.appendChild(removeBtn);
  //       filesContainer.appendChild(wrapper);
  //     };
  //     reader.readAsDataURL(file);
  //   });
  // }

  // ticketForm?.addEventListener("submit", async e => {
  //   e.preventDefault();

  //   // Скопіювати selectedFiles у fileInput перед відправкою
  //   const dataTransfer = new DataTransfer();
  //   selectedFiles.forEach(f => dataTransfer.items.add(f));
  //   fileInput.files = dataTransfer.files;

  //   const title = document.getElementById("ticketTitle").value.trim();
  //   const description = document.getElementById("ticketDescription").value.trim();

  //   if (title.length < 3 || description.length < 10) {
  //     showToast("Заповніть правильно всі поля!", "error");
  //     return;
  //   }

  //   try {
  //     const payload = { title, description, client_id: currentUserId };
  //     const res = await fetch(`${API_BASE}/tickets/create/ticket`, {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       credentials: "include",
  //       body: JSON.stringify(payload)
  //     });
  //     if (!res.ok) throw new Error("Не вдалося створити заявку");
  //     const ticket = await res.json();

  //     for (const file of fileInput.files) {
  //       const formData = new FormData();
  //       formData.append("ticket_id", ticket.id);
  //       formData.append("file", file);
  //       await fetch(`${API_BASE}/tickets/file/upload`, { method: "POST", credentials: "include", body: formData });
  //     }

  //     showToast("Заявка успішно створена!", "success");
  //     ticketForm.reset();
  //     selectedFiles = [];
  //     renderFiles();
  //     document.getElementById("ticketModal")?.classList.remove("open");
  //   } catch (err) {
  //     console.error("❌ Помилка при створенні заявки:", err);
  //     showToast(err.message, "error");
  //   }
  // });

//   // ==== CHAT FORM ====
//   const chatForm = document.getElementById("chatForm");
//   chatForm?.addEventListener("submit", e => {
//     e.preventDefault();
//     const input = document.getElementById("messageInput");
//     if (input.value.trim()) {
//       sendMessage(input.value.trim());
//       input.value = "";
//     }
//   });

//   // ==== CHAT FILE UPLOAD ====
//   const chatFileInput = document.getElementById("fileInput");
//   chatFileInput?.addEventListener("change", async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;
//     if (!currentChatId) {
//       showToast("Спочатку оберіть чат", "error");
//       return;
//     }

//     const formData = new FormData();
//     formData.append("file", file);
//     formData.append("author_id", currentUserId);

//     const messagesContainer = document.getElementById("chatMessages");
//     const tempMessageEl = document.createElement("div");
//     tempMessageEl.classList.add("chat-message", "loading");
//     tempMessageEl.textContent = `Завантаження ${file.name}...`;
//     messagesContainer.appendChild(tempMessageEl);
//     messagesContainer.scrollTop = messagesContainer.scrollHeight;

//     try {
//       const res = await fetch(`${API_BASE}/chats/${currentChatId}/upload`, {
//         method: "POST",
//         body: formData
//       });

//       if (!res.ok) throw new Error(`Не вдалося завантажити файл (${res.status})`);

//       const message = await res.json();
//       tempMessageEl.remove();
//       addMessageToUI(message);
//       sendMessage(null, message.file_url);

//     } catch (err) {
//       console.error("Помилка завантаження файлу:", err);
//       tempMessageEl.remove();
//       showToast(err.message, "error");
//     } finally {
//       chatFileInput.value = "";
//     }
//   });

//   // ==== TICKET MODAL ====
//   const openModalBtn = document.getElementById("openTicketModal");
//   const ticketModal = document.getElementById("ticketModal");
//   const closeModalBtn = document.getElementById("closeTicketModal");

//   openModalBtn?.addEventListener("click", e => {
//     e.preventDefault();
//     ticketModal.classList.add("open");
//   });

//   closeModalBtn?.addEventListener("click", () => ticketModal.classList.remove("open"));

//   ticketModal?.addEventListener("click", e => {
//     if (e.target === ticketModal) ticketModal.classList.remove("open");
//   });

//   // ==== TICKETS SIDEBAR ====
//   document.getElementById("closeTicketsSidebar")?.addEventListener("click", () => {
//     document.getElementById("ticketsSidebar").classList.remove("open");
//   });
// });






















// HomeFunctions.js
// import { showToast } from "./toast_msg.js";


// let currentUser = null;
// let chatSocket = null;
// let notificationsSocket = null;
// let currentChatId = null;

// const API_BASE = "http://localhost:8000/api";

// // ===== HELPERS =====
// function getInitials(name) {
//   if (!name) return "";
//   const parts = name.trim().split(" ");
//   const initials = parts.map(p => p[0].toUpperCase()).join("");
//   return initials.length > 2 ? initials.slice(0, 2) : initials;
// }

// async function fetchCurrentUser() {
//   try {
//     const res = await fetch(`${API_BASE}/user/auth/user`, { credentials: "include" });
//     if (!res.ok) throw new Error("Unauthorized");
//     currentUser = await res.json();
//     return currentUser;
//   } catch (err) {
//     console.warn("User not authenticated", err);
//     window.location.replace("/");
//   }
// }

// // ===== LOGOUT =====
// function Logout() {
//   fetch(`${API_BASE}/user/logout`, { method: "POST", credentials: "include" })
//     .finally(() => window.location.replace("/"));
// }

// // ===== USER MENU =====
// function initUserMenu(user) {
//   const btn = document.getElementById("userMenuBtn");
//   const menu = document.getElementById("userMenu");
//   const avatar = document.querySelector(".user__avatar");
//   avatar.textContent = getInitials(user.full_name);

//   btn.addEventListener("click", e => {
//     e.stopPropagation();
//     menu.classList.toggle("open");
//     btn.setAttribute("aria-expanded", menu.classList.contains("open"));
//   });

//   document.addEventListener("click", e => {
//     if (!btn.contains(e.target) && !menu.contains(e.target)) {
//       menu.classList.remove("open");
//       btn.setAttribute("aria-expanded", "false");
//     }
//   });
// }

// // ===== CHAT =====
// function toggleChat() {
//   const chatWidget = document.getElementById("chatWidget");
//   chatWidget.style.display = chatWidget.style.display === "none" || !chatWidget.style.display ? "block" : "none";
// }


// // ===== WS CHAT =====
// let sendQueue = []; // черга повідомлень, якщо WS ще не відкритий


// async function connectChat(chatId) {
//   if (!currentUser) return;

//   // Закриваємо попереднє з'єднання
//   if (chatSocket && chatSocket.readyState === WebSocket.OPEN) {
//     chatSocket.close();
//   }
//   currentChatId = chatId;

//   try {
//     const res = await fetch("http://localhost:8000/api/ws/ws_token", {
//       method: "GET",
//       credentials: "include",
//     });

//     if (!res.ok) {
//       throw new Error("Не вдалося отримати ws_token");
//     }
//     const { ws_token } = await res.json();

//     chatSocket = new WebSocket(`ws://localhost:8000/api/ws/chat/${chatId}?ws_token=${ws_token}`);

//     chatSocket.onopen = () => {
//       console.log(`WS connected to chat ${chatId}`);
//       // після відкриття відправляємо всі повідомлення з черги
//       if (sendQueue.length) {
//         console.log("Flushing sendQueue:", sendQueue.length);
//         sendQueue.forEach(payload => chatSocket.send(JSON.stringify(payload)));
//         sendQueue = [];
//       }
//     };

//     chatSocket.onmessage = (event) => {
//       try {
//         const message = JSON.parse(event.data);
//         console.log("WS onmessage:", message);
//         addMessageToUI(message);
//       } catch (e) {
//         console.error("Failed parse WS message", e, event.data);
//       }
//     };

//     chatSocket.onclose = (ev) => {
//       console.warn("Chat WebSocket closed", ev);
//       // можна пробувати автопідключення тут, якщо хочеш
//     };
//     chatSocket.onerror = (err) => {
//       console.error("WS Error", err);
//     };
//   } catch (err) {
//     console.error("Помилка підключення до чату:", err);
//   }
// }


// function sendMessage(text, fileUrl = null) {
//   const payload = {
//     text: text || (fileUrl ? "📎 Файл" : ""),
//     author_id: currentUser.id, // необхідно для бекенду
//     is_file: !!fileUrl,
//     file_url: fileUrl,
//   };

//   if (!chatSocket || chatSocket.readyState !== WebSocket.OPEN) {
//     console.warn("WS not open, queueing message");
//     sendQueue.push(payload);
//     return;
//   }

//   chatSocket.send(JSON.stringify(payload));
// }


// function sendWsMessage() {
//   const input = document.getElementById("messageInput");
//   const fileInput = document.getElementById("fileInput");

//   let fileUrl = null;
//   if (fileInput && fileInput.files && fileInput.files.length > 0) {
//     // тимчасовий preview (можна замінити на URL з сервера)
//     const file = fileInput.files[0];
//     fileUrl = URL.createObjectURL(file);
//   }

//   const text = input.value.trim();
//   if (!text && !fileUrl) return;

//   // Відправляємо на сервер
//   sendMessage(text, fileUrl);

//   // Очищаємо інпути
//   input.value = "";
//   fileInput.value = "";
// }

// function addMessageToUI(message) {
//   const container = document.getElementById("chatMessages");
//   const el = document.createElement("div");
//   el.classList.add("message");

//   // Відрізняємо свої та чужі повідомлення
//   if (message.author_id === currentUser.id) {
//     el.classList.add("client"); // твоє повідомлення
//   } else {
//     el.classList.add("master"); // повідомлення іншого
//   }

//   el.innerHTML = message.is_file
//     ? `<a href="${message.file_url}" target="_blank">📎 Файл</a>`
//     : message.text;

//   container.appendChild(el);
//   container.scrollTop = container.scrollHeight;
// }

// async function loadMessages(chatId) {
//   if (!currentUser) return;
//   const res = await fetch(`${API_BASE}/chats/${chatId}/messages`, { credentials: "include" });
//   const messages = await res.json();
//   const container = document.getElementById("chatMessages");
//   container.innerHTML = "";
//   messages.forEach(addMessageToUI);
// }

// async function renderTopbar() {
//   if (!currentUser) return;
//   const topbar = document.getElementById("chatTopbar");
//   const container = document.getElementById("chatMessages");
//   topbar.innerHTML = "";

//   try {
//     const res = await fetch(`${API_BASE}/chats/user/chats`, { credentials: "include" });
//     if (!res.ok) throw new Error("Failed to fetch chats");
//     const chats = await res.json();

//     if (!chats.length) {
//       container.innerHTML = "<div class='chat-empty'>У вас ще немає чату</div>";
//       return;
//     }

//     chats.forEach(chat => {
//       const div = document.createElement("div");
//       div.classList.add("chat-topbar-item");
//       const otherUserName = chat.client_id === currentUser.id ? "Майстер" : "Клієнт";
//       div.textContent = getInitials(otherUserName);

//       div.addEventListener("click", async () => {
//         await loadMessages(chat.id);
//         connectChat(chat.id);
//         document.getElementById("chatHeader").textContent = `Чат #${chat.id}`;
//       });

//       topbar.appendChild(div);
//     });
//   } catch (err) {
//     console.error(err);
//   }
// }

// async function initChat() {
//   await renderTopbar();
// }


// // ===== WS NOTIFICATIONS =====
// function connectNotifications() {
//   if (!currentUser) return;

//   // створюємо WS без токена
//   notificationsSocket = new WebSocket(`ws://localhost:8000/api/ws/notifications`);

//   notificationsSocket.onopen = () => console.log("Notifications WS opened");
//   notificationsSocket.onerror = err => console.error("Notifications WS error", err);

//   notificationsSocket.onmessage = async event => {
//     const data = JSON.parse(event.data);
//     console.log("Notification", data);

//     if (data.type === "chat_created") {
//       await loadMessages(data.chat_id);
//       connectChat(data.chat_id);

//       const topbar = document.getElementById("chatTopbar");
//       const div = document.createElement("div");
//       div.classList.add("chat-topbar-item");
//       const otherName = data.client_id === currentUser.id ? "Майстер" : "Клієнт";
//       div.textContent = getInitials(otherName);

//       div.addEventListener("click", async () => {
//         await loadMessages(data.chat_id);
//         connectChat(data.chat_id);
//         document.getElementById("chatHeader").textContent = `Чат #${data.chat_id}`;
//       });

//       topbar.appendChild(div);
//       showToast("Новий чат створено", "success");
//     }
//   };

//   notificationsSocket.onclose = () => console.warn("Notifications WS closed");
// }


// // ===== TICKETS =====
// async function openTicketsSidebar() {
//   const sidebar = document.getElementById("ticketsSidebar");
//   sidebar.classList.add("open");

//   try {
//     const res = await fetch(`${API_BASE}/tickets/user/get_tickets/`, { credentials: "include" });
//     const data = await res.json();
//     const tickets = data.data.tickets || [];
//     const container = document.getElementById("ticketsSidebarContent");
//     container.innerHTML = "";

//     if (!tickets.length) {
//       container.innerHTML = "<p>У вас поки що немає заявок.</p>";
//       return;
//     }

//     tickets.forEach(ticket => {
//       const div = document.createElement("div");
//       div.classList.add("ticket-card-sidebar");
//       const imgSrc = ticket.photos?.length ? `http://localhost:8000${ticket.photos[0]}` : "https://via.placeholder.com/60";

//       div.innerHTML = `
//         <img src="${imgSrc}" alt="${ticket.title}">
//         <div class="ticket-info">
//           <h4>${ticket.title}</h4>
//           <span class="status ${ticket.status}">${ticket.status.replace("_", " ").toUpperCase()}</span>
//         </div>
//       `;
//       container.appendChild(div);
//     });
//   } catch (err) {
//     console.error("Failed to load tickets", err);
//   }
// }

// // ===== COOKIE HELPER =====
// function getCookie(name) {
//   const value = `; ${document.cookie}`;
//   const parts = value.split(`; ${name}=`);
//   if (parts.length === 2) return parts.pop().split(";").shift();
// }

// // ===== INIT =====
// document.addEventListener("DOMContentLoaded", async () => {
//   const user = await fetchCurrentUser();
//   if (!user) return;

//   initUserMenu(user);
//   await initChat();
//   connectNotifications();

//   document.getElementById("chatToggle")?.addEventListener("click", toggleChat);
//   document.getElementById("openTicketModal")?.addEventListener("click", e => {
//     e.preventDefault();
//     document.getElementById("ticketModal").classList.add("open");
//   });
//   document.getElementById("closeTicketModal")?.addEventListener("click", () => {
//     document.getElementById("ticketModal").classList.remove("open");
//   });
//   document.getElementById("closeTicketsSidebar")?.addEventListener("click", () => {
//     document.getElementById("ticketsSidebar").classList.remove("open");
//   });

// });

let currentUser = null;
let chatSocket = null;
let notificationsSocket = null;
let currentChatId = null;

const API_BASE = "http://localhost:8000/api";

// ===== HELPERS =====
function getInitials(name) {
  if (!name) return "";
  const parts = name.trim().split(" ");
  const initials = parts.map(p => p[0].toUpperCase()).join("");
  return initials.length > 2 ? initials.slice(0, 2) : initials;
}

async function fetchCurrentUser() {
  try {
    const res = await fetch(`${API_BASE}/user/auth/user`, { credentials: "include" });
    if (!res.ok) throw new Error("Unauthorized");
    currentUser = await res.json();
    return currentUser;
  } catch (err) {
    console.warn("User not authenticated", err);
    window.location.replace("/");
  }
}

// ===== LOGOUT =====
function Logout() {
  fetch(`${API_BASE}/user/logout`, { method: "POST", credentials: "include" })
    .finally(() => window.location.replace("/"));
}

// ===== USER MENU =====
function initUserMenu(user) {
  const btn = document.getElementById("userMenuBtn");
  const menu = document.getElementById("userMenu");
  const avatar = document.querySelector(".user__avatar");
  avatar.textContent = getInitials(user.full_name);

  btn.addEventListener("click", e => {
    e.stopPropagation();
    menu.classList.toggle("open");
    btn.setAttribute("aria-expanded", menu.classList.contains("open"));
  });

  document.addEventListener("click", e => {
    if (!btn.contains(e.target) && !menu.contains(e.target)) {
      menu.classList.remove("open");
      btn.setAttribute("aria-expanded", "false");
    }
  });
}

// ===== CHAT =====
function toggleChat() {
  const chatWidget = document.getElementById("chatWidget");
  chatWidget.style.display = chatWidget.style.display === "none" || !chatWidget.style.display ? "block" : "none";
}

// ===== WS CHAT =====
let sendQueue = []; // черга повідомлень, якщо WS ще не відкритий

async function connectChat(chatId) {
  if (!currentUser) return;

  if (chatSocket && chatSocket.readyState === WebSocket.OPEN) {
    chatSocket.close();
  }
  currentChatId = chatId;
  
  try {
    const res = await fetch("http://localhost:8000/api/ws/ws_token", {
      method: "GET",
      credentials: "include",
    });
    if (!res.ok) throw new Error("Не вдалося отримати ws_token");
    const { ws_token } = await res.json();

    chatSocket = new WebSocket(`ws://localhost:8000/api/ws/chat/${chatId}?ws_token=${ws_token}`);

    chatSocket.onopen = () => {
      console.log(`WS connected to chat ${chatId}`);
      if (sendQueue.length) {
        sendQueue.forEach(payload => chatSocket.send(JSON.stringify(payload)));
        sendQueue = [];
      }
    };

    chatSocket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        addMessageToUI(message);
      } catch (e) {
        console.error("Failed parse WS message", e, event.data);
      }
    };

    chatSocket.onclose = (ev) => console.warn("Chat WebSocket closed", ev);
    chatSocket.onerror = (err) => console.error("WS Error", err);
  } catch (err) {
    console.error("Помилка підключення до чату:", err);
  }
}

function sendMessage(text, fileUrl = null) {
  const payload = {
    text: text || (fileUrl ? "📎 Файл" : ""),
    author_id: currentUser.id,
    is_file: !!fileUrl,
    file_url: fileUrl,
  };

  if (!chatSocket || chatSocket.readyState !== WebSocket.OPEN) {
    sendQueue.push(payload);
    return;
  }

  chatSocket.send(JSON.stringify(payload));
}

function sendWsMessage() {
  const input = document.getElementById("messageInput");
  const fileInput = document.getElementById("fileInput");

  let fileUrl = null;
  if (fileInput && fileInput.files && fileInput.files.length > 0) {
    const file = fileInput.files[0];
    fileUrl = URL.createObjectURL(file);
  }

  const text = input.value.trim();
  if (!text && !fileUrl) return;

  sendMessage(text, fileUrl);

  input.value = "";
  fileInput.value = "";
}

function addMessageToUI(message) {
  const container = document.getElementById("chatMessages");
  const el = document.createElement("div");
  el.classList.add("message");
  el.classList.add(message.author_id === currentUser.id ? "client" : "master");
  el.innerHTML = message.is_file
    ? `<a href="${message.file_url}" target="_blank">📎 Файл</a>`
    : message.text;
  container.appendChild(el);
  container.scrollTop = container.scrollHeight;
}

async function loadMessages(chatId) {
  if (!currentUser) return;
  const res = await fetch(`${API_BASE}/chats/${chatId}/messages`, { credentials: "include" });
  const messages = await res.json();
  const container = document.getElementById("chatMessages");
  container.innerHTML = "";
  messages.forEach(addMessageToUI);
}

async function renderTopbar() {
  if (!currentUser) return;
  const topbar = document.getElementById("chatTopbar");
  const container = document.getElementById("chatMessages");
  topbar.innerHTML = "";

  try {
    const res = await fetch(`${API_BASE}/chats/user/chats`, { credentials: "include" });
    if (!res.ok) throw new Error("Failed to fetch chats");
    const chats = await res.json();

    if (!chats.length) {
      container.innerHTML = "<div class='chat-empty'>У вас ще немає чату</div>";
      return;
    }

    chats.forEach(chat => {
      const div = document.createElement("div");
      div.classList.add("chat-topbar-item");
      const otherUserName = chat.client_id === currentUser.id ? "Майстер" : "Клієнт";
      div.textContent = getInitials(otherUserName);

      div.addEventListener("click", async () => {
        await loadMessages(chat.id);
        connectChat(chat.id);
        document.getElementById("chatHeader").textContent = `Чат #${chat.id}`;
      });

      topbar.appendChild(div);
    });
  } catch (err) {
    console.error(err);
  }
}

async function initChat() {
  await renderTopbar();
}

// ===== WS NOTIFICATIONS =====
function connectNotifications() {
  if (!currentUser) return;

  notificationsSocket = new WebSocket(`ws://localhost:8000/api/ws/notifications`);

  notificationsSocket.onopen = () => console.log("Notifications WS opened");
  notificationsSocket.onerror = err => console.error("Notifications WS error", err);

  notificationsSocket.onmessage = async event => {
    const data = JSON.parse(event.data);

    if (data.type === "chat_created") {
      await loadMessages(data.chat_id);
      connectChat(data.chat_id);

      const topbar = document.getElementById("chatTopbar");
      const div = document.createElement("div");
      div.classList.add("chat-topbar-item");
      const otherName = data.client_id === currentUser.id ? "Майстер" : "Клієнт";
      div.textContent = getInitials(otherName);
      toggleChat()
      div.addEventListener("click", async () => {
        await loadMessages(data.chat_id);
        connectChat(data.chat_id);
        document.getElementById("chatHeader").textContent = `Чат #${data.chat_id}`;
      });

      topbar.appendChild(div);
      showToast("Новий чат створено", "success");
    }
  };

  notificationsSocket.onclose = () => console.warn("Notifications WS closed");
}

// ===== TICKETS =====
async function openTicketsSidebar() {
  const sidebar = document.getElementById("ticketsSidebar");
  sidebar.classList.add("open");

  try {
    const res = await fetch(`${API_BASE}/tickets/user/get_tickets/`, { credentials: "include" });
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
      const imgSrc = ticket.photos?.length ? `http://localhost:8000${ticket.photos[0]}` : "https://via.placeholder.com/60";

      div.innerHTML = `
        <img src="${imgSrc}" alt="${ticket.title}">
        <div class="ticket-info">
          <h4>${ticket.title}</h4>
          <span class="status ${ticket.status}">${ticket.status.replace("_", " ").toUpperCase()}</span>
        </div>
      `;
      container.appendChild(div);
    });
  } catch (err) {
    console.error("Failed to load tickets", err);
  }
}

// ===== TICKET FORM & FILES (ІНТЕГРАЦІЯ) =====
const ticketForm = document.getElementById("ticketForm");
const fileInput = document.getElementById("ticketFiles");
const filesContainer = document.querySelector(".files_control");
let selectedFiles = [];

function renderFiles() {
  filesContainer.innerHTML = "";
  if (!selectedFiles.length) {
    filesContainer.style.display = "none";
    return;
  }
  filesContainer.style.display = "flex";

  selectedFiles.forEach((file, index) => {
    const reader = new FileReader();
    reader.onload = e => {
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

fileInput?.addEventListener("change", (e) => {
  const newFiles = Array.from(e.target.files);
  newFiles.forEach(file => {
    if (!selectedFiles.some(f => f.name === file.name && f.size === file.size)) {
      selectedFiles.push(file);
    }
  });
  renderFiles();
});

ticketForm?.addEventListener("submit", async e => {
  e.preventDefault();

  const dataTransfer = new DataTransfer();
  selectedFiles.forEach(f => dataTransfer.items.add(f));
  fileInput.files = dataTransfer.files;

  const title = document.getElementById("ticketTitle").value.trim();
  const description = document.getElementById("ticketDescription").value.trim();

  if (title.length < 3 || description.length < 10) {
    showToast("Заповніть правильно всі поля!", "error");
    return;
  }

  try {
    const payload = { title, description, client_id: currentUser.id };
    const res = await fetch(`${API_BASE}/tickets/create/ticket`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("Не вдалося створити заявку");
    const ticket = await res.json();

    for (const file of fileInput.files) {
      const formData = new FormData();
      formData.append("ticket_id", ticket.id);
      formData.append("file", file);
      await fetch(`${API_BASE}/tickets/file/upload`, { method: "POST", credentials: "include", body: formData });
    }

    showToast("Заявка успішно створена!", "success");
    ticketForm.reset();
    selectedFiles = [];
    renderFiles();
    document.getElementById("ticketModal")?.classList.remove("open");
    openTicketsSidebar();
  } catch (err) {
    console.error("❌ Помилка при створенні заявки:", err);
    showToast(err.message, "error");
  }
});

// ===== COOKIE HELPER =====
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
}

// ===== INIT =====
document.addEventListener("DOMContentLoaded", async () => {
  const user = await fetchCurrentUser();
  if (!user) return;

  initUserMenu(user);
  await initChat();
  connectNotifications();

  document.getElementById("chatToggle")?.addEventListener("click", toggleChat);
  document.getElementById("openTicketModal")?.addEventListener("click", e => {
    e.preventDefault();
    document.getElementById("ticketModal").classList.add("open");
  });
  document.getElementById("closeTicketModal")?.addEventListener("click", () => {
    document.getElementById("ticketModal").classList.remove("open");
  });
  document.getElementById("closeTicketsSidebar")?.addEventListener("click", () => {
    document.getElementById("ticketsSidebar").classList.remove("open");
  });
});