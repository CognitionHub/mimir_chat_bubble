const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'ws://localhost:8000'
    : 'wss://api.cognitionhub.no';
const API_KEY = "sdlfkgh-glsiygewoi--golsihgioweg"
const OPENER_MESSAGE = "Hei, hvordan kan jeg hjelpe deg?"

const toggleFailedToConnect = (show) => {
    const isShowing = document.getElementById("mimirFailedState");
    if (isShowing && !show) {
        isShowing.remove();
    }

    if (!isShowing && show) {
        const loadingState = addMimirElement("div", {
            "id": "mimirFailedState", "onclick": () => {
                ws = null;
                initiateConversation();
            }
        }, messageContainer);
        addMimirElement("i", { "className": "fas fa-exclamation-circle fa-lg" }, loadingState)
        addMimirElement("div", { "id": "mimirLoadingText", "textContent": "Klarte ikke å koble til, trykk for å prøve på nytt" }, loadingState)
        scrollToBottom();
    }
}

let ws;

let lastChunkType = null;
const initiateConversation = () => {
    if (ws || chat.style.display === "none") {
        return;
    }

    ws = new WebSocket(API_URL + "/chat" + "?customer_id=" + crypto.randomUUID() + "&company_name=" + "skopus" + "&api_key=" + API_KEY);

    ws.addEventListener('open', () => {
        const openerMessage = document.getElementById("mimirOpenerMessage");
        if (!openerMessage) {
            addMimirElement("div", { "textContent": OPENER_MESSAGE, "id": "mimirOpenerMessage" }, messageContainer);
            addMimirElement("div", { "textContent": "Siden dette er en fiktiv nettbutikk, har jeg dessverre ikke en like imponerende produkt-katalog som det dere sikkert har. Akkurat nå har jeg bare informasjon om 7 typer sko. Om du vil vite hvilke, er det bare å spørre.", "id": "mimirOpenerMessage" }, messageContainer);
            addMimirElement("div", { "textContent": "Ellers svarer jeg blant annet på spørsmål om frakt, retur, kansellering eller sporing", "id": "mimirOpenerMessage" }, messageContainer);
        }

        toggleFailedToConnect(false);
    });

    ws.addEventListener('message', (event) => {
        const parsedMessage = JSON.parse(event.data);
        const chunkType = parsedMessage.type;
        const chunkContent = parsedMessage.content

        if (chunkType === "initial_messages") {
            document.querySelectorAll('.mimirUserMessage').forEach(el => el.remove());
            document.querySelectorAll('.mimirBotMessage').forEach(el => el.remove());

            chunkContent.messages.forEach(({ content, sender }) => {
                const id = sender == "customer" ? "mimirUserMessage" : "mimirBotMessage";
                addMimirElement("div", { "textContent": content, "className": id }, messageContainer);
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

    ws.addEventListener('close', () => {
        toggleFailedToConnect(true);
    });
};


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
    } else {
        chat.style.display = "flex";
        initiateConversation();
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
        if (text.trim() === '' || isCurrentlyAnswering || !ws || ws.readyState !== WebSocket.OPEN) {
            return;
        }

        input.value = "";
        input.focus();

        if (ws && ws.readyState === WebSocket.OPEN) {
            addMimirElement("div", { "textContent": text, "className": "mimirUserMessage" }, messageContainer);
            ws.send(text);
        } else {
            console.error("WebSocket is not open. readyState: ", ws.readyState);
            return;
        }

        setLoadingState("Tenker");
        isCurrentlyAnswering = true;
        sendIcon.style.opacity = "0.3";
    } else {
        if (isFirstToken) {
            currentMessage = addMimirElement("div", { "className": "mimirBotMessage", "textContent": text }, messageContainer);
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

// Icon stylesheet
addMimirElement("link", {
    rel: "stylesheet",
    href: "https://use.fontawesome.com/releases/v5.7.1/css/all.css",
    type: "text/css"
}, document.head);

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
const input = addMimirElement("textarea", { "id": "mimirInput", "rows": 1, "autocomplete": "off", "placeholder": "Still et spørsmål..." }, inputForm)
input.addEventListener("input", () => {
    input.style.height = 'auto';
    input.style.height = input.scrollHeight + 'px';
})
input.addEventListener("keypress", (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        addMessage(input.value, true);
    }
})
const sendIcon = addMimirElement("i", { "className": "fas fa-paper-plane fa-lg", "id": "mimirSendIcon", "onclick": () => addMessage(input.value, true) }, inputForm)

// Header
const header = addMimirElement("div", { "id": "mimirHeader" }, chat)
const topText = addMimirElement("div", { "id": "mimirTopText", "textContent": `Chat` }, header)
const closeIcon = addMimirElement("i", { "className": "fas fa-times fa-lg", "id": "mimirChatIcon", "id": "mimirCloseIcon", "onclick": toggleChat }, header)

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