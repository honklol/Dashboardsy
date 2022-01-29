import { getToken } from "next-auth/jwt"
import { executeQuery } from '../../../db'
import config from '../../../config.json'
import Axios from 'axios'

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: '405 Method not allowed', error: true });
    }
    if (!req.body.userid || !req.body.coins) {
        return res.status(400).json({ message: '400 Bad Request', error: true });
    }
    const sqlr = await executeQuery("SELECT * FROM resources WHERE uid = ?", [req.body.userid]);
    if (sqlr == false || sqlr.length === 0) {
        return res.status(404).json({ message: '404 User Not Found', error: true });
    }
    const oldamt = sqlr[0].coins;
    const newamt = oldamt + req.body.coins;
    await executeQuery("UPDATE resources SET coins = ? WHERE uid = ?", [newamt, req.body.userid]);
    return res.status(200).json({ "message": "200 OK", error: false });
}