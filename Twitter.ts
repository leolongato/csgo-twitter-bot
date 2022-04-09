import { TwitterClient } from "twitter-api-client";

const twitterClient = new TwitterClient({
  apiKey: process.env.TWITTER_API_KEY || "",
  apiSecret: process.env.TWITTER_API_SECRET || "",
  accessToken: process.env.TWITTER_ACCESS_TOKEN || "",
  accessTokenSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET || "",
});

export async function CreateTweet(text: string) {
  try {
    const tweetResponse = await twitterClient.tweetsV2.createTweet({
      text,
    });
    return tweetResponse.data;
  } catch (error) {
    return `Could not create tweet: ${error}`;
  }
}
