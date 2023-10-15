const bubble = document.createElement("div");
bubble.id = "mimirBubble";

const chatIcon = document.createElement("i");
chatIcon.className = "fas fa-comment fa-2x";
chatIcon.id = "mimirChatIcon";
bubble.appendChild(chatIcon);

const chat = document.createElement("div");
chat.id = "mimirChat";

const apiUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:8000'
    : 'https://cognition-hub-backend.azurewebsites.net/docs#/default/get_conversation_content_conversations__conversation_id__get';

const apiKey = "sdlfkgh-glsiygewoi--golsihgioweg"

const initiateConversation = async () => {
    // setInitialMessages(data.messages);
}

const setInitialMessages = (data) => {
    console.log("setInitialMessages", data);
    data.messages.forEach((message) => {
        isUser = message.sender === "customer";
        // strip message.content of ""
        messageCleaned = message.content.replace(/"/g, "");
        renderMessage(messageCleaned, isUser);
    });
}

const sendMessage = async (messageContent) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(
            messageContent,
            conversationId
            ));
    } else {
        console.error("WebSocket is not open. readyState: ", ws.readyState);
    }
}

const scrollToBottom = () => {
    messageContainer.scrollTop = messageContainer.scrollHeight;
};

let ws;

// company, customer id, api key, conversation id
const connectWebSocket = () => {
  let chunkedResponse = "";

  const customerId = window.$mimirCustomerID;
  const companyName = window.$mimirCompany;
  ws = new WebSocket("ws://localhost:8000/ws?customer_id=" + customerId + "&company_name=" + companyName);

  ws.addEventListener('open', () => {
    // WebSocket is connected
    // pass customer_id
  });

  ws.addEventListener('message', (event) => {
    const parsedMessage = JSON.parse(event.data);
    const chunkType = parsedMessage.type;
    const chunkContent = parsedMessage.content || parsedMessage.message;

    if (chunkType === "initial_messages") {
        setInitialMessages(chunkContent);
    }
  
    if (chunkType === "token" || chunkType === "full_message") {
        addMessage(chunkContent, false, chunkType);
    }
  });

  ws.addEventListener('close', () => {
    console.log('Connection closed');
  });
};


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

let lastBotMessageElement = null;
let appendToLastBotMessage = false;

const renderMessage = (text, isUser) => {
    console.log("renderMessage", text, isUser);
    const message = document.createElement("div");
    message.textContent = text;
    message.id = isUser ? "mimirUserMessage" : "mimirBotMessage";
    messageContainer.appendChild(message);
    toggleLoading(isUser);

    if (!isUser) {
        lastBotMessageElement = message;
    }

    scrollToBottom(); // Auto-scroll to bottom
}

const addMessage = (text, isUser, chunkType) => {

    if (isUser) {
        text.id = "mimirUserMessage";
        renderMessage(text, isUser);
        input.value = "";
        input.focus();
        appendToLastBotMessage = false;
        sendMessage(text);
    } else {
        text.id = "mimirBotMessage";
        if (chunkType === "full_message") {
            lastBotMessageElement.textContent = text;
        } else {
            if (appendToLastBotMessage && lastBotMessageElement) {
                lastBotMessageElement.textContent += text;
            } else {
                renderMessage(text, isUser, chunkType);
            }
        }

        if (chunkType === "token") {
            appendToLastBotMessage = true;
        } else if (chunkType === "full_message" || chunkType !== "token") {
            appendToLastBotMessage = false;
        }
    }
}



document.body.appendChild(bubble);
document.body.appendChild(chat);

const header = document.createElement("div");
header.id = "mimirHeader";
chat.appendChild(header);

const botIcon = document.createElement("i");
botIcon.className = "fas fa-robot fa-2x";
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

addMessage("Hei, hvordan kan jeg hjelpe deg?", false);

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


(async () => {
    connectWebSocket();
    conversationId = await initiateConversation();
})();


// If running on localhost we want to show the chat by default
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    bubble.click();
}