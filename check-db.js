const { DataSource } = require('typeorm');
const { User, Organization, Task, AuditLog } = require('./dist/libs/data');

async function check() {
  console.log(' Checking database contents...');
  
  const dataSource = new DataSource({
    type: 'sqlite',
    database: 'database.sqlite',
    entities: [User, Organization, Task, AuditLog], // All 4 entities
    synchronize: false,
  });

  await dataSource.initialize();
  
  // Check organizations
  const orgs = await dataSource.getRepository(Organization).find();
  console.log(' Organizations:', orgs.map(o => ({ id: o.id, name: o.name })));
  
  // Check users  
  const users = await dataSource.getRepository(User).find();
  console.log(' Users:', users.map(u => ({ id: u.id, email: u.email, role: u.role, orgId: u.organizationId })));
  
  // Check tasks
  const tasks = await dataSource.getRepository(Task).find();
  console.log(' Tasks:', tasks.length);
  
  await dataSource.destroy();
  console.log(' Check complete.');
}

check().catch(console.error);
