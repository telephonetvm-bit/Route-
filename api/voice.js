export default async function handler(req, res) {
  // 1. Настройка CORS для разрешения запросов с Тильды
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // 2. Обработка предварительного запроса (Preflight) от браузера
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Допускаются только POST-запросы' });
  }

  try {
    // Получаем сообщения с вашего сайта, либо используем дефолтные
    const userMessages = req.body.messages || [{"role": "user", "content": "Расскажи о зарождении вселенной"}];

    // 3. Скрытый запрос к RouterAI с вашим ключом
    const response = await fetch("https://routerai.ru/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer sk-_NeJR429pfFdgRVvOPXX2PQK_-OKWWOa"
      },
      body: JSON.stringify({
        model: "openai/gpt-audio-mini",
        modalities: ["text", "audio"],
        messages: userMessages,
        audio: {
          voice: "alloy",
          format: "pcm16"
        },
        stream: false // Отключено для упрощения. Получать аудио целиком на фронтенд легче, чем собирать стриминг по чанкам.
      })
    });

    if (!response.ok) {
      throw new Error(`Ошибка RouterAI: ${response.statusText}`);
    }

    // 4. Возвращаем результат обратно на Тильду
    const data = await response.json();
    res.status(200).json(data);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
