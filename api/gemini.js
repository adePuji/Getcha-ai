export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method tidak diizinkan' });
    }

    let apiKey = req.headers["x-gemini-api-key"] || req.headers["authorization"];
    if (typeof apiKey === "string" && apiKey.startsWith("Bearer ")) {
        apiKey = apiKey.substring(7);
    }

    if (!apiKey) {
        apiKey = process.env.GEMINI_API_KEY;
    }

    if (!apiKey) {
        return res.status(401).json({ error: "Gemini API Key tidak terdeteksi. Silakan masukkan API Key gratis Anda melalui tombol 🔑 API Key di sudut kanan atas halaman aplikasi." });
    }

    const { systemPrompt, userQuery } = req.body;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: userQuery }] }],
                systemInstruction: { parts: [{ text: systemPrompt }] },
                generationConfig: { temperature: 0.7 }
            })
        });

        const data = await response.json();
        
        if (data.error) {
            return res.status(400).json({ error: data.error.message });
        }

        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ error: 'Gagal menghubungi server Google AI Studio' });
    }
}
