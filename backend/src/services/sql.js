const sql = require('mssql');

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT || 1433),
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
  options: {
    encrypt: true,
    trustServerCertificate: false,
  },
};

let poolPromise;

function getPool() {
  if (!poolPromise) {
    poolPromise = sql.connect(config);
  }

  return poolPromise;
}

async function query(queryText, params = {}) {
  const pool = await getPool();
  const request = pool.request();

  for (const [name, value] of Object.entries(params)) {
    if (value && typeof value === 'object' && 'type' in value) {
      request.input(name, value.type, value.value);
    } else {
      request.input(name, value);
    }
  }

  const result = await request.query(queryText);
  return result.recordset;
}

module.exports = {
  sql,
  query,
  getPool,
};
