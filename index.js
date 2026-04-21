const {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ChannelType,
  PermissionsBitField,
  StringSelectMenuBuilder // 👈 thêm
} = require('discord.js');

const { createCanvas, loadImage } = require("canvas");

const fs = require("fs");

if (!fs.existsSync("./data.json")) {
  fs.writeFileSync("./data.json", "{}");
}

let data = JSON.parse(fs.readFileSync("./data.json", "utf8"));

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers]
});

const TOKEN = process.env.TOKEN;

const BANNER = "https://cdn.discordapp.com/attachments/1495638864520548392/1495659302386667550/giphy_1.gif";
const LEGIT = "https://discord.com/channels/1495637850866319390/1495638797692698654";

const STAFF_ROLE_ID = "1495660645343953087";
const LOG_CHANNEL_ID = "1495661035355377694";
const ROLE_CUSTOMER = "1495742777261162597"; // 🛒
const ROLE_KHACH_QUEN = "1495748595562053763"; // 💸
const ROLE_VIP = "1495748444290285598"; // ⭐
const ROLE_VIPPP = "1495748642206650448"; // 👑
const VIP_CHANNEL_ID = "1495766857431646288";
const CHECK_RANK_CHANNEL_ID = "1495775470216675359";

// 👉 GIF bảng giá
const GIF = "https://cdn.discordapp.com/attachments/1495638864520548392/1495696433376919562/Paucek_and_Lage_1.gif";
const GIF_YT = "https://cdn.discordapp.com/attachments/1495638864520548392/1495720153386848310/9b2727740f20d66eeeb300568926619e.gif?ex=69e74571&is=69e5f3f1&hm=c8c47bb5f586e3ff5927a4ba6c8f5a969cbada4c86f14ca43f2c301f316ee275&";
const GIF_SP = "https://cdn.discordapp.com/attachments/1495638864520548392/1495720151595749477/276f273d11f8b9dbc0a9c55bb38ea8c6.gif?ex=69e74571&is=69e5f3f1&hm=8e793a056ac1cd462d5d8b94097363ed6bfa6bc9402a05d1f2626592399679ce&";
const GIF_GPT = "https://cdn.discordapp.com/attachments/1495638864520548392/1495720152132751421/4b06e393fd0647c265b1282b0f006486.gif?ex=69e74571&is=69e5f3f1&hm=8f58cb0ca6522a35f507d8e41551df79d2dfadfde81fbda3c294083b3fc8b4e3&";
const GIF_NETFLIX = "https://cdn.discordapp.com/attachments/1495638864520548392/1495720152677748898/2d97922c558c15f8850105e0498aeafb.gif?ex=69e74571&is=69e5f3f1&hm=8c6f7cb2347d6db6ba235201a83723c53286ef779951ecb43a788faadc2ca1f6&";

client.once('ready', () => {
  console.log(`🔥 ${client.user.tag} đã online`);
});

// ================= PANEL =================
client.on('messageCreate', async (message) => {
	


  // 🔒 chỉ staff dùng
 if (message.content.startsWith("!donhang")) {

  // ✅ khai báo trước
  let target = message.mentions.users.first() || message.author;
  const userId = target.id;

  // ✅ check quyền sau
  if (
    target.id !== message.author.id &&
    !message.member.roles.cache.has(STAFF_ROLE_ID)
  ) {
    return message.reply("❌ Bạn chỉ được xem đơn của mình!");
  }

  if (!data[userId]) {
    return message.reply("❌ User chưa có đơn!");
  }

  const history = data[userId].history || [];

  if (history.length === 0) {
    return message.reply("❌ Không có đơn!");
  }

  

  let page = 0;
  const perPage = 3;
  const totalPages = Math.ceil(history.length / perPage);

  const generateEmbed = (page) => {

    const start = page * perPage;
    const current = history.slice().reverse().slice(start, start + perPage);

    const totalMoney = history.reduce((sum, h) => sum + h.amount, 0);

    const embed = new EmbedBuilder()
      .setColor(0x00BFFF)
      .setTitle(`📦 ĐƠN HÀNG - ${target.username}`)
      .setDescription(`💰 Tổng: **${totalMoney.toLocaleString()}đ** • 📦 ${history.length} đơn`)
      .setThumbnail(target.displayAvatarURL({ dynamic: true }))
      .setFooter({ text: `Trang ${page + 1}/${totalPages} • 36Store` })
      .setTimestamp();

    current.forEach(h => {

      const orderDate = new Date(h.date);
      const now = new Date();

      const diff = Math.floor((now - orderDate) / (1000 * 60 * 60 * 24));
      const remain = h.warranty - diff;

      const status = remain > 0
        ? `🟢 ${remain} ngày`
        : "🔴 Hết hạn";

      embed.addFields({
        name: `🧾 #${h.id || "N/A"} • ${h.product || "Không rõ"}`,
        value:
`💰 **${h.amount.toLocaleString()}đ**
📅 ${orderDate.toLocaleDateString()}
🛡 ${status}`,
        inline: false
      });

    });

    return embed;
  };

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("prev")
      .setLabel("⬅️")
      .setStyle(ButtonStyle.Secondary),

    new ButtonBuilder()
      .setCustomId("next")
      .setLabel("➡️")
      .setStyle(ButtonStyle.Secondary)
  );

  const msg = await message.reply({
    embeds: [generateEmbed(page)],
    components: [row]
  });

  const collector = msg.createMessageComponentCollector({
    time: 60000
  });

  collector.on("collect", async (interaction) => {

    if (interaction.user.id !== message.author.id) {
      return interaction.reply({ content: "❌ Không phải của bạn!", ephemeral: true });
    }

    if (interaction.customId === "next") {
      page = (page + 1) % totalPages;
    }

    if (interaction.customId === "prev") {
      page = (page - 1 + totalPages) % totalPages;
    }

    await interaction.update({
      embeds: [generateEmbed(page)],
      components: [row]
    });

  });

}

 if (!message.guild || message.author.bot) return;
 if (message.content === "!panel") {
    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setImage(BANNER)
      .setDescription(`
# ⭐ 36 STORE

━━━━━━━━━━━━━━━

🛒 **Mua Hàng**  
➤ Nếu bạn muốn mua hàng  

⚙️ **Hỗ trợ Buyer**  
➤ Nếu bạn gặp vấn đề về sản phẩm  

━━━━━━━━━━━━━━━

> 🚫 Vui lòng không spam ticket
      `)
      .setFooter({ text: "36 STORE • Uy tín - Nhanh chóng" })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("buy")
        .setLabel("🛒 MUA HÀNG")
        .setStyle(ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId("support")
        .setLabel("❌ Hỗ trợ Buyer")
        .setStyle(ButtonStyle.Danger)
    );

    const row2 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("✅ Check Legit Shop")
        .setStyle(ButtonStyle.Link)
        .setURL(LEGIT)
    );

    message.channel.send({ embeds: [embed], components: [row, row2] });
  }

  // ================= BẢNG GIÁ =================
  if (message.content === "!setupgia") {
await message.channel.bulkDelete(10).catch(() => {});
    const embed = new EmbedBuilder()
      .setColor(0x57F287)
      .setTitle("💎 BẢNG GIÁ 36 STORE")
      .setThumbnail("https://cdn.discordapp.com/attachments/1495638864520548392/1495705466674614373/Paucek_and_Lage_2.gif?ex=69e737c4&is=69e5e644&hm=101f55b1b9c7deda0c3aefd4b09423e34b700aedfccf3ec15913384352ba1796&")
      .setImage("https://cdn.discordapp.com/attachments/1495638864520548392/1495713187826368663/3aa46f5701fc6ed92234ea0a9f86e2cd.gif?ex=69e73ef4&is=69e5ed74&hm=8d086ce0636f2c9b81277ab547a28af0cc394186b3ebee5bec91b8f6756fda47&")
     .setDescription(`
\`\`\`ansi
\u001b[1;32mNhấn Vào Mục Bên Dưới Và Chọn Sản Phẩm Bạn Cần Tham Khảo Bot Sẽ Hiện Bảng Giá Sản Phẩm Lên\u001b[0m
\`\`\`

🛒 **Mua Hàng Tại:** <#1495731009226805309>  
🎨 **Xem Decor Tại:** <#1495708903818789014>  
💸 **Săn Sale Tại:** <#1495708929823477841>
`);
    const menu = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
  .setCustomId("menu_price")
  .setPlaceholder("📦 Xem giá sản phẩm")
  .addOptions([
    {
      label: "Youtube Premium",
      value: "yt",
      emoji: { id: "1495689772117655562" }
    },
    {
      label: "Spotify Premium",
      value: "sp",
      emoji: { id: "1495689980972896296" }
    },
    {
      label: "ChatGPT Plus",
      value: "gpt",
      emoji: { id: "1495689844058357841" }
    },
    {
      label: "Netflix",
      value: "netflix",
      emoji: { id: "1495689454210514984" }
    }
  ])
    );

    message.channel.send({ embeds: [embed], components: [menu] });
  }
  
  // ===== DONE THEO TIỀN =====
  if (message.content.startsWith("!qr")) {

  if (!message.member.roles.cache.has(STAFF_ROLE_ID)) return;

  const args = message.content.split(" ");
  let amount = args[1];

  if (!amount) {
    return message.reply("❌ Dùng: !qr 98 hoặc !qr 98000");
  }

  if (amount.length <= 3) {
    amount = parseInt(amount) * 1000;
  } else {
    amount = parseInt(amount);
  }

 const note = `${message.author.id}`;

  const qr = `https://img.vietqr.io/image/VCB-1030776109-compact.png?amount=${amount}&addInfo=${note}`;

  const embed = new EmbedBuilder()
  .setColor(0x00FF99)
  .setTitle("💳 THANH TOÁN")
  .setDescription(`
💰 Số tiền: **${amount.toLocaleString()}đ**

🏦 Ngân hàng: **Vietcombank**
🔢 STK: **1030776109**

📱 Quét QR để thanh toán
📌 Nội dung: **${note}**
`)
  .setImage(qr); // 🔥 THÊM DÒNG NÀY

message.channel.send({ embeds: [embed] });
}

if (message.content.startsWith("!done")) {


  if (!message.member.roles.cache.has(STAFF_ROLE_ID)) {
  return message.reply("❌ Bạn không có quyền dùng lệnh này!");
}

  if (!message.channel.topic) {
    return message.reply("❌ Lệnh này chỉ dùng trong ticket!");
  }

  const args = message.content.split(" ");
  const amount = parseInt(args[1]);

  if (!amount) return message.reply("❌ Nhập số tiền! VD: !done 50000");

  const userId = message.channel.topic?.replace("UserID: ", "");
  const member = await message.guild.members.fetch(userId).catch(() => null);

  if (!member) return;

  // ===== FIX DATA =====
  if (!data[userId]) {
  data[userId] = { orders: 0, money: 0, history: [] };
}

if (!data[userId].history) {
  data[userId].history = [];
}

const product = args[2] || "Không rõ";

const orderId = Date.now(); // ID đơn

const warrantyDays = 30; // số ngày bảo hành

data[userId].history.push({
  id: orderId,
  product: product,
  amount: amount,
  date: new Date().toISOString(),
  warranty: warrantyDays
});

data[userId].orders += 1;
data[userId].money += amount;

  fs.writeFileSync("./data.json", JSON.stringify(data, null, 2));

const money = data[userId].money;
const orders = data[userId].orders;

let newRole;

if (money >= 5000000) newRole = ROLE_VIPPP;
else if (money >= 1000000) newRole = ROLE_VIP;
else if (money >= 200000) newRole = ROLE_KHACH_QUEN;
else newRole = ROLE_CUSTOMER;

const roles = [ROLE_CUSTOMER, ROLE_KHACH_QUEN, ROLE_VIP, ROLE_VIPPP];

// 🔥 lấy rank cũ chuẩn (ưu tiên cao → thấp)
const priority = [ROLE_VIPPP, ROLE_VIP, ROLE_KHACH_QUEN, ROLE_CUSTOMER];

const oldRank = priority.find(r => member.roles.cache.has(r)) || null;

// xoá role cũ
for (const r of roles) {
  if (member.roles.cache.has(r)) {
    await member.roles.remove(r);
  }
}

// add role mới
await member.roles.add(newRole);

// 🔥 check lên rank
if (oldRank !== newRole) {

  const vipChannel = message.guild.channels.cache.get(VIP_CHANNEL_ID);
  const role = message.guild.roles.cache.get(newRole);

  if (vipChannel && role) {

    const embedVip = new EmbedBuilder()
      .setColor(0xFFD700)
      .setTitle("🎉 KHÁCH HÀNG LÊN VIP 🔥")
      .setDescription(`
👤 ${member}

🏆 Rank mới: **${role.name}**
💰 Tổng tiền: **${money.toLocaleString()}đ**

🚀 Cảm ơn bạn đã ủng hộ shop!
`)
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .setTimestamp();

    vipChannel.send({ embeds: [embedVip] });
  }
}

// embed hoàn thành đơn
const remain =
  money < 200000 ? (200000 - money) :
  money < 1000000 ? (1000000 - money) :
  money < 5000000 ? (5000000 - money) : 0;

const embed = new EmbedBuilder()
  .setColor(0xF1C40F)
  .setTitle("💰 HOÀN THÀNH ĐƠN")
  .setDescription(`
👤 ${member}

💵 Tổng tiền: **${money.toLocaleString()}đ**
📦 Tổng đơn: **${orders}**

🔥 Còn **${remain.toLocaleString()}đ** nữa lên rank!
`)
  .setTimestamp();

message.channel.send({ embeds: [embed] });
}

if (message.content === "!rank") {
	if (message.channel.id !== CHECK_RANK_CHANNEL_ID)
    return message.reply(`❌ Vui lòng dùng lệnh tại <#${CHECK_RANK_CHANNEL_ID}>`);

  const userId = message.author.id;
  if (!data[userId]) {
    return message.reply("❌ Bạn chưa có dữ liệu!");
  }

  const user = data[userId];
  const money = user.money;
  const orders = user.orders;

  let rank = "🛒 Khách hàng";
let next = 200000;

if (money >= 5000000) {
  rank = "👑 VIP++";
  next = null;
}
else if (money >= 1000000) {
  rank = "⭐ VIP";
  next = 5000000;
}
else if (money >= 200000) {
  rank = "💸 Khách quen";
  next = 1000000;
}

  const remain = next ? (next - money) : 0;

  const embed = new EmbedBuilder()
    .setColor(0x5865F2)
    .setTitle("📊 THÔNG TIN VIP")
    .setDescription(`
👤 ${message.author}

🏆 Rank: **${rank}**
💵 Tổng tiền: **${money.toLocaleString()}đ**
📦 Đơn: **${orders}**

${next ? `🎯 Còn ${remain.toLocaleString()}đ nữa lên rank` : "👑 MAX RANK"}
    `)
    .setTimestamp();

  message.reply({ embeds: [embed] });
}

if (message.content === "!history") {
	
	if (message.channel.id !== CHECK_RANK_CHANNEL_ID)
    return message.reply(`❌ Vui lòng dùng lệnh tại <#${CHECK_RANK_CHANNEL_ID}>`);

  const userId = message.author.id;

  if (!data[userId]) {
    return message.reply("❌ Không có dữ liệu");
  }

  const history = data[userId].history || [];

  const last = history.slice(-5);

  const text = last.map(h => `💰 ${h.amount}đ - ${h.date}`).join("\n");

  const embed = new EmbedBuilder()
    .setColor(0x57F287)
    .setTitle("🧾 LỊCH SỬ MUA")
    .setDescription(text || "Chưa có")
    .setTimestamp();

  message.reply({ embeds: [embed] });
}

if (message.content === "!top") {
 if (message.channel.id !== CHECK_RANK_CHANNEL_ID)
    return message.reply(`❌ Vui lòng dùng lệnh tại <#${CHECK_RANK_CHANNEL_ID}>`);
  const sorted = Object.entries(data)
    .sort((a, b) => b[1].money - a[1].money)
    .slice(0, 5);

  let text = "";

  for (let i = 0; i < sorted.length; i++) {
    const [id, info] = sorted[i];
    text += `#${i+1} <@${id}> - ${info.money.toLocaleString()}đ\n`;
  }

  const embed = new EmbedBuilder()
    .setColor(0xF1C40F)
    .setTitle("🏆 TOP NẠP")
    .setDescription(text || "Chưa có dữ liệu");

  message.channel.send({ embeds: [embed] });
}
});
// ================= INTERACTION =================
client.on('interactionCreate', async interaction => {

  // ===== MENU BẢNG GIÁ =====
  if (interaction.isStringSelectMenu() && interaction.customId === "menu_price") {

    let embed;

    if (interaction.values[0] === "yt") {
      embed = new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle("Bảng Giá Youtube Premium")
        .setThumbnail(GIF)
        .setDescription(`
<:YouTube_23392:1495689772117655562> Youtube Premium 1 Tháng:
\`\`\`
PRICE: 40.000 VND
\`\`\`

<:YouTube_23392:1495689772117655562> Youtube Premium 3 Tháng:
\`\`\`
PRICE: 120.000 VND
\`\`\`

<:YouTube_23392:1495689772117655562> Youtube Premium 6 Tháng:
\`\`\`
PRICE: 230.000 VND
\`\`\`

<:YouTube_23392:1495689772117655562> Youtube Premium 1 Năm:
\`\`\`
PRICE: 350.000 VND
\`\`\`
•  **Chỉ cần gửi email để add, không cần mật khẩu  **
•  **Dùng lâu dài, nên mua gói 1 năm  **
•  🔒 **Bảo hành full 1 đổi 1 trong thời gian sử dụng**
`)
		.setImage(GIF_YT);
    }

    if (interaction.values[0] === "sp") {
      embed = new EmbedBuilder()
        .setColor(0x1DB954)
        .setTitle("Bảng giá Spotify Premium")
        .setDescription(`
<:spotify_logo_icon_189218:1495689980972896296> Spotify Premium 4 Tháng:
\`\`\`
PRICE: 100.000 VND
\`\`\`

<:spotify_logo_icon_189218:1495689980972896296> Spotify Premium 1 Năm:
\`\`\`
PRICE: 340.000 VND
\`\`\`

• **Tài khoản chính chủ ** 
• **Nghe nhạc không quảng cáo ** 
• **🔒 Bảo hành full thời gian sử dụng**
        `)
		.setImage(GIF_SP);
    }

    if (interaction.values[0] === "gpt") {
      embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle("Bảng giá ChatGPT Plus")
        .setDescription(`
<:chatgpt_logo_chatgpt_logo_square:1495689844058357841> ChatGPT Plus 1 Tháng:
\`\`\`
PRICE: 90.000 VND
\`\`\`

<:chatgpt_logo_chatgpt_logo_square:1495689844058357841> Add Fam:
\`\`\`
PRICE: 119.000 VND
\`\`\`

• Sử dụng GPT-4  
• Tốc độ nhanh, ưu tiên  
• 🔒 Bảo hành full
`)
		.setImage(GIF_GPT)
    }

    if (interaction.values[0] === "netflix") {
      embed = new EmbedBuilder()
        .setColor(0xE50914)
        .setTitle("Bảng giá Netflix")
        .setDescription(`
<:netflix_macos_bigsur_icon_189917:1495689454210514984> Netflix 3 Tháng:
\`\`\`
PRICE: 220.000 VND
\`\`\`

<:netflix_macos_bigsur_icon_189917:1495689454210514984> Netflix 6 Tháng:
\`\`\`
PRICE: 320.000 VND
\`\`\`

<:netflix_macos_bigsur_icon_189917:1495689454210514984> Netflix 1 Năm:
\`\`\`
PRICE: 620.000 VND
\`\`\`

• **Tài khoản Premium ** 
• **Xem 4K, nhiều thiết bị ** 
• **🔒 Bảo hành full**
`)
		.setImage(GIF_NETFLIX)
    }
await interaction.reply({
  embeds: [embed],
  ephemeral: true
});
setTimeout(() => {
  interaction.deleteReply().catch(() => {});
}, 60000);
  }
  
  
  

  // ================= TICKET (GIỮ NGUYÊN) =================
  if (!interaction.isButton()) return;

  if (interaction.customId === "buy" || interaction.customId === "support") {

    const type = interaction.customId === "buy" ? "mua" : "hotro";

    const existing = interaction.guild.channels.cache.find(c =>
      c.topic && c.topic.includes(interaction.user.id) && c.name.startsWith(type)
    );

    if (existing) {
      await interaction.reply({
        content: `❌ Bạn đã có ticket ${type.toUpperCase()} rồi!`,
        ephemeral: true
      });

      setTimeout(() => {
        interaction.deleteReply().catch(() => {});
      }, 8000);

      return;
    }

    const channel = await interaction.guild.channels.create({
      name: `${type}-${interaction.user.username}-${interaction.user.id.slice(0,4)}`,
      type: ChannelType.GuildText,
      permissionOverwrites: [
        { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
        { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel] },
        { id: STAFF_ROLE_ID, allow: [PermissionsBitField.Flags.ViewChannel] },
      ],
    });

    await channel.setTopic(`UserID: ${interaction.user.id}`);

    const close = new ActionRowBuilder().addComponents(
  new ButtonBuilder()
    .setCustomId("close")
    .setLabel("🔒 Đóng ticket")
    .setStyle(ButtonStyle.Danger)
);

    await channel.send({
  content: `
👋 Xin chào quý khách ${interaction.user}

Cảm ơn bạn đã tin tưởng 36 STORE 💙  
Đội ngũ chúng mình luôn sẵn sàng hỗ trợ bạn nhanh nhất có thể!

Vui lòng mô tả nhu cầu hoặc vấn đề của bạn bên dưới, staff sẽ phản hồi trong vài phút ⏱

<@&${STAFF_ROLE_ID}> vào hỗ trợ khách ngay nhé 🚀
  `,
  components: [close]
});
	// ===== LOG CREATE =====
const logChannel = interaction.guild.channels.cache.get(LOG_CHANNEL_ID);

if (logChannel) {
  const logEmbed = new EmbedBuilder()
    .setColor(0x5865F2)
    .setTitle("📩 TICKET MỚI")
    .addFields(
      { name: "👤 User", value: `${interaction.user.tag}`, inline: true },
      { name: "🆔 ID", value: `${interaction.user.id}`, inline: true },
      { name: "📂 Loại", value: `${type}`, inline: true },
      { name: "📍 Channel", value: `<#${channel.id}>`, inline: false }
    )
    .setTimestamp();

  logChannel.send({ embeds: [logEmbed] });
}

    const openBtn = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("🔗 Mở Ticket")
        .setStyle(ButtonStyle.Link)
        .setURL(`https://discord.com/channels/${interaction.guild.id}/${channel.id}`)
    );

    await interaction.reply({
      content: "🎫 Ticket đã được tạo!",
      components: [openBtn],
      ephemeral: true
    });
	setTimeout(() => {
  interaction.deleteReply().catch(() => {});
}, 15000);
  }

  if (interaction.customId === "close") {

  if (!interaction.member.roles.cache.has(STAFF_ROLE_ID) &&
      !interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
    
    return interaction.reply({
      content: "❌ Bạn không có quyền đóng ticket!",
      ephemeral: true
    });
  }

  const logChannel = interaction.guild.channels.cache.get(LOG_CHANNEL_ID);

  // 🔥 lấy user từ topic
  const userId = interaction.channel.topic?.replace("UserID: ", "") || "Không rõ";
  const user = await interaction.client.users.fetch(userId).catch(() => null);

  // 🔥 xác định loại ticket
  const type = interaction.channel.name.startsWith("mua") ? "🛒 MUA" : "⚙️ HỖ TRỢ";

  if (logChannel) {
    const logEmbed = new EmbedBuilder()
      .setColor(0xED4245)
      .setTitle("❌ TICKET ĐÓNG")
      .addFields(
        { name: "📁 Ticket", value: `${interaction.channel.name}`, inline: true },
        { name: "📂 Loại", value: `${type}`, inline: true },
        { name: "👤 Khách", value: user ? `${user.tag}` : "Không rõ", inline: false },
        { name: "👮 Đóng bởi", value: `${interaction.user.tag}`, inline: false }
      )
      .setTimestamp();

    logChannel.send({ embeds: [logEmbed] });
  }

  await interaction.channel.send("⏳ Đang đóng ticket...");
  setTimeout(() => interaction.channel.delete(), 2000);
}

});

// 👉 DÁN WELCOME Ở ĐÂY
client.on("guildMemberAdd", async (member) => {

  const channel = member.guild.channels.cache.get("1495638265288458331"); // kênh welcome

  if (!channel) return;

  const embed = new EmbedBuilder()
    .setColor(0x5865F2)
    .setThumbnail("https://cdn.discordapp.com/attachments/1495638864520548392/1495658367547478137/giphy.gif?ex=69e70be6&is=69e5ba66&hm=d1252dd0d3fb42c7286cd734548583cb85fe220ff5973496b3fa013607e04d68&") // 👉 thay logo nếu muốn
    .setDescription(`
# 💎 36 STORE

👋 **Chào mừng ${member} đến với server!**

━━━━━━━━━━━━━━━

📢 **Thông báo**  
➤ <#1495736279667577015>

💰 **Bảng giá**  
➤ <#1495731767083274383>

🎫 **Mua hàng**  
➤ <#1495731009226805309>

━━━━━━━━━━━━━━━

🚀 **Bắt đầu bằng cách xem bảng giá và tạo ticket nhé!**

💙 *Uy tín – Nhanh chóng – Giá tốt*
`)
    .setImage("https://cdn.discordapp.com/attachments/1495638864520548392/1495738324026134589/b34bd0ef85660338e6082332e0d31a7f.gif?ex=69e7565d&is=69e604dd&hm=0b8332d9552b46c43a9d9c0c5e6ee882c2cfb9337499496ac0149013888e31ae&") // 👉 đổi gif nếu muốn
    .setFooter({ text: "36 STORE • Official System" });

  channel.send({ embeds: [embed] });
});

client.login(TOKEN);