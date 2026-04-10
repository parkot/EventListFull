<template>
  <div class="promo-page">
    <header class="topbar-wrap">
      <div class="topbar">
        <a class="brand" href="#home">EventList</a>
        <button
          class="menu-toggle"
          type="button"
          :aria-expanded="String(menuOpen)"
          aria-controls="main-nav"
          @click="menuOpen = !menuOpen"
        >
          Menu
        </button>
        <nav id="main-nav" class="topbar-actions" :class="{ open: menuOpen }" aria-label="Authentication actions">
          <a class="btn btn-ghost" href="/signin">Sign In</a>
          <a class="btn btn-primary" href="/register">Register</a>
        </nav>
      </div>
    </header>

    <main id="home" class="hero">
      <p class="eyebrow">Invitation platform for modern hosts</p>
      <h1>Launch unforgettable events with less stress and more confidence.</h1>
      <p class="hero-copy">
        EventListFull combines multilingual invites, RSVP tracking, table planning,
        and attendee check-in into one connected workflow. From first invite to final guest,
        every step stays clear and organized.
      </p>
      <div class="hero-cta-row">
        <a class="btn btn-primary" href="/register">Start Free Trial</a>
        <a class="btn btn-outline" href="#tour">View Product Tour</a>
      </div>

      <section class="hero-media" aria-label="Event experience preview">
        <article class="hero-photo main">
          <img src="https://picsum.photos/seed/eventlist-main/960/640" alt="Guests celebrating at an event" loading="lazy" />
        </article>
        <article class="hero-photo side side-a">
          <img src="https://picsum.photos/seed/eventlist-side-a/420/520" alt="Organizer checking RSVP list" loading="lazy" />
        </article>
        <article class="hero-photo side side-b">
          <img src="https://picsum.photos/seed/eventlist-side-b/420/520" alt="Table setup prepared for attendees" loading="lazy" />
        </article>
        <div class="hero-stat-card">
          <p class="stat-value">98%</p>
          <p class="stat-copy">average RSVP completion rate in the first 72 hours</p>
        </div>
      </section>

      <section id="tour" class="value-grid" aria-label="Core product highlights">
        <article class="value-card">
          <h2>Multilingual Invitations</h2>
          <p>Send polished email and SMS invites in the right language for every guest.</p>
        </article>
        <article class="value-card">
          <h2>Smart RSVP Insights</h2>
          <p>Track attendance, meal preferences, and plus-ones with live dashboards.</p>
        </article>
        <article class="value-card">
          <h2>Smooth Entry Flow</h2>
          <p>Use invitation scan codes for fast, accurate check-in at the venue.</p>
        </article>
      </section>

      <section class="pricing" aria-label="Pricing plans">
        <div class="section-intro">
          <p class="section-label">Pricing</p>
          <h2>Flexible plans for every event team</h2>
        </div>
        <div class="pricing-grid">
          <article class="pricing-card">
            <p class="plan">Starter</p>
            <p class="price">$0<span>/month</span></p>
            <p class="plan-copy">Great for trying out invitation workflows for smaller events.</p>
            <a class="btn btn-outline" href="/register">Get Started</a>
          </article>
          <article class="pricing-card featured">
            <p class="plan">Premium</p>
            <p class="price">$49<span>/month</span></p>
            <p class="plan-copy">Advanced templates, analytics, and priority sending capacity.</p>
            <a class="btn btn-primary" href="/register">Choose Premium</a>
          </article>
          <article class="pricing-card">
            <p class="plan">SMS Credits</p>
            <p class="price">$15<span>/pack</span></p>
            <p class="plan-copy">Top up message volume and keep campaigns moving without interruption.</p>
            <a class="btn btn-outline" href="/signin">Buy Credits</a>
          </article>
        </div>
      </section>

      <section class="testimonials" aria-label="Customer testimonials">
        <div class="section-intro">
          <p class="section-label">Success Stories</p>
          <h2>Teams that switched to EventList move faster</h2>
        </div>
        <div class="quote-grid">
          <blockquote class="quote-card">
            "We cut guest check-in time by 60% and eliminated table confusion."
            <cite>Marina K., Venue Operations Lead</cite>
          </blockquote>
          <blockquote class="quote-card">
            "Our bilingual campaigns finally feel professional and consistent."
            <cite>Daniel R., Event Coordinator</cite>
          </blockquote>
        </div>
      </section>

      <section class="gallery" aria-label="Template gallery previews">
        <div class="section-intro">
          <p class="section-label">Template Looks</p>
          <h2>Beautiful invitation layouts ready to customize</h2>
        </div>
        <div class="gallery-grid">
          <article class="gallery-card tall">
            <img src="https://picsum.photos/seed/eventlist-gallery-1/700/980" alt="Elegant wedding invitation template" loading="lazy" />
            <p>Elegant ceremony style</p>
          </article>
          <article class="gallery-card">
            <img src="https://picsum.photos/seed/eventlist-gallery-2/700/520" alt="Corporate launch invitation template" loading="lazy" />
            <p>Professional launch style</p>
          </article>
          <article class="gallery-card">
            <img src="https://picsum.photos/seed/eventlist-gallery-3/700/520" alt="Birthday celebration invitation template" loading="lazy" />
            <p>Playful celebration style</p>
          </article>
        </div>
      </section>
    </main>

    <footer class="page-footer">
      <p>EventListFull makes invitation, RSVP, and check-in workflows feel effortless.</p>
      <div class="footer-actions">
        <a href="/register">Create your account</a>
        <a href="/signin">Sign in</a>
        <NuxtLink to="/privacy">Privacy</NuxtLink>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const menuOpen = ref(false);
</script>
