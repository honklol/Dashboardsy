import { executeQuery } from '../../db'
import { sendLog } from '../../webhook';

export default async function updateUserResources(req, res, dmanager) {
    if (!req.body.resources.cpu || !req.body.resources.memory || !req.body.resources.disk || !req.body.resources.serverlimit) {
        return res.status(400).json({ message: '400 Bad Request', error: true });
    }
    const sqlr = await executeQuery("SELECT * FROM resources WHERE uid = ?", [req.query.userid]);
    if (sqlr == false || sqlr.length === 0) {
        return res.status(404).json({ message: '404 User Not Found', error: true });
    }
    if (typeof req.body.resources.cpu !== "number" || typeof req.body.resources.memory !== "number" || typeof req.body.resources.disk !== "number" || typeof req.body.resources.serverlimit !== "number") {
        return res.status(400).json({ message: '400 Bad Request', error: true });
    }
    await executeQuery("UPDATE resources SET cpu = cpu + ? WHERE uid = ?", [req.body.resources.cpu, req.query.userid]);
    await executeQuery("UPDATE resources SET memory = memory + ? WHERE uid = ?", [req.body.resources.memory, req.query.userid]);
    await executeQuery("UPDATE resources SET disk = disk + ? WHERE uid = ?", [req.body.resources.disk, req.query.userid]);
    await executeQuery("UPDATE resources SET serverlimit = serverlimit + ? WHERE uid = ?", [req.body.resources.serverlimit, req.query.userid]);
    await sendLog("Update Resources (ADMIN API)", { "sub": req.query.userid, "name": "ADMIN API" }, `Amount of resources: ${JSON.stringify(req.body.resources)}, ${dmanager ? `Dashboardsy Manager: <#${dmanager}>` : `None`}`)
    return res.status(200).json({ "message": "200 OK", error: false });
}