import { executeQuery } from '../../../db'
import config from '../../../config.json'
import Axios from 'axios';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: '405 Method not allowed', error: true });
    }
    if (req.headers.authorization !== config.adminapi.apikey) {
        return new Response('{ "message": "403 Forbidden", "error": true }')
    }
    if (config.renewal.enabled == true) {
        const pterores = await Axios.get(`https://${config.panel_url}/api/application/servers?per_page=10000`, {
            headers: {
              "Authorization": `Bearer ${config.panel_apikey}`
            }
          })
        const servers = pterores.data.data
        const sqlres = JSON.parse(JSON.stringify(await executeQuery("SELECT * FROM renewals;")))
        const currentdate = new Date().getTime()
        servers.forEach(async server => {
            const serverid = server.attributes.id
            const serverownerid = server.attributes.user;
            const sqlruser = await executeQuery("SELECT * FROM resources WHERE ptero_uid = ?", [serverownerid])
            if (sqlruser.length == 0 || !sqlruser) {
                return;
            }
            const dateforrenewal = await sqlres.find(s => s.serverid == serverid).renewaldate
            if (dateforrenewal <= currentdate) {
                if (sqlruser[0].coins < config.renewal.costtorenew) {
                    if (server.attributes.suspended == false) {
                        const suspendres = await Axios.post(`https://${config.panel_url}/api/application/servers/${serverid}/suspend`, {}, {
                            headers: {
                                "Content-Type": "application/json",
                                "Accept": "application/json",
                                "Authorization": `Bearer ${config.panel_apikey}`
                            }
                        }).catch(e => console.log(e.response.data.errors))
                        if (suspendres.status !== 204) {
                            console.error("Error suspending server with id: " + serverid)
                        }
                    }
                    if (config.renewal.automaticallydeleteservers) {
                        const ifdeletionexists =  await executeQuery("SELECT * FROM deletions WHERE serverid = ?", [serverid])
                        if (!ifdeletionexists || ifdeletionexists.length == 0) {
                            await executeQuery("INSERT INTO deletions (uid, serverid, deletiondate) VALUES (?, ?, ?)", [sqlruser[0].uid, serverid, currentdate + (config.renewal.deleteserverafterhowmanydays * 24 * 60 * 60 * 1000)])
                        }
                    }
                    await executeQuery("UPDATE renewals SET renewaldate = ? WHERE serverid = ?", [(currentdate + (1*60*60*1000)), serverid])
                } else {
                    if (server.attributes.suspended == true) {
                        const unsuspendres = await Axios.post(`https://${config.panel_url}/api/application/servers/${serverid}/unsuspend`, {}, {
                            headers: {
                                "Content-Type": "application/json",
                                "Accept": "application/json",
                                "Authorization": `Bearer ${config.panel_apikey}`
                            }
                        })
                        if (unsuspendres.status !== 204) {
                            console.error("Error unsuspending server with id: " + serverid)
                        }
                    }
                    await executeQuery("UPDATE resources SET coins = coins - ? WHERE uid = ?", [config.renewal.costtorenew, sqlruser[0].uid])
                    await executeQuery("UPDATE renewals SET renewaldate = ? WHERE serverid = ?", [(currentdate + (config.renewal.daystorenewafter * 24 * 60 * 60 * 1000)), serverid])
                    const sqlr = await executeQuery("SELECT * FROM deletions WHERE serverid = ?", [serverid])
                    if (sqlr || sqlr.length > 0) {
                        await executeQuery("DELETE FROM deletions WHERE serverid = ?", [serverid])
                    }
                }
            }
        })
    }
    if (config.renewal.automaticallydeleteservers) {
        const sqlres = await executeQuery("SELECT * FROM deletions;")
        const currentdate = new Date().getTime()
        sqlres.forEach(async s => {
            if (s.deletiondate <= currentdate) {
                await executeQuery("DELETE FROM deletions WHERE serverid = ?", [s.serverid])
                await executeQuery("DELETE FROM renewals WHERE serverid = ?", [s.serverid])
                await Axios.delete(`https://${config.panel_url}/api/application/servers/${s.serverid}`, {
                    headers: {
                        "Authorization": `Bearer ${config.panel_apikey}`
                    }
                })
            }
        })
    }
    return res.status(200).json({ "message": "200 OK", error: false });
}