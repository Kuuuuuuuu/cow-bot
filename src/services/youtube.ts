import Parser from 'rss-parser';

const parser = new Parser();

export async function getLatestVideo(channelId: string) {
   const feed = await parser.parseURL(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`);

   return feed.items[0];
}
