
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method not allowed");
  }

  const apiKey = process.env.STABILITY_API_KEY;

  if (!apiKey) {
    return res.status(500).send("API key is not configured");
  }

  try {
    const { prompt, style, aspect_ratio } = req.body || {};

    if (
      typeof prompt !== "string" ||
      !prompt.trim() ||
      prompt.length > 1000
    ) {
      return res.status(400).send("Некорректное описание");
    }

    const styles = [
      "photographic",
      "cinematic",
      "anime",
      "digital-art",
      "fantasy-art",
      "3d-model",
      "pixel-art"
    ];

    const ratios = [
      "1:1",
      "16:9",
      "9:16",
      "3:2",
      "2:3"
    ];

    const form = new FormData();

    form.append("prompt", prompt.trim());
    form.append("output_format", "png");

    if (styles.includes(style)) {
      form.append("style_preset", style);
    }

    if (ratios.includes(aspect_ratio)) {
      form.append("aspect_ratio", aspect_ratio);
    }

    const response = await fetch(
      "https://api.stability.ai/v2beta/stable-image/generate/core",
      {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + apiKey,
          "Accept": "image/*"
        },
        body: form
      }
    );

    if (!response.ok) {
      const error = await response.text();
      return res.status(response.status).send(error.slice(0, 1500));
    }

    const image = Buffer.from(
      await response.arrayBuffer()
    );

    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "no-store");

    return res.status(200).send(image);

  } catch (error) {
    console.error(error);
    return res.status(500).send("Ошибка сервера");
  }
}
