async function test() {
  const loginRes = await fetch('http://localhost:8080/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@pawtok.com', contrasena: 'admin123' })
  });
  
  const cookie = loginRes.headers.get('set-cookie')?.split(';')[0];
  
  const form = new FormData();
  form.append('nombre', 'Admin Test');
  form.append('email', 'admin@pawtok.com');
  form.append('bio', 'Test bio');
  
  // Fake file
  const fileBlob = new Blob(['fake image data'], { type: 'image/png' });
  form.append('foto', fileBlob, 'test.png');
  
  const putRes = await fetch('http://localhost:8080/api/usuarios/me/perfil', {
    method: 'PUT',
    headers: { 'Cookie': cookie },
    body: form
  });
  const body = await putRes.text();
  console.log('PUT Status:', putRes.status);
  console.log('PUT Body:', body);
}

test();
