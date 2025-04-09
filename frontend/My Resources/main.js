import { GoogleGenerativeAI } from "@google/generative-ai";

const businessInfo = `
CBSE Class 1 - English Example
Topic: Singular and Plural
Definition:
Singular: When we talk about one person, place, or thing.
Plural: When we talk about more than one person, place, or thing.
Examples:
Singular: Dog → Plural: Dogs
Singular: Child → Plural: Children
Singular: Tomato → Plural: Tomatoes
Rule:
Add -s to most words: cat → cats
Add -es to words ending in s, sh, ch, x, o: box → boxes
Change y to i and add -es if the word ends in a consonant + y: baby → babies

CBSE Class 10 - History Example
Topic: The Rise of Nationalism in India
Definition: Nationalism is the feeling of unity and pride among people of a country.
Key Events:
Swadeshi Movement (1905): People boycotted British goods and promoted Indian industries.
Jallianwala Bagh Massacre (1919): British soldiers fired on peaceful protesters, leading to outrage across India.
Non-Cooperation Movement (1920): Led by Mahatma Gandhi, people refused to cooperate with the British government.
Quit India Movement (1942): A call for complete independence, forcing the British to leave India in 1947.
Impact: These movements united Indians and helped achieve independence.

CBSE Class 8 - Geography Example
Topic: Types of Natural Resources
Definition: Natural resources are things we get from nature and use in our daily lives.
Types:
1 Renewable Resources: Can be replaced naturally.
Examples: Sunlight, wind, forests, water.
2 Non-Renewable Resources: Limited in nature, take millions of years to form.
Examples: Coal, petroleum, minerals.
3 Human-Made Resources: Things made using natural resources.
Examples: Buildings, roads, machines.
Importance:
Used for food, energy, and daily needs.
Need to be conserved for future generations.

CBSE Class 6 - Science Example
Topic: Food and Its Sources
Definition: Food gives us energy to work and grow. It comes from plants and animals.
Types of Food Sources:
Plant-Based: Fruits, vegetables, grains, pulses, nuts.
Animal-Based: Milk, eggs, meat, fish, honey.
Functions of Food:
Energy-Giving Foods: Rice, wheat, sugar.
Body-Building Foods: Milk, eggs, fish.
Protective Foods: Fruits, vegetables, nuts.
Why is a Balanced Diet Important?
Keeps the body strong and healthy.
Prevents diseases and helps in growth.

FAQs
Q: How can I use this platform to study?
A: Select your class and subject from the dropdown, explore courses, and ask the chatbot any doubts.
Q: Can I download study materials?
A: Yes! You can download content for offline access and sync your progress when you’re online.
Q: How do I track my progress?
A: Click on your profile in the top-right corner to see completed and ongoing courses.
Q: How can I ask the chatbot questions?
A: Simply type your question in the chat window, and I'll provide an instant answer! 

Tone Instructions for the Chatbot
Young Students (Class 1-3): Use simple, short sentences with examples. Be encouraging.
Middle School Students (Class 4-8): Provide step-by-step explanations with examples. Keep it engaging.
High School Students (Class 9-10): Give clear, structured answers with key points. Provide real-world applications.
`;

const API_KEY = "AIzaSyBvhVtQSTq6fBDBx_NUFKz-zyzUk2TwGVQ";
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: `${businessInfo}\nEnsure clear paragraph breaks and proper formatting.`
});

let messages = { history: [] };

function detectLanguage(text) {
    const lowerText = text.toLowerCase();
    if (/[\u0980-\u09FF]/.test(text) && (lowerText.includes("হ্যালো") || lowerText.includes("নামতা") || !/[\u0900-\u097F]/.test(text))) return "bn"; // Bengali
    if (/[\u0900-\u097F]/.test(text) || lowerText.includes("हाय") || lowerText.includes("नमस्ते")) return "hi"; // Hindi
    if (/[ñ¿¡áéíóú]/.test(text) || lowerText.includes("hola")) return "es"; // Spanish
    if (/[çàâéèêëîïôûùü]/.test(text) || lowerText.includes("bonjour")) return "fr"; // French
    if (/[äöüß]/.test(text) || lowerText.includes("hallo")) return "de"; // German
    if (/[\u0400-\u04FF]/.test(text) || lowerText.includes("привет")) return "ru"; // Russian
    if (/[\u4E00-\u9FFF]/.test(text) || lowerText.includes("你好")) return "zh"; // Chinese (Simplified)
    if (/[\u3040-\u309F\u30A0-\u30FF]/.test(text) || lowerText.includes("こんにちは")) return "ja"; // Japanese
    if (/[\u0600-\u06FF]/.test(text) || lowerText.includes("مرحبا")) return "ar"; // Arabic
    if (/[\u0B00-\u0B7F]/.test(text) || lowerText.includes("ନମସ୍କାର")) return "or"; // Odia
    return "en"; // Default to English
}

// Translation function using Google Cloud Translation API
async function translateText(text, targetLang) {
    try {
        const response = await fetch(
            `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    q: text,
                    target: targetLang,
                    format: "text"
                })
            }
        );
        const data = await response.json();
        if (data.error) throw new Error(data.error.message);
        return data.data.translations[0].translatedText;
    } catch (error) {
        return text; // Fallback to original text
    }
}

// Detect explicit translation requests
function detectTranslationRequest(userMessage) {
    const lowerMessage = userMessage.toLowerCase();
    const languageMap = {
        "bengali": "bn",
        "hindi": "hi",
        "spanish": "es",
        "french": "fr",
        "german": "de",
        "russian": "ru",
        "chinese": "zh",
        "japanese": "ja",
        "arabic": "ar",
        "odia": "or",
        "english": "en"
    };

    for (const [language, code] of Object.entries(languageMap)) {
        if (lowerMessage.includes(`translate into ${language}`) || 
            lowerMessage.includes(`translate to ${language}`)) {
            return { targetLang: code, languageName: language };
        }
    }
    return null;
}

// Determine tone based on class level
function getToneForClassLevel(userMessage) {
    const messageLower = userMessage.toLowerCase();
    if (messageLower.includes("class 1") || messageLower.includes("class 2") || messageLower.includes("class 3")) {
        return "Young Students (Class 1-3): Use simple, short sentences with examples. Be encouraging.";
    } else if (messageLower.includes("class 4") || messageLower.includes("class 5") || messageLower.includes("class 6") || 
               messageLower.includes("class 7") || messageLower.includes("class 8")) {
        return "Middle School Students (Class 4-8): Provide step-by-step explanations with examples. Keep it engaging.";
    } else if (messageLower.includes("class 9") || messageLower.includes("class 10")) {
        return "High School Students (Class 9-10): Give clear, structured answers with key points. Provide real-world applications.";
    }
    return "General Tone: Maintain a friendly and clear tone.";
}

// Display message in the chat
function displayMessage(content, role) {
    document.querySelector(".chatbot-sidebar .chat").insertAdjacentHTML("beforeend", `
        <div class="${role}"><p>${content}</p></div>
    `);
}

// Handle sending messages
async function sendMessage() {
    const input = document.getElementById('chatInput');
    const userMessage = input.value.trim();

    if (!userMessage) return;

    input.value = "";
    displayMessage(userMessage, "user");
    document.querySelector(".chatbot-sidebar .chat").insertAdjacentHTML("beforeend", `<div class="loader"></div>`);

    const detectedLang = detectLanguage(userMessage);
    let prompt = userMessage;

    // Handle explicit translation requests
    const translationRequest = detectTranslationRequest(userMessage);
    if (translationRequest) {
        const requestText = userMessage.toLowerCase();
        const translateIndex = requestText.indexOf(`translate into ${translationRequest.languageName}`) !== -1
            ? requestText.indexOf(`translate into ${translationRequest.languageName}`) + `translate into ${translationRequest.languageName}`.length
            : requestText.indexOf(`translate to ${translationRequest.languageName}`) + `translate to ${translationRequest.languageName}`.length;
        let textToTranslate = userMessage.substring(translateIndex).trim();

        textToTranslate = textToTranslate.replace(/BENGALI-te:/i, "").trim();
        const textLang = detectLanguage(textToTranslate);

        let responseText;
        if (textLang === translationRequest.targetLang) {
            responseText = `This text is already in ${translationRequest.languageName}:\n\n${textToTranslate}`;
        } else {
            const translatedText = await translateText(textToTranslate, translationRequest.targetLang);
            responseText = `Here is the translated text in ${translationRequest.languageName}:\n\n${translatedText}`;
        }

        displayMessage(responseText, "model");
        document.querySelector(".chatbot-sidebar .chat .loader").remove();
        messages.history.push({ role: "user", parts: [{ text: userMessage }] });
        messages.history.push({ role: "model", parts: [{ text: responseText }] });
        return;
    }

    // Translate non-English prompts to English for the AI model
    if (detectedLang !== "en") {
        prompt = await translateText(userMessage, "en");
    }

    // Handle multiplication table requests
    const tableMatch = userMessage.match(/(\d+)\s*x\s*table/i);
    if (tableMatch) {
        const number = parseInt(tableMatch[1]);
        let table = `<div style="display: flex; flex-direction: column; gap: 5px;">`;
        for (let i = 1; i <= 10; i++) {
            table += `<p>${number} × ${i} = ${number * i}</p>`;
        }
        table += `</div>`;

        const intro = {
            "hi": `ठीक है! यहाँ ${number} की तालिका है:`,
            "es": `¡Vale! Aquí está la tabla de ${number}:`,
            "fr": `D'accord ! Voici la table de ${number} :`,
            "de": `Okay! Hier ist die Tabelle von ${number}:`,
            "ru": `Хорошо! Вот таблица для ${number}:`,
            "zh": `好的！这是 ${number} 的乘法表：`,
            "ja": `オーケー！${number}の掛け算表です：`,
            "ar": `حسنًا! هذه جدول ضرب ${number}:`,
            "bn": `ঠিক আছে! এখানে ${number}-এর নামতা দেওয়া হল:`,
            "or": `ଠିକ୍ ଅଛି! ଏଠାରେ ${number} ର ଗୁଣନାମା ଅଛି:`,
            "en": `Okay! Here is the table of ${number}:`
        }[detectedLang] || `Okay! Here is the table of ${number}:`;

        const responseText = `${intro}\n${table}`;
        displayMessage(responseText, "model");
        document.querySelector(".chatbot-sidebar .chat .loader").remove();
        messages.history.push({ role: "user", parts: [{ text: userMessage }] });
        messages.history.push({ role: "model", parts: [{ text: responseText }] });
        return;
    }

    // General query handling
    const toneInstruction = getToneForClassLevel(userMessage);
    const fullPrompt = `${prompt}\n\n${toneInstruction}`;
    const chat = model.startChat(messages);
    let result = await chat.sendMessageStream(fullPrompt);

    let fullResponse = "";
    for await (const chunk of result.stream) {
        fullResponse += chunk.text() + " ";
    }
    fullResponse = fullResponse.replace(/\*/g, "").replace(/\n{2,}/g, "</p><p>");

    if (detectedLang !== "en") {
        fullResponse = await translateText(fullResponse, detectedLang);
    }

    displayMessage(fullResponse, "model");
    document.querySelector(".chatbot-sidebar .chat .loader").remove();
    messages.history.push({ role: "user", parts: [{ text: userMessage }] });
    messages.history.push({ role: "model", parts: [{ text: fullResponse }] });
}

// Initialize chatbot and set up event listeners
function initializeChatbot() {
    // DOM elements
    const chatbotBtn = document.getElementById('chatbotBtn');
    const sendBtn = document.getElementById('sendBtn');
    const chatInput = document.getElementById('chatInput');
    const chatbotSidebar = document.getElementById('chatbotSidebar');
    const micBtn = document.getElementById('micBtn');
    const homeBtn = document.getElementById('homeBtn'); // Home button
    const dashBtn = document.getElementById('dashBtn'); // Dashboard button

    // Toggle chatbot sidebar
    if (chatbotBtn && chatbotSidebar) {
        chatbotBtn.addEventListener('click', () => {
            chatbotSidebar.classList.toggle('open');
        });
    }

    // Send message on button click
    if (sendBtn) {
        sendBtn.addEventListener('click', sendMessage);
    }

    // Send message on Enter key (Shift+Enter for new line)
    if (chatInput) {
        chatInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                sendMessage();
            }
        });
    }

    // Redirect to Home2.html on Home button click
    if (homeBtn) {
        homeBtn.addEventListener('click', (event) => {
            event.preventDefault(); // Prevent any default behavior
            try {
                window.location.href = './Home2/Home2.html'; // Redirect to Home2.html
            } catch (error) {
                displayMessage('Error: Unable to redirect to Home page. Please check if Home2.html exists.', 'model');
            }
        });
    }

    // Redirect to Dashboard.html on Dashboard button click
    if (dashBtn) {
        dashBtn.addEventListener('click', (event) => {
            event.preventDefault(); // Prevent any default behavior
            console.log('Dashboard button clicked'); // Log for debugging
            try {
                window.location.href = './Dashboard/Dashboard.html'; // Redirect to Dashboard.html
            } catch (error) {
                displayMessage('Error: Unable to redirect to Dashboard page. Please check if Dashboard.html exists.', 'model');
            }
        });
    }

    // Speech-to-Text setup
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition && micBtn) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        micBtn.addEventListener('click', () => {
            if (micBtn.classList.contains('listening')) {
                recognition.stop();
            } else {
                recognition.start();
                micBtn.classList.add('listening');
            }
        });

        recognition.onresult = (event) => {
            chatInput.value = event.results[0][0].transcript;
            micBtn.classList.remove('listening');
            sendMessage();
        };

        recognition.onend = () => {
            micBtn.classList.remove('listening');
            if (chatInput.value.trim()) {
                sendMessage();
            }
        };

        recognition.onerror = () => {
            chatInput.value = 'Sorry, I couldn’t understand. Please try again.';
            micBtn.classList.remove('listening');
            sendMessage();
        };
    } else if (micBtn) {
        micBtn.style.display = 'none';
    }
}

export { sendMessage, initializeChatbot };
