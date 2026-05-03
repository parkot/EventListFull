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
    searchPlaceholder: 'Ctrl + K',
    wizard: 'Asistente'
  },
  menu: {
    navigation: 'Navegacion',
    dashboard: 'Panel',
    events: 'Eventos',
    people: 'Personas',
    administrators: 'Administradores',
    users: 'Usuarios',
    emailTemplates: 'Plantillas de correo',
    eventTemplates: 'Plantillas de evento',
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
      status: 'Estado',
      url: 'URL publica',
      copyUrl: 'Copiar URL',
      copied: 'Copiado'
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
  wizardPage: {
    title: 'Asistente de creacion de eventos',
    loading: 'Cargando datos del asistente...',
    steps: {
      createEvent: 'Crear evento',
      selectTemplate: 'Seleccionar plantilla',
      selectPeople: 'Seleccionar personas',
      preview: 'Vista previa',
      confirmAndSend: 'Confirmar y enviar'
    },
    actions: {
      backToEvents: 'Volver a eventos',
      back: 'Atras',
      next: 'Siguiente'
    },
    form: {
      title: 'Titulo del evento',
      occasionType: 'Tipo de ocasion',
      scheduledDateTime: 'Fecha y hora programadas',
      venue: 'Lugar',
      address: 'Direccion',
      defaultLanguage: 'Idioma predeterminado',
      timeZone: 'Zona horaria'
    },
    table: {
      name: 'Nombre',
      email: 'Correo',
      phone: 'Telefono'
    },
    preview: {
      eventSummary: 'Resumen del evento',
      title: 'Titulo',
      occasion: 'Ocasion',
      when: 'Cuando',
      venue: 'Lugar',
      address: 'Direccion',
      timeZone: 'Zona horaria',
      defaultLanguage: 'Idioma predeterminado',
      selectedTemplate: 'Plantilla seleccionada',
      noTemplateSelected: 'No hay plantilla seleccionada',
      recipients: 'Destinatarios',
      peopleSelected: '{{count}} personas seleccionadas'
    },
    confirm: {
      description: 'Listo para crear el evento, adjuntar las personas seleccionadas como invitados y enviar invitaciones.',
      confirmAndSend: 'Confirmar y enviar',
      eventId: 'Id del evento'
    },
    warnings: {
      noTemplates: 'No se encontraron plantillas de invitacion. Crea al menos una plantilla para poder enviar invitaciones.',
      noPeople: 'No se encontraron personas. Agrega personas primero desde la pagina Personas.'
    },
    validation: {
      titleRequired: 'El titulo del evento es obligatorio.',
      occasionTypeRequired: 'El tipo de ocasion es obligatorio.',
      scheduledRequired: 'La fecha y hora son obligatorias.',
      venueRequired: 'El lugar es obligatorio.',
      addressRequired: 'La direccion es obligatoria.',
      timeZoneRequired: 'La zona horaria es obligatoria.',
      templateRequired: 'Selecciona una plantilla.',
      peopleRequired: 'Selecciona al menos una persona.'
    },
    errors: {
      backendUnavailable: 'No se puede alcanzar la API backend. Verifica que EventList.Api este ejecutandose.',
      loadTemplates: 'Error al cargar plantillas.',
      loadPeople: 'Error al cargar personas.',
      loadWizardData: 'Error al cargar los datos del asistente.',
      createEvent: 'Error al crear el evento.',
      updateEvent: 'Error al actualizar el evento.',
      eventIdMissing: 'La API de eventos no devolvio un id de evento.',
      addGuests: 'Error al agregar las personas seleccionadas como invitados.',
      sendInvitations: 'Error al enviar invitaciones.',
      completeWizard: 'Error al completar el asistente.'
    },
    success: {
      sent: 'Las invitaciones se enviaron correctamente.'
    }
  },
  publicInvitation: {
    title: 'Invitacion',
    loading: 'Cargando invitacion...',
    welcome: 'Hola {{guestName}}',
    eventTitle: 'Evento',
    occasion: 'Ocasion',
    scheduled: 'Fecha y hora',
    venue: 'Lugar',
    address: 'Direccion',
    currentResponse: 'Respuesta actual',
    answerPrompt: 'Por favor elige tu respuesta',
    responseSaved: 'Tu respuesta ha sido guardada.',
    actions: {
      agree: 'Aceptar',
      dontKnow: 'No se',
      reject: 'Rechazar'
    },
    errors: {
      backendUnavailable: 'No se puede alcanzar la API backend en {{baseUrl}}. Inicia la API con: dotnet run --project src/Backend/EventList.Api',
      invalidInvitation: 'Este enlace de invitacion es invalido o ha expirado.',
      loadInvitation: 'No se puede cargar la invitacion ahora.',
      submitRsvp: 'No se puede enviar tu respuesta ahora.'
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
    resetPassword: {
      title: 'Restablecer contrasena',
      backToLogin: 'Volver al inicio de sesion',
      passwordLabel: 'Nueva contrasena',
      passwordPlaceholder: 'Ingresa tu nueva contrasena',
      confirmPasswordLabel: 'Confirmar contrasena',
      confirmPasswordPlaceholder: 'Repite la nueva contrasena',
      button: 'Restablecer contrasena',
      success: 'Tu contrasena fue restablecida exitosamente. Ya puedes iniciar sesion.',
      error: 'No se pudo restablecer la contrasena. El enlace puede haber expirado.',
      invalidToken: 'Token invalido o faltante. Solicita un nuevo enlace de recuperacion.',
      confirmPasswordRequired: 'Por favor confirma tu contrasena',
      passwordsMustMatch: 'Las contrasenas deben coincidir'
    },
    confirmEmail: {
      title: 'Confirma tu direccion de correo',
      backToLogin: 'Volver al inicio de sesion',
      instructions: 'Haz clic en el boton para confirmar tu direccion de correo.',
      button: 'Confirmar correo',
      successTitle: 'Gracias!',
      successMessage: 'Tu direccion de correo fue confirmada. Ya puedes iniciar sesion.',
      checkInboxTitle: 'Revisa tu bandeja de entrada',
      checkInboxMessage: 'Te enviamos un enlace de confirmacion. Abrelo para verificar tu correo.',
      checkInboxEmail: 'Correo de confirmacion enviado a: {{email}}',
      error: 'No se pudo confirmar tu correo ahora. El enlace puede ser invalido o haber expirado.'
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
      button: 'Crear cuenta',
      unableToRegister: 'No se puede crear tu cuenta ahora. Por favor intenta de nuevo.',
      emailAlreadyExists: 'Ya existe una cuenta con este correo. Por favor inicia sesion.',
      goToLogin: 'Ir a Iniciar sesion',
      successToast: 'Cuenta creada. Revisa tu correo para confirmar tu direccion.',
      welcome: {
        defaultName: 'amigo',
        title: 'Bienvenido, {{firstName}}',
        instructions: {
          line1: 'Tu cuenta esta lista y ahora puedes comenzar a organizar eventos.',
          line2: 'Usa el panel para crear eventos, gestionar invitados y seguir respuestas.',
          line3: 'Si es tu primera visita, comienza con el panel principal.'
        },
        goToDashboard: 'Ir al Panel de Administracion'
      }
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
  },
  emailTemplates: {
    title: 'Plantillas de correo',
    newTemplate: 'Nueva plantilla',
    adminOnly: 'Esta página solo está disponible para administradores.',
    sendTestEmail: 'Enviar correo de prueba',
    filterByType: 'Filtrar por tipo',
    filterByLanguage: 'Filtrar por idioma',
    all: 'Todos',
    search: 'Buscar',
    searchPlaceholder: 'Tipo, asunto, cuerpo',
    loading: 'Cargando plantillas...',
    noTemplates: 'Ninguna plantilla coincide con los filtros actuales.',
    edit: 'Editar',
    table: {
      action: 'Acción',
      type: 'Tipo',
      language: 'Idioma',
      subject: 'Asunto'
    },
    dialog: {
      saveTitle: 'Guardar plantilla de correo',
      testTitle: 'Enviar correo de prueba',
      typeLabel: 'Tipo',
      languageLabel: 'Idioma',
      languageHelper: 'Elige el idioma de la plantilla',
      subjectLabel: 'Asunto',
      bodyLabel: 'Cuerpo (HTML)',
      bodyHelper: 'Marcadores compatibles: {{Email}}, {{Token}}, {{ConfirmationLink}}, {{ResetLink}}, {{EventTitle}}, {{EventDate}}, {{EventLink}}',
      livePreview: 'Vista previa',
      previewCaption: 'La vista previa usa valores de muestra para verificar los marcadores antes de guardar.',
      toEmailLabel: 'Para (email)',
      templateTypeLabel: 'Tipo de plantilla',
      testLanguageHelper: 'Selecciona la versión de idioma de la plantilla a enviar',
      cancel: 'Cancelar',
      save: 'Guardar',
      send: 'Enviar'
    },
    success: {
      saved: 'Plantilla de correo guardada correctamente.',
      testSent: 'Correo de prueba enviado a {{toEmail}}.'
    },
    errors: {
      backendUnavailable: 'No se puede alcanzar la API en {{baseUrl}}. Inicia la API con: dotnet run --project src/Backend/EventList.Api',
      load: 'Error al cargar las plantillas de correo.',
      save: 'Error al guardar la plantilla de correo.',
      sendTest: 'Error al enviar el correo de prueba.',
      subjectBodyRequired: 'El asunto y el cuerpo son obligatorios.',
      recipientRequired: 'El correo del destinatario es obligatorio.',
      invalidEmail: 'Por favor, introduce una dirección de correo válida.'
    }
  },
  eventTemplates: {
    title: 'Plantillas de evento',
    newTemplate: 'Nueva plantilla',
    adminOnly: 'Esta pagina solo esta disponible para administradores.',
    filterByLanguage: 'Filtrar por idioma',
    all: 'Todos',
    search: 'Buscar',
    searchPlaceholder: 'Nombre, cuerpo',
    loading: 'Cargando plantillas...',
    noTemplates: 'Ninguna plantilla coincide con los filtros actuales.',
    edit: 'Editar',
    table: {
      action: 'Accion',
      name: 'Nombre',
      language: 'Idioma',
      created: 'Creado'
    },
    dialog: {
      saveTitle: 'Guardar plantilla de evento',
      nameLabel: 'Nombre',
      languageLabel: 'Idioma',
      bodyLabel: 'Cuerpo (HTML)',
      bodyHelper: 'Marcadores compatibles: {{GuestName}}, {{EventTitle}}, {{EventDateUtc}}, {{Venue}}, {{Address}}, {{InvitationLink}}, {{ScanCode}}, {{TableNumber}}',
      livePreview: 'Vista previa',
      previewCaption: 'La vista previa usa valores de muestra para verificar los marcadores antes de guardar.',
      cancel: 'Cancelar',
      save: 'Guardar'
    },
    success: {
      saved: 'Plantilla de evento guardada correctamente.'
    },
    errors: {
      backendUnavailable: 'No se puede alcanzar la API en {{baseUrl}}. Inicia la API con: dotnet run --project src/Backend/EventList.Api',
      load: 'Error al cargar las plantillas de evento.',
      save: 'Error al guardar la plantilla de evento.',
      nameBodyRequired: 'El nombre y el cuerpo son obligatorios.'
    }
  },
  usersPage: {
    title: 'Usuarios',
    createUser: 'Crear usuario',
    adminOnly: 'Esta página solo está disponible para administradores.',
    loading: 'Cargando usuarios...',
    noUsers: 'No se encontraron usuarios.',
    view: 'Ver',
    edit: 'Editar',
    yes: 'Sí',
    no: 'No',
    table: {
      action: 'Acción',
      email: 'Correo',
      role: 'Rol',
      language: 'Idioma',
      timeZone: 'Zona horaria',
      emailConfirmed: 'Correo confirmado',
      created: 'Creado',
      lastLogin: 'Último acceso'
    },
    createDialog: {
      title: 'Crear usuario',
      emailLabel: 'Correo',
      passwordLabel: 'Contraseña',
      roleLabel: 'Rol',
      preferredLanguageLabel: 'Idioma preferido',
      timeZoneLabel: 'Zona horaria',
      cancel: 'Cancelar',
      create: 'Crear'
    },
    editDialog: {
      title: 'Editar usuario',
      emailLabel: 'Correo',
      roleLabel: 'Rol',
      preferredLanguageLabel: 'Idioma preferido',
      timeZoneLabel: 'Zona horaria',
      emailConfirmedLabel: 'Correo confirmado',
      cancel: 'Cancelar',
      save: 'Guardar'
    },
    viewDialog: {
      title: 'Detalles del usuario',
      email: 'Correo',
      role: 'Rol',
      preferredLanguage: 'Idioma preferido',
      timeZone: 'Zona horaria',
      emailConfirmed: 'Correo confirmado',
      created: 'Creado',
      lastLogin: 'Último acceso',
      userId: 'ID de usuario',
      loadingDetails: 'Cargando detalles del usuario...',
      close: 'Cerrar'
    },
    success: {
      created: 'Usuario creado correctamente.',
      updated: 'Usuario actualizado correctamente.'
    },
    errors: {
      backendUnavailable: 'No se puede alcanzar la API en {{baseUrl}}. Inicia la API con: dotnet run --project src/Backend/EventList.Api',
      load: 'Error al cargar los usuarios.',
      create: 'Error al crear el usuario.',
      update: 'Error al actualizar el usuario.',
      loadDetails: 'Error al cargar los detalles del usuario.',
      emailPasswordRequired: 'El correo y la contraseña son obligatorios.',
      emailRequired: 'El correo es obligatorio.',
      invalidEmail: 'Por favor, introduce una dirección de correo válida.'
    }
  },
  peoplePage: {
    title: 'Personas',
    importAvailability: 'Importar disponibilidad (Excel)',
    createPerson: 'Crear persona',
    active: 'Activos',
    archived: 'Archivados',
    loading: 'Cargando personas {{view}}...',
    noArchivedPeople: 'No hay personas archivadas aún.',
    noPeople: 'No hay personas aún. Crea una persona o importa disponibilidad desde un archivo Excel.',
    edit: 'Editar',
    archive: 'Archivar',
    restore: 'Restaurar',
    table: {
      action: 'Acción',
      fullName: 'Nombre completo',
      email: 'Correo',
      phone: 'Teléfono',
      availability: 'Disponibilidad',
      archivedAt: 'Archivado el'
    },
    dialog: {
      createTitle: 'Crear persona',
      editTitle: 'Editar persona',
      fullNameLabel: 'Nombre completo',
      emailLabel: 'Correo',
      phoneLabel: 'Teléfono',
      availabilityLabel: 'Disponibilidad',
      availabilityPlaceholder: 'Ejemplo: Lun-Vie 09:00-18:00',
      cancel: 'Cancelar',
      save: 'Guardar',
      create: 'Crear'
    },
    confirmArchive: '¿Archivar a {{name}}?',
    confirmRestore: '¿Restaurar a {{name}}?',
    success: {
      archived: 'Persona archivada correctamente.',
      restored: 'Persona restaurada correctamente.',
      created: 'Persona creada correctamente.',
      updated: 'Persona actualizada correctamente.',
      importComplete: 'Importación de Excel completa. Añadidos {{added}}, actualizados {{updated}}.'
    },
    errors: {
      backendUnavailable: 'No se puede alcanzar la API en {{baseUrl}}. Inicia la API con: dotnet run --project src/Backend/EventList.Api',
      load: 'No se pueden cargar las personas ahora mismo.',
      loadArchived: 'No se pueden cargar las personas archivadas ahora mismo.',
      archive: 'Error al archivar la persona.',
      restore: 'Error al restaurar la persona.',
      create: 'Error al crear la persona.',
      update: 'Error al actualizar la persona.',
      importFailed: 'No se pudo importar este archivo. Sube un archivo .xlsx o .xls válido.',
      importApiError: 'Error al importar personas desde Excel.',
      emptyFile: 'El archivo Excel seleccionado está vacío.',
      fullNameEmailRequired: 'El nombre completo y el correo son obligatorios.',
      invalidEmail: 'Por favor, introduce una dirección de correo válida.'
    }
  }
};

export default es;
