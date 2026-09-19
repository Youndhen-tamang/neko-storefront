import type { Metadata } from "next";
import { LegalSection, LegalShell } from "@/components/landing/legal-shell";

export const metadata: Metadata = {
  title: "Privacy Policy — VocaCommerce",
  description: "How VocaCommerce collects, uses, and protects personal data on strapnote.com.",
};

export default function PrivacyPage() {
  return (
    <LegalShell title="Privacy Policy" updated="19 September 2026">
      <LegalSection title="Who we are">
        <p>
          VocaCommerce is operated by Strapnote Pvt. Ltd., a company registered in Nepal (registration no.
          184927/078/079) with its office at House 12, Jhamsikhel Marg, Ward 2, Lalitpur 44700, Nepal.
        </p>
        <p>
          This policy covers the platform at strapnote.com, tenant storefronts such as lumina.strapnote.com,
          and the shop-owner admin. Questions: privacy@strapnote.com.
        </p>
      </LegalSection>

      <LegalSection title="What we collect">
        <p>We collect only what the product needs to run a store or complete an order:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <span className="text-foreground">Shop owners:</span> name, work email, password hash, store slug,
            branding, and catalog you upload.
          </li>
          <li>
            <span className="text-foreground">Shoppers:</span> name, email, phone, shipping address, and order
            history when you check out.
          </li>
          <li>
            <span className="text-foreground">Voice shopping:</span> microphone audio is processed in the
            browser to transcribe what you say. We send the transcript to the store assistant. We do not keep
            raw audio files after the session unless you stay in an open voice conversation.
          </li>
          <li>
            <span className="text-foreground">Payments:</span> card numbers are typed on Stripe. We never see
            or store full card details. We keep Stripe session ids, invoice numbers, and order totals.
          </li>
          <li>
            <span className="text-foreground">Product photos:</span> images you upload are stored with our
            image host so listings and try-on can run.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="How we use it">
        <p>
          We use this data to host your tenant store, show live stock, take orders, send invoice emails, power
          the spoken assistant, and keep shop owners signed in. We do not sell personal data. We do not use
          voice transcripts to train public models.
        </p>
        <p>
          Each shop is scoped to its own subdomain. Products, orders, and chats on lumina.strapnote.com are not
          mixed with another tenant.
        </p>
      </LegalSection>

      <LegalSection title="Cookies and local storage">
        <p>
          We store an admin session token, cart contents, and chat preferences (including whether spoken
          replies are on) on your device. These are first-party and needed for the store to work. We do not
          run third-party advertising cookies.
        </p>
      </LegalSection>

      <LegalSection title="Processors">
        <p>We use these processors to run the platform:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Stripe, Inc. — checkout and payment confirmation</li>
          <li>Cloudinary, Inc. — product and try-on images</li>
          <li>OpenRouter, Inc. — store assistant replies from live catalog</li>
          <li>Our SMTP provider — invoice and password-reset mail</li>
        </ul>
        <p>
          They receive only what that job requires. Stripe’s privacy policy governs card data:
          stripe.com/privacy.
        </p>
      </LegalSection>

      <LegalSection title="How long we keep it">
        <p>
          Shop-owner accounts and catalogs stay until the super admin closes the shop. Orders and invoices are
          kept for seven years for tax records in Nepal. Voice transcripts in an open chat stay on your device
          and on our servers for 30 days after the last message, then they are deleted. You can ask us to
          delete a shopper profile by emailing privacy@strapnote.com with the invoice number.
        </p>
      </LegalSection>

      <LegalSection title="Your rights">
        <p>
          You can ask for a copy of your data, a correction, or deletion, subject to records we must keep for
          law. Write to privacy@strapnote.com. We aim to reply within 30 days. If you are in the EEA or UK,
          you may also contact your local data authority.
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
          privacy@strapnote.com · +977-1-5452180
        </p>
      </LegalSection>
    </LegalShell>
  );
}
