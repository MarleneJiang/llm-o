<script setup>
const { chat, response } = useAI();
const question = ref('');
</script>

<template>
  <h1>LLM-O</h1>
  <div>可用模型：gpt-35-turbo (1106)、gpt-35-turbo (0125)、gpt-4 (1106-Preview)、gpt-4 (0125-Preview)、gpt-4o、gpt-4o-mini</div>
  <div class="w-[250px] mt-3">
    <EditableRoot v-slot="{ isEditing }" default-value="" placeholder="请输入问题..."
      class="flex flex-col gap-4" auto-resize>
      <EditableArea class="text-black w-[250px]">
        <EditablePreview />
        <EditableInput class="w-full placeholder:text-black" v-model="question"/>
      </EditableArea>
      <EditableEditTrigger v-if="!isEditing"
        class="w-max inline-flex items-center justify-center rounded font-medium text-[15px] px-[15px] leading-[35px] h-[35px] bg-white text-green11 shadow-[0_2px_10px] shadow-blackA7 outline-none hover:bg-mauve3 focus:shadow-[0_0_0_2px] focus:shadow-black" />
      <div v-else class="flex gap-4">
        <EditableSubmitTrigger
          class="inline-flex items-center justify-center rounded font-medium text-[15px] px-[15px] leading-[35px] h-[35px] bg-white text-green11 shadow-[0_2px_10px] shadow-blackA7 outline-none hover:bg-mauve3 focus:shadow-[0_0_0_2px] focus:shadow-black" @click="chat(question)"/>
        <EditableCancelTrigger
          class="inline-flex items-center justify-center rounded font-medium text-[15px] px-[15px] leading-[35px] h-[35px] bg-red9 text-white shadow-[0_2px_10px] shadow-blackA7 outline-none hover:bg-red10 focus:shadow-[0_0_0_2px] focus:shadow-black" />
      </div>
    </EditableRoot>
  </div>
  <p>{{ response.answer }}</p>
  <p>{{ response.details }}</p>
  <p>{{ response.details_eng }}</p>
  <p v-for="item in response.related_question" :key="item.id"> >>> {{ item }}</p>
</template>