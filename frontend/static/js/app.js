async function loadData() {
    try {
        const response = await fetch("http://localhost:8000/api/hello");
        const data = await response.json();
        console.log(data);        
        document.getElementById("output").textContent = JSON.stringify(data.message, null, 2);
    } catch (err) {
        console.error("Помилка:", err);
    }
}