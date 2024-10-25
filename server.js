const express = require('express');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');
const dotenv = require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());


const MODEL_NAME = "gemini-pro";
const API_KEY = process.env.API_KEY;


async function runChat(userInput) {
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const generationConfig = {
    temperature: 0.9,
    topK: 1,
    topP: 1,
    maxOutputTokens: 1000,
  };

  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
   
  ];

  const chat = model.startChat({
    generationConfig,
    safetySettings,
    history: [
     
      {
        role: "user",
        parts: [{
          text: "quero que responda de maneira curta e resumida. priemiro envie uma mensagem pra capture o email e nome, Após capturar o nome e e-mail, pergunte qual a duvida: pode criar Links fictícios para acessar informações detalhadas e preencher formulários para solicitações de serviços públicos (ex.: 'www.caruaru.gov.br/formularios').\n\nSe o usuário precisar de algo mais específico ou personalizado, você pode redirecioná-lo ou orientá-lo sobre os melhores canais para atendimento, sempre respondendo de forma clara e objetiva. Além disso, mais informações úteis: A Prefeitura de Caruaru oferece diversos serviços e informações úteis para facilitar o atendimento e a interação com os cidadãos. Nosso Centro de Atendimento ao Cidadão, localizado na Rua do Cidadão, 123, no Centro, funciona de segunda a sexta-feira, das 8h às 17h. Já a Secretaria de Educação, na Avenida Educação, 500, atende de segunda a sexta-feira, das 9h às 16h, enquanto a Secretaria de Saúde está disponível de segunda a sexta-feira, das 8h às 18h, na Rua da Saúde, 789, Bairro da Esperança. Para outras secretarias e setores, recomendamos entrar em contato via e-mail ou telefone, disponíveis ao final deste documento.\n\nEm relação aos serviços de saúde, a cidade conta com uma rede de Unidades Básicas de Saúde espalhadas em diversos bairros; é possível localizar a unidade mais próxima acessando www.caruaru.gov.br/ubs. O Hospital Municipal Caruaruense, situado na Rua da Saúde, 1000, no Bairro Hospitalar, oferece pronto atendimento 24 horas. Para agendar consultas ou conferir as campanhas de vacinação, acesse www.caruaru.gov.br/saude/agendamentos e www.caruaru.gov.br/saude/vacinacao.\n\nPara um atendimento mais ágil, a prefeitura disponibiliza o Portal de Atendimento Digital. Nele, você pode solicitar a segunda via de documentos, marcar atendimentos em várias secretarias e acessar serviços de autoatendimento em www.caruaru.gov.br/atendimento. Já para quem utiliza o transporte público, oferecemos informações sobre horários e rotas de ônibus, que podem ser consultados em www.caruaru.gov.br/transporte. As estações de integração, nos bairros Centro e Novo, permitem uma mobilidade mais eficiente, e os cidadãos podem se cadastrar para o sistema de bilhetagem eletrônica em www.caruaru.gov.br/bilhetagem.\n\nNo quesito localização dos setores, cada área de atendimento tem um endereço estratégico para facilitar o acesso da população. Exemplos incluem a Unidade Básica de Saúde Centro, na Rua da Vida, 22, o CRAS (Centro de Referência de Assistência Social) na Rua do Amparo, 400, e a Secretaria de Cultura, na Avenida do Artesanato, 300, Bairro Histórico. Para mapas e orientações detalhadas, consulte www.caruaru.gov.br/mapas.\n\nAlém disso, a prefeitura fornece uma lista de contatos úteis para setores específicos, como a Ouvidoria Municipal e o Atendimento ao Cidadão, assegurando que cada cidadão receba atendimento de forma rápida e personalizada. Em caso de dúvidas sobre qualquer serviço, consulte www.caruaru.gov.br/contatos para obter e-mails e telefones atualizados. Quero que responda de forma resumida, e sem usar o * pra ate um idoso entender"
        }]
      },
    ],
  });

  const result = await chat.sendMessage(userInput);
  const response = result.response;
  return response.text();
}


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.use(express.static('public'));

// Serve the loader image
app.get('/loader.gif', (req, res) => {
  res.sendFile(__dirname + '/loader.gif');
});


app.post('/chat', async (req, res) => {
  try {
    const userInput = req.body?.userInput;
    console.log('incoming /chat req', userInput);

    if (!userInput) {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    const response = await runChat(userInput);
    res.json({ response });
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
