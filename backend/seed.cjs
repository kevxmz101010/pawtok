const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function run() {
  try {
    const connection = await mysql.createConnection({host: 'localhost', user: 'root', password: 'root', database: 'pawtok'});
    
    // hash password "123456"
    const hash = await bcrypt.hash('123456', 10);
    
    // check if user exists
    const [users] = await connection.execute(`SELECT id_usuario as id FROM usuarios WHERE email = 'refugio@pawtok.com'`);
    let userId;
    if (users.length === 0) {
      const [result] = await connection.execute(`INSERT INTO usuarios (nombre, email, password, id_rol, fecha_registro) VALUES ('Refugio Patitas', 'refugio@pawtok.com', ?, 3, NOW())`, [hash]);
      userId = result.insertId;
    } else {
      userId = users[0].id;
      await connection.execute(`UPDATE usuarios SET password = ? WHERE id_usuario = ?`, [hash, userId]);
    }
    
    // check if shelter exists
    const [shelters] = await connection.execute(`SELECT id_refugio as id FROM refugios WHERE id_usuario = ?`, [userId]);
    if (shelters.length === 0) {
      await connection.execute(`INSERT INTO refugios (id_usuario, nombre, direccion, telefono, email, descripcion, estado_verificacion) VALUES (?, 'Patitas Rescate', '123 Fake St', '555-0000', 'refugio@pawtok.com', 'Un lugar feliz', 'Aprobado')`, [userId]);
    }
    
    console.log('Seed completed successfully! Credenciales: refugio@pawtok.com / password123');
    await connection.end();
  } catch(e) {
    console.error(e);
  }
}
run();
