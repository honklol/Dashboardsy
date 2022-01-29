import NextAuth from "next-auth"
import DiscordProvider from "next-auth/providers/discord";
import Axios from 'axios';
import config from '../../../config.json';
import { executeQuery } from '../../../db';

export default NextAuth({
    secret: process.env.SECRET_COOKIE_PASSWORD,
    providers: [
        DiscordProvider({
            clientId: process.env.DISCORD_CLIENT_ID,
            clientSecret: process.env.DISCORD_CLIENT_SECRET,
            authorization: { params: { scope: 'identify guilds email' } },
        })
    ],
    theme: {
        colorScheme: "dark",
        logo: "/favicon.png"
    },
    callbacks: {
        async jwt({ token, account }) {
            const sqlresourc = await executeQuery("SELECT * FROM resources WHERE uid = ?", [token.sub])
            if (sqlresourc == false || sqlresourc.length == 0) {
                return token
            }
            if (account) {
                const userguilds = await Axios.get("https://discord.com/api/v9/users/@me/guilds", {
                    headers: {
                        "Authorization": `Bearer ${account.access_token}`,
                        "Accept": "application/json"
                    },
                })
                const guilds = userguilds.data;
                const userid = token.sub
                config.earningmethods.j4r.forEach(async s => {
                    const guildExists = await guilds.find(g => g.id === s.gid);
                    if (!guildExists) {
                        return token;
                    }
                    const sqlr = await executeQuery("SELECT * FROM j4r WHERE uid = ? AND guildid = ?", [userid, s.gid])
                    if (sqlr.length > 0 && sqlr[0].claimed == 1) {
                        return token;
                    }
                    await executeQuery("UPDATE resources SET coins = coins + ? WHERE uid = ?", [s.coins, userid])
                    await executeQuery("INSERT INTO j4r (uid, guildid, claimed) VALUES (?, ?, ?)", [userid, s.gid, 1])
                })
            }
            return token
        }
    }
})
