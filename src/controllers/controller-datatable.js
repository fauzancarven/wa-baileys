const mysql = require('mysql2/promise');
const config = require('../configs/database'); 
const dbConfig = config();
let pool = mysql.createPool({
    host: dbConfig.host,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database
});

module.exports = {
    device: async (req, res) => {
        let id = req.session.userid;
        try {
            const [results] = await pool.execute('SELECT * FROM device WHERE user_id = ?', [id]);
            let data = results.map((row) => ({
                "#": row.id,
                "Name": row.name,
                "Number": row.nomor,
                "Status": row.status
            }));
            res.json({ data: data });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error' });
        }
    }
}

