import pool from '../config/db.js';

async function migrate() {
  const connection = await pool.getConnection();
  try {
    // Step 1: Drop old UNIQUE index
    console.log('Step 1: Dropping uk_namtaichinh...');
    await connection.query(`ALTER TABLE dutoanhangnam DROP INDEX uk_namtaichinh`);
    console.log('OK');

    // Step 2: Add new UNIQUE on namtaichinh + capduyet
    console.log('Step 2: Adding UNIQUE on (namtaichinh, capduyet)...');
    await connection.query(`
      ALTER TABLE dutoanhangnam
      ADD UNIQUE INDEX uk_namtaichinh_capduyet (namtaichinh, capduyet)
    `);
    console.log('OK');

    // Step 3: Add FK for parent_id
    console.log('Step 3: Adding FK for parent_id...');
    await connection.query(`
      ALTER TABLE dutoanhangnam
      ADD CONSTRAINT fk_dutoan_parent
      FOREIGN KEY (parent_id) REFERENCES dutoanhangnam(dutoanhangnam_id)
      ON DELETE CASCADE ON UPDATE CASCADE
    `);
    console.log('OK');

    console.log('\nMigration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error.message);
    console.error('Error code:', error.code);
  } finally {
    connection.release();
    process.exit(0);
  }
}

migrate();
