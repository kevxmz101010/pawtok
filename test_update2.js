async function test() {
  const loginRes = await fetch('http://localhost:8080/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@pawtok.com', contrasena: 'admin123' })
  });
  
  const cookie = loginRes.headers.get('set-cookie')?.split(';')[0];
  console.log('Cookie:', cookie);
  
  const form = new FormData();
  form.append('nombre', 'Admin Test');
  form.append('email', 'admin@pawtok.com');
  form.append('bio', 'Test bio');
  
  const updateRes = await fetch('http://localhost:8080/api/usuarios/me/perfil', {
    method: 'POST',
    headers: { 'Cookie': cookie },
    body: form
  });
  
  const body = await updateRes.text();
  console.log('POST Status:', updateRes.status);
  console.log('POST Body:', body);
  
  // also try PUT just in case they didn't restart
  const putRes = await fetch('http://localhost:8080/api/usuarios/me/perfil', {
    method: 'PUT',
    headers: { 'Cookie': cookie },
    body: form
  });
  console.log('PUT Status:', putRes.status);
}

test();
