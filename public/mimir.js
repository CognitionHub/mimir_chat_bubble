const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'ws://localhost:8000'
    : 'wss://cognition-hub-backend.azurewebsites.net';
const API_KEY = "sdlfkgh-glsiygewoi--golsihgioweg"

let ws;

let lastChunkType = null;
const initiateConversation = () => {
    ws = new WebSocket(API_URL + "/chat" + "?customer_id=" + window.$mimirCustomerID + "&company_name=" + window.$mimirCompany + "&api_key=" + API_KEY);

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

const sendMessage = async (messageContent) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(messageContent);
    } else {
        addMessage("Noe gikk galt, beklager for ulempen.", false, true, true)
        const currentState = document.getElementById("mimirLoadingState");
        if (currentState) {
            currentState.remove();
        }
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

let currentMessage = null;
let isCurrentlyAnswering = false;
const addMessage = (text, isUser, isFirstToken, isFullMessage) => {
    if (isUser) {
        // Don't send empty messages and disallow two questions at the same time
        if (text.trim() === '' || isCurrentlyAnswering) {
            return;
        }

        input.value = "";
        input.focus();
        addMimirElement("div", { "textContent": text, "id": "mimirUserMessage" }, messageContainer);

        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(messageContent);
        } else {
            addMessage("Noe gikk galt, beklager for ulempen.", false, true, true)
            console.error("WebSocket is not open. readyState: ", ws.readyState);
            return;
        }

        setLoadingState("Tenker");
        isCurrentlyAnswering = true;
        sendIcon.style.opacity = "0.3";
    } else {
        if (isFirstToken) {
            currentMessage = addMimirElement("div", { "id": "mimirBotMessage", "textContent": text }, messageContainer);
        } else {
            currentMessage.textContent = isFullMessage ? text : currentMessage.textContent + text;
        }

        if (isFullMessage) {
            sendIcon.style.opacity = "1";
            isCurrentlyAnswering = false;
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
const sendIcon = addMimirElement("i", { "className": "fas fa-paper-plane fa-lg", "id": "mimirSendIcon", "onclick": () => addMessage(input.value, true) }, inputForm)
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
