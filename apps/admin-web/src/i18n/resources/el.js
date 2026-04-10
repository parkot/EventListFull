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
      status: 'Κατάσταση'
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
      button: 'Δημιουργία λογαριασμού'
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
  }
};

export default el;
