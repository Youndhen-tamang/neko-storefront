import type { Metadata } from "next";
import { LegalSection, LegalShell } from "@/components/landing/legal-shell";

export const metadata: Metadata = {
  title: "Terms of Use — VocaCommerce",
  description: "Terms for using VocaCommerce stores and the strapnote.com platform.",
};

export default function TermsPage() {
  return (
    <LegalShell title="Terms of Use" updated="19 September 2026">
      <LegalSection title="Agreement">
        <p>
          These terms are between you and Strapnote Pvt. Ltd. (“Strapnote”, “we”), the operator of
          VocaCommerce on strapnote.com. By opening a store, signing in to admin, or placing an order on a
          tenant storefront, you agree to them.
        </p>
        <p>
          Governing law is the law of Nepal. Courts in Kathmandu have exclusive venue, except where a
          consumer-protection law in your country says otherwise.
        </p>
      </LegalSection>

      <LegalSection title="The platform">
        <p>
          VocaCommerce is a multi-tenant commerce platform. Each shop lives on its own subdomain, for
          example lumina.strapnote.com, with its own catalog, checkout, admin, and spoken assistant. We
          provide the software. Shop owners are responsible for the goods they list and the orders they
          fulfil.
        </p>
        <p>
          A super admin creates shops and assigns the first owner. Self-serve public registration is not
          offered. If you did not receive access, you have no right to a store on this platform.
        </p>
      </LegalSection>

      <LegalSection title="Shop owners">
        <p>If you run a shop, you agree to:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>List only products you can legally sell and ship</li>
          <li>Keep prices, stock, and descriptions accurate</li>
          <li>Honour paid orders and the invoice we email to the customer</li>
          <li>Use the assistant and photo-listing tools without uploading others’ personal data you have no right to use</li>
          <li>Keep your admin login to yourself</li>
        </ul>
        <p>
          We may suspend a shop that breaks these rules, sells prohibited goods, or puts shoppers at risk. We
          will email the owner at the address on the shop before a lasting shutdown unless we must act
          immediately.
        </p>
      </LegalSection>

      <LegalSection title="Shoppers">
        <p>
          When you buy from a tenant store, your contract for the goods is with that shop, not with Strapnote.
          Checkout may be cash on delivery or Stripe. If you pay with Stripe, you enter card details on
          Stripe’s page. We never ask for card numbers in chat or by voice.
        </p>
        <p>
          Voice shopping is optional. You can type, tap, or speak. Spoken replies use your device speakers.
          You can turn them off in the assistant. Transcripts are used only to answer you and place the order
          you asked for.
        </p>
      </LegalSection>

      <LegalSection title="Acceptable use">
        <p>You must not:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Probe, scrape, or overload the API or another tenant’s store</li>
          <li>Impersonate a shop or send invoice emails that are not yours</li>
          <li>Upload malware or illegal content in product images or comments</li>
          <li>Use the microphone to record other people without their consent</li>
        </ul>
      </LegalSection>

      <LegalSection title="Intellectual property">
        <p>
          The VocaCommerce name, software, and landing belong to Strapnote. Shop names, logos, and product
          photos belong to the shop that uploaded them. You may not copy the platform or a shop’s catalog
          without permission.
        </p>
      </LegalSection>

      <LegalSection title="Availability and liability">
        <p>
          We run the platform as-is. We do not promise uninterrupted uptime. To the fullest extent Nepalese
          law allows, Strapnote is not liable for lost profits, lost stock data, or indirect loss, and our
          total liability for a claim is limited to NPR 50,000 or the fees you paid us in the 12 months
          before the claim, whichever is greater.
        </p>
        <p>
          Nothing in these terms limits liability for fraud, death, or personal injury caused by our
          negligence, where that limit would be illegal.
        </p>
      </LegalSection>

      <LegalSection title="Changes">
        <p>
          We may update these terms. The date at the top is the current version. Continued use after a change
          means you accept the new terms. Material changes will be noted on this page.
        </p>
      </LegalSection>

      <LegalSection title="Contact">
        <p>
          Strapnote Pvt. Ltd.
          <br />
          House 12, Jhamsikhel Marg, Ward 2
          <br />
          Lalitpur 44700, Nepal
          <br />
          legal@strapnote.com · +977-1-5452180
        </p>
      </LegalSection>
    </LegalShell>
  );
}
