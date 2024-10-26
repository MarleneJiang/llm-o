import { set, get } from 'jsonuri';
export default function() {
  const response = ref({
    answer: 'Brief:',
    details: 'Details:',
    details_eng: 'Translation:',
    related_question: [
      '?',
      '?',
      '?'
    ],
  } as any);
  // const response = reactive({
  //   errMessage: '',
  //   jsonList: [],
  // });
  const chat = async (question: string) => {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        question
      }),
    });
    if(!res.body){
      return
    }
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let done = false;
    const data = {
      answer: 'Brief:',
      details: 'Details:',
      related_question: [],
    };
    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      if (!done) {
        const content = decoder.decode(value);
        const lines = content.trim().split('\n');
        for (const line of lines) {
          const input = JSON.parse(line);
          if (input.uri) {
            const content = get(data, input.uri);
            set(data, input.uri, (content || '') + input.delta);
            response.value = { ...data };
          }
        }
      }
    }
  }

  return {
    response,
    chat
  };
}