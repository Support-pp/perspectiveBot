import { Client, Message, Emoji, WebhookClient } from "discord.js";
var request = require("request");

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
      // console.log(msg.client?.user?.id + " :: " + msg.author.id);
      if (msg.webhookID) return;
      this.analyseToxicity(msg);
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
        msg.react("517818221651427365");
      }
      if (score >= 0.85) {
        msg.reply("ihre Nachricht wurde gelöscht! Bitte bleibe freundlich!");
        const webhookClient = new WebhookClient(
          "725804372533182495",
          "BOv_g9Dji5bFzGy3fUEaermHwW8Z9QS0KRryce988no4f0DIOlbJCSB9WskZKCcNtihf"
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
 * :vertical_traffic_light:
 * env
 * PERSPECTIVE_KEY
 * TOKEN
 */
