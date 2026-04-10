import { _ as __nuxt_component_0 } from './nuxt-link-DSPCcg1k.mjs';
import { ref, mergeProps, withCtx, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderAttr, ssrRenderClass, ssrRenderComponent } from 'vue/server-renderer';
import '../_/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import './server.mjs';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'unhead/plugins';
import 'vue-router';

const _sfc_main = {
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const menuOpen = ref(false);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "promo-page" }, _attrs))}><header class="topbar-wrap"><div class="topbar"><a class="brand" href="#home">EventList</a><button class="menu-toggle" type="button"${ssrRenderAttr("aria-expanded", String(menuOpen.value))} aria-controls="main-nav"> Menu </button><nav id="main-nav" class="${ssrRenderClass([{ open: menuOpen.value }, "topbar-actions"])}" aria-label="Authentication actions"><a class="btn btn-ghost" href="/signin">Sign In</a><a class="btn btn-primary" href="/register">Register</a></nav></div></header><main id="home" class="hero"><p class="eyebrow">Invitation platform for modern hosts</p><h1>Launch unforgettable events with less stress and more confidence.</h1><p class="hero-copy"> EventListFull combines multilingual invites, RSVP tracking, table planning, and attendee check-in into one connected workflow. From first invite to final guest, every step stays clear and organized. </p><div class="hero-cta-row"><a class="btn btn-primary" href="/register">Start Free Trial</a><a class="btn btn-outline" href="#tour">View Product Tour</a></div><section class="hero-media" aria-label="Event experience preview"><article class="hero-photo main"><img src="https://picsum.photos/seed/eventlist-main/960/640" alt="Guests celebrating at an event" loading="lazy"></article><article class="hero-photo side side-a"><img src="https://picsum.photos/seed/eventlist-side-a/420/520" alt="Organizer checking RSVP list" loading="lazy"></article><article class="hero-photo side side-b"><img src="https://picsum.photos/seed/eventlist-side-b/420/520" alt="Table setup prepared for attendees" loading="lazy"></article><div class="hero-stat-card"><p class="stat-value">98%</p><p class="stat-copy">average RSVP completion rate in the first 72 hours</p></div></section><section id="tour" class="value-grid" aria-label="Core product highlights"><article class="value-card"><h2>Multilingual Invitations</h2><p>Send polished email and SMS invites in the right language for every guest.</p></article><article class="value-card"><h2>Smart RSVP Insights</h2><p>Track attendance, meal preferences, and plus-ones with live dashboards.</p></article><article class="value-card"><h2>Smooth Entry Flow</h2><p>Use invitation scan codes for fast, accurate check-in at the venue.</p></article></section><section class="pricing" aria-label="Pricing plans"><div class="section-intro"><p class="section-label">Pricing</p><h2>Flexible plans for every event team</h2></div><div class="pricing-grid"><article class="pricing-card"><p class="plan">Starter</p><p class="price">$0<span>/month</span></p><p class="plan-copy">Great for trying out invitation workflows for smaller events.</p><a class="btn btn-outline" href="/register">Get Started</a></article><article class="pricing-card featured"><p class="plan">Premium</p><p class="price">$49<span>/month</span></p><p class="plan-copy">Advanced templates, analytics, and priority sending capacity.</p><a class="btn btn-primary" href="/register">Choose Premium</a></article><article class="pricing-card"><p class="plan">SMS Credits</p><p class="price">$15<span>/pack</span></p><p class="plan-copy">Top up message volume and keep campaigns moving without interruption.</p><a class="btn btn-outline" href="/signin">Buy Credits</a></article></div></section><section class="testimonials" aria-label="Customer testimonials"><div class="section-intro"><p class="section-label">Success Stories</p><h2>Teams that switched to EventList move faster</h2></div><div class="quote-grid"><blockquote class="quote-card"> &quot;We cut guest check-in time by 60% and eliminated table confusion.&quot; <cite>Marina K., Venue Operations Lead</cite></blockquote><blockquote class="quote-card"> &quot;Our bilingual campaigns finally feel professional and consistent.&quot; <cite>Daniel R., Event Coordinator</cite></blockquote></div></section><section class="gallery" aria-label="Template gallery previews"><div class="section-intro"><p class="section-label">Template Looks</p><h2>Beautiful invitation layouts ready to customize</h2></div><div class="gallery-grid"><article class="gallery-card tall"><img src="https://picsum.photos/seed/eventlist-gallery-1/700/980" alt="Elegant wedding invitation template" loading="lazy"><p>Elegant ceremony style</p></article><article class="gallery-card"><img src="https://picsum.photos/seed/eventlist-gallery-2/700/520" alt="Corporate launch invitation template" loading="lazy"><p>Professional launch style</p></article><article class="gallery-card"><img src="https://picsum.photos/seed/eventlist-gallery-3/700/520" alt="Birthday celebration invitation template" loading="lazy"><p>Playful celebration style</p></article></div></section></main><footer class="page-footer"><p>EventListFull makes invitation, RSVP, and check-in workflows feel effortless.</p><div class="footer-actions"><a href="/register">Create your account</a><a href="/signin">Sign in</a>`);
      _push(ssrRenderComponent(_component_NuxtLink, { to: "/privacy" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Privacy`);
          } else {
            return [
              createTextVNode("Privacy")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></footer></div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-BwXohojN.mjs.map
