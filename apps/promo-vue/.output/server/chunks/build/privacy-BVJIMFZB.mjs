import { _ as __nuxt_component_0 } from './nuxt-link-DSPCcg1k.mjs';
import { mergeProps, withCtx, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent } from 'vue/server-renderer';
import { _ as _export_sfc } from './server.mjs';
import '../_/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'unhead/plugins';
import 'vue-router';

const _sfc_main = {};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs) {
  const _component_NuxtLink = __nuxt_component_0;
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "promo-page privacy-page" }, _attrs))}><header class="topbar-wrap"><div class="topbar">`);
  _push(ssrRenderComponent(_component_NuxtLink, {
    class: "brand",
    to: "/"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`EventList`);
      } else {
        return [
          createTextVNode("EventList")
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`<nav class="topbar-actions" aria-label="Privacy page navigation">`);
  _push(ssrRenderComponent(_component_NuxtLink, {
    class: "btn btn-ghost",
    to: "/"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`Back to Home`);
      } else {
        return [
          createTextVNode("Back to Home")
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`<a class="btn btn-primary" href="/register">Register</a></nav></div></header><main class="privacy-content"><p class="eyebrow">Privacy Policy</p><h1>Your event data, handled responsibly.</h1><p class="policy-meta">Last updated: April 10, 2026</p><p class="hero-copy"> EventListFull is designed to keep personal data protected and processing transparent. This policy page is a starter template and should be replaced with legal-approved text before production launch. </p><nav class="privacy-toc" aria-label="Privacy policy table of contents"><p class="toc-title">On this page</p><a href="#collect">What We Collect</a><a href="#process">Why We Process It</a><a href="#retention">Retention and Security</a><a href="#rights">Your Rights</a><a href="#contact">Contact</a></nav><section id="collect" class="privacy-block"><h2>What We Collect</h2><p> We may process account profile data, invitation details, RSVP responses, and message delivery metadata needed to run event workflows. </p></section><section id="process" class="privacy-block"><h2>Why We Process It</h2><p> Data is used to create events, send invitations, track attendance, and support secure sign-in and billing operations. </p></section><section id="retention" class="privacy-block"><h2>Retention and Security</h2><p> Information is retained only as long as required for service delivery and compliance. Access is restricted and monitored according to role-based policies. </p></section><section id="rights" class="privacy-block"><h2>Your Rights</h2><p> Depending on local regulations, users may request access, correction, deletion, or export of their personal data. Requests should be verified before fulfillment. </p></section><section id="contact" class="privacy-block"><h2>Contact</h2><p> For privacy inquiries, contact privacy@eventlist.example. Replace this address with your official support channel. </p></section></main></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/privacy.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const privacy = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);

export { privacy as default };
//# sourceMappingURL=privacy-BVJIMFZB.mjs.map
