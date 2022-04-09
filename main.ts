import "dotenv/config";
import { CreateTweet } from "./Twitter";
import cron from "cron";
import HLTV, { MatchFilter, MatchPreview } from "hltv";
import emojis from "node-emoji";

var job = new cron.CronJob("0 0 8 * * *", Run, null, true, "America/Sao_Paulo");

job.start();

async function Run() {
  console.log("Starting tweets process...");
  const matches = await HLTV.getMatches({ filter: MatchFilter.TopTier });

  let filteredMatches = matches.filter(FilterMatches);

  if (filteredMatches.length === 0) {
    console.log("Não há jogos neste dia");
    return;
  }

  const thopyEmoji = emojis.find("trophy");
  const arrowRightEmoji = emojis.find("arrow_right");
  const calendarEmoji = emojis.find("calendar");
  const clockEmoji = emojis.find("clock1");
  const starEmoji = emojis.find("star");
  const fireEmoji = emojis.find("fire");
  const liveEmoji = emojis.find("red_circle");

  for (const match of filteredMatches) {
    const eventName = match.event?.name || match.title || "";
    const date = new Date(convertTZ(new Date(match.date || 0)));
    const formatedDate = date.toLocaleDateString("pt-BR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    await Sleep(2000);
    let ttTeam1,
      team1Name = "";
    if (match.team1) {
      const team1 = (await HLTV.getTeam({ id: match.team1?.id || 0 })) || "";
      team1Name = team1.name;
      const splitedTeam1 =
        team1 && team1.id ? team1.twitter?.split("/") : team1.name;
      ttTeam1 = team1.id
        ? `${team1Name} ${
            splitedTeam1?.length !== undefined
              ? "@" + splitedTeam1?.at(splitedTeam1.length - 1)
              : ""
          }`
        : splitedTeam1;
    }

    await Sleep(2000);
    let ttTeam2,
      team2Name = "";
    if (match.team2) {
      const team2 = (await HLTV.getTeam({ id: match.team2?.id || 0 })) || "";
      team2Name = team2.name;
      const splitedTeam2 = team2.id ? team2.twitter?.split("/") : team2.name;
      ttTeam2 = team2.id
        ? `${team2Name} ${
            splitedTeam2?.length !== undefined
              ? "@" + splitedTeam2?.at(splitedTeam2.length - 1)
              : ""
          }`
        : splitedTeam2;
    }

    const stars = match.stars ? starEmoji.emoji.repeat(match.stars) : "";

    const event = `${thopyEmoji.emoji} ${eventName}`;

    const matchFormat = `${
      arrowRightEmoji.emoji
    }  ${match.format?.toUpperCase()}`;

    const matchTeams =
      ttTeam1 && ttTeam2
        ? `${fireEmoji.emoji} ${ttTeam1} x ${ttTeam2} ${stars}`
        : `${stars}`;

    let hashTags = `#CSGO #${eventName
      ?.replace(/\s/g, "")
      .replace("-", "")
      .replace("/", "")}`;

    if (team1Name !== "") hashTags += ` #${team1Name.replace(/\s/g, "")}`;
    if (team2Name !== "") hashTags += ` #${team2Name.replace(/\s/g, "")}`;

    const dateTime = match.date
      ? `${calendarEmoji.emoji} ${formatedDate}\n${
          clockEmoji.emoji
        } ${date.getHours()}:${date.getMinutes().toString().padEnd(2, "0")}`
      : `${liveEmoji.emoji} LIVE`;

    const message = `${event}\n${matchFormat}\n${dateTime}\n${matchTeams}\n\n${hashTags}
      `;

    const tweet = await CreateTweet(message);
    console.log(tweet);
  }
  console.log("Finishing tweets process.");
}

function FilterMatches(match: MatchPreview) {
  const date = new Date(match.date || 0);
  const now = new Date(convertTZ(new Date()));

  return (
    (date.getDay() === now.getDay() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()) ||
    match.live === true
  );
}

function convertTZ(date: Date) {
  return new Date(date).toLocaleString("en-US", {
    timeZone: "America/Sao_Paulo",
  });
}

function Sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
