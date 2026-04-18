const http = require('http');

const testData = JSON.stringify({
  email: 'admin@techshop.com',
  password: 'admin123'
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/admin/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': testData.length
  }
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response:', data);
    try {
      const parsed = JSON.parse(data);
      console.log('Admin login successful!');
      if (parsed.data && parsed.data.token) {
        console.log('Token received:', parsed.data.token.substring(0, 50) + '...');
        
        // Now test admin dashboard with this token
        testAdminDashboard(parsed.data.token);
      }
    } catch (e) {
      console.log('Failed to parse JSON:', e.message);
    }
  });
});

req.on('error', (e) => {
  console.error(`Request error: ${e.message}`);
});

req.write(testData);
req.end();

function testAdminDashboard(token) {
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/admin/dashboard',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };

  const req = http.request(options, (res) => {
    console.log(`\nDashboard Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('Dashboard Response:', data);
      try {
        const parsed = JSON.parse(data);
        if (parsed.success) {
          console.log('✅ Admin dashboard access successful!');
        } else {
          console.log('❌ Admin dashboard access failed:', parsed.message);
        }
      } catch (e) {
        console.log('Failed to parse dashboard response:', e.message);
      }
    });
  });

  req.on('error', (e) => {
    console.error(`Dashboard request error: ${e.message}`);
  });

  req.end();
}
