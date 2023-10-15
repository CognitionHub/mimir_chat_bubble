const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'ws://localhost:8000'
    : 'ws://cognition-hub-backend.azurewebsites.net/docs#/default/get_conversation_content_conversations__conversation_id__get';
const API_KEY = "sdlfkgh-glsiygewoi--golsihgioweg"

let ws;

// company, customer id, api key, conversation id
let lastChunkType = null;
const initiateConversation = () => {
    // websocket expects customer_id, company_name, db
    ws = new WebSocket(API_URL + "/ws" + "?customer_id=" + window.$mimirCustomerID + "&company_name=" + window.$mimirCompany);

    ws.addEventListener('open', () => {
        // WebSocket is connected
        // pass customer_id
    });
        
    ws.addEventListener('message', (event) => {
        const parsedMessage = JSON.parse(event.data);
        const chunkType = parsedMessage.type;
        const chunkContent = parsedMessage.content

        if (chunkType === "initial_messages") {
            chunkContent.messages.forEach(({ content, sender }) => {
                const id = sender == "customer" ? "mimirUserMessage" : "mimirBotMessage";
                addMimirElement("div", { "textContent": content, "id": id }, messageContainer);
            });
            scrollToBottom();
        }

        if (chunkType === "tool") {
            setLoadingState(chunkContent);
        }

        if (chunkType === "token" || chunkType === "full_message") {
            const currentState = document.getElementById("mimirLoadingState");
            if (currentState) {
                currentState.remove();
            }
            addMessage(chunkContent, false, lastChunkType != "token", chunkType === "full_message");
        }
        lastChunkType = chunkType;
    });
};


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
        ws.send(messageContent);
    } else {
        console.error("WebSocket is not open. readyState: ", ws.readyState);
    }
}

const addMimirElement = (elementName = "div", properties = {}, parent = document.body) => {
    const e = document.createElement(elementName);
    Object.assign(e, properties);
    e.style.whiteSpace = "pre-line";
    parent.appendChild(e);
    return e
}

const scrollToBottom = () => {
    messageContainer.scrollTop = messageContainer.scrollHeight;
};

const toggleChat = () => {
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
}

const setLoadingState = (loadingText) => {
    const currentState = document.getElementById("mimirLoadingState");
    if (currentState) {
        currentState.remove();
    }

    const loadingState = addMimirElement("div", { "id": "mimirLoadingState" }, messageContainer);
    addMimirElement("div", { "id": "mimirSpinner" }, loadingState)
    addMimirElement("div", { "id": "mimirLoadingText", "textContent": loadingText }, loadingState)
    scrollToBottom();
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

let currentMessage = null;
const addMessage = (text, isUser, isFirstToken, isFullMessage) => {
    if (isUser) {
        sendMessage(text)
        input.value = "";
        input.focus();
        addMimirElement("div", { "textContent": text, "id": "mimirUserMessage" }, messageContainer);
        setLoadingState("Tenker");
    } else {
        if (isFirstToken) {
            currentMessage = addMimirElement("div", { "id": "mimirBotMessage", "textContent": text }, messageContainer);
        } else {
            currentMessage.textContent = isFullMessage ? text : currentMessage.textContent + text;
        }
    }

    scrollToBottom();
}

// Bubble
const bubble = addMimirElement("div", { "id": "mimirBubble", "onclick": toggleChat }, document.body)
const chatIcon = addMimirElement("i", { "className": "fas fa-comment fa-2x", "id": "mimirChatIcon" }, bubble)

// Chat
const chat = addMimirElement("div", { "id": "mimirChat" })
const messageContainer = addMimirElement("div", { "id": "mimirMessageContainer" }, chat)

// Input
const inputForm = addMimirElement("form", {
    "id": "mimirInputForm", "onsubmit": (e) => {
        e.preventDefault();
        addMessage(input.value, true);
    }
}, chat)
const input = addMimirElement("input", { "id": "mimirInput", "autocomplete": "off", "placeholder": "Still et spørsmål..." }, inputForm)
const sendIcon = addMimirElement("i", { "className": "fas fa-paper-plane fa-lg", "id": "mimirSendIcon" }, inputForm)

// Header
const header = addMimirElement("div", { "id": "mimirHeader" }, chat)
const topText = addMimirElement("div", { "id": "mimirTopText", "textContent": `Chat` }, header)

initiateConversation();
addMessage("Hei, hvordan kan jeg hjelpe deg?", false, true, false);

// Hide chat if clicked outside of chat
document.addEventListener("click", (e) => {
    if (!chat.contains(e.target) && !bubble.contains(e.target) && chat.style.display === "flex") {
        toggleChat()
    }
});

// If running on localhost we want to show the chat by default
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    toggleChat()
}
