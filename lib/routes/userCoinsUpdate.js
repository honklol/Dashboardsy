import { executeQuery } from '../../db'
import { sendLog } from '../../webhook';

export default async function updateUserCoins(req, res, dmanager) {
    if (!req.body.coins) {
        return res.status(400).json({ message: '400 Bad Request', error: true });
    }
    const sqlr = await executeQuery("SELECT * FROM resources WHERE uid = ?", [req.query.userid]);
    if (sqlr == false || sqlr.length === 0) {
        return res.status(404).json({ message: '404 User Not Found', error: true });
    }
    if (typeof req.body.coins !== "number") {
        return res.status(400).json({ message: '400 Bad Request', error: true });
    }
    await executeQuery("UPDATE resources SET coins = coins + ? WHERE uid = ?", [req.body.coins, req.query.userid]);
    await sendLog("Update Coins (ADMIN API)", { "sub": req.query.userid, "name": "ADMIN API" }, `Amount of coins: ${req.body.coins}, ${dmanager ? `Dashboardsy Manager: <#${dmanager}>` : `None`}`)
    return res.status(200).json({ "message": "200 OK", error: false });
}