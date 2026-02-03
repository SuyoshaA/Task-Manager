// fix-passwords.js
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();

console.log('🔧 Fixing plaintext passwords...');

const db = new sqlite3.Database('database.sqlite', async (err) => {
  if (err) {
    console.error('❌ Cannot open database:', err.message);
    return;
  }

  try {
    // Get all users
    db.all('SELECT email, password FROM user', async (err, rows) => {
      if (err) {
        console.error('❌ Error fetching users:', err.message);
        db.close();
        return;
      }

      for (const row of rows) {
        // Check if password is already hashed (bcrypt hashes start with $2)
        if (!row.password.startsWith('$2')) {
          console.log(`📝 Hashing password for ${row.email}...`);
          const hashedPassword = await bcrypt.hash(row.password, 10);
          
          db.run(
            'UPDATE user SET password = ? WHERE email = ?',
            [hashedPassword, row.email],
            (updateErr) => {
              if (updateErr) {
                console.error(`❌ Error updating ${row.email}:`, updateErr.message);
              } else {
                console.log(`✅ Updated ${row.email}`);
              }
            }
          );
        }
      }
      
      // Wait a bit then close
      setTimeout(() => {
        console.log('🎉 All passwords updated!');
        db.close();
      }, 2000);
    });
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    db.close();
  }
});