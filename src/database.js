import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false }
});

export async function initDatabase() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS licenses (
        id SERIAL PRIMARY KEY,
        license_key VARCHAR(255) UNIQUE NOT NULL,
        user_id VARCHAR(255) UNIQUE NOT NULL,
        username VARCHAR(255) NOT NULL,
        status VARCHAR(50) DEFAULT 'active',
        activated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        revoked_at TIMESTAMP,
        revoked_by VARCHAR(255)
      );
      CREATE INDEX IF NOT EXISTS idx_user_id ON licenses(user_id);
      CREATE INDEX IF NOT EXISTS idx_license_key ON licenses(license_key);
      CREATE INDEX IF NOT EXISTS idx_status ON licenses(status);
    `);
    console.log('✅ Database schema initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  } finally {
    client.release();
  }
}

export async function createLicense(userId, username, licenseKey) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'INSERT INTO licenses (user_id, username, license_key) VALUES ($1, $2, $3) RETURNING *',
      [userId, username, licenseKey]
    );
    return result.rows[0];
  } catch (error) {
    if (error.code === '23505') {
      return null;
    }
    throw error;
  } finally {
    client.release();
  }
}

export async function getLicenseByUserId(userId) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT * FROM licenses WHERE user_id = $1',
      [userId]
    );
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

export async function getAllLicenses(limit = 10, offset = 0) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT * FROM licenses ORDER BY activated_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    const countResult = await client.query('SELECT COUNT(*) FROM licenses');
    return {
      licenses: result.rows,
      total: parseInt(countResult.rows[0].count)
    };
  } finally {
    client.release();
  }
}

export async function revokeLicense(userId, revokedBy) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'UPDATE licenses SET status = $1, revoked_at = CURRENT_TIMESTAMP, revoked_by = $2 WHERE user_id = $3 RETURNING *',
      ['revoked', revokedBy, userId]
    );
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

export { pool };
