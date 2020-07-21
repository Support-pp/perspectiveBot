import { Client, Message, Emoji, WebhookClient } from "discord.js";
var request = require("request");
const allowedChannels = [
  "309033097180217349", //sp-en
  "303664307667730440", //sp-de
  "303663158923493376", //lobby
  "488559618352611333", //offtopic
  "344094121729851392", //pro
  "643080361487761438", //labor
  "348417474905243651", //test
];

export class DiscordTS {
  public client: Client;
  public DISCOVERY_URL =
    "https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=";
  constructor() {
    this.client = new Client();
  }

  public start(): void {
    this.client.on("ready", () => {
      console.log("[>] Connected.");
      console.log("Logged in as " + this.client?.user?.tag);
    });

    this.client.on("message", (msg: Message) => {
      console.log("> " + msg.content);

      if (msg.webhookID) return;

      if (allowedChannels.includes(msg.channel.id)) {
        this.analyseToxicity(msg);
      }
    });

    this.client.login(process.env.TOKEN);
  }

  public analyseToxicity(msg: Message) {
    var options = {
      method: "POST",
      url: this.DISCOVERY_URL + process.env.PERSPECTIVE_KEY,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        comment: { text: msg.content },
        languages: ["de"],
        requestedAttributes: { TOXICITY: {} },
      }),
    };
    request(options, function (error: any, response: any) {
      if (error) throw new Error(error);
      const data = JSON.parse(response.body);
      const score = data?.attributeScores?.TOXICITY?.summaryScore?.value;
      console.log(score);

      if (score >= 0.7) {
        msg.react(process.env.DISCORD_CHANNEL_ID || "");
      }
      if (score >= 0.85) {
        msg.reply("deine Nachricht wurde gelöscht! Bitte bleibe freundlich!");
        const webhookClient = new WebhookClient(
          process.env.DISCORD_ID || "",
          process.env.DISCORD_TOKEN || ""
        );

        webhookClient.send(msg.content, {
          username: msg.author.username,
          avatarURL: `https://cdn.discordapp.com/avatars/${msg.author.id}/${msg.author.avatar}.png`,
        });

        msg.delete();
      }
    });
  }
}

/**
 * env
 * PERSPECTIVE_KEY
 * TOKEN
 * DISCORD_ID
 * DISCORD_TOKEN
 * DISCORD_CHANNEL_ID
 */
