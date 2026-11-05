export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Метод не поддерживается"
    });
  }

  try {
    const { prompt, style, aspect_ratio } = req.body || {};

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({
        error: "Введите описание изображения"
      });
    }

    const apiKey = process.env.STABILITY_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "API-ключ не настроен на сервере"
      });
    }

    const form = new FormData();

    form.append("prompt", prompt);
    form.append("output_format", "png");

    if (style && style !== "none") {
      form.append("style_preset", style);
    }

    const allowedRatios = [
      "1:1", "16:9", "9:16", "3:2", "2:3"
    ];

    if (allowedRatios.includes(aspect_ratio)) {
      form.append("aspect_ratio", aspect_ratio);
    }

    const response = await fetch(
      "https://api.stability.ai/v2beta/stable-image/generate/core",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Accept": "image/*"
        },
        body: form
      }
    );

    if (!response.ok) {
      const errorText = await response.text();

      return res.status(response.status).json({
        error: "Stability AI: " + errorText
      });
    }

    const imageBuffer = Buffer.from(
      await response.arrayBuffer()
    );

    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "no-store");

    return res.status(200).send(imageBuffer);

  } catch (error) {
    return res.status(500).json({
      error: error.message || "Ошибка сервера"
    });
  }
}
