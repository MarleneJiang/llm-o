import OpenAI from 'openai';

import type { ChatConfig, ChatOptions } from '../../types';
import { Tube } from '../../tube';
import { JSONParser } from '../../parser';
import { sleep } from '../../utils';

const DEFAULT_CHAT_OPTIONS = {
  temperature: 0.9,
  top_p: 1,
  frequency_penalty: 0,
  presence_penalty: 0,
};

export async function getChatCompletions(
  tube: Tube,
  messages: any[],
  client: OpenAI,
  config: ChatConfig,
  options?: ChatOptions,
  onComplete?: (content: string) => void,
  onStringResponse?: (content: {uri: string|null, delta: string} | string) => void
) {
  options = {...DEFAULT_CHAT_OPTIONS, ...options};
  options.max_tokens = options.max_tokens || config.max_tokens || 4096; // || 16384;

  const isQuiet: boolean = !!options.quiet;
  delete options.quiet;

  const isJSONFormat = options.response_format?.type === 'json_object';
  const { model_name } = config as ChatConfig;
  const model = model_name || '';
  const parentPath = options.response_format?.root;
  delete options.response_format.root;

  const events = await client.chat.completions.create({
    messages,
    ...options,
    model,
    stream: true,
    stream_options: {
      include_usage: true,
    },
  });

  let content = '';
  const buffer: any[] = [];
  let done = false;

  let parser: JSONParser | undefined;
  
  if (isJSONFormat) {
    parser = new JSONParser({
      parentPath,
      autoFix: true,
    });
    parser.on('data', (data) => {
      buffer.push(data);
    });
    parser.on('string-resolve', (content) => {
      if (onStringResponse) onStringResponse(content);
    });
  }

  const promises: any[] = [
    (async () => {
      for await (const event of events) {
        if (tube.canceled) break;
        const choice = event.choices[0];
        if (choice && choice.delta) {
          if (choice.delta.content) {
            content += choice.delta.content;
            if (parser) { // JSON format
              parser.trace(choice.delta.content);
            } else {
              buffer.push({ uri: parentPath, delta: choice.delta.content });
            }
          }
        }
      }
      done = true;
      if (parser) {
        parser.finish();
      }
    })(),
    (async () => {
      let i = 0;
      while (!(done && i >= buffer.length)) {
        if (i < buffer.length) {
          tube.enqueue(buffer[i], isQuiet);
          i++;
        }
        const delta = buffer.length - i;
        if (done || delta <= 0) await sleep(10);
        else await sleep(Math.max(10, 1000 / delta));
      }
      if (!tube.canceled && onComplete) onComplete(content);
    })(),
  ];
  await Promise.race(promises);
  if (!isJSONFormat && onStringResponse) onStringResponse({ uri: parentPath, delta: content });
  return content; // inference done
}