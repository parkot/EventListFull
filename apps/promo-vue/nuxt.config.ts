export default defineNuxtConfig({
  devtools: { enabled: false },
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      title: 'EventList Promo',
      meta: [
        {
          name: 'description',
          content:
            'EventListFull is a multilingual invitation platform for RSVP management, check-in, and modern event operations.'
        }
      ]
    }
  },
  compatibilityDate: '2026-04-10'
});
