import config from '../config';
import redis from '../redis';
// import {formatRecipes, searchRecipes} from '../services/ai/eartho/recipeSearch';
import Cerebras from '@cerebras/cerebras_cloud_sdk';
import type {ChatCompletionCreateParams} from '@cerebras/cerebras_cloud_sdk/resources.mjs';
import type {Message} from 'discord.js';
import fs from 'node:fs';
import path from 'node:path';

const maxMsgHistory = 30;
const systemPrompt = fs.readFileSync(path.join(__dirname, '../services/ai/system-prompt.txt'), 'utf8');

type ChatMessage = ChatCompletionCreateParams.UserMessageRequest | ChatCompletionCreateParams.AssistantMessageRequest;
type SystemMessage = {role: 'system'; content: string};

const cerebras = new Cerebras({
   apiKey: process.env.CEREBRAS_API_KEY,
});

export default {
   enable: true,

   historyKey(channelId: string): string {
      return `cowai:history:${channelId}`;
   },

   async getHistory(channelId: string): Promise<ChatMessage[]> {
      const key = this.historyKey(channelId);

      const messages: string[] = await redis.lrange(key, 0, -1);

      return messages.map((msg: string): ChatMessage => JSON.parse(msg));
   },

   async saveHistory(channelId: string, history: ChatMessage[]): Promise<void> {
      const key = this.historyKey(channelId);

      const pipeline = redis.multi();

      pipeline.del(key);

      for (const msg of history.slice(-maxMsgHistory)) {
         pipeline.rpush(key, JSON.stringify(msg));
      }

      pipeline.expire(key, 60 * 60 * 24); // 24 hours

      await pipeline.exec();
   },

   buildMessages(userContent: string, history: ChatMessage[]): ChatCompletionCreateParams['messages'] {
      const systemMessages: SystemMessage[] = [{role: 'system', content: systemPrompt}];

      // const recipes = searchRecipes(userContent);
      // if (recipes.length > 0) {
      //    systemMessages.push({
      //       role: 'system',
      //       content: [
      //          'The following is the official Eartho brewing database.',
      //          'Only use these recipes if the user is asking about brewing or drinks.',
      //          `Recipes:\n${formatRecipes(recipes)}`,
      //       ].join('\n'),
      //    });
      // }

      return [...systemMessages, ...history];
   },

   async execute(message: Message<true>): Promise<void> {
      if (message.author.bot || message.channel.id !== config.channelIds.cowAI || !message.content.trim()) {
         return;
      }

      void message.channel.sendTyping().catch(() => {});

      try {
         const history = await this.getHistory(message.channel.id);

         history.push({
            role: 'user',
            content: `${message.author.username}: ${message.content}`,
         });

         const messages = this.buildMessages(message.content, history);

         const {choices} = await cerebras.chat.completions.create({
            model: 'gpt-oss-120b',
            messages,
            max_completion_tokens: 1024,
            temperature: 0.2,
            top_p: 1,
            reasoning_effort: 'low',
         });

         // @ts-expect-error - i think choices is always returned
         const reply = (choices[0]?.message as {content?: string} | undefined)?.content?.trim() ?? 'I pooped my pants.';

         history.push({role: 'assistant', content: reply});
         await this.saveHistory(message.channel.id, history);

         await message.reply(reply.slice(0, 2000));
      } catch (error) {
         console.error('Error generating response:', error);
         await message.reply('Something went wrong.');
      }
   },
};
