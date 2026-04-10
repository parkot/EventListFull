const en = {
  common: {
    home: 'Home',
    loading: 'Loading...',
    and: 'and'
  },
  language: {
    label: 'Language',
    english: 'English',
    spanish: 'Spanish',
    greek: 'Greek'
  },
  header: {
    downloadFreeVersion: 'Download Free Version',
    searchPlaceholder: 'Ctrl + K'
  },
  menu: {
    navigation: 'Navigation',
    dashboard: 'Dashboard',
    events: 'Events',
    people: 'People',
    administrators: 'Administrators',
    users: 'Users',
    authentication: 'Authentication',
    login: 'Login',
    register: 'Register',
    utilities: 'Utilities',
    typography: 'Typography',
    color: 'Color',
    shadow: 'Shadow',
    support: 'Support',
    samplePage: 'Sample Page',
    documentation: 'Documentation'
  },
  footer: {
    rightsReserved: 'All rights reserved',
    hireUs: 'Hire us',
    license: 'License',
    terms: 'Terms',
    figmaDesignSystem: 'Figma Design System'
  },
  dashboard: {
    title: 'Dashboard',
    apiHealth: 'API Health',
    checking: 'Checking...',
    currentUser: 'Current User',
    signedIn: 'Signed in',
    signedInAccount: 'Signed-in account',
    userRole: 'User',
    sessionInvalid: 'Session invalid',
    loginAgain: 'Please login again',
    totalOrder: 'Total Order',
    totalSales: 'Total Sales',
    incomeOverview: 'Income Overview',
    thisWeekStatistics: 'This Week Statistics',
    recentOrders: 'Recent Orders',
    exportCsv: 'Export as CSV',
    exportExcel: 'Export as Excel',
    printTable: 'Print Table',
    analyticsReport: 'Analytics Report',
    weekly: 'Weekly',
    monthly: 'Monthly',
    yearly: 'Yearly',
    financeGrowth: 'Company Finance Growth',
    expensesRatio: 'Company Expenses Ratio',
    businessRiskCases: 'Business Risk Cases',
    low: 'Low',
    transactionHistory: 'Transaction History',
    helpSupportChat: 'Help & Support Chat',
    typicalReply: 'Typical reply within 5 min',
    needHelp: 'Need Help?'
  },
  eventsPage: {
    title: 'Events',
    createNewEvent: 'Create New Event',
    loadingEvents: 'Loading events...',
    noEvents: 'No events yet. Create your first event.',
    edit: 'Edit',
    createEvent: 'Create Event',
    editEvent: 'Edit Event',
    save: 'Save',
    saveChanges: 'Save Changes',
    cancel: 'Cancel',
    close: 'Close',
    guestsTitle: 'Guests',
    loadingGuests: 'Loading guests...',
    noGuests: 'No guests found for this event.',
    eventFallback: 'Event',
    table: {
      edit: 'Edit',
      title: 'Title',
      occasion: 'Occasion',
      scheduledLocal: 'Scheduled (Local)',
      venue: 'Venue',
      guests: 'Guests'
    },
    form: {
      title: 'Title',
      occasionType: 'Occasion Type',
      scheduledDateTime: 'Scheduled Date & Time',
      venue: 'Venue',
      address: 'Address',
      timeZone: 'Time Zone',
      defaultLanguage: 'Default Language'
    },
    guestsTable: {
      name: 'Name',
      countPerson: 'Count Person',
      status: 'Status',
      url: 'Public URL',
      copyUrl: 'Copy URL',
      copied: 'Copied'
    },
    rsvp: {
      accepted: 'Accepted',
      rejected: 'Rejected',
      maybe: 'Maybe',
      pending: 'Pending'
    },
    errors: {
      backendUnavailable: 'Cannot reach backend API at {{baseUrl}}. Start API with: dotnet run --project src/Backend/EventList.Api',
      loadEvents: 'Unable to load events right now.',
      loadEventDetails: 'Failed to load event details.',
      loadGuests: 'Failed to load guests.',
      createEvent: 'Failed to create event.',
      updateEvent: 'Failed to update event.'
    },
    validation: {
      titleMax: 'Title must be 120 characters or less',
      titleRequired: 'Title is required',
      occasionTypeMax: 'Occasion type must be 60 characters or less',
      occasionTypeRequired: 'Occasion type is required',
      scheduledAtRequired: 'Date and time are required',
      venueMax: 'Venue must be 160 characters or less',
      venueRequired: 'Venue is required',
      addressMax: 'Address must be 240 characters or less',
      addressRequired: 'Address is required',
      timeZoneMax: 'Time zone must be 100 characters or less',
      timeZoneRequired: 'Time zone is required',
      defaultLanguageMax: 'Language must be 10 characters or less',
      defaultLanguageRequired: 'Default language is required'
    }
  },
  publicInvitation: {
    title: 'Invitation',
    loading: 'Loading invitation...',
    welcome: 'Hello {{guestName}}',
    eventTitle: 'Event',
    occasion: 'Occasion',
    scheduled: 'Date and time',
    venue: 'Venue',
    address: 'Address',
    currentResponse: 'Current response',
    answerPrompt: 'Please choose your response',
    responseSaved: 'Your response has been saved.',
    actions: {
      agree: 'Agree',
      dontKnow: "I don't know",
      reject: 'Reject'
    },
    errors: {
      backendUnavailable: 'Cannot reach backend API at {{baseUrl}}. Start API with: dotnet run --project src/Backend/EventList.Api',
      invalidInvitation: 'This invitation link is invalid or expired.',
      loadInvitation: 'Unable to load invitation right now.',
      submitRsvp: 'Unable to submit your response right now.'
    }
  },
  auth: {
    login: {
      title: 'Login',
      noAccount: "Don't have an account?",
      emailLabel: 'Email Address',
      emailPlaceholder: 'Enter email address',
      passwordLabel: 'Password',
      passwordPlaceholder: 'Enter password',
      keepSignedIn: 'Keep me sign in',
      forgotPassword: 'Forgot Password?',
      button: 'Login',
      invalidCredentials: 'Invalid email or password.',
      unableToLogin: 'Unable to login right now. Please try again.'
    },
    forgotPassword: {
      title: 'Forgot Password',
      backToLogin: 'Back to login',
      emailLabel: 'Email Address',
      emailPlaceholder: 'Enter email address',
      button: 'Send Reset Link',
      success: 'If the email exists, a reset link has been sent.',
      error: 'Unable to send reset link right now. Please try again.'
    },
    register: {
      title: 'Sign up',
      haveAccount: 'Already have an account?',
      firstNameLabel: 'First Name*',
      lastNameLabel: 'Last Name*',
      phoneLabel: 'Phone Number',
      emailLabel: 'Email Address*',
      passwordLabel: 'Password',
      firstNamePlaceholder: 'John',
      lastNamePlaceholder: 'Doe',
      countryCodePlaceholder: '+1',
      phonePlaceholder: '5551234567',
      emailPlaceholder: 'demo@company.com',
      agreeText: 'By Signing up, you agree to our',
      termsOfService: 'Terms of Service',
      privacyPolicy: 'Privacy Policy',
      button: 'Create Account'
    },
    validation: {
      mustBeValidEmail: 'Must be a valid email',
      emailRequired: 'Email is required',
      passwordRequired: 'Password is required',
      passwordNoSpaces: 'Password cannot start or end with spaces',
      passwordTooLongLogin: 'Password must be less than 100 characters',
      passwordTooLongRegister: 'Password must be less than 10 characters',
      firstNameRequired: 'First Name is required',
      lastNameRequired: 'Last Name is required'
    }
  }
};

export default en;
