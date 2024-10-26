import OpenAI from 'openai';
import { Ling } from "../ling/index";

interface envConfig {
  AZURE_OPENAI_ENDPOINT: string, MODEL_NAME: string, API_KEY: string, API_VERSION: string, HELICONE_API_KEY: string
}

export function reasoning(config: envConfig,question: string, sse: boolean = false) {
  const { AZURE_OPENAI_ENDPOINT, MODEL_NAME, API_KEY, API_VERSION, HELICONE_API_KEY } = config;
  
  const apiVersion = API_VERSION || "2024-08-01-preview";
  const client = new OpenAI({
    baseURL: "https://oai.helicone.ai/openai/deployments/" + MODEL_NAME,
    apiKey: API_KEY,
    defaultHeaders: {
      "Helicone-Auth": `Bearer ${HELICONE_API_KEY}`,
      "Helicone-OpenAI-API-Base": AZURE_OPENAI_ENDPOINT,
      "api-key": API_KEY,
    },
    defaultQuery: { "api-version": apiVersion },
  })

  const ling = new Ling(client);
  ling.setSSE(sse);

  // 工作流
  const bot = ling.createBot();
  bot.addPrompt('你用JSON格式回答我，以{开头\n[Example]\n{"answer": "我的回答"}');
  bot.chat(question);
  bot.on('string-response', ({uri, delta}) => {
    console.log('bot string-response', uri, delta);

    const bot2 = ling.createBot();
    bot2.addPrompt('将我给你的内容扩写成更详细的内容，用JSON格式回答我，将解答内容的详细文字放在\'details\'字段里，将2-3条相关的其他知识点放在\'related_question\'字段里。\n[Example]\n{"details": "我的详细回答", "related_question": ["相关知识内容",...]}');
    bot2.chat(delta);
    bot2.on('response', (content) => {
      // 流数据推送完成
      console.log('bot2 response finished', content);
    });

    const bot3 = ling.createBot('test',undefined,{response_format:{ type: 'text' }});
    bot3.addPrompt('将我给你的内容**用英文**扩写成更详细的内容');
    bot3.chat(delta);
    bot3.on('response', (content) => {
      // 流数据推送完成
      console.log('bot3 response finished', content);
    });
  });

  // const bot3 = ling.createBot('test', undefined, { response_format: { type: 'text' } });
  // bot3.addPrompt('将我给你的内容**用英文**扩写成更详细的内容');
  // bot3.chat(question);
  // bot3.on('response', (content) => {
  //   // 流数据推送完成
  //   console.log('bot3 response finished', content);
  // });

  ling.on('message', (message) => {
    console.log('ling message', message);
  });

  ling.close(); // 可以直接关闭，关闭时会检查所有bot的状态是否都完成了

  return ling;
}