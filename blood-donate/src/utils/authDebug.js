// Debug helper to check authentication status
export const debugAuth = () => {
  console.log('=== Auth Debug Info ===');
  
  // Check localStorage
  console.log('localStorage keys:', Object.keys(localStorage));
  console.log('localStorage authToken:', localStorage.getItem('authToken'));
  console.log('localStorage token:', localStorage.getItem('token'));
  console.log('localStorage accessToken:', localStorage.getItem('accessToken'));
  
  // Check sessionStorage  
  console.log('sessionStorage keys:', Object.keys(sessionStorage));
  console.log('sessionStorage authToken:', sessionStorage.getItem('authToken'));
  console.log('sessionStorage token:', sessionStorage.getItem('token'));
  console.log('sessionStorage accessToken:', sessionStorage.getItem('accessToken'));
  
  // Check if user data exists
  console.log('localStorage user:', localStorage.getItem('user'));
  console.log('localStorage userData:', localStorage.getItem('userData'));
  console.log('sessionStorage user:', sessionStorage.getItem('user'));
  
  console.log('=== End Auth Debug ===');
};

// Function to manually set token for testing
export const setTestToken = (token) => {
  localStorage.setItem('authToken', token);
  console.log('Test token set:', token);
};

// Function to clear all auth data
export const clearAuth = () => {
  const authKeys = ['authToken', 'token', 'accessToken', 'user', 'userData'];
  
  authKeys.forEach(key => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
  
  console.log('All auth data cleared');
};
