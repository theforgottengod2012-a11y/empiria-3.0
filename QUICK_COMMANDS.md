# ⚡ EMPIRIA - Quick Command Cheatsheet

## Prefix
All commands use `$` prefix or mention the bot.

---

## 🛡️ MODERATION
```
/warn <user> [reason]          Warn a member
/warnlist <user>               View user's warnings
/removewarn <user> <#>         Remove warning #N
$case <id>                      View specific case
$cases [@user]                  View user's cases
$logs [@user] [action]          View mod logs

$ban <user> [reason]            Ban user
$kick <user> [reason]           Kick user
$timeout <user> <time>          Timeout user
$softban <user>                 Ban then unban (purge messages)
$jail <user>                    Send to jail role
$unjail <user>                  Release from jail

$lock                           Lock channel
$unlock                         Unlock channel
$lockdown                       Lock server
$clear <#>                      Delete # messages
$nuke                           Delete & recreate channel
```

---

## 🤖 AUTOMOD
```
$automod status                 View all settings
$automod enable                 Turn on automod
$automod disable                Turn off automod
$automod filter <type>          Toggle filter (spam/invites/caps/emojis/scamlinks)
$automod filter spam on         Enable specific filter
$automod filter capslock off    Disable caps detection
$automod punishment <level> <action>   Set punishment
$automod blacklist add <word>   Add to blacklist
$automod blacklist remove <word> Remove from blacklist
$automod spamsettings <sens> <time>    Tune settings
$automod logs #channel          Set log channel
```

---

## 💰 ECONOMY
```
$balance                        Check money
$daily                          Claim daily reward
$work                           Earn from work/trivia
$deposit <amount>               Bank money
$withdraw <amount>              Withdraw from bank

$jobs                           List jobs
$jobs miner                     Become miner
$jobs programmer                Become programmer
$jobs doctor                    Become doctor

$crime                          Commit crime (risky!)
$heal                           Treat injuries

$coinflip <heads|tails> <$>     Simple coinflip
$coinflip_vs <@user> <$>        Challenge player
$blackjack <$>                  Play blackjack
$slots <$>                      Spin slots
$roulette <num> <$>             Bet on number
$dicegame <$>                   Roll dice game

$customrename <name>            Rename custom role
$customhex <#HEX>               Change role color
$customicon <url>               Set role icon

$leaderboard xp                 XP leaderboard
$leaderboard wallet             Money leaderboard
```

---

## 🎉 GIVEAWAYS
```
$gstart <time> <winners> <prize>
$gstart 1h 1 Nitro
$gstart 24h 2 "Role" --invites 3 --level 5

$gend <msgId>                   End giveaway
$greroll <msgId>                Pick new winner(s)
```

---

## 🎫 TICKETS
```
$ticket setup                   Create ticket panel
(Users click dropdown to open support ticket)
(Staff click CLAIM or CLOSE buttons in ticket channel)
```

---

## ⭐ LEVELING
```
$leaderboard xp                 Top by level
/rank                           Your rank card (coming soon)
(Auto: +5 XP per message)
```

---

## 📨 INVITES
```
$invites                        Check your invite count
$invites @user                  Check someone's invites
$inviteleaderboard              Top inviters
```

---

## 🎭 REACTION ROLES
```
$rrole panel                    Create role panel
$rrole add <msgId> <@role> <emoji>    Add role
$rrole remove <msgId> <@role>  Remove role
```

---

## 📅 EVENTS
```
$event create <name> <type> <time>
$event create MovieNight movie 2h
$event create Tournament gaming 4h

$event list                     View upcoming events
$event join <eventId>           Join event
$event start <eventId>          Go live
$event end <eventId>            Complete event
```

---

## 📊 LOGGING
```
$logs                           Latest 10 logs
$logs @user                     User's logs
$logs warn                      Only warnings
$logs @user crime               User's crimes
```

---

## Useful Tips
- Use `$` before any command
- Can mention bot instead: `@Empiria balance`
- Brackets are optional: `[reason]` is optional
- Angle brackets required: `<user>` must be provided

---

**Need help?** Use `$help` or mention the bot!
