const { DataSource } = require('typeorm');
const bcrypt = require('bcrypt');
const { User, Organization } = require('./dist/libs/data');

async function hashPassword(password) {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

async function seed() {
  console.log('🔧 Seeding database...');
  
  const dataSource = new DataSource({
    type: 'sqlite',
    database: 'database.sqlite',
    entities: [User, Organization],
    synchronize: true, // ✅ Auto-create tables
    logging: false,
  });

  await dataSource.initialize();
  console.log('✅ Database connected');
  
  // Create organization
  const orgRepo = dataSource.getRepository(Organization);
  let org = await orgRepo.findOne({ where: { name: 'Main Organization' } });
  
  if (!org) {
    org = orgRepo.create({ name: 'Main Organization' });
    await orgRepo.save(org);
    console.log('✅ Created organization id:', org.id);
  } else {
    console.log('✓ Organization exists id:', org.id);
  }
  
  // Create users with hashed passwords
  const userRepo = dataSource.getRepository(User);
  const hashedPassword = await hashPassword('password123');
  
  const testUsers = [
    { email: 'owner@techcorp.com', role: 'owner' },
    { email: 'admin@techcorp.com', role: 'admin' },
    { email: 'viewer@techcorp.com', role: 'viewer' },
  ];
  
  for (const userData of testUsers) {
    let user = await userRepo.findOne({ where: { email: userData.email } });
    
    if (user) {
      // Update existing
      user.password = hashedPassword;
      user.role = userData.role;
      await userRepo.save(user);
      console.log(`✓ Updated user: ${user.email}`);
    } else {
      // Create new
      user = userRepo.create({
        email: userData.email,
        password: hashedPassword,
        role: userData.role,
        organizationId: org.id,
      });
      await userRepo.save(user);
      console.log(`✅ Created user: ${user.email}`);
    }
  }
  
  await dataSource.destroy();
  console.log('\n🎉 Database seeded!');
  console.log('🔑 All users use password: password123');
}

seed().catch(console.error);