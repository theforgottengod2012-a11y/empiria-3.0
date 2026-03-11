const { getUser, addMoney, removeMoney, checkCooldown } = require("../../utils/economy");
const BLACKJACK_COOLDOWN = 10*1000;

module.exports = {
  name: "blackjack",
  aliases: ["bj"],
  description: "Play a quick blackjack game",
  module: "economy",

  async execute(message,args,client){
    const userId = message.author.id;
    const bet = parseInt(args[0]);
    const MAX_BET = 250000;
    if(!bet||bet<=0||bet > MAX_BET) return message.reply(`❌ Enter a valid bet (Max: 💵 ${MAX_BET})`);

    const user = await getUser(userId);
    if(user.wallet<bet) return message.reply("❌ Not enough money");

    const timeLeft = await checkCooldown(userId,"blackjack",BLACKJACK_COOLDOWN);
    if(timeLeft>0) return message.reply("⏳ Wait a few seconds before playing again");

    const draw = () => Math.floor(Math.random()*11)+1;
    let userTotal = draw()+draw();
    let dealerTotal = draw()+draw();

    // Check for natural blackjack or initial busts (though bust is impossible with 2 cards max 22, but let's be safe)
    let result = "";
    if(userTotal > 21) { 
      result="💀 Bust! You lost"; 
      await removeMoney(userId,bet); 
    } else if(dealerTotal > 21) { 
      result="🎉 Dealer bust! You win"; 
      await addMoney(userId,bet*2); 
    } else if(userTotal === 21 && dealerTotal !== 21) {
      result="🎉 Blackjack! You win";
      await addMoney(userId, Math.floor(bet * 2.5));
    } else if(userTotal > dealerTotal) { 
      result="🎉 You win!"; 
      await addMoney(userId,bet*2); 
    } else if(userTotal < dealerTotal) { 
      result="💀 You lost"; 
      await removeMoney(userId,bet); 
    } else { 
      result="🤝 Draw"; 
    }

    message.reply({embeds:[{
      title:"🃏 Blackjack",
      color: result.includes("win")?0x57f287:0xed4245,
      fields:[
        {name:"Your total", value:userTotal.toString(), inline:true},
        {name:"Dealer total", value:dealerTotal.toString(), inline:true},
        {name:"Result", value:result, inline:true}
      ]
    }]});
  }
};
