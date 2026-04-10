<template>
  <div class="promo-page privacy-page">
    <header class="topbar-wrap">
      <div class="topbar">
        <NuxtLink class="brand" to="/">EventList</NuxtLink>
        <nav class="topbar-actions" aria-label="Privacy page navigation">
          <NuxtLink class="btn btn-ghost" to="/">Back to Home</NuxtLink>
          <a class="btn btn-primary" href="/register">Register</a>
        </nav>
      </div>
    </header>

    <main class="privacy-content">
      <p class="eyebrow">Privacy Policy</p>
      <h1>Your event data, handled responsibly.</h1>
      <p class="policy-meta">Last updated: April 10, 2026</p>
      <p class="hero-copy">
        EventListFull is designed to keep personal data protected and processing transparent.
        This policy page is a starter template and should be replaced with legal-approved text
        before production launch.
      </p>

      <nav class="privacy-toc" aria-label="Privacy policy table of contents">
        <p class="toc-title">On this page</p>
        <a href="#collect">What We Collect</a>
        <a href="#process">Why We Process It</a>
        <a href="#retention">Retention and Security</a>
        <a href="#rights">Your Rights</a>
        <a href="#contact">Contact</a>
      </nav>

      <section id="collect" class="privacy-block">
        <h2>What We Collect</h2>
        <p>
          We may process account profile data, invitation details, RSVP responses, and message
          delivery metadata needed to run event workflows.
        </p>
      </section>

      <section id="process" class="privacy-block">
        <h2>Why We Process It</h2>
        <p>
          Data is used to create events, send invitations, track attendance, and support secure
          sign-in and billing operations.
        </p>
      </section>

      <section id="retention" class="privacy-block">
        <h2>Retention and Security</h2>
        <p>
          Information is retained only as long as required for service delivery and compliance.
          Access is restricted and monitored according to role-based policies.
        </p>
      </section>

      <section id="rights" class="privacy-block">
        <h2>Your Rights</h2>
        <p>
          Depending on local regulations, users may request access, correction, deletion, or
          export of their personal data. Requests should be verified before fulfillment.
        </p>
      </section>

      <section id="contact" class="privacy-block">
        <h2>Contact</h2>
        <p>
          For privacy inquiries, contact privacy@eventlist.example. Replace this address with your
          official support channel.
        </p>
      </section>
    </main>
  </div>
</template>
