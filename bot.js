const { default: axios } = require('axios');
const { Telegraf } = require('telegraf');
const { gameOptions, againOptions } = require('./options');
const TOKEN = "6213676626:AAHHWaW9h-ZBgb6vL4aMGxIwLY2oLhhRWCI"
const API_Key = "e912095366b6c5165f3da8b4b0c2fd0a"

const chats = {}

const bot = new Telegraf(TOKEN);

bot.telegram.setMyCommands([
   { command: "/start", description: "Запуск бота" },
   { command: "/info", description: "О боте" },
   { command: "/game", description: "Отгадай число!" },
]);

bot.start((ctx) => ctx.reply(`Привет,${ctx.update.message.chat.first_name}. Отправь мне геопозицию, а я скажу тебе какая там температура!`));

const startGame = async (chatId, ctx) => {
   await ctx.sendMessage(`Сейчас я загадаю число от 0 до 9, а ты попытаешься отгадать!`, gameOptions);
   let random = Math.floor(Math.random() * 10);
   // console.log(random);
   chats[chatId] = random;
   setTimeout(() => {
      ctx.sendMessage(`Отгадывай!`);
   }, 800)
}

bot.on("message", async (ctx) => {
   if (ctx.update.message.location) {
      const baseURL = `https://api.openweathermap.org/data/2.5/weather?lat=${ctx.update.message.location.latitude}&lon=${ctx.update.message.location.longitude}&appid=${API_Key}`
      let response = await axios.get(baseURL);
      await ctx.sendSticker(`https://tlgrm.ru/_/stickers/25d/f5a/25df5a18-cf79-4b3e-a2f1-4862771ebd1c/1.webp`);
      await ctx.reply(`В твоем ${response.data.name || "Мухосранске"} сейчас ${(+response.data.main.temp - 273.15).toFixed(1)}°C`);
   } else if (ctx.message.text === "/info") {
      await ctx.reply(`Я предназначен пока что для того, чтоб отправлять температуру в твоем горде!`);

   } else if (ctx.message.text === "/game") {
      startGame(ctx.chat.ids, ctx);

   } else {
      await ctx.sendSticker(`https://tlgrm.ru/_/stickers/25d/f5a/25df5a18-cf79-4b3e-a2f1-4862771ebd1c/10.webp`);
      await ctx.reply(` Отправь геопозицию места, где хочешь узнать погоду вместо  "${ctx.message.text}" или /game, если хочешь сыграть в игру!`);
   }
})
bot.on("callback_query", async ctx => {
   if (ctx.update.callback_query.data === "/again") {
      startGame(ctx.chat.id, ctx)
   } else if (chats[ctx.chat.id] == ctx.update.callback_query.data) {
      await ctx.sendSticker(`https://tlgrm.ru/_/stickers/8eb/10f/8eb10f4b-8f4f-4958-aa48-80e7af90470a/52.webp`);
      return await ctx.sendMessage(` В точку!`, againOptions);
   } else {
      return await ctx.reply(` Не совсем то, что я загадал...`, againOptions);
   }
})
bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))