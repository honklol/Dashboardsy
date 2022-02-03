import Axios from 'axios';
import config from './config.json'

export async function sendLog(event, session, otherinf) {
    if (!config.auditlogs.enabled) {
        return true;
    }
    const currentime = await new Date().toUTCString();
    const data = {
        "content": "New Log Entry",
        "name": "Dashboardsy Audit Logs",
        "embeds": [{
            "title": "Event: " + event,
            "type": "rich",
            "description": `User: ${session.name} (${session.sub})\nTime: ${currentime}\nOther Info: ${otherinf}`,
        }]
    }
    const res = await Axios.post(config.auditlogs.discordwebhookurl, data, {
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
    })
    if (res.status !== 200 || res.status !== 204) {
        return true;
    } else {
        return false;
    }
}