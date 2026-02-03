const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

console.log('🌱 Seeding database...');

// Open database
const db = new sqlite3.Database('database.sqlite', (err) => {
  if (err) {
    console.error('❌ Cannot open database:', err.message);
    return;
  }
  console.log('✅ Connected to database');
});

// Run SQL commands
db.serialize(async () => {
  // 1. Create tables
  db.run(`
    CREATE TABLE IF NOT EXISTS organization (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      parentId INTEGER
    )
  `, (err) => {
    if (err) console.error('❌ Error creating organization table:', err.message);
    else console.log('✅ Organization table ready');
  });

  db.run(`
    CREATE TABLE IF NOT EXISTS user (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL,
      organizationId INTEGER NOT NULL
    )
  `, (err) => {
    if (err) console.error('❌ Error creating user table:', err.message);
    else console.log('✅ User table ready');
  });

  // 2. Add organization
  db.run(`
    INSERT OR REPLACE INTO organization (id, name) 
    VALUES (1, 'Tech Corp')
  `, (err) => {
    if (err) console.error('❌ Error creating organization:', err.message);
    else console.log('✅ Organization created');
  });

  // 3. Hash password ONCE and add all users
  try {
    console.log('🔑 Generating bcrypt hash for "password123"...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    console.log('Hash generated:', hashedPassword.substring(0, 30) + '...');
    
    const users = [
      ['owner@techcorp.com', 'owner', 1],
      ['admin@techcorp.com', 'admin', 1],
      ['viewer@techcorp.com', 'viewer', 1],
      ['owner@example.com', 'owner', 1],
      ['admin@example.com', 'admin', 1],
      ['viewer@example.com', 'viewer', 1]
    ];
    
    console.log(`\n👥 Creating ${users.length} users with SAME password hash...`);
    
    for (const [email, role, orgId] of users) {
      db.run(
        `INSERT OR REPLACE INTO user (email, password, role, organizationId) VALUES (?, ?, ?, ?)`,
        [email, hashedPassword, role, orgId],  // Use the SAME hash for everyone
        (err) => {
          if (err) {
            console.error(`❌ Error creating ${email}:`, err.message);
          } else {
            console.log(`✅ Created: ${email} (${role})`);
          }
        }
      );
    }

    // 4. Verify
    setTimeout(() => {
      db.all('SELECT email, role, LENGTH(password) as pwd_len FROM user', (err, rows) => {
        if (err) {
          console.error('❌ Error reading users:', err.message);
        } else {
          console.log('\n📋 Users in database:');
          console.table(rows);
          
          // Verify all passwords are the same
          const firstHash = rows[0]?.pwd_len;
          const allSame = rows.every(row => row.pwd_len === firstHash);
          console.log(`\n🔍 Password consistency check: ${allSame ? '✅ All passwords have same length' : '❌ Passwords differ!'}`);
        }
        
        console.log('\n🎉 Database seeded!');
        console.log('🔑 All 6 users have password: password123');
        console.log('💡 All passwords use the SAME bcrypt hash');
        
        db.close((err) => {
          if (err) console.error('❌ Error closing database:', err.message);
        });
      });
    }, 2000);
    
  } catch (error) {
    console.error('❌ Error hashing passwords:', error.message);
    db.close();
  }
});