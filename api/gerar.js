export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { imagemBase64, imagemTipo, preco, tamanhos } = req.body;

  if (!imagemBase64 || !preco) {
    return res.status(400).json({ error: 'Foto e preço são obrigatórios' });
  }

  const prompt = `Você é especialista em marketing para lojas de roupas infantis brasileiras.

Analise a foto desta peça infantil e crie conteúdo completo para a Maricota Store.

Informações:
- Preço: ${preco}
- Tamanhos: ${tamanhos || 'não informado'}
- Slogan da marca: "Para voar com estilo desde cedo"

Use gatilhos de venda reais: escassez, urgência, prova social, exclusividade, benefício emocional para mães.

Gere exatamente estes 4 formatos separados assim:

=== STORIES ===
Crie uma sequência de 5 stories criativos e envolventes. Cada story numerado. Use gatilhos de venda, emojis, linguagem próxima de mãe para mãe. Inclua CTA no último story.

=== FEED ===
Legenda completa para post no feed do Instagram. Começo que para o scroll, descrição da peça baseada na foto, gatilhos de venda, hashtags relevantes e CTA.

=== REELS ===
Roteiro completo cena por cena. Inclua: o que mostrar na câmera, o que falar (texto falado), duração de cada cena, música sugerida. Tom autêntico, não parece IA.

=== WHATSAPP ===
Mensagem para lista de transmissão. Curta, direta, com senso de urgência e link de compra no final.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-opus-4-6',
        max_tokens: 3000,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: imagemTipo,
                data: imagemBase64
              }
            },
            {
              type: 'text',
              text: prompt
            }
          ]
        }]
      })
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || 'Erro na API' });
    }

    return res.status(200).json({ content: data.content[0].text });
  } catch (error) {
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}
