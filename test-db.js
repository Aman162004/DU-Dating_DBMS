import { query } from './db.js';
import pool from './db.js';

async function testDatabase() {
  try {
    console.log('📊 Testing database connection...\n');
    
    // Check total users
    const usersCount = await query('SELECT COUNT(*) FROM users');
    console.log('✅ Total users in database:', usersCount.rows[0].count);
    
    // Check total profiles
    const profilesCount = await query('SELECT COUNT(*) FROM profiles');
    console.log('✅ Total profiles in database:', profilesCount.rows[0].count);
    
    // Get last 5 registered users
    const recentUsers = await query(`
      SELECT u.email, u.first_name, u.created_at, c.college_name 
      FROM users u 
      JOIN colleges c ON u.college_id = c.college_id 
      ORDER BY u.created_at DESC 
      LIMIT 5
    `);
    
    console.log('\n📝 Last 5 registered users:');
    recentUsers.rows.forEach((user, index) => {
      console.log(`${index + 1}. ${user.first_name} (${user.email}) - ${user.college_name} - Registered: ${user.created_at}`);
    });
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Database error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

testDatabase();
