import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

// Vinculamos SweetAlert con React para poder renderizar componentes dentro si fuera necesario
const MySwal = withReactContent(Swal);

/**
 * Muestra un diálogo modal asíncrono y bloqueante.
 * * @param {Object} options
 * @param {string} options.title - Título principal
 * @param {string} options.text - Mensaje secundario
 * @param {string} options.icon - 'success' | 'error' | 'warning' | 'info' | 'question'
 * @param {boolean} options.showCancelButton - Define si se muestra el botón de cancelar
 * @param {string} options.confirmButtonText - Texto del botón de acción
 * @param {string} options.cancelButtonText - Texto del botón de cancelar
 * @returns {Promise<SweetAlertResult>} - Promesa que resuelve con el resultado de la interacción
 */
export const showDialog = async ({
  title,
  text,
  icon = 'info',
  showCancelButton = false, // Por defecto oculto, para usarlo como alerta simple
  confirmButtonText = 'Ok',
  cancelButtonText = 'Cancelar',
}) => {
  return MySwal.fire({
    title,
    text,
    icon,
    showCancelButton,

    // Colores corporativos
    confirmButtonColor: '#e78813', // Naranja SPACE
    cancelButtonColor: '#6b7280',  // Gris neutro (mejor UX que rojo chillón para cancelar)

    // Textos
    confirmButtonText,
    cancelButtonText,

    // Restricciones de cierre (Solicitado)
    allowOutsideClick: false,
    allowEscapeKey: false,

    // Mejoras de Usabilidad (Sugerencias)
    reverseButtons: true, // Pone el botón de acción a la derecha (estándar moderno)
    focusCancel: showCancelButton, // Por seguridad, el foco inicia en "Cancelar" si existe

    // Animación suave (opcional, acorde a tus modales)
    showClass: {
      popup: 'animate__animated animate__fadeInDown animate__faster'
    },
    hideClass: {
      popup: 'animate__animated animate__fadeOutUp animate__faster'
    }
  });
};

/**
 * EXTRA: Notificación tipo "Toast" pequeña en la esquina.
 * Ideal para mensajes de éxito que no requieren clic del usuario.
 */
export const showToast = (title, icon = 'success') => {
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer)
      toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
  });

  Toast.fire({
    icon,
    title
  });
};