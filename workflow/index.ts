import OpenAI from 'openai';
import { Ling } from "../ling/index";

interface envConfig {
  AZURE_OPENAI_ENDPOINT: string, MODEL_NAME: string, API_KEY: string, API_VERSION: string, HELICONE_API_KEY: string
}

const createAnswerBot = (ling: Ling, question: string, answers: string = '') => {
  const bot3 = ling.createBot('answer', undefined, { response_format: { type: 'text' } });
  bot3.addPrompt('请你根据我的问题和思考过程，给出最终答案。请深呼吸，一步一步慢慢来');
  bot3.chat('我的提问：' + question + answers ? ('\n\n思考过程：' + answers) : '');
  bot3.on('response', (content) => {
    // 流数据推送完成
    // console.log('bot3 response finished', content);
  });
}

const createReasoningBot = (ling: Ling, question: string, answers: string = '', times: number = 0) => {
  const bot = ling.createBot('reasoningList/' + times);
  bot.addPrompt(`你是一个复杂问题处理大师，擅长把复杂问题分解成简单的问题，逐步分析和思考，并给出思路。现在请你分析我的问题，并根据之前的思考过程，给出当前的思考和下一步行动。请以json格式响应，确保 next_action 字段具有值 step 或 final_answer。
example:
{   "title": "Title of a step",   "briefContent": "Short description of the thought in this step",   "next_action": "step" }
如果整个思考过程基本完成，可以将 next_action 指定为 final_answer。`+ (!!answers ? `我的提问：${question}` : ''));
  !!answers && bot.addHistory([bot.botMessage(answers)])
  bot.chat(!!answers ? '请根据上面的思考继续给出当前的思考，并告诉我是需要进一步思考还是直接让大模型给出答案。' : `我的提问：${question}`);
  bot.on('inference-done', (content) => {
    const reasoning = JSON.parse(content)
    // console.log(`bot${times} inference-done`, reasoning);
    const reasoningAnswers = answers + '\n\n' + reasoning.title + ':\n' + reasoning.briefContent
    if (times <= 5 && reasoning?.next_action == 'step') {
      createReasoningBot(ling, question, reasoningAnswers, times + 1)
    } else {
      createAnswerBot(ling, question, reasoningAnswers)
    }
  });
}

export function reasoning(config: envConfig, question: string, sse: boolean = false) {
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
  createReasoningBot(ling, question)

  ling.on('message', (message) => {
    // console.log('ling message', message);
  });

  ling.close(); // 可以直接关闭，关闭时会检查所有bot的状态是否都完成了

  return ling;
}