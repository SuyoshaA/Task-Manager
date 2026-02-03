const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.sqlite');

console.log(' Seeding database directly...');

db.serialize(() => {
  // First, disable foreign keys
  db.run('PRAGMA foreign_keys = OFF');
  
  // Clear existing data
  db.run('DELETE FROM organization');
  db.run('DELETE FROM user');
  db.run('DELETE FROM task');
  
  // Insert organization with ID 1
  db.run(\INSERT INTO organization (id, name) VALUES (1, 'Main Organization')\, (err) => {
    if (err) console.error('Org insert error:', err.message);
    else console.log(' Created organization ID 1');
  });
  
  // Insert user with ID 1
  db.run(\INSERT INTO user (id, email, password, role, organizationId) VALUES (1, 'owner@example.com', 'temp', 'owner', 1)\, (err) => {
    if (err) console.error('User insert error:', err.message);
    else console.log(' Created user ID 1');
  });
  
  // Re-enable foreign keys
  db.run('PRAGMA foreign_keys = ON', () => {
    console.log(' Database seeded!');
    db.close();
  });
});
