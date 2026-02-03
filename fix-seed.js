const bcrypt = require("bcrypt");
const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("database.sqlite");

async function seed() {
  console.log("🌱 Seeding database with test users...");
  
  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash("password123", 10);
    console.log("✅ Password hashed");
    
    db.serialize(() => {
      // Create tables
      db.run(
        "CREATE TABLE IF NOT EXISTS organization (" +
        "  id INTEGER PRIMARY KEY AUTOINCREMENT," +
        "  name TEXT NOT NULL" +
        ")"
      );
      
      db.run(
        "CREATE TABLE IF NOT EXISTS user (" +
        "  id INTEGER PRIMARY KEY AUTOINCREMENT," +
        "  email TEXT UNIQUE NOT NULL," +
        "  password TEXT NOT NULL," +
        "  role TEXT NOT NULL DEFAULT 'viewer'," +
        "  organizationId INTEGER NOT NULL DEFAULT 1" +
        ")"
      );
      
      // Create organization
      db.run("INSERT OR IGNORE INTO organization (id, name) VALUES (1, 'Tech Corp')", function(err) {
        if (err) {
          console.error("❌ Error creating organization:", err.message);
          return;
        }
        
        console.log("✅ Organization created");
        
        // Create users
        const users = [
          ["owner@techcorp.com", hashedPassword, "owner", 1],
          ["admin@techcorp.com", hashedPassword, "admin", 1],
          ["viewer@techcorp.com", hashedPassword, "viewer", 1]
        ];
        
        let usersCreated = 0;
        users.forEach(([email, password, role, orgId]) => {
          db.run(
            "INSERT OR REPLACE INTO user (email, password, role, organizationId) VALUES (?, ?, ?, ?)",
            [email, password, role, orgId],
            function(err) {
              if (err) {
                console.error("❌ Error creating " + email + ":", err.message);
              } else {
                console.log("✅ Created: " + email + " (" + role + ")");
              }
              
              usersCreated++;
              if (usersCreated === users.length) {
                // Show all users
                db.all("SELECT email, role FROM user", (err, rows) => {
                  if (err) {
                    console.error("❌ Error reading users:", err.message);
                  } else {
                    console.log("\n📋 All users in database:");
                    rows.forEach(row => console.log("   👤 " + row.email + " - " + row.role));
                  }
                  
                  console.log("\n🎉 Database seeded successfully!");
                  console.log("🔑 Password for all users: password123");
                  db.close();
                });
              }
            }
          );
        });
      });
    });
    
  } catch (error) {
    console.error("❌ Seeding failed:", error.message);
    console.log("💡 Make sure bcrypt is installed: npm install bcrypt");
  }
}

// Run the seeder
seed();