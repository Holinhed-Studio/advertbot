'use strict'

// - libs
const colors = require('./lib/colors.js');

const Discord = require('discord.js');
const bot = new Discord.Client();

const KEY = 'Njk3NTIxOTU5NDMyNjE4MTE2.Xo4f8g.FeLX73N7vozeMZZqrmYoonPxid';



bot.on('ready', () => {
    console.log(colors.format(colors.bg.green, colors.fg.black), '=== STARTUP COMPLETE ===');
});

bot.login(KEY)
   .then(() => {
      console.log(colors.format(colors.fg.green), 'Discord login successful!');
   })
   .catch(err => {
      console.log(colors.format(colors.fg.red), '[CRITICAL] Discord login failed. Perhaps the key is invalid?');
      process.exit(0);
   });