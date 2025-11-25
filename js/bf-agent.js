
// Supabase Configuration
const SUPABASE_URL = 'https://ytrqzsnzixkgqkczdksl.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0cnF6c256aXhrZ3FrY3pka3NsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4NDgyMjAsImV4cCI6MjA3OTQyNDIyMH0.IUktvXiH6HyBRLduFmeCupX1pPEt2dlHgRINNyYcI7k';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Chat State
const chatState = {
    history: [],
    currentStep: 0,
    totalSteps: 5,
    data: {
        nombre: '',
        email: '',
        whatsapp: '',
        empresa: '',
        rol: '',
        presupuesto: '',
        tipo_proyecto: '',
        descripcion: '',
        metodo_pago: ''
    }
};

// Validation Functions
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPhone(phone) {
    // Accept international format with + and numbers
    const phoneRegex = /^\+?[1-9]\d{7,14}$/;
    return phoneRegex.test(phone.replace(/[\s-]/g, ''));
}

function isValidBudget(budget) {
    const budgetLower = budget.toLowerCase();
    // Accept formats like: $3k, 3000, 3k, $3,000, etc.
    const hasValidRange = budgetLower.includes('3k') || budgetLower.includes('7k') ||
        budgetLower.includes('15k') || budgetLower.includes('25k') ||
        budgetLower.includes('50k');

    // Extract number if present
    const numMatch = budget.match(/\d+/);
    if (numMatch) {
        const num = parseInt(numMatch[0]);
        // Accept if >= 3000
        return num >= 3000 || hasValidRange;
    }

    return hasValidRange;
}

// DOM Elements
const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const paymentModal = document.getElementById('payment-modal');

// Initial Message
function initChat() {
    // Add initial greeting if history is empty
    if (chatState.history.length === 0) {
        updateProgressIndicator();
        addMessage("Hola 👋 Soy el Consultor IA de Software Nicaragua.\n\n📋 Te haré 5 preguntas rápidas para asegurar tu cupo Black Friday.\n\n¿Cuál es tu nombre completo?", 'agent');
        chatState.history.push({ role: 'assistant', content: "Hola 👋 Soy el Consultor IA de Software Nicaragua. ¿Cuál es tu nombre completo?" });
    }
}

// Progress Indicator
function updateProgressIndicator() {
    let progressHTML = '<div class="chat-progress">';
    for (let i = 1; i <= chatState.totalSteps; i++) {
        const isActive = i <= chatState.currentStep;
        const isCurrent = i === chatState.currentStep;
        progressHTML += `<div class="progress-step ${isActive ? 'active' : ''} ${isCurrent ? 'current' : ''}">${i}</div>`;
    }
    progressHTML += '</div>';

    // Remove old progress indicator
    const oldProgress = chatMessages.querySelector('.chat-progress');
    if (oldProgress) oldProgress.remove();

    // Add new one at the top
    chatMessages.insertAdjacentHTML('afterbegin', progressHTML);
}

// Handle Input
function handleKeyPress(event) {
    if (event.key === 'Enter') sendMessage();
}

async function sendMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    // Validation based on current step
    const step = chatState.history.filter(m => m.role === 'assistant').length;

    // Step 2: Email validation
    if (step === 2 && !isValidEmail(text)) {
        addMessage("⚠️ Por favor ingresa un correo electrónico válido (ejemplo: tu@email.com)", 'agent');
        return;
    }

    // Step 3: Phone validation
    if (step === 3 && !isValidPhone(text)) {
        addMessage("⚠️ Por favor ingresa un número de WhatsApp válido con código de país (ejemplo: +50512345678)", 'agent');
        return;
    }

    // Step 6: Budget validation
    if (step === 6 && !isValidBudget(text)) {
        addMessage("⚠️ Para calificar, el presupuesto mínimo es de $3,000 USD. Por favor indica un presupuesto válido (ejemplo: $5k, $10k, $15k, etc.)", 'agent');
        return;
    }

    // 1. Add User Message
    addMessage(text, 'user');
    userInput.value = '';
    chatState.history.push({ role: 'user', content: text });

    // Update progress
    if (step <= chatState.totalSteps) {
        chatState.currentStep = step;
        updateProgressIndicator();
    }

    // 2. Show Typing
    const loadingId = addMessage('Escribiendo...', 'agent', true);

    try {
        // 3. Call API
        let data;
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: chatState.history })
            });
            if (!response.ok) throw new Error('Network response was not ok');
            data = await response.json();
        } catch (fetchError) {
            console.warn('API Call failed (likely local dev), using mock response:', fetchError);
            // Mock Response Logic for Local Testing
            await new Promise(r => setTimeout(r, 1000)); // Simulate delay
            data = { reply: getMockReply(chatState.history) };
        }

        removeMessage(loadingId);

        if (data.reply) {
            addMessage(data.reply, 'agent');
            chatState.history.push({ role: 'assistant', content: data.reply });

            // 4. Check for Qualification Trigger
            // If the agent asks for payment or mentions the $97 reservation explicitly as the next step
            if (data.reply.includes('$97') && (data.reply.includes('proceder') || data.reply.includes('reserva'))) {
                // Extract data before showing modal
                extractDataFromHistory();

                setTimeout(() => {
                    showPaymentModal();
                }, 2000);
            }
        }
    } catch (error) {
        console.error('Error:', error);
        removeMessage(loadingId);
        addMessage("Error de conexión. Intenta de nuevo.", 'agent');
    }
}

// Mock Logic for Local Dev
function getMockReply(history) {
    const lastUserMsg = history[history.length - 1].content.toLowerCase();
    const step = history.filter(m => m.role === 'assistant').length;

    // Simple linear flow for testing
    if (step === 1) return "✅ Perfecto. ¿Cuál es tu correo electrónico para enviarte la información?";
    if (step === 2) return "📱 Excelente. ¿Me podrías dar tu número de WhatsApp con código de país? (ejemplo: +50512345678)";
    if (step === 3) return "🏢 ¿Cuál es el nombre de tu empresa?";
    if (step === 4) return "👤 ¿Cuál es tu rol en la empresa? (Ej: Dueño, CEO, CTO, Gerente)";
    if (step === 5) return "💰 ¿Cuál es tu presupuesto estimado?\n\nOpciones:\n• $3k-$7k\n• $7k-$15k\n• $15k-$25k\n• +$50k";
    if (step === 6) {
        return "🚀 Perfecto. ¿Qué tipo de proyecto deseas desarrollar? (App Móvil, Plataforma Web, Sistema ERP, etc.)";
    }
    if (step === 7) return "📝 Por último, descríbeme brevemente tu idea o proyecto.";

    return "🎉 ¡Excelente! Tu proyecto califica perfectamente.\n\n✨ Para asegurar tu cupo Black Friday con 20% de descuento y comenzar ANTES QUE TERMINE EL AÑO, realiza tu reserva de $97 (100% reembolsable).\n\n⏰ Confirmaremos tu primera reunión en las próximas 3 horas.\n\n¿Deseas proceder con el pago ahora?";
}

function addMessage(text, sender, isLoading = false) {
    const div = document.createElement('div');
    div.classList.add('message', sender);
    div.textContent = text;
    if (isLoading) div.id = 'loading-' + Date.now();
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return div.id;
}

function removeMessage(id) {
    if (id) document.getElementById(id)?.remove();
}

// Data Extraction (Basic Heuristic)
function extractDataFromHistory() {
    // In a real scenario, we would ask the LLM to output JSON.
    // Here we will try to grab the email if present in the last few messages.
    const emailRegex = /[\w.-]+@[\w.-]+\.\w+/;

    chatState.history.forEach(msg => {
        if (msg.role === 'user') {
            if (emailRegex.test(msg.content)) {
                chatState.data.email = msg.content.match(emailRegex)[0];
            }
            // We could add more regex for phone, etc.
            // For now, we rely on the conversation log being saved.
        }
    });
}

// Payment Modal
function showPaymentModal() {
    paymentModal.style.display = 'flex';
    // Save lead as "Qualified / Pending Payment"
    saveLead('pendiente');
}

async function selectPayment(method) {
    chatState.data.metodo_pago = method;

    // Update Lead
    await saveLead('pendiente_pago_' + method);

    // Handle specific methods
    if (method === 'PayPal') {
        // Close modal first
        paymentModal.style.display = 'none';
        addMessage(`💳 Redirigiendo a PayPal para procesar tu pago de $97...`, 'agent');
        
        // Track conversion in Facebook Pixel - evento de inicio de compra
        if (typeof fbq !== 'undefined') {
            fbq('track', 'InitiateCheckout', {value: 97.00, currency: 'USD'});
        }
        
        // Redirect to PayPal after a short delay
        setTimeout(() => {
            // PayPal button redirige automáticamente a la página de gracias configurada en PayPal
            // El botón de PayPal ya está configurado para redirigir a https://softwarenicaragua.com/gracias/
        }, 1500);
    } else if (method === 'CashApp') {
        addMessage(`💵 Envía tu pago de $97 a Cash App: **$softnicaragua**\n\n📸 Envía el comprobante al WhatsApp: +50588241003`, 'agent');
        setTimeout(() => {
            window.open('https://wa.me/50588241003?text=Hola,%20ya%20realicé%20el%20pago%20de%20$97%20por%20Cash%20App', '_blank');
        }, 1000);
    } else if (method === 'Transferencia') {
        addMessage(`🏦 Para obtener los datos de transferencia bancaria, contáctanos por WhatsApp.`, 'agent');
        setTimeout(() => {
            window.open('https://wa.me/50588241003?text=Hola,%20necesito%20los%20datos%20para%20transferencia%20bancaria', '_blank');
        }, 1000);
    }

    // Close modal and show success message in chat
    paymentModal.style.display = 'none';
    addMessage("✅ ¡Perfecto! Tu cupo Black Friday está CONFIRMADO.\n\n📞 Te contactaremos vía WhatsApp en las próximas 3 horas para confirmar tu primera reunión.\n\n🎯 Comenzaremos tu proyecto antes que termine el año.", 'agent');
}

// Save to Supabase
async function saveLead(estado) {
    const leadData = {
        email: chatState.data.email || null,
        metodo_pago: chatState.data.metodo_pago || null,
        estado: estado,
        conversation_log: chatState.history
        // created_at is auto-generated by Supabase, don't include it
    };

    try {
        const { data, error } = await supabase
            .from('bf_black_friday_2025')
            .insert([leadData]);

        if (error) {
            console.error('Supabase Error:', error);
        } else {
            console.log('Lead Saved Successfully:', data);
        }
    } catch (err) {
        console.error('Unexpected Error:', err);
    }
}

// Start Chat on Load
initChat();
