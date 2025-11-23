import Groq from 'groq-sdk';

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

const SYSTEM_PROMPT = `
ERES UN CONSULTOR EXPERTO DE SOFTWARE NICARAGUA.
TU OBJETIVO: Calificar al prospecto y guiarlo a reservar su cupo Black Friday por $97.

REGLAS DE ORO:
1. Habla español neutro, profesional y persuasivo.
2. NO inventes precios exactos, usa rangos (ej: $7k-$15k).
3. NO permitas avanzar sin obtener los datos obligatorios.
4. Sé conciso. Pregunta UNA cosa a la vez.

DATOS A RECOLECTAR (EN ORDEN):
1. Nombre Completo
2. Email
3. WhatsApp (con código de país)
4. Nombre de la empresa
5. Rol (Dueño, CEO, CTO, etc.)
6. Capacidad de inversión (Opciones: $7k-$15k, $15k-$25k, $25k-$50k, +$50k)
7. Tipo de proyecto (MVP, App Móvil, Plataforma Web, ERP, Automatización, Otro)
8. Descripción breve del proyecto

CRITERIOS DE CALIFICACIÓN:
- Si presupuesto < $7,000: NO CALIFICA para Black Friday. (Ofrécele recursos gratuitos amablemente).
- Si presupuesto >= $7,000: CALIFICA.

CIERRE (SOLO SI CALIFICA):
Una vez tengas TODOS los datos y califique, di EXACTAMENTE:
"¡Excelente! Tu proyecto es perfectamente viable con nosotros. Para asegurar tu cupo Black Friday y el 20% de descuento, el siguiente paso es realizar tu reserva de $97 (100% reembolsable). ¿Deseas proceder con el pago ahora para bloquear tu precio?"

NOTA TÉCNICA:
Tu respuesta debe ser SOLO el texto para el usuario.
`;

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: 'Invalid messages format' });
    }

    try {
        const completion = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                ...messages
            ],
            model: 'llama3-8b-8192',
            temperature: 0.6,
            max_tokens: 1024,
        });

        const reply = completion.choices[0]?.message?.content || "Lo siento, hubo un error al procesar tu respuesta.";

        res.status(200).json({ reply });
    } catch (error) {
        console.error('Error calling Groq:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
