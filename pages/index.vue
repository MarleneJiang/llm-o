<script setup>
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
const { chat, response, done } = useAI();
const question = ref('strawberry里有几个r');
const isOpen = ref(false)
</script>

<template>
  <div
    class="container flex flex-col items-start justify-between space-y-2 py-4 sm:flex-row sm:items-center sm:space-y-0 md:h-16">

    <HoverCard>
      <HoverCardTrigger>
        <div class="relative flex items-center">
        <h2 class="text-2xl font-semibold text-nowrap">
          LLM-O
        </h2><Badge class="text-nowrap ml-1">动手写丐版O1</Badge></div>
      </HoverCardTrigger>
      <HoverCardContent>
        可用模型（支持JSON Mode）：gpt-35-turbo (1106)、gpt-35-turbo (0125)、gpt-4 (1106-Preview)、gpt-4 (0125-Preview)、gpt-4o、gpt-4o-mini
      </HoverCardContent>
    </HoverCard>
    <div class="ml-auto flex w-full space-x-2 sm:justify-end">
    </div>
  </div>
  <Separator label="" />
  <div class="flex gap-4 mt-8 items-center mx-4">
    <Avatar>
      <AvatarImage src="https://avatars.githubusercontent.com/u/49270362" alt="User" />
      <AvatarFallback>User</AvatarFallback>
    </Avatar>
    <div class="w-full">
      <div class="flex w-full max-w-sm items-center gap-1.5">
        <Input id="question" type="text" placeholder="请输入问题..." v-model="question" />
        <Button type="submit" @click="chat(question)" :disabled="!done">
          提问
        </Button>
      </div>
    </div>
  </div>
  <div class="flex mt-8 mx-4 gap-4">
    <Avatar v-if="response?.reasoningList.length || response?.answer || !done">
      <AvatarImage src="https://avatars.githubusercontent.com/u/14957082" alt="AI" />
      <AvatarFallback>AI</AvatarFallback>
    </Avatar>
    <div v-if="response?.reasoningList.length || response?.answer">
      <p>{{ response?.errMessage }}</p>
      <Collapsible v-model:open="isOpen" v-if="response?.reasoningList.length">
        <CollapsibleTrigger>
          <div :class="`flex items-center text-base text-[#5d5d5d] ${response.answer ? '' : 'animate-pulse'}`">{{
            response.answer ? '思考 几秒 ' :'正在思考' }}
            <Icon v-if="isOpen" name="material-symbols-light:keyboard-arrow-up" class="w-[25px] h-[25px]" />
            <Icon v-else name="material-symbols-light:keyboard-arrow-down" class="w-[25px] h-[25px]" />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div class="flex relative gap-3 items-center mt-1">
            <div class="border-l-2 pl-4 border-[#5d5d5d]">
              <div v-for="(item, index) in response.reasoningList" :key="index">
                <div class="font-semibold mt-2">{{ item?.title }}</div>
                <div class="text-base">{{ item?.briefContent }}</div>
              </div>
            </div>
          </div>

        </CollapsibleContent>
      </Collapsible>
      <p v-if="response?.answer" class="text-lg mt-4">{{ response?.answer }}</p>
    </div>
    <Skeleton v-else-if="!done" class="w-[15px] h-[15px] rounded-full bg-[black] mt-2" />
  </div>
</template>