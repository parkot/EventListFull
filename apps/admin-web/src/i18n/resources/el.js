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
