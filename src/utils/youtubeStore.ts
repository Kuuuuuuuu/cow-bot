import {promises as fs} from 'node:fs';
import {dirname, join} from 'node:path';

const FILE = join(process.cwd(), 'data', 'youtube.json');

type YoutubeStore = Record<string, string>;

async function readStore(): Promise<YoutubeStore> {
   try {
      const data = await fs.readFile(FILE, 'utf8');
      return JSON.parse(data);
   } catch {
      await fs.mkdir(dirname(FILE), {recursive: true});
      await fs.writeFile(FILE, '{}');
      return {};
   }
}

export async function getLastVideoId(channelId: string): Promise<string | null> {
   const store = await readStore();
   return store[channelId] ?? null;
}

export async function setLastVideoId(channelId: string, videoId: string) {
   const store = await readStore();
   store[channelId] = videoId;

   await fs.writeFile(FILE, JSON.stringify(store, null, 2));
}
