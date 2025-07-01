// Test file for User Management APIs
// Run this in browser console to test API functions

import { 
  getAllUsers, 
  getUsersByRole, 
  searchUserByName, 
  updateUser, 
  getUserDetail,
  testApiConnection
} from './userManagementApi.js';

// Test functions
export const runApiTests = async () => {
  console.log('🧪 Starting API Tests...');
  
  // Test 1: API Connection
  console.log('\n1️⃣ Testing API Connection...');
  try {
    const connectionResult = await testApiConnection();
    console.log('✅ Connection Test:', connectionResult);
  } catch (error) {
    console.error('❌ Connection Test Failed:', error);
  }
  
  // Test 2: Get All Users
  console.log('\n2️⃣ Testing Get All Users...');
  try {
    const users = await getAllUsers();
    console.log('✅ Get All Users:', users);
    console.log(`📊 Total users: ${users.length}`);
  } catch (error) {
    console.error('❌ Get All Users Failed:', error);
  }
  
  // Test 3: Get Users by Role
  console.log('\n3️⃣ Testing Get Users by Role...');
  try {
    const staffUsers = await getUsersByRole('Staff');
    console.log('✅ Staff Users:', staffUsers);
    
    const memberUsers = await getUsersByRole('Member');
    console.log('✅ Member Users:', memberUsers);
  } catch (error) {
    console.error('❌ Get Users by Role Failed:', error);
  }
  
  // Test 4: Search Users by Name
  console.log('\n4️⃣ Testing Search Users by Name...');
  try {
    const searchResult = await searchUserByName('test');
    console.log('✅ Search Result:', searchResult);
  } catch (error) {
    console.error('❌ Search Users Failed:', error);
  }
  
  // Test 5: Get User Detail (if users exist)
  console.log('\n5️⃣ Testing Get User Detail...');
  try {
    const users = await getAllUsers();
    if (users && users.length > 0) {
      const userDetail = await getUserDetail(users[0].id || users[0].userId);
      console.log('✅ User Detail:', userDetail);
    } else {
      console.log('⚠️ No users found to test detail');
    }
  } catch (error) {
    console.error('❌ Get User Detail Failed:', error);
  }
  
  console.log('\n🏁 API Tests Completed!');
};

// Quick test function for development
export const quickTest = async () => {
  console.log('🚀 Quick API Test');
  
  try {
    // Test connection first
    const connection = await testApiConnection();
    console.log('Connection:', connection);
    
    if (connection.success) {
      // Test get all users
      const users = await getAllUsers();
      console.log('Users:', users);
      console.log('API is working! ✅');
    } else {
      console.log('API connection failed ❌');
    }
  } catch (error) {
    console.error('Quick test failed:', error);
  }
};

// Usage:
// In browser console:
// import('./apiTest.js').then(module => module.quickTest());
// or
// import('./apiTest.js').then(module => module.runApiTests());
