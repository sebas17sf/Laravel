const express = require('express');
const admin = require('firebase-admin');
const bodyParser = require('body-parser');
const serviceAccount = require('./avanzada-3ce1f-firebase-adminsdk-qqb5w-e6b4cb32b3.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://avanzada-3ce1f-default-rtdb.firebaseio.com',
});

const app = express();
app.use(express.json());
app.use(bodyParser.json());

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});


////obtener todos los usuarios
app.get('/Usuarios', async (req, res) => {
    try {
        const snapshot = await admin.database().ref('Usuario/').once('value');
        const data = snapshot.val();
        res.json(data);
    } catch (error) {
        console.error('Error al obtener datos de Firebase:', error);
        res.status(500).json({ error: 'Error al obtener datos de Firebase' });
    }
});

//////insertar usuarios
app.post('/Usuarios', async (req, res) => {
    try {
      const { body } = req;
      console.log('Datos recibidos:', body);  
      const snapshot = await admin.database().ref('Usuario/').push(body);
      res.json({ id: snapshot.key });
    } catch (error) {
      console.error('Error al insertar datos en Firebase:', error);
      res.status(500).json({ error: 'Error al insertar datos en Firebase' });
    }
  });

  ////////eliminar un usuario de firebase
  app.delete('/eliminar-usuario', async (req, res) => {
    try {
      const { correoElectronico } = req.body;
  
      if (!correoElectronico) {
        return res.status(400).json({ error: 'Correo electrónico no proporcionado' });
      }
  
      const snapshot = await admin.database().ref('Usuario').orderByChild('correoElectronico').equalTo(correoElectronico).once('value');
  
      if (snapshot.exists()) {
        const key = Object.keys(snapshot.val())[0];
        await admin.database().ref('Usuario').child(key).remove();
        return res.json({ success: true, message: 'Usuario eliminado correctamente' });
      } else {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
    } catch (error) {
      console.error('Error al procesar la solicitud:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  });


  ////////actualizar solo el estado de un usuario
  app.put('/actualizar-estado', async (req, res) => {
    try {
      const { correoElectronico, estado } = req.body;
  
      if (!correoElectronico) {
        return res.status(400).json({ error: 'Correo electrónico no proporcionado' });
      }
  
      if (estado === undefined) {
        return res.status(400).json({ error: 'Estado no proporcionado' });
      }
  
      const snapshot = await admin.database().ref('Usuario').orderByChild('correoElectronico').equalTo(correoElectronico).once('value');
  
      if (snapshot.exists()) {
        const key = Object.keys(snapshot.val())[0];
        await admin.database().ref('Usuario').child(key).update({ estado });
        return res.json({ success: true, message: 'Estado actualizado correctamente' });
      } else {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
    } catch (error) {
      console.error('Error al procesar la solicitud:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  });





const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor iniciado en http://localhost:${PORT}`);
});
