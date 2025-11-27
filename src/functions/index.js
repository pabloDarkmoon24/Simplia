const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

// ============================================
// CAMBIAR CONTRASEÑA DE DISTRIBUIDOR
// ============================================
exports.cambiarPasswordDistribuidor = functions.https.onRequest(async (req, res) => {
  // Configurar CORS manualmente
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Manejar preflight
  if (req.method === 'OPTIONS') {
    return res.status(204).send('');
  }

  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Método no permitido' });
    }

    const { uid, nuevaPassword, idToken } = req.body;

    if (!uid || !nuevaPassword || !idToken) {
      return res.status(400).json({ error: 'Faltan datos' });
    }

    // Verificar token
    await admin.auth().verifyIdToken(idToken);

    if (nuevaPassword.length < 6) {
      return res.status(400).json({ error: 'Contraseña muy corta' });
    }

    // Actualizar contraseña en Firebase Auth
    await admin.auth().updateUser(uid, {
      password: nuevaPassword
    });

    // Actualizar Firestore
    await admin.firestore().collection('distribuidores').doc(uid).update({
      passwordTemporal: nuevaPassword,
      debeActualizarPassword: true,
      ultimoCambioPassword: admin.firestore.FieldValue.serverTimestamp(),
      passwordCambiadaPorAdmin: true
    });

    return res.status(200).json({ success: true, message: 'Contraseña actualizada' });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
});

// ============================================
// ELIMINAR DISTRIBUIDOR
// ============================================
exports.eliminarDistribuidor = functions.https.onRequest(async (req, res) => {
  // Configurar CORS manualmente
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Manejar preflight
  if (req.method === 'OPTIONS') {
    return res.status(204).send('');
  }

  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Método no permitido' });
    }

    const { uid, idToken } = req.body;

    if (!uid || !idToken) {
      return res.status(400).json({ error: 'Faltan datos' });
    }

    // Verificar token
    await admin.auth().verifyIdToken(idToken);

    // Eliminar de Auth
    try {
      await admin.auth().deleteUser(uid);
    } catch (error) {
      if (error.code !== 'auth/user-not-found') {
        throw error;
      }
    }

    // Eliminar de Firestore
    await admin.firestore().collection('distribuidores').doc(uid).delete();

    return res.status(200).json({ success: true, message: 'Distribuidor eliminado' });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
});