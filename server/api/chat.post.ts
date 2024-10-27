import { reasoning } from '../../workflow/index'
import type { H3Event } from 'h3'

function validateConfig(config: any) {
  const requiredFields = [
    'MODEL_NAME',
    'API_KEY',
    'API_VERSION',
    'HELICONE_API_KEY'
  ];

  for (const field of requiredFields) {
    if (config[field] === undefined || !(field in config)) {
      console.error(`配置错误: ${field} 未定义`);
      return { status: false, field };
    }
  }
  if ((config['ENDPOINT'] === undefined || !('ENDPOINT' in config)) && (config['AZURE_OPENAI_ENDPOINT'] === undefined || !('AZURE_OPENAI_ENDPOINT' in config))) {
    console.error(`配置错误: ENDPOINT 未定义`);
    return { status: false, field: 'ENDPOINT' };
  }

  return { status: true };
}

function sendStream(event: H3Event, stream: ReadableStream) {
  // Mark to prevent h3 handling response
  event._handled = true

  // Workers (unenv)
  // @ts-expect-error _data will be there.
  event.node.res._data = stream

  if (event.node.res.socket) {
    stream.pipeTo(
      new WritableStream({
        write(chunk) {
          event.node.res.write(chunk)
        },
        close() {
          event.node.res.end()
        }
      })
    )
  }
}

export default defineEventHandler(async (event) => {
  setResponseHeaders(event, {
    'Access-Control-Allow-Methods': 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Headers':
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
    'Access-Control-Expose-Headers': '*'
  })
  if (getMethod(event) === 'OPTIONS') {
    event.res.statusCode = 204
    event.res.statusMessage = 'No Content.'
    return 'OK'
  }

  const body = await readBody(event)
  if (!body) {
    return { error: 'no payload' }
  }

  const config = useRuntimeConfig()
  const validateRes = validateConfig(config)
  if (!validateRes.status) {
    return { error: `missing ${validateRes.field} field.` }
  }

  const question = body.question;
  const agents = reasoning(config, question);

  try {
    return sendStream(event, agents.stream);
  } catch {
    agents.cancel();
  }
})