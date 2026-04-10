const es = {
  common: {
    home: 'Inicio',
    loading: 'Cargando...',
    and: 'y'
  },
  language: {
    label: 'Idioma',
    english: 'Ingles',
    spanish: 'Espanol',
    greek: 'Griego'
  },
  header: {
    downloadFreeVersion: 'Descargar version gratis',
    searchPlaceholder: 'Ctrl + K'
  },
  menu: {
    navigation: 'Navegacion',
    dashboard: 'Panel',
    events: 'Eventos',
    authentication: 'Autenticacion',
    login: 'Iniciar sesion',
    register: 'Registrarse',
    utilities: 'Utilidades',
    typography: 'Tipografia',
    color: 'Color',
    shadow: 'Sombra',
    support: 'Soporte',
    samplePage: 'Pagina de ejemplo',
    documentation: 'Documentacion'
  },
  footer: {
    rightsReserved: 'Todos los derechos reservados',
    hireUs: 'Contratanos',
    license: 'Licencia',
    terms: 'Terminos',
    figmaDesignSystem: 'Sistema de diseno Figma'
  },
  dashboard: {
    title: 'Panel',
    apiHealth: 'Salud de API',
    checking: 'Verificando...',
    currentUser: 'Usuario actual',
    signedIn: 'Sesion iniciada',
    signedInAccount: 'Cuenta con sesion iniciada',
    userRole: 'Usuario',
    sessionInvalid: 'Sesion invalida',
    loginAgain: 'Inicia sesion de nuevo',
    totalOrder: 'Pedidos totales',
    totalSales: 'Ventas totales',
    incomeOverview: 'Resumen de ingresos',
    thisWeekStatistics: 'Estadisticas de esta semana',
    recentOrders: 'Pedidos recientes',
    exportCsv: 'Exportar CSV',
    exportExcel: 'Exportar Excel',
    printTable: 'Imprimir tabla',
    analyticsReport: 'Reporte analitico',
    weekly: 'Semanal',
    monthly: 'Mensual',
    yearly: 'Anual',
    financeGrowth: 'Crecimiento financiero',
    expensesRatio: 'Ratio de gastos',
    businessRiskCases: 'Casos de riesgo',
    low: 'Bajo',
    transactionHistory: 'Historial de transacciones',
    helpSupportChat: 'Chat de ayuda y soporte',
    typicalReply: 'Respuesta tipica en 5 min',
    needHelp: 'Necesitas ayuda?'
  },
  eventsPage: {
    title: 'Eventos',
    createNewEvent: 'Crear nuevo evento',
    loadingEvents: 'Cargando eventos...',
    noEvents: 'Aun no hay eventos. Crea tu primer evento.',
    edit: 'Editar',
    createEvent: 'Crear evento',
    editEvent: 'Editar evento',
    save: 'Guardar',
    saveChanges: 'Guardar cambios',
    cancel: 'Cancelar',
    close: 'Cerrar',
    guestsTitle: 'Invitados',
    loadingGuests: 'Cargando invitados...',
    noGuests: 'No se encontraron invitados para este evento.',
    eventFallback: 'Evento',
    table: {
      edit: 'Editar',
      title: 'Titulo',
      occasion: 'Ocasion',
      scheduledLocal: 'Programado (local)',
      venue: 'Lugar',
      guests: 'Invitados'
    },
    form: {
      title: 'Titulo',
      occasionType: 'Tipo de ocasion',
      scheduledDateTime: 'Fecha y hora programada',
      venue: 'Lugar',
      address: 'Direccion',
      timeZone: 'Zona horaria',
      defaultLanguage: 'Idioma predeterminado'
    },
    guestsTable: {
      name: 'Nombre',
      countPerson: 'Cantidad de personas',
      status: 'Estado'
    },
    rsvp: {
      accepted: 'Aceptado',
      rejected: 'Rechazado',
      maybe: 'Quizas',
      pending: 'Pendiente'
    },
    errors: {
      backendUnavailable: 'No se puede alcanzar la API backend en {{baseUrl}}. Inicia la API con: dotnet run --project src/Backend/EventList.Api',
      loadEvents: 'No se pueden cargar los eventos ahora.',
      loadEventDetails: 'Error al cargar los detalles del evento.',
      loadGuests: 'Error al cargar invitados.',
      createEvent: 'Error al crear evento.',
      updateEvent: 'Error al actualizar evento.'
    },
    validation: {
      titleMax: 'El titulo debe tener 120 caracteres o menos',
      titleRequired: 'El titulo es obligatorio',
      occasionTypeMax: 'El tipo de ocasion debe tener 60 caracteres o menos',
      occasionTypeRequired: 'El tipo de ocasion es obligatorio',
      scheduledAtRequired: 'La fecha y hora son obligatorias',
      venueMax: 'El lugar debe tener 160 caracteres o menos',
      venueRequired: 'El lugar es obligatorio',
      addressMax: 'La direccion debe tener 240 caracteres o menos',
      addressRequired: 'La direccion es obligatoria',
      timeZoneMax: 'La zona horaria debe tener 100 caracteres o menos',
      timeZoneRequired: 'La zona horaria es obligatoria',
      defaultLanguageMax: 'El idioma debe tener 10 caracteres o menos',
      defaultLanguageRequired: 'El idioma predeterminado es obligatorio'
    }
  },
  auth: {
    login: {
      title: 'Iniciar sesion',
      noAccount: '¿No tienes una cuenta?',
      emailLabel: 'Correo electronico',
      emailPlaceholder: 'Ingresa tu correo',
      passwordLabel: 'Contrasena',
      passwordPlaceholder: 'Ingresa tu contrasena',
      keepSignedIn: 'Mantenerme conectado',
      forgotPassword: '¿Olvidaste tu contrasena?',
      button: 'Iniciar sesion',
      invalidCredentials: 'Correo o contrasena invalidos.',
      unableToLogin: 'No se puede iniciar sesion ahora. Por favor intenta de nuevo.'
    },
    forgotPassword: {
      title: 'Olvide mi contrasena',
      backToLogin: 'Volver al inicio de sesion',
      emailLabel: 'Correo electronico',
      emailPlaceholder: 'Ingresa tu correo',
      button: 'Enviar enlace de recuperacion',
      success: 'Si el correo existe, se envio un enlace de recuperacion.',
      error: 'No se pudo enviar el enlace ahora. Intenta de nuevo.'
    },
    register: {
      title: 'Registrarse',
      haveAccount: '¿Ya tienes una cuenta?',
      firstNameLabel: 'Nombre*',
      lastNameLabel: 'Apellido*',
      phoneLabel: 'Telefono',
      emailLabel: 'Correo electronico*',
      passwordLabel: 'Contrasena',
      firstNamePlaceholder: 'Juan',
      lastNamePlaceholder: 'Garcia',
      countryCodePlaceholder: '+34',
      phonePlaceholder: '600123456',
      emailPlaceholder: 'demo@empresa.com',
      agreeText: 'Al registrarte, aceptas nuestros',
      termsOfService: 'Terminos de servicio',
      privacyPolicy: 'Politica de privacidad',
      button: 'Crear cuenta'
    },
    validation: {
      mustBeValidEmail: 'Debe ser un correo valido',
      emailRequired: 'El correo es obligatorio',
      passwordRequired: 'La contrasena es obligatoria',
      passwordNoSpaces: 'La contrasena no puede comenzar ni terminar con espacios',
      passwordTooLongLogin: 'La contrasena debe tener menos de 100 caracteres',
      passwordTooLongRegister: 'La contrasena debe tener menos de 10 caracteres',
      firstNameRequired: 'El nombre es obligatorio',
      lastNameRequired: 'El apellido es obligatorio'
    }
  }
};

export default es;
