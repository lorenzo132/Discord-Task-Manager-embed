const {
  CommandClient
} = require("eris");
const {
  inspect
} = require('util');
const fetch = require("node-fetch");
const { v4 } = require('uuid');
const systemInformation = require("systeminformation");
const config = require("../config.json");

const bot = new CommandClient(config.token, {}, {
  description: "Server Stats what else!",
  owner: "big shaq",
  prefix: "gwrewgrewgrews"
});

let initialized = false;

bot.on("ready", async () => {
  console.log("Ready");

  if (!initialized) {
    initialized = true;
    const channel = bot.getChannel("769229040857907220"); // change this to channel it
    const message = await channel.getMessage("769229205367554101"); // change this to the message

    const embed = await getEmbed("Updated at");
    await message.edit(embed);

    setInterval(async () => {
      let uuid = v4();
      const _embed = await getEmbed("Updated at");
      await message.edit(_embed);
    }, 7000)
  }
});

function formatBytes(a, b) {
  if (0 == a) return "0 Bytes";
  const c = 1024,
    d = b || 2,
    e = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"],
    f = Math.floor(Math.log(a) / Math.log(c));
  return parseFloat((a / Math.pow(c, f)).toFixed(d)) + " " + e[f]
}

function formatUptime(o) {
  o = Number(o);
  const s = Math.floor(o / 86400),
    n = Math.floor(o % 86400 / 3600),
    r = Math.floor(o % 3600 / 60),
    t = Math.floor(o % 60);
  return (s > 0 ? s + (1 == s ? " day, " : " days, ") : "") + (n > 0 ? n + (1 == n ? " hour, " : " hours, ") : "") + (r > 0 ? r + (1 == r ? " minute, " : " minutes, ") : "") + (t > 0 ? t + (1 == t ? " second" : " seconds") : "")
}

async function getEmbed(footer = null) {
  const cpuSpeed = await systemInformation.cpuCurrentspeed();
  const cpuInfo = await systemInformation.cpu();
  const currentLoad = await systemInformation.currentLoad();
  const memory = await systemInformation.mem();
  const memLayout = await systemInformation.memLayout();
  const driveInfo = await systemInformation.fsSize();
  const time = await systemInformation.time();
  await systemInformation.networkStats();
  await systemInformation.networkStats();
  await systemInformation.networkStats();
  const networkStats = await systemInformation.networkStats();

  let diskUsed = 0;
  let diskTotal = 0;

  for (const drive of driveInfo) {
    diskUsed += drive.used;
    diskTotal = drive.size;
  }

  return {
    content: "",
    embed: {
      title: "Server Stats",
      timestamp: new Date(Date.now()),
      color: 0x3cfa5f,
      fields: [{
        name: "Server Info",
        value: `\`\`\`prolog\nCPU: ${cpuInfo.manufacturer} ${cpuInfo.brand} (${cpuInfo.speed} GHz)\nCPU Usage: ${(currentLoad.currentload).toFixed(2)}%\n\nCores (Physical): ${cpuInfo.physicalCores}\nCores (Total): ${cpuInfo.cores}\n-------------------------------------\nTotal Devices: ${memLayout.length}\nCurrent Usage: ${formatBytes(memory.active, 2).replace(" GB", "")}/${formatBytes(memory.total, 2)}\n\nMemory Usage (w/ buffers): ${formatBytes(memory.used, 2)}\nAvailable: ${formatBytes(memory.available, 2)}\n-------------------------------------\nDisk Usage: ${formatBytes(diskUsed, 2)}/${formatBytes(diskTotal, 2)}\n-------------------------------------\n${networkStats[0].rx_sec === -1 ? "" : `Network Stats:\n\nCurrent Transfer: ${formatBytes(networkStats[0].tx_sec, 2)}/s\nCurrent Recieved: ${formatBytes(networkStats[0].rx_sec, 2)}/s\n\nTotal Transferred: ${formatBytes(networkStats[0].tx_bytes, 2)}\nTotal Recieved: ${formatBytes(networkStats[0].rx_bytes, 2)}\n-------------------------------------\n`}Uptime: ${formatUptime(time.uptime)}\`\`\``
      }, {
        "name": "Discord API websocket ping",
        "value": `\`\`\`prolog\n${(bot.shards.get(0)).latency} ms\`\`\``
      }],
      footer: {
        text: footer ? footer : null
      }
    },
  }
}

bot.registerCommand("stats", async (message) => {
  const embed = await getEmbed();
  await message.channel.createMessage(embed);
}, {
  description: "Get the Server stats"
});

bot.registerCommand("eval", async (message, params) => {
  if (message.author.id !== "188363246695219201") return;
  let evaled;
  try {
    const stopwatchStart = process.hrtime()
    evaled = eval(params.join(' '))
    if (evaled instanceof Promise) {
      evaled = await evaled
    }
    const stopwatchEnd = process.hrtime(stopwatchStart)

    let response = ''

    response += `**Output:**\n\`\`\`js\n${clean(
        inspect(evaled, { depth: 0 }),
        bot.token
      )}\`\`\``
    response += `\n**Type:**\`\`\`${typeof evaled}\`\`\``
    response += `\n\n⏱️ \`${(stopwatchEnd[0] * 1e9 + stopwatchEnd[1]) /
        1e6}ms\``

    if (response.length > 0) {
      return response
    }
  } catch (err) {
    console.error('Eval Command Error:', err)
    return `Error:\`\`\`xl\n${clean(err, bot.token)}\n\`\`\``
  }
}, {
  description: "- Owner Only -",
  fullDescription: "evaluate code what else",
  usage: "<code>"
});

bot.connect();

function clean(text, token) {
  if (typeof text === 'string') {
    text = text
      .replace(/`/g, `\`${String.fromCharCode(8203)}`)
      .replace(/@/g, `@${String.fromCharCode(8203)}`)

    return text.replace(new RegExp(token, 'gi'), '****')
  }

  return text
}
