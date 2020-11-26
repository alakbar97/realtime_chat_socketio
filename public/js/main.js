const socket = io();

const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const roomName = document.getElementById("room-name");
const userList = document.getElementById("users");

const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

socket.emit("joinRoom", { username, room });

const outputMessage = (msg) => {
  const div = document.createElement("div");
  div.classList.add("message");
  div.innerHTML = `<p class="meta">${msg.username} <span>${msg.time}</span></p>
      <p class="text">
        ${msg.text}
      </p>`;
  document.querySelector(".chat-messages").appendChild(div);
};

const outputRoom = (room, users) => {
  roomName.innerText = room;
  userList.innerHTML = `
    ${users.map((user) => `<li>${user.username}</li>`).join('')}
    `;
};

socket.on("roomUsers", ({ room, users }) => {
  outputRoom(room, users);
});

socket.on("message", (message) => {
  outputMessage(message);

  chatMessages.scrollTop = chatMessages.scrollHeight;
});

chatForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const msg = e.target.elements.msg.value;

  socket.emit("chatMessage", msg);

  e.target.elements.msg.value = "";
  e.target.elements.msg.focus();
});
