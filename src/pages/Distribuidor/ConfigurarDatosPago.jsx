// src/components/PanelDistribuidor/ConfigurarDatosPago.jsx
import { useState, useEffect } from 'react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase/config';

export const ConfigurarDatosPago = ({ distribuidorData, onActualizar, onCambiarSeccion }) => {
  const [datosPago, setDatosPago] = useState({
    banco: '',
    tipoCuenta: '',
    numeroCuenta: '',
    titular: '',
    documento: ''
  });

  const [guardando, setGuardando] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [datosGuardados, setDatosGuardados] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [mostrarNotif, setMostrarNotif] = useState(false);
  const [notifData, setNotifData] = useState({ tipo: '', mensaje: '' });

  // Cargar datos directamente desde Firestore al montar
  useEffect(() => {
    cargarDatosPagoDesdeFirestore();
  }, []);

  // También escuchar cambios en distribuidorData (por si se actualiza)
  useEffect(() => {
    if (distribuidorData?.datosPago?.configurado && !cargando) {
      actualizarEstadoConDatos(distribuidorData.datosPago);
    }
  }, [distribuidorData]);

  const cargarDatosPagoDesdeFirestore = async () => {
    try {
      const user = auth.currentUser;
      
      if (!user) {
        console.error('❌ No hay usuario autenticado');
        setCargando(false);
        setModoEdicion(true);
        return;
      }

      const uid = user.uid;
      console.log('🔍 Cargando datos de pago desde Firestore para UID:', uid);

      const distribuidorRef = doc(db, 'distribuidores', uid);
      const distribuidorSnap = await getDoc(distribuidorRef);

      if (distribuidorSnap.exists()) {
        const data = distribuidorSnap.data();
        console.log('📄 Datos del distribuidor:', data);

        if (data.datosPago?.configurado) {
          console.log('✅ Datos de pago encontrados:', data.datosPago);
          actualizarEstadoConDatos(data.datosPago);
        } else {
          console.log('⚠️ No hay datos de pago configurados');
          setDatosGuardados(false);
          setModoEdicion(true);
        }
      } else {
        console.log('⚠️ Documento del distribuidor no existe');
        setDatosGuardados(false);
        setModoEdicion(true);
      }
    } catch (error) {
      console.error('❌ Error al cargar datos de pago:', error);
      setDatosGuardados(false);
      setModoEdicion(true);
    } finally {
      setCargando(false);
    }
  };

  const actualizarEstadoConDatos = (datosPagoFirestore) => {
    setDatosPago({
      banco: datosPagoFirestore.banco || '',
      tipoCuenta: datosPagoFirestore.tipoCuenta || '',
      numeroCuenta: datosPagoFirestore.numeroCuenta || '',
      titular: datosPagoFirestore.titular || '',
      documento: datosPagoFirestore.documento || ''
    });
    setDatosGuardados(true);
    setModoEdicion(false);
  };

  const handleChange = (e) => {
    setDatosPago({
      ...datosPago,
      [e.target.name]: e.target.value
    });
  };

  const mostrarNotificacion = (tipo, mensaje) => {
    setNotifData({ tipo, mensaje });
    setMostrarNotif(true);
    setTimeout(() => {
      setMostrarNotif(false);
    }, 3000);
  };

  const activarEdicion = () => {
    setModoEdicion(true);
  };

  const cancelarEdicion = () => {
    // Recargar datos desde Firestore para restaurar valores originales
    cargarDatosPagoDesdeFirestore();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const user = auth.currentUser;
    
    if (!user) {
      console.error('❌ Error: No hay usuario autenticado');
      mostrarNotificacion('error', 'Error: Sesión no válida');
      return;
    }

    const uid = user.uid;

    setGuardando(true);

    try {
      console.log('💾 Guardando datos de pago para distribuidor:', uid);

      const distribuidorRef = doc(db, 'distribuidores', uid);

      const datosPagoParaGuardar = {
        banco: datosPago.banco,
        tipoCuenta: datosPago.tipoCuenta,
        numeroCuenta: datosPago.numeroCuenta,
        titular: datosPago.titular,
        documento: datosPago.documento,
        configurado: true,
        fechaActualizacion: new Date().toISOString()
      };

      await setDoc(
        distribuidorRef,
        {
          datosPago: datosPagoParaGuardar
        },
        { merge: true }
      );

      console.log('✅ Datos de pago guardados exitosamente');

      setDatosGuardados(true);
      setModoEdicion(false);

      mostrarNotificacion('success', '¡Datos guardados correctamente! 💾');

      if (onActualizar) {
        onActualizar();
      }

      // Recargar datos desde Firestore para confirmar guardado
      setTimeout(async () => {
        await cargarDatosPagoDesdeFirestore();
        
        if (onCambiarSeccion) {
          onCambiarSeccion('resumen');
        }
      }, 1500);

    } catch (error) {
      console.error('❌ Error al guardar datos de pago:', error);
      mostrarNotificacion('error', 'Error al guardar datos. Intenta de nuevo.');
    } finally {
      setGuardando(false);
    }
  };

  // Mostrar loading mientras carga
  if (cargando) {
    return (
      <div className="configurar-datos-pago-container">
        <h2>Configurar Datos de Pago 💳</h2>
        <div className="loading-container" style={{ padding: '40px', textAlign: 'center' }}>
          <div className="spinner-small" style={{ margin: '0 auto 20px' }}></div>
          <p>Cargando información bancaria...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="configurar-datos-pago-container">
      <h2>Configurar Datos de Pago 💳</h2>
      <p className="subtitle">
        {datosGuardados 
          ? 'Tus datos bancarios están configurados. Puedes editarlos si es necesario.' 
          : 'Configura tus datos bancarios para recibir tus comisiones'
        }
      </p>

      {/* MODO VISTA: Datos guardados y no editando */}
      {datosGuardados && !modoEdicion ? (
        <div className="datos-pago-vista">
          <div className="alerta-info">
            ℹ️ <strong>Cuenta Bancaria Configurada</strong>
            <p>Esta es la cuenta donde recibirás tus pagos. Si necesitas modificarla, haz clic en "Editar".</p>
          </div>

          <div className="datos-resumen vista-completa">
            <h4>📋 Información Bancaria Actual</h4>
            <div className="datos-resumen-grid">
              <div className="resumen-item">
                <span className="label">Banco</span>
                <span className="value">{datosPago.banco}</span>
              </div>
              <div className="resumen-item">
                <span className="label">Tipo de Cuenta</span>
                <span className="value">{datosPago.tipoCuenta}</span>
              </div>
              <div className="resumen-item">
                <span className="label">Número de Cuenta</span>
                <span className="value">{datosPago.numeroCuenta}</span>
              </div>
              <div className="resumen-item">
                <span className="label">Titular</span>
                <span className="value">{datosPago.titular}</span>
              </div>
              <div className="resumen-item">
                <span className="label">Documento</span>
                <span className="value">{datosPago.documento}</span>
              </div>
            </div>
          </div>

          <div className="acciones-vista">
            <button 
              onClick={activarEdicion}
              className="btn-editar-datos"
            >
              ✏️ Editar Datos Bancarios
            </button>
          </div>

          <div className="info-seguridad">
            <div className="info-icon">🔒</div>
            <div className="info-texto">
              <strong>Tus datos están seguros</strong>
              <p>
                Esta información es confidencial y solo será utilizada para
                procesar tus pagos de comisiones.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* MODO EDICIÓN: Formulario activo */
        <form className="form-datos-pago" onSubmit={handleSubmit}>
          {datosGuardados && (
            <div className="alerta-edicion">
              ⚠️ <strong>Modo Edición Activo</strong>
              <p>Estás modificando tus datos bancarios. Asegúrate de que la información sea correcta.</p>
            </div>
          )}

          {/* Banco */}
          <div className="form-group">
            <label htmlFor="banco">Banco *</label>
            <select
              id="banco"
              name="banco"
              value={datosPago.banco}
              onChange={handleChange}
              required
              disabled={guardando}
            >
              <option value="">Selecciona tu banco</option>
              <option value="Bancolombia">Bancolombia</option>
              <option value="Banco de Bogotá">Banco de Bogotá</option>
              <option value="Davivienda">Davivienda</option>
              <option value="BBVA">BBVA</option>
              <option value="Banco Popular">Banco Popular</option>
              <option value="Banco Occidente">Banco Occidente</option>
              <option value="Banco Agrario">Banco Agrario</option>
              <option value="Banco AV Villas">Banco AV Villas</option>
              <option value="Banco Caja Social">Banco Caja Social</option>
              <option value="Banco Falabella">Banco Falabella</option>
              <option value="Banco GNB Sudameris">Banco GNB Sudameris</option>
              <option value="Banco Pichincha">Banco Pichincha</option>
              <option value="Bancoomeva">Bancoomeva</option>
              <option value="Citibank">Citibank</option>
              <option value="Itaú">Itaú</option>
              <option value="Scotiabank Colpatria">Scotiabank Colpatria</option>
              <option value="Nequi">Nequi</option>
              <option value="Daviplata">Daviplata</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          {/* Tipo de Cuenta */}
          <div className="form-group">
            <label htmlFor="tipoCuenta">Tipo de Cuenta *</label>
            <select
              id="tipoCuenta"
              name="tipoCuenta"
              value={datosPago.tipoCuenta}
              onChange={handleChange}
              required
              disabled={guardando}
            >
              <option value="">Selecciona el tipo</option>
              <option value="Ahorros">Ahorros</option>
              <option value="Corriente">Corriente</option>
            </select>
          </div>

          {/* Número de Cuenta */}
          <div className="form-group full-width">
            <label htmlFor="numeroCuenta">Número de Cuenta *</label>
            <input
              type="text"
              id="numeroCuenta"
              name="numeroCuenta"
              placeholder="Ej: 1234567890"
              value={datosPago.numeroCuenta}
              onChange={handleChange}
              required
              disabled={guardando}
            />
            <span className="input-hint">
              Ingresa el número completo de tu cuenta bancaria
            </span>
          </div>

          {/* Titular */}
          <div className="form-group">
            <label htmlFor="titular">Titular de la Cuenta *</label>
            <input
              type="text"
              id="titular"
              name="titular"
              placeholder="Nombre completo del titular"
              value={datosPago.titular}
              onChange={handleChange}
              required
              disabled={guardando}
            />
          </div>

          {/* Documento */}
          <div className="form-group">
            <label htmlFor="documento">Documento de Identidad *</label>
            <input
              type="text"
              id="documento"
              name="documento"
              placeholder="Ej: 1234567890"
              value={datosPago.documento}
              onChange={handleChange}
              required
              disabled={guardando}
            />
            <span className="input-hint">
              Cédula o NIT del titular
            </span>
          </div>

          {/* Resumen de Datos */}
          {(datosPago.banco || datosPago.numeroCuenta || datosPago.titular) && (
            <div className="datos-resumen">
              <h4>Resumen de tus datos</h4>
              <div className="datos-resumen-grid">
                {datosPago.banco && (
                  <div className="resumen-item">
                    <span className="label">Banco</span>
                    <span className="value">{datosPago.banco}</span>
                  </div>
                )}
                {datosPago.tipoCuenta && (
                  <div className="resumen-item">
                    <span className="label">Tipo de Cuenta</span>
                    <span className="value">{datosPago.tipoCuenta}</span>
                  </div>
                )}
                {datosPago.numeroCuenta && (
                  <div className="resumen-item">
                    <span className="label">Número de Cuenta</span>
                    <span className="value">{datosPago.numeroCuenta}</span>
                  </div>
                )}
                {datosPago.titular && (
                  <div className="resumen-item">
                    <span className="label">Titular</span>
                    <span className="value">{datosPago.titular}</span>
                  </div>
                )}
                {datosPago.documento && (
                  <div className="resumen-item">
                    <span className="label">Documento</span>
                    <span className="value">{datosPago.documento}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Botones de Acción */}
          <div className="form-actions">
            {datosGuardados && (
              <button
                type="button"
                onClick={cancelarEdicion}
                className="btn-cancelar-edicion"
                disabled={guardando}
              >
                ❌ Cancelar
              </button>
            )}
            
            <button
              type="submit"
              className="btn-guardar-datos"
              disabled={guardando}
            >
              {guardando ? (
                <>
                  <span className="spinner-small"></span>
                  Guardando...
                </>
              ) : (
                <>
                  💾 {datosGuardados ? 'Guardar Cambios' : 'Guardar Datos'}
                </>
              )}
            </button>
          </div>

          {/* Información de Seguridad */}
          <div className="info-seguridad">
            <div className="info-icon">🔒</div>
            <div className="info-texto">
              <strong>Tus datos están seguros</strong>
              <p>
                Esta información es confidencial y solo será utilizada para
                procesar tus pagos de comisiones. No compartimos tus datos con
                terceros.
              </p>
            </div>
          </div>
        </form>
      )}

      {/* Notificación */}
      {mostrarNotif && (
        <div className={`notification-toast notification-${notifData.tipo}`}>
          <span className="notification-icon">
            {notifData.tipo === 'success' ? '✅' : '❌'}
          </span>
          <span className="notification-message">{notifData.mensaje}</span>
          <button
            className="notification-close"
            onClick={() => setMostrarNotif(false)}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};