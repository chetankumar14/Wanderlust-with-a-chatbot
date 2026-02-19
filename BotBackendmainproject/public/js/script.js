// Example starter JavaScript for disabling form submissions if there are invalid fields
(() => {
  'use strict'

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll('.needs-validation')

  // Loop over them and prevent submission
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault()
        event.stopPropagation()
      }

      form.classList.add('was-validated')
    }, false)
  })
})()


// chatbot

const chatBtn = document.getElementById("chatBtn");
const chatPopup = document.getElementById("chatPopup");
const closeChat = document.getElementById("closeChat");
const sendBtn = document.getElementById("sendBtn");
const userInput = document.getElementById("userInput");
const chatMessages = document.getElementById("chatMessages");


// ✅ Restore chat state when page loads
document.addEventListener("DOMContentLoaded", () => {
  const savedHistory = localStorage.getItem("chatHistory");
  const chatOpen = localStorage.getItem("chatOpen");

  if (savedHistory) {
    chatMessages.innerHTML = savedHistory;
  }

  if (chatOpen === "true") {
    chatPopup.classList.remove("d-none");
  }

  chatMessages.scrollTop = chatMessages.scrollHeight;
});


// ✅ Toggle chat open
chatBtn.addEventListener("click", () => {
  chatPopup.classList.toggle("d-none");

  const isOpen = !chatPopup.classList.contains("d-none");
  localStorage.setItem("chatOpen", isOpen);
});


// ✅ Close chat
closeChat.addEventListener("click", () => {
  chatPopup.classList.add("d-none");
  localStorage.setItem("chatOpen", "false");
});


// ✅ Send button
sendBtn.addEventListener("click", sendMessage);


// ✅ Enter key support
userInput.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    sendMessage();
  }
});


async function sendMessage() {
  const message = userInput.value.trim();
  if (!message) return;

  // Show user message
  chatMessages.innerHTML += `<div><strong>You:</strong> ${message}</div>`;
  userInput.value = "";

  // Save history immediately
  localStorage.setItem("chatHistory", chatMessages.innerHTML);

  try {
    const res = await fetch("/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message })
    });

    const data = await res.json();

    // Show bot reply
    chatMessages.innerHTML += `<div><strong>Bot:</strong> ${data.reply}</div>`;

    // Save again
    localStorage.setItem("chatHistory", chatMessages.innerHTML);

    chatMessages.scrollTop = chatMessages.scrollHeight;

  } catch (err) {
    chatMessages.innerHTML += `<div><strong>Bot:</strong> Error connecting to server.</div>`;
  }
}

