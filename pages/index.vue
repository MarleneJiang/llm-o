<script setup>
import { onMounted, ref } from 'vue';
import { set, get } from 'jsonuri';

const response = ref({
  answer: 'Brief:',
  details: 'Details:',
  details_eng: 'Translation:',
  related_question: [
    '?',
    '?',
    '?'
  ],
});
onMounted(async () => {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      question: 'Can I laid on the cloud?'
    }),
  });
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
    if(!done) {
      const content = decoder.decode(value);
      const lines = content.trim().split('\n');
      for(const line of lines) {
        const input = JSON.parse(line);
        if(input.uri) {
          const content = get(data, input.uri);
          set(data, input.uri, (content || '') + input.delta);
          response.value = {...data};
        }
      }
    }
  }
});
</script>

<template>
  <h1>Hello~</h1>
  <p>{{ response.answer }}</p>
  <p>{{ response.details }}</p>
  <p>{{ response.details_eng }}</p>
  <p v-for="item in response.related_question" :key="item.id"> >>> {{ item }}</p>
</template>