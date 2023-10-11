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

let conversationId;

const initiateConversation = async () => {
    try {
        const customerId = window.$mimirCustomerID;

        const url = `${apiUrl}/conversations/?company_name=sprell&customer_id=${encodeURIComponent(customerId)}`;
        const response = await fetch(url, { 
            method: 'POST',
            headers: {
                "access_token": apiKey
            }
         });

        if (!response.ok) {
            throw new Error('Could not initiate conversation' + response.statusText);
        }

        const data = await response.json();
        setInitialMessages(data.messages);
        return data.id;
    } catch (error) {
        console.error(error);
    }
}

const setInitialMessages = (messages) => {
    messages.forEach((message) => {
        isUser = message.sender === "customer";
        renderMessage(message.content, isUser);
    });
}

const sendMessage = async (conversationId, messageContent) => {
    try {
        const url = `${apiUrl}/conversations/${encodeURIComponent(conversationId)}/messages?message_content=${encodeURIComponent(messageContent)}`;
        const response = await fetch(url, { 
            method: 'POST',
            headers: {
                "access_token": apiKey
            }
        
     });

        if (!response.ok) {
            throw new Error('Could not send message' + response.statusText);
        }

        const data = await response.json();
        // I only want the last message of data.messages
        const messageText = data.messages[data.messages.length - 1].content;
        return messageText;
    } catch (error) {
        console.error(error);
    }
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

const renderMessage = (text, isUser) => {
    if (text.length > 0) {
        const message = document.createElement("div");
        message.textContent = text;
        message.id = isUser ? "mimirUserMessage" : "mimirBotMessage";
        messageContainer.appendChild(message);
        toggleLoading(isUser);
        scrollToBottom(); // Auto-scroll to bottom
    }
}

const addMessage = (text, isUser) => {
    if (text.length > 0) {
        renderMessage(text, isUser);

        if (isUser) {
            text.id = "mimirUserMessage";
            input.value = "";
            input.focus();
            sendMessage(conversationId,text).then((messageText) => {
                addMessage(messageText, false);
            })
        } else {
            text.id = "mimirBotMessage";
        }
    }
}

const scrollToBottom = () => {
    messageContainer.scrollTop = messageContainer.scrollHeight;
};

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
    conversationId = await initiateConversation();
})();


// If running on localhost we want to show the chat by default
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    bubble.click();
}