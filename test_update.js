const http = require('http');

async function test() {
  // 1. Login
  const loginData = JSON.stringify({ email: 'admin@pawtok.com', contrasena: 'admin123' });
  const loginReq = http.request('http://localhost:8080/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': loginData.length
    }
  }, (res) => {
    let cookie = res.headers['set-cookie'] ? res.headers['set-cookie'][0].split(';')[0] : '';
    
    // 2. Try POST /api/usuarios/me/perfil
    const FormData = require('form-data');
    const form = new FormData();
    form.append('nombre', 'Admin Test');
    form.append('email', 'admin@pawtok.com');
    form.append('bio', 'Test bio');
    
    const updateReq = http.request('http://localhost:8080/api/usuarios/me/perfil', {
      method: 'POST',
      headers: {
        'Cookie': cookie,
        ...form.getHeaders()
      }
    }, (res2) => {
      let body = '';
      res2.on('data', d => body += d);
      res2.on('end', () => {
        console.log('POST Status:', res2.statusCode);
        console.log('POST Body:', body);
      });
    });
    updateReq.on('error', console.error);
    form.pipe(updateReq);
  });
  
  loginReq.on('error', console.error);
  loginReq.write(loginData);
  loginReq.end();
}

test();
