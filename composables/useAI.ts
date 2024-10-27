import { set, get } from 'jsonuri';
export default function () {

  const response = reactive({
    errMessage: '',
    reasoningList: [],
    answer: ''
  } as any);
  const done = ref(true);

  const chat = async (question: string) => {
    done.value=false;
    response.reasoningList = [];
    response.answer = ''
    response.errMessage = ''
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        question
      }),
    });
    if (!res.body) {
      return
    }
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    while (!done.value) {
      const { value, done: doneReading } = await reader.read();
      done.value = doneReading;
      if (!done.value) {
        const content = decoder.decode(value);
        const lines = content.trim().split('\n');
        for (const line of lines) {
          const input = JSON.parse(line);
          if (input.uri) {
            const content = get(response, input.uri);
            set(response, input.uri, (content || '') + input.delta);
          }
        }
      }
    }
  }

  return {
    response,
    chat,
    done
  };
}