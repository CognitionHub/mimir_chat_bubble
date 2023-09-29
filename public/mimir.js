const bubble = document.createElement("div");
bubble.id = "mimirBubble";

const chatIcon = document.createElement("i");
chatIcon.className = "fas fa-comment fa-2x";
chatIcon.id = "mimirChatIcon";
bubble.appendChild(chatIcon);

const chat = document.createElement("div");
chat.id = "mimirChat";

const callApi = async (text) => {
    await new Promise(resolve => setTimeout(resolve, 3000));
    return "Halla, har ikke koblet opp mot API enda."
}

const loading = document.createElement("div");
loading.id = "mimirLoading";
loading.textContent = "Laster...";

const toggleLoading = (showLoading) => {
    if (showLoading) {
        messageContainer.appendChild(loading);
    } else if (messageContainer.contains(loading)) {
        messageContainer.removeChild(loading);
    }
}

const addMessage = (text, isUser) => {
    if (text.length > 0) {
        const message = document.createElement("div");
        message.textContent = text;

        if (isUser) {
            message.id = "mimirUserMessage";
            input.value = "";
            input.focus();
            callApi(text).then((response) => {
                addMessage(response, false);
            })
        } else {
            message.id = "mimirBotMessage";
        }

        messageContainer.appendChild(message);
        toggleLoading(isUser);
    }
}

document.body.appendChild(bubble);
document.body.appendChild(chat);

const header = document.createElement("div");
header.id = "mimirHeader";
chat.appendChild(header);

const botIcon = document.createElement("i");
botIcon.className = "fas fa-smile fa-lg";
header.appendChild(botIcon);

const topText = document.createElement("div");
topText.textContent = `${$mimirCompany}-bot`;
topText.id = "mimirTopText";
header.appendChild(topText);

const messageContainer = document.createElement("div");
messageContainer.id = "mimirMessageContainer";
chat.appendChild(messageContainer);

const inputForm = document.createElement("form");
inputForm.id = "mimirInputForm";
inputForm.onsubmit = (e) => {
    e.preventDefault();
    addMessage(input.value, true);
}
chat.appendChild(inputForm);

const input = document.createElement("input");
input.autocomplete = "off";
input.id = "mimirInput";
input.placeholder = "Still et spørmål...";
inputForm.appendChild(input);

const sendIcon = document.createElement("i");
sendIcon.className = "fas fa-paper-plane fa-lg";
sendIcon.id = "mimirSendIcon";
sendIcon.onclick = () => {
    addMessage(input.value, true);
}
inputForm.appendChild(sendIcon);

addMessage("Hei, hva kan jeg hjelpe deg?", false);

bubble.onclick = () => {
    const chatShowing = chat.style.display === "flex";
    if (chatShowing) {
        chat.style.display = "none";
        chatIcon.style.transform = "";
        chatIcon.classList.remove("fa-times");
        chatIcon.classList.add("fa-comment");
    } else {
        chat.style.display = "flex";
        chatIcon.classList.remove("fa-comment");
        chatIcon.classList.add("fa-times");
        chatIcon.style.transform = "rotate(90deg)";
    }
};

document.addEventListener("click", function (event) {
    if (!chat.contains(event.target) && !bubble.contains(event.target)) {
        chat.style.display = "none";
    }
});

// If running on localhost we want to show the chat by default
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    bubble.click();
}