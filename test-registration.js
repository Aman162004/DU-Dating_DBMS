import fetch from 'node-fetch';

async function testRegistration() {
  try {
    console.log('Testing DU Dating App registration...');

    // Get colleges first
    console.log('Fetching colleges...');
    const collegesRes = await fetch('http://localhost:3000/api/auth/colleges');
    if (!collegesRes.ok) {
      throw new Error(`Failed to fetch colleges: ${collegesRes.status}`);
    }
    const colleges = await collegesRes.json();
    console.log('Colleges response:', JSON.stringify(colleges, null, 2));
    console.log('Available colleges:', colleges.colleges?.map(c => `${c.college_id}: ${c.college_name}`));

    // Get interests
    console.log('Fetching interests...');
    const interestsRes = await fetch('http://localhost:3000/api/interests');
    if (!interestsRes.ok) {
      throw new Error(`Failed to fetch interests: ${interestsRes.status}`);
    }
    const interests = await interestsRes.json();
    console.log('Available interests:', interests.interests.map(i => `${i.interest_id}: ${i.interest_name}`));

    // Register user
    console.log('Registering dummy user...');
    const registerData = {
      email: 'test@ce.du.ac.in',
      password: 'password123',
      first_name: 'Test User',
      college_id: colleges.colleges[0].college_id,
      date_of_birth: '2000-01-01',
      gender: 'Male',
      bio: 'This is a test bio that is at least 50 characters long to satisfy the validation requirements for the DU dating app.',
      seeking: 'Female',
      relationship_goal: 'Casual Dating',
      interest_ids: interests.interests.slice(0, 3).map(i => i.interest_id),
      personality_traits: ['Adventurous', 'Creative']
    };

    console.log('Registration data:', JSON.stringify(registerData, null, 2));

    const registerRes = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registerData)
    });

    const result = await registerRes.json();
    console.log('Registration result:', JSON.stringify(result, null, 2));

    if (result.success) {
      console.log('✅ Registration successful!');
      console.log('User ID:', result.user.user_id);
      console.log('Token:', result.token.substring(0, 50) + '...');
    } else {
      console.log('❌ Registration failed:', result.message);
    }

  } catch (error) {
    console.error('Error during test:', error.message);
  }
}

testRegistration();