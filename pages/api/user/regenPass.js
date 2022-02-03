import { getToken } from "next-auth/jwt"
import { executeQuery } from '../../../db'
import config from '../../../config.json'
import Axios from 'axios'
import { setCache, getCache } from '../../../lib/cache'
import { sendLog } from '../../../webhook';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: '405 Method not allowed', error: true });
    }
    const session = await getToken({
        req,
        secret: process.env.SECRET_COOKIE_PASSWORD,
        secureCookie: process.env.NEXTAUTH_URL.startsWith('https://')
    })
    const sqlr = await executeQuery("SELECT * FROM resources WHERE uid = ?", [session.sub]);
    if (sqlr == false || sqlr.length == 0) {
        return res.status(500).json({ message: '500 Internal Server Error', error: true })
    }
    const generated_pass = await mkPass(16);
    const pterores = await Axios.patch(`https://${config.panel_url}/api/application/users/${sqlr[0].ptero_uid}`, {
        "email": session.email,
        "username": session.sub,
        "first_name": session.name,
        "last_name": session.name,
        "password": generated_pass,
        "root_admin": false
    }, {
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": `Bearer ${config.panel_apikey}`
        }
    }).catch(e => {
        console.error(e.response.data.errors)
        return res.status(500).json({ message: '500 Internal Server Error', error: true })
    });
    const ratelimitexists = await getCache(`ratelimit:${session.sub}`);
    if (ratelimitexists != false) {
        return res.status(429).json({ message: '429 Ratelimited', error: true })
    }
    await setCache(`ratelimit:${session.sub}`, true, 900);
    await sendLog("Regenerated Password", session, `None`)
    return res.status(200).json({ message: '200 OK', error: false, data: { password: generated_pass } })
}

function mkPass(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789%&#@$';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * 
 charactersLength));
   }
   return result;
}