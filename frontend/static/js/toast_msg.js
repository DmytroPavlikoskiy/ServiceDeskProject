

function showToast(message, type = "success") {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast toast--${type}`;
    toast.innerHTML = `
        <i class="${type === 'success' ? 'fa fa-check-circle' : type === 'error' ? 'fa fa-exclamation-circle' : 'fa fa-info-circle'}"></i>
        <span>${message}</span>
    `;
    container.appendChild(toast);

    // Затримка + показ
    requestAnimationFrame(() => {
        toast.style.transform = "translateY(0)";
        toast.style.opacity = "1";
    });

    // Ховаємо після 3.5 секунд
    setTimeout(() => {
        toast.style.transform = "translateY(100%)";
        toast.style.opacity = "0";
        toast.addEventListener("transitionend", () => toast.remove());
    }, 3500);
}