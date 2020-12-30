'use strict'

const colors = require('./lib/colors.js');
const fs = require('fs');
const Discord = require('discord.js');

const bot = new Discord.Client();

let CONFIG, GROUPS;

let campaign = 0;
let interval = 0;

try {
    CONFIG = JSON.parse(fs.readFileSync('./config.json'));
    GROUPS = JSON.parse(fs.readFileSync('./groups.json'));
    console.log(`Using key ${CONFIG.key}`);
} catch (err) {
    console.log(colors.format(colors.fg.red), `[CRITICAL] Cannot read ${!CONFIG ? 'config' : 'groups'} file.`);
    console.log(err);
    process.exit(1);
}

bot.on('ready', () => {

    console.log(`Using channel '${CONFIG.channelid}'`);
    const msgchannel = bot.channels.cache.get(CONFIG.channelid);

    if (!msgchannel) {
        console.log(colors.format(colors.fg.red), `[ERROR] Cannot find channel. Perhaps the ID is wrong?`);
        process.exit(1);
    }

    console.log('Channel found! Attempting to clear last 100 messages...');

    if (CONFIG.clearonstartup) {
        console.log(colors.format(colors.fg.cyan), '[NOTE] Due to limitations, only the last 100 messages from less \n       than 2 weeks ago can be deleted automatically.');
        msgchannel.bulkDelete(100);
    } else {
        console.log('\'clearonstartup\' is false. Skipping.');
    }

    const pi = CONFIG.postinterval;
    const ci = CONFIG.campaigninterval;
    interval = (pi.seconds + (pi.minutes * 60) + (pi.hours * 60 * 60) + (pi.days * 60 * 60 * 24));
    campaign = (ci.seconds + (ci.minutes * 60) + (ci.hours * 60 * 60) + (ci.days * 60 * 60 * 24));

    if (interval == 0) {
        console.log(colors.format(colors.fg.red), 'Cannot proceed. Interval is set to 0.');
        process.exit(0);
    }

    const admin = bot.users.cache.get(CONFIG.adminid);

    if (admin) console.log(`The admin of this campaign is: ${CONFIG.adminid}.`);

    console.log(colors.format(colors.fg.green), `Campaign ready! Posting every ${interval} seconds${campaign == 0 ? '.' : ` for ${campaign} seconds.`}`);

    let constant = campaign == 0;
    let gid = 0;
    
    if (admin) admin.send('Your campaign is now running!');

    console.log(colors.format(colors.bg.green, colors.fg.black), '=== STARTUP COMPLETE ===');

    let x = setInterval(() => {

        let embed = new Discord.MessageEmbed()
            .setTitle(`__${GROUPS[gid].name}__`)
            .setColor(GROUPS[gid].color ? GROUPS[gid].color : CONFIG.embedcolor)
            .setDescription(GROUPS[gid].desc)
            .setThumbnail(GROUPS[gid].icon);

        if (GROUPS[gid].fields)
        for (let f of GROUPS[gid].fields) {
            embed.addField(f.title, f.desc, f.inline);
        }

        msgchannel.send(embed);

        msgchannel.send(`https://discord.gg/${GROUPS[gid].code}`);

        gid = (gid + 1) % GROUPS.length;

        if (!constant) {
            campaign -= interval;
            if (campaign < 0) {
                process.exit(0);
            }
        }
    }, interval * 1000);
});

bot.login(CONFIG.key)
   .then(() => {
      console.log(colors.format(colors.fg.green), 'Discord login successful!');
   })
   .catch(err => {
      console.log(colors.format(colors.fg.red), '[CRITICAL] Discord login failed. Perhaps the key is invalid?');
      process.exit(0);
   });