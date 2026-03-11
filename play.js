const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, NoSubscriberBehavior } = require("@discordjs/voice");
const play = require("play-dl");

module.exports = {
  name: "play",
  aliases: ["p"],
  async execute(message, args, client) {
    const vc = message.member.voice.channel;
    if (!vc) {
      return message.reply("Join a voice channel first!");
    }
    
    const query = args.join(" ");
    if (!query) return message.reply("Please provide a song name or link.");

    if (!client.queue) client.queue = new Map();
    const serverQueue = client.queue.get(message.guild.id);

    try {
      if (process.env.SPOTIFY_CLIENT_ID && process.env.SPOTIFY_CLIENT_SECRET) {
        await play.setToken({
          spotify: {
            client_id: process.env.SPOTIFY_CLIENT_ID,
            client_secret: process.env.SPOTIFY_CLIENT_SECRET,
            market: 'US'
          }
        }).catch(() => {});
      }

      if (query.includes("spotify.com")) {
        if (play.is_spotify_url(query)) {
          const spotifyData = await play.spotify(query);
          if (spotifyData.type === 'track') {
            const searchResult = await play.search(`${spotifyData.name} ${spotifyData.artists[0].name}`, { limit: 1 });
            if (!searchResult.length) return message.reply("Could not find this Spotify track on YouTube.");
            const info = await play.video_info(searchResult[0].url);
            const song = {
              title: info.video_details.title,
              url: info.video_details.url,
              duration: info.video_details.durationRaw
            };
            return handleSong(message, vc, song, client);
          } else if (spotifyData.type === 'playlist' || spotifyData.type === 'album') {
             await spotifyData.fetch();
             const tracks = await spotifyData.all_tracks();
             message.reply(`Adding ${tracks.length} tracks from the Spotify ${spotifyData.type} to the queue...`);
             for (const track of tracks) {
                 const searchResult = await play.search(`${track.name} ${track.artists[0].name}`, { limit: 1 });
                 if (searchResult.length) {
                     const song = {
                         title: searchResult[0].title,
                         url: searchResult[0].url,
                         duration: searchResult[0].durationRaw
                     };
                     await handleSong(message, vc, song, client, true);
                 }
             }
             return;
          } else {
            return message.reply("Only Spotify track, album, and playlist links are supported.");
          }
        }
      }

      if (play.yt_validate(query) === 'video') {
          const info = await play.video_info(query);
          const song = {
              title: info.video_details.title,
              url: info.video_details.url,
              duration: info.video_details.durationRaw
          };
          return handleSong(message, vc, song, client);
      } else if (play.yt_validate(query) === 'playlist') {
          const playlist = await play.playlist_info(query, { incomplete: true });
          const videos = await playlist.all_videos();
          message.reply(`Adding ${videos.length} videos from the playlist to the queue...`);
          for (const video of videos) {
              const song = {
                  title: video.title,
                  url: video.url,
                  duration: video.durationRaw
              };
              await handleSong(message, vc, song, client, true);
          }
          return;
      }

      let search = await play.search(query, { limit: 1 });
      if (!search || search.length === 0) return message.reply("No results found.");
      const info = await play.video_info(search[0].url);
      const song = {
        title: info.video_details.title || "Unknown Title",
        url: info.video_details.url,
        duration: info.video_details.durationRaw || "00:00"
      };

      return handleSong(message, vc, song, client);
    } catch (error) {
      console.error(error);
      message.reply("There was an error playing this song.");
    }
  }
};

async function handleSong(message, vc, song, client, silent = false) {
  if (!client.queue) client.queue = new Map();
  const serverQueue = client.queue.get(message.guild.id);

  if (!serverQueue) {
    const queueContruct = {
      textChannel: message.channel,
      voiceChannel: vc,
      connection: null,
      songs: [],
      player: null,
      playing: true,
    };

    client.queue.set(message.guild.id, queueContruct);
    queueContruct.songs.push(song);

    try {
      const connection = joinVoiceChannel({
        channelId: vc.id,
        guildId: message.guild.id,
        adapterCreator: message.guild.voiceAdapterCreator,
      });
      queueContruct.connection = connection;
      
      const player = createAudioPlayer({
        behaviors: { noSubscriber: NoSubscriberBehavior.Play }
      });
      queueContruct.player = player;
      
      connection.subscribe(player);
      playSong(message.guild.id, queueContruct.songs[0], client);
    } catch (err) {
      console.log(err);
      client.queue.delete(message.guild.id);
      if (!silent) return message.reply("Could not join the voice channel.");
    }
  } else {
    serverQueue.songs.push(song);
    if (!silent) return message.channel.send(`👍 **${song.title}** has been added to the queue!`);
  }
}

async function playSong(guildId, song, client) {
  const serverQueue = client.queue.get(guildId);
  if (!serverQueue) return;

  if (!song || !song.url || song.url === 'undefined') {
    serverQueue.songs.shift();
    if (serverQueue.songs.length > 0) {
      return playSong(guildId, serverQueue.songs[0], client);
    }
    
    setTimeout(() => {
        if (serverQueue && serverQueue.songs.length === 0) {
            try { serverQueue.connection.destroy(); } catch(e) {}
            client.queue.delete(guildId);
        }
    }, 30000);
    return;
  }

  try {
    // We already have the URL, but play-dl stream() sometimes fails if it hasn't cached info
    const stream = await play.stream(song.url, { 
      discordPlayerCompatibility: true 
    }).catch(err => {
      console.error(`Stream error for ${song.url}:`, err);
      return null;
    });

    if (!stream) {
      serverQueue.textChannel.send(`❌ Could not play **${song.title}**. Skipping...`);
      serverQueue.songs.shift();
      return playSong(guildId, serverQueue.songs[0], client);
    }

    const resource = createAudioResource(stream.stream, { inputType: stream.type });
    serverQueue.player.play(resource);
    
    serverQueue.player.once(AudioPlayerStatus.Idle, () => {
      serverQueue.songs.shift();
      playSong(guildId, serverQueue.songs[0], client);
    });

    serverQueue.textChannel.send(`🎶 Now playing: **${song.title}**`);
  } catch (error) {
    console.error(error);
    serverQueue.songs.shift();
    playSong(guildId, serverQueue.songs[0], client);
  }
}
