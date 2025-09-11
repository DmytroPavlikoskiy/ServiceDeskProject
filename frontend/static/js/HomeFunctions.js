// // ==== INIT USER CHECK ====
// async function fetchCurrentUser() {
//   try {
//     const res = await fetch("http://localhost:8000/api/user/auth/user", {
//       method: "GET",
//       credentials: "include"
//     });

//     if (!res.ok) throw new Error("Unauthorized");

//     const data = await res.json();
//     currentUserId = data.id;
//     return data;
//   } catch (err) {
//     console.warn("❌ Користувач не авторизований:", err);
//     // редірект на логін
//     // window.location.replace("/");
    
//   }
// }

// // ==== INIT APP ====
// document.addEventListener("DOMContentLoaded", async () => {
//   const user = await fetchCurrentUser();
//   if (!user) return; // зупиняєм, бо редіректнувся

//   // Ініціалізація чату
//   await initChat();

//   // Завантаження тікетів
//   fetchTickets(user.id);
// });


// // ==== CHAT FUNCTIONS ====
// // (тут залишаємо твої функції, але прибрав дублікати і виправив порядок)
// async function initChat() {
//   await fetchChats();
//   renderTopbar();
// }

// // ==== FETCH TICKETS ====
// async function fetchTickets(clientId) {
//   try {
//     const response = await fetch(`/api/ticket/${clientId}`, {
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
//     const res = await fetch("/api/tickets", {
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

//         await fetch("/api/files/upload", {
//           method: "POST",
//           credentials: "include",
//           body: formData
//         });
//       }
//     }

//     showToast("✅ Заявка успішно створена!", "success");
//     ticketForm.reset();
//     ticketModal.classList.remove("open");
//     fetchTickets(currentUserId);

//   } catch (err) {
//     console.error("❌ Помилка при створенні заявки:", err);
//     showToast(err.message, "error");
//   }
// });

// ==== INIT USER CHECK ====
async function fetchCurrentUser() {
  try {
    const res = await fetch("http://localhost:8000/api/user/auth/user", {
      method: "GET",
      credentials: "include"
    });

    if (!res.ok) {
      // користувач не авторизований або токен недійсний
      throw new Error("Unauthorized");
    }

    const data = await res.json();
    currentUserId = data.id;
    return data;
  } catch (err) {
    console.warn("❌ Користувач не авторизований:", err);
    // редірект на логін
    window.location.replace("http://localhost:3000/"); 
  }
}

// ==== INIT APP ====
document.addEventListener("DOMContentLoaded", async () => {
  // перевірка користувача
  const user = await fetchCurrentUser();
  if (!user) return; // якщо редіректнувся, далі код не виконується

  // Ініціалізація чату
  await initChat();

  // Завантаження тікетів
  await fetchTickets(user.id);
});

// ==== CHAT FUNCTIONS ====
async function initChat() {
  await fetchChats();
  renderTopbar();
}

// ==== FETCH TICKETS ====
async function fetchTickets(clientId) {
  try {
    const response = await fetch(`http://localhost:8000/api/ticket/${clientId}`, {
      method: "GET",
      credentials: "include"
    });

    if (!response.ok) throw new Error("Помилка при отриманні тікетів");

    const result = await response.json();
    const ticketsContainer = document.getElementById("ticketsList");
    ticketsContainer.innerHTML = "";

    if (result.data?.status === 200 && result.data.ticket) {
      const tickets = Array.isArray(result.data.ticket)
        ? result.data.ticket
        : [result.data.ticket];

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
    console.error("❌ Помилка при отриманні тікетів:", error);
    document.getElementById("ticketsList").innerHTML = `<p>Не вдалося завантажити заявки.</p>`;
  }
}

// ==== TICKET MODAL ====
const openModalBtn = document.getElementById("openTicketModal");
const ticketModal = document.getElementById("ticketModal");
const closeModalBtn = document.getElementById("closeTicketModal");
const ticketForm = document.getElementById("ticketForm");

openModalBtn.addEventListener("click", e => {
  e.preventDefault();
  ticketModal.classList.add("open");
});

closeModalBtn.addEventListener("click", () => {
  ticketModal.classList.remove("open");
});

ticketModal.addEventListener("click", e => {
  if (e.target === ticketModal) {
    ticketModal.classList.remove("open");
  }
});

ticketForm.addEventListener("submit", async e => {
  e.preventDefault();

  const title = ticketForm.title.value.trim();
  const description = ticketForm.description.value.trim();
  const files = ticketForm.files.files;

  if (title.length < 3 || description.length < 10) {
    showToast("Заповніть правильно всі поля!", "error");
    return;
  }

  try {
    // 1. створення заявки
    const payload = { title, description, priority: "medium" };
    const res = await fetch("http://localhost:8000/api/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Не вдалося створити заявку");
    }

    const { ticket } = await res.json();

    // 2. завантаження файлів
    if (files.length > 0) {
      for (const file of files) {
        const formData = new FormData();
        formData.append("ticket_id", ticket.id);
        formData.append("file", file);

        await fetch("http://localhost:8000/api/files/upload", {
          method: "POST",
          credentials: "include",
          body: formData
        });
      }
    }

    showToast("✅ Заявка успішно створена!", "success");
    ticketForm.reset();
    ticketModal.classList.remove("open");
    await fetchTickets(currentUserId);

  } catch (err) {
    console.error("❌ Помилка при створенні заявки:", err);
    showToast(err.message, "error");
  }
});