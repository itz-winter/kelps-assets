document.createElement("style").textContent = `
@keyframes notify-info-box-slide-in {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
.notify-info-box {
  padding: 15px;
  border-radius: 5px;
  color: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}
.notify-info-box.success { background-color: #4CAF50; }
.notify-info-box.error { background-color: #f44336; }
.notify-info-box.warning { background-color: #ff9800; }
`.trim().appendTo(document.head);

function notify(type, message) {
  const en = document.querySelector(".notification");
  if (en) {
    en.remove();
  }
  const n = document.createElement("div");
  n.className = `notify-info-box ${type} notification`;
  n.innerHTML = `<p>${message}</p>`;
  n.style.position = "fixed";
  n.style.top = "20px";
  n.style.right = "20px";
  n.style.zIndex = "10000";
  n.style.minWidth = "250px";
  n.style.animation = "notify-info-box-slide-in 0.3s ease";

  document.body.appendChild(n);

  setTimeout(() => {
    n.style.opacity = "0";
    n.style.transition = "opacity 0.3s ease";
    setTimeout(() => n.remove(), 300);
  }, 3000);
}
