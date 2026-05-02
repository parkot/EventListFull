const el = {
  common: {
    home: 'Αρχική',
    loading: 'Φόρτωση...',
    and: 'και'
  },
  language: {
    label: 'Γλώσσα',
    english: 'Αγγλικά',
    spanish: 'Ισπανικά',
    greek: 'Ελληνικά'
  },
  header: {
    downloadFreeVersion: 'Λήψη δωρεάν έκδοσης',
    searchPlaceholder: 'Ctrl + K'
  },
  menu: {
    navigation: 'Πλοήγηση',
    dashboard: 'Πίνακας',
    events: 'Εκδηλώσεις',
    people: 'Άτομα',
    administrators: 'Διαχειριστές',
    users: 'Χρήστες',
    emailTemplates: 'Πρότυπα email',
    authentication: 'Αυθεντικοποίηση',
    login: 'Σύνδεση',
    register: 'Εγγραφή',
    utilities: 'Εργαλεία',
    typography: 'Τυπογραφία',
    color: 'Χρώμα',
    shadow: 'Σκιά',
    support: 'Υποστήριξη',
    samplePage: 'Δείγμα σελίδας',
    documentation: 'Τεκμηρίωση'
  },
  footer: {
    rightsReserved: 'Με επιφύλαξη παντός δικαιώματος',
    hireUs: 'Προσλάβετε μας',
    license: 'Άδεια',
    terms: 'Όροι',
    figmaDesignSystem: 'Σύστημα σχεδίασης Figma'
  },
  dashboard: {
    title: 'Πίνακας',
    apiHealth: 'Κατάσταση API',
    checking: 'Έλεγχος...',
    currentUser: 'Τρέχων χρήστης',
    signedIn: 'Συνδεδεμένος',
    signedInAccount: 'Συνδεδεμένος λογαριασμός',
    userRole: 'Χρήστης',
    sessionInvalid: 'Μη έγκυρη σύνοδος',
    loginAgain: 'Παρακαλώ συνδεθείτε ξανά',
    totalOrder: 'Σύνολο παραγγελιών',
    totalSales: 'Συνολικές πωλήσεις',
    incomeOverview: 'Επισκόπηση εσόδων',
    thisWeekStatistics: 'Στατιστικά εβδομάδας',
    recentOrders: 'Πρόσφατες παραγγελίες',
    exportCsv: 'Εξαγωγή CSV',
    exportExcel: 'Εξαγωγή Excel',
    printTable: 'Εκτύπωση πίνακα',
    analyticsReport: 'Αναλυτική έκθεση',
    weekly: 'Εβδομαδιαία',
    monthly: 'Μηνιαία',
    yearly: 'Ετήσια',
    financeGrowth: 'Οικονομική ανάπτυξη εταιρείας',
    expensesRatio: 'Αναλογία εξόδων',
    businessRiskCases: 'Επιχειρηματικοί κίνδυνοι',
    low: 'Χαμηλός',
    transactionHistory: 'Ιστορικό συναλλαγών',
    helpSupportChat: 'Βοήθεια & Υποστήριξη',
    typicalReply: 'Συνήθης απάντηση εντός 5 λεπτών',
    needHelp: 'Χρειάζεστε βοήθεια;'
  },
  eventsPage: {
    title: 'Εκδηλώσεις',
    createNewEvent: 'Δημιουργία νέας εκδήλωσης',
    loadingEvents: 'Φόρτωση εκδηλώσεων...',
    noEvents: 'Δεν υπάρχουν εκδηλώσεις ακόμα. Δημιουργήστε την πρώτη σας εκδήλωση.',
    edit: 'Επεξεργασία',
    createEvent: 'Δημιουργία εκδήλωσης',
    editEvent: 'Επεξεργασία εκδήλωσης',
    save: 'Αποθήκευση',
    saveChanges: 'Αποθήκευση αλλαγών',
    cancel: 'Ακύρωση',
    close: 'Κλείσιμο',
    guestsTitle: 'Καλεσμένοι',
    loadingGuests: 'Φόρτωση καλεσμένων...',
    noGuests: 'Δεν βρέθηκαν καλεσμένοι για αυτή την εκδήλωση.',
    eventFallback: 'Εκδήλωση',
    table: {
      edit: 'Επεξεργασία',
      title: 'Τίτλος',
      occasion: 'Περίσταση',
      scheduledLocal: 'Προγραμματισμένο (τοπική ώρα)',
      venue: 'Χώρος',
      guests: 'Καλεσμένοι'
    },
    form: {
      title: 'Τίτλος',
      occasionType: 'Τύπος περίστασης',
      scheduledDateTime: 'Ημερομηνία και ώρα',
      venue: 'Χώρος',
      address: 'Διεύθυνση',
      timeZone: 'Ζώνη ώρας',
      defaultLanguage: 'Προεπιλεγμένη γλώσσα'
    },
    guestsTable: {
      name: 'Όνομα',
      countPerson: 'Αριθμός ατόμων',
      status: 'Κατάσταση',
      url: 'Δημόσιο URL',
      copyUrl: 'Αντιγραφή URL',
      copied: 'Αντιγράφηκε'
    },
    rsvp: {
      accepted: 'Αποδοχή',
      rejected: 'Απόρριψη',
      maybe: 'Ίσως',
      pending: 'Σε εκκρεμότητα'
    },
    errors: {
      backendUnavailable:
        'Αδυναμία πρόσβασης στο backend API στο {{baseUrl}}. Ξεκινήστε το API με: dotnet run --project src/Backend/EventList.Api',
      loadEvents: 'Αδυναμία φόρτωσης εκδηλώσεων αυτή τη στιγμή.',
      loadEventDetails: 'Αποτυχία φόρτωσης λεπτομερειών εκδήλωσης.',
      loadGuests: 'Αποτυχία φόρτωσης καλεσμένων.',
      createEvent: 'Αποτυχία δημιουργίας εκδήλωσης.',
      updateEvent: 'Αποτυχία ενημέρωσης εκδήλωσης.'
    },
    validation: {
      titleMax: 'Ο τίτλος πρέπει να έχει έως 120 χαρακτήρες',
      titleRequired: 'Ο τίτλος είναι υποχρεωτικός',
      occasionTypeMax: 'Ο τύπος περίστασης πρέπει να έχει έως 60 χαρακτήρες',
      occasionTypeRequired: 'Ο τύπος περίστασης είναι υποχρεωτικός',
      scheduledAtRequired: 'Η ημερομηνία και ώρα είναι υποχρεωτικές',
      venueMax: 'Ο χώρος πρέπει να έχει έως 160 χαρακτήρες',
      venueRequired: 'Ο χώρος είναι υποχρεωτικός',
      addressMax: 'Η διεύθυνση πρέπει να έχει έως 240 χαρακτήρες',
      addressRequired: 'Η διεύθυνση είναι υποχρεωτική',
      timeZoneMax: 'Η ζώνη ώρας πρέπει να έχει έως 100 χαρακτήρες',
      timeZoneRequired: 'Η ζώνη ώρας είναι υποχρεωτική',
      defaultLanguageMax: 'Η γλώσσα πρέπει να έχει έως 10 χαρακτήρες',
      defaultLanguageRequired: 'Η προεπιλεγμένη γλώσσα είναι υποχρεωτική'
    }
  },
  publicInvitation: {
    title: 'Πρόσκληση',
    loading: 'Φόρτωση πρόσκλησης...',
    welcome: 'Γεια σου {{guestName}}',
    eventTitle: 'Εκδήλωση',
    occasion: 'Περίσταση',
    scheduled: 'Ημερομηνία και ώρα',
    venue: 'Χώρος',
    address: 'Διεύθυνση',
    currentResponse: 'Τρέχουσα απάντηση',
    answerPrompt: 'Παρακαλώ επίλεξε την απάντησή σου',
    responseSaved: 'Η απάντησή σου αποθηκεύτηκε.',
    actions: {
      agree: 'Συμφωνώ',
      dontKnow: 'Δεν ξέρω',
      reject: 'Απόρριψη'
    },
    errors: {
      backendUnavailable:
        'Αδυναμία πρόσβασης στο backend API στο {{baseUrl}}. Ξεκινήστε το API με: dotnet run --project src/Backend/EventList.Api',
      invalidInvitation: 'Αυτός ο σύνδεσμος πρόσκλησης δεν είναι έγκυρος ή έχει λήξει.',
      loadInvitation: 'Αδυναμία φόρτωσης της πρόσκλησης αυτή τη στιγμή.',
      submitRsvp: 'Αδυναμία αποστολής της απάντησής σου αυτή τη στιγμή.'
    }
  },
  auth: {
    login: {
      title: 'Σύνδεση',
      noAccount: 'Δεν έχετε λογαριασμό;',
      emailLabel: 'Διεύθυνση email',
      emailPlaceholder: 'Εισάγετε email',
      passwordLabel: 'Κωδικός',
      passwordPlaceholder: 'Εισάγετε κωδικό',
      keepSignedIn: 'Παραμονή συνδεδεμένου',
      forgotPassword: 'Ξεχάσατε τον κωδικό;',
      button: 'Σύνδεση',
      invalidCredentials: 'Μη έγκυρο email ή κωδικός.',
      unableToLogin: 'Αδυναμία σύνδεσης αυτή τη στιγμή. Δοκιμάστε ξανά.'
    },
    forgotPassword: {
      title: 'Ξέχασα τον κωδικό',
      backToLogin: 'Επιστροφή στη σύνδεση',
      emailLabel: 'Διεύθυνση email',
      emailPlaceholder: 'Εισάγετε email',
      button: 'Αποστολή συνδέσμου επαναφοράς',
      success: 'Αν υπάρχει το email, στάλθηκε σύνδεσμος επαναφοράς.',
      error: 'Αδυναμία αποστολής συνδέσμου τώρα. Δοκιμάστε ξανά.'
    },
    register: {
      title: 'Εγγραφή',
      haveAccount: 'Έχετε ήδη λογαριασμό;',
      firstNameLabel: 'Όνομα*',
      lastNameLabel: 'Επώνυμο*',
      phoneLabel: 'Τηλέφωνο',
      emailLabel: 'Διεύθυνση email*',
      passwordLabel: 'Κωδικός',
      firstNamePlaceholder: 'Γιώργος',
      lastNamePlaceholder: 'Παπαδόπουλος',
      countryCodePlaceholder: '+30',
      phonePlaceholder: '6912345678',
      emailPlaceholder: 'demo@etaireia.gr',
      agreeText: 'Με την εγγραφή σας αποδέχεστε τους',
      termsOfService: 'Όρους χρήσης',
      privacyPolicy: 'Πολιτική απορρήτου',
      button: 'Δημιουργία λογαριασμού',
      unableToRegister: 'Αδυναμία δημιουργίας λογαριασμού αυτή τη στιγμή. Προσπαθήστε ξανά.',
      emailAlreadyExists: 'Υπάρχει ήδη λογαριασμός με αυτό το email. Παρακαλώ συνδεθείτε.',
      goToLogin: 'Μετάβαση στη Σύνδεση',
      successToast: 'Ο λογαριασμός δημιουργήθηκε. Ανακατεύθυνση...',
      welcome: {
        defaultName: 'φίλε',
        title: 'Καλώς ήρθες, {{firstName}}',
        instructions: {
          line1: 'Ο λογαριασμός σου είναι έτοιμος και μπορείς να ξεκινήσεις τη διοργάνωση εκδηλώσεων.',
          line2: 'Χρησιμοποίησε τον πίνακα για δημιουργία εκδηλώσεων, διαχείριση καλεσμένων και παρακολούθηση απαντήσεων.',
          line3: 'Αν είναι η πρώτη σου επίσκεψη, ξεκίνα από την αρχική εικόνα του πίνακα.'
        },
        goToDashboard: 'Μετάβαση Στον Πίνακα Διαχείρισης'
      }
    },
    validation: {
      mustBeValidEmail: 'Πρέπει να είναι έγκυρο email',
      emailRequired: 'Το email είναι υποχρεωτικό',
      passwordRequired: 'Ο κωδικός είναι υποχρεωτικός',
      passwordNoSpaces: 'Ο κωδικός δεν μπορεί να αρχίζει ή να τελειώνει με κενά',
      passwordTooLongLogin: 'Ο κωδικός πρέπει να έχει λιγότερους από 100 χαρακτήρες',
      passwordTooLongRegister: 'Ο κωδικός πρέπει να έχει λιγότερους από 10 χαρακτήρες',
      firstNameRequired: 'Το όνομα είναι υποχρεωτικό',
      lastNameRequired: 'Το επώνυμο είναι υποχρεωτικό'
    }
  },
  emailTemplates: {
    title: 'Πρότυπα email',
    newTemplate: 'Νέο πρότυπο',
    adminOnly: 'Αυτή η σελίδα είναι διαθέσιμη μόνο σε διαχειριστές.',
    sendTestEmail: 'Αποστολή δοκιμαστικού email',
    filterByType: 'Φιλτράρισμα ανά τύπο',
    filterByLanguage: 'Φιλτράρισμα ανά γλώσσα',
    all: 'Όλα',
    search: 'Αναζήτηση',
    searchPlaceholder: 'Τύπος, θέμα, κείμενο',
    loading: 'Φόρτωση προτύπων...',
    noTemplates: 'Δεν υπάρχουν πρότυπα που να ταιριάζουν με τα τρέχοντα φίλτρα.',
    edit: 'Επεξεργασία',
    table: {
      action: 'Ενέργεια',
      type: 'Τύπος',
      language: 'Γλώσσα',
      subject: 'Θέμα'
    },
    dialog: {
      saveTitle: 'Αποθήκευση προτύπου email',
      testTitle: 'Αποστολή δοκιμαστικού email',
      typeLabel: 'Τύπος',
      languageLabel: 'Γλώσσα',
      languageHelper: 'Επιλέξτε γλώσσα προτύπου',
      subjectLabel: 'Θέμα',
      bodyLabel: 'Κείμενο (HTML)',
      bodyHelper: 'Υποστηριζόμενοι δείκτες θέσης: {{Email}}, {{Token}}, {{ConfirmationLink}}, {{ResetLink}}, {{EventTitle}}, {{EventDate}}, {{EventLink}}',
      livePreview: 'Ζωντανή προεπισκόπηση',
      previewCaption: 'Η προεπισκόπηση χρησιμοποιεί δείγματα τιμών για επαλήθευση των δεικτών πριν την αποθήκευση.',
      toEmailLabel: 'Προς (email)',
      templateTypeLabel: 'Τύπος προτύπου',
      testLanguageHelper: 'Επιλέξτε την έκδοση γλώσσας του προτύπου για αποστολή',
      cancel: 'Ακύρωση',
      save: 'Αποθήκευση',
      send: 'Αποστολή'
    },
    success: {
      saved: 'Το πρότυπο email αποθηκεύτηκε με επιτυχία.',
      testSent: 'Το δοκιμαστικό email στάλθηκε στο {{toEmail}}.'
    },
    errors: {
      backendUnavailable: 'Δεν είναι δυνατή η πρόσβαση στο API στο {{baseUrl}}. Εκκινήστε το API με: dotnet run --project src/Backend/EventList.Api',
      load: 'Αποτυχία φόρτωσης προτύπων email.',
      save: 'Αποτυχία αποθήκευσης προτύπου email.',
      sendTest: 'Αποτυχία αποστολής δοκιμαστικού email.',
      subjectBodyRequired: 'Το θέμα και το κείμενο είναι υποχρεωτικά.',
      recipientRequired: 'Το email παραλήπτη είναι υποχρεωτικό.',
      invalidEmail: 'Παρακαλώ εισάγετε έγκυρη διεύθυνση email.'
    }
  },
  usersPage: {
    title: 'Χρήστες',
    createUser: 'Δημιουργία χρήστη',
    adminOnly: 'Αυτή η σελίδα είναι διαθέσιμη μόνο σε διαχειριστές.',
    loading: 'Φόρτωση χρηστών...',
    noUsers: 'Δεν βρέθηκαν χρήστες.',
    view: 'Προβολή',
    edit: 'Επεξεργασία',
    yes: 'Ναι',
    no: 'Όχι',
    table: {
      action: 'Ενέργεια',
      email: 'Email',
      role: 'Ρόλος',
      language: 'Γλώσσα',
      timeZone: 'Ζώνη ώρας',
      emailConfirmed: 'Email επιβεβαιωμένο',
      created: 'Δημιουργήθηκε',
      lastLogin: 'Τελευταία σύνδεση'
    },
    createDialog: {
      title: 'Δημιουργία χρήστη',
      emailLabel: 'Email',
      passwordLabel: 'Κωδικός',
      roleLabel: 'Ρόλος',
      preferredLanguageLabel: 'Προτιμώμενη γλώσσα',
      timeZoneLabel: 'Ζώνη ώρας',
      cancel: 'Ακύρωση',
      create: 'Δημιουργία'
    },
    editDialog: {
      title: 'Επεξεργασία χρήστη',
      emailLabel: 'Email',
      roleLabel: 'Ρόλος',
      preferredLanguageLabel: 'Προτιμώμενη γλώσσα',
      timeZoneLabel: 'Ζώνη ώρας',
      emailConfirmedLabel: 'Email επιβεβαιωμένο',
      cancel: 'Ακύρωση',
      save: 'Αποθήκευση'
    },
    viewDialog: {
      title: 'Στοιχεία χρήστη',
      email: 'Email',
      role: 'Ρόλος',
      preferredLanguage: 'Προτιμώμενη γλώσσα',
      timeZone: 'Ζώνη ώρας',
      emailConfirmed: 'Email επιβεβαιωμένο',
      created: 'Δημιουργήθηκε',
      lastLogin: 'Τελευταία σύνδεση',
      userId: 'ID χρήστη',
      loadingDetails: 'Φόρτωση στοιχείων χρήστη...',
      close: 'Κλείσιμο'
    },
    success: {
      created: 'Ο χρήστης δημιουργήθηκε με επιτυχία.',
      updated: 'Ο χρήστης ενημερώθηκε με επιτυχία.'
    },
    errors: {
      backendUnavailable: 'Δεν είναι δυνατή η πρόσβαση στο API στο {{baseUrl}}. Εκκινήστε το API με: dotnet run --project src/Backend/EventList.Api',
      load: 'Αποτυχία φόρτωσης χρηστών.',
      create: 'Αποτυχία δημιουργίας χρήστη.',
      update: 'Αποτυχία ενημέρωσης χρήστη.',
      loadDetails: 'Αποτυχία φόρτωσης στοιχείων χρήστη.',
      emailPasswordRequired: 'Το email και ο κωδικός είναι υποχρεωτικά.',
      emailRequired: 'Το email είναι υποχρεωτικό.',
      invalidEmail: 'Παρακαλώ εισάγετε έγκυρη διεύθυνση email.'
    }
  },
  peoplePage: {
    title: 'Άτομα',
    importAvailability: 'Εισαγωγή διαθεσιμότητας (Excel)',
    createPerson: 'Δημιουργία ατόμου',
    active: 'Ενεργά',
    archived: 'Αρχειοθετημένα',
    loading: 'Φόρτωση {{view}} ατόμων...',
    noArchivedPeople: 'Δεν υπάρχουν αρχειοθετημένα άτομα ακόμα.',
    noPeople: 'Δεν υπάρχουν άτομα ακόμα. Δημιουργήστε ένα άτομο ή εισάγετε διαθεσιμότητα από αρχείο Excel.',
    edit: 'Επεξεργασία',
    archive: 'Αρχειοθέτηση',
    restore: 'Επαναφορά',
    table: {
      action: 'Ενέργεια',
      fullName: 'Πλήρες όνομα',
      email: 'Email',
      phone: 'Τηλέφωνο',
      availability: 'Διαθεσιμότητα',
      archivedAt: 'Αρχειοθετήθηκε'
    },
    dialog: {
      createTitle: 'Δημιουργία ατόμου',
      editTitle: 'Επεξεργασία ατόμου',
      fullNameLabel: 'Πλήρες όνομα',
      emailLabel: 'Email',
      phoneLabel: 'Τηλέφωνο',
      availabilityLabel: 'Διαθεσιμότητα',
      availabilityPlaceholder: 'Παράδειγμα: Δευ-Παρ 09:00-18:00',
      cancel: 'Ακύρωση',
      save: 'Αποθήκευση',
      create: 'Δημιουργία'
    },
    confirmArchive: 'Αρχειοθέτηση {{name}};',
    confirmRestore: 'Επαναφορά {{name}};',
    success: {
      archived: 'Το άτομο αρχειοθετήθηκε με επιτυχία.',
      restored: 'Το άτομο επαναφέρθηκε με επιτυχία.',
      created: 'Το άτομο δημιουργήθηκε με επιτυχία.',
      updated: 'Το άτομο ενημερώθηκε με επιτυχία.',
      importComplete: 'Η εισαγωγή Excel ολοκληρώθηκε. Προστέθηκαν {{added}}, ενημερώθηκαν {{updated}}.'
    },
    errors: {
      backendUnavailable: 'Δεν είναι δυνατή η πρόσβαση στο API στο {{baseUrl}}. Εκκινήστε το API με: dotnet run --project src/Backend/EventList.Api',
      load: 'Αδύνατη η φόρτωση ατόμων αυτή τη στιγμή.',
      loadArchived: 'Αδύνατη η φόρτωση αρχειοθετημένων ατόμων αυτή τη στιγμή.',
      archive: 'Αποτυχία αρχειοθέτησης ατόμου.',
      restore: 'Αποτυχία επαναφοράς ατόμου.',
      create: 'Αποτυχία δημιουργίας ατόμου.',
      update: 'Αποτυχία ενημέρωσης ατόμου.',
      importFailed: 'Αδύνατη η εισαγωγή αυτού του αρχείου. Ανεβάστε έγκυρο αρχείο .xlsx ή .xls.',
      importApiError: 'Αποτυχία εισαγωγής ατόμων από Excel.',
      emptyFile: 'Το επιλεγμένο αρχείο Excel είναι κενό.',
      fullNameEmailRequired: 'Το πλήρες όνομα και το email είναι υποχρεωτικά.',
      invalidEmail: 'Παρακαλώ εισάγετε έγκυρη διεύθυνση email.'
    }
  }
};

export default el;
