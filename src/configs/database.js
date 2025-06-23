require('dotenv').config();

module.exports = (sessionName = "mgs") => {
    return {
        multipleStatements: true,
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        session: sessionName,
        tableName: process.env.DB_TABLE
    };
};