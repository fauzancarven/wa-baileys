module.exports = (sessionName = "mgs") => {
    return {
        multipleStatements: true,
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'nodejs',
        session: sessionName,
        tableName: 'auth'
    };
};