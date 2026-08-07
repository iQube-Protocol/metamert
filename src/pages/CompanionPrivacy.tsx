import { useEffect } from "react";

const CANONICAL = "https://metame.com/companion/privacy";

function setMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mt-8 space-y-3">
    <h2 className="text-lg font-semibold text-foreground">{title}</h2>
    <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">{children}</div>
  </section>
);

const CompanionPrivacy = () => {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = "metaMe Companion Privacy Policy | metaMe";
    setMeta("name", "description", "Privacy and data-use practices for the metaMe Companion browser extension.");
    setMeta("property", "og:title", "metaMe Companion Privacy Policy | metaMe");
    setMeta("property", "og:description", "Privacy and data-use practices for the metaMe Companion browser extension.");
    setMeta("property", "og:type", "website");
    setMeta("property", "og:url", CANONICAL);
    setMeta("name", "twitter:card", "summary");

    let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    const prevHref = link.href;
    link.href = CANONICAL;

    return () => {
      document.title = prevTitle;
      if (link && prevHref) link.href = prevHref;
    };
  }, []);

  return (
    <main className="min-h-screen bg-background px-5 py-10 sm:px-8">
      <article className="mx-auto w-full max-w-3xl">
        <header className="space-y-2 border-b border-border pb-6">
          <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">metaMe Companion Privacy Policy</h1>
          <p className="text-sm text-muted-foreground">Effective date: August 6, 2026</p>
        </header>

        <div className="mt-6 space-y-3 text-sm leading-relaxed text-muted-foreground">
          <p>
            metaMe Companion is a browser companion designed to give users a consent-controlled way to interact with
            browser context and the metaMe ecosystem.
          </p>
          <p>
            Privacy, user agency and explicit consent are fundamental to the design of metaMe Companion. This policy
            explains what information the Companion may process, why it processes that information, how information may
            be shared, and the choices available to users.
          </p>
          <p>
            This policy applies specifically to the metaMe Companion browser extension and should be read together with
            any broader privacy notices applicable to metaMe services.
          </p>
        </div>

        <Section title="1. Our single purpose">
          <p>
            The single purpose of metaMe Companion is to provide a consent-controlled browser companion that allows
            users to work with approved context from the webpages they are viewing and intentionally capture selected
            content into their metaMe Companion experience.
          </p>
          <p>The Companion requests browser permissions only where they are necessary to provide this functionality.</p>
        </Section>

        <Section title="2. Information metaMe Companion may process">
          <p>
            Depending on the features a user chooses to activate, metaMe Companion may process the following categories
            of information:
          </p>
          <p>
            <strong className="text-foreground">Website content.</strong> The Companion may process text, hyperlinks,
            page metadata and other context from a webpage when required to provide an observation or capture feature
            authorised by the user.
          </p>
          <p>
            <strong className="text-foreground">Web browsing context.</strong> The Companion may process information
            associated with the webpage being viewed, such as its URL, domain and page title, when necessary to provide
            its user-facing browser-context features.
          </p>
          <p>
            <strong className="text-foreground">Personal communications.</strong> When a user communicates with metaMe
            Companion or an associated Agent through the Companion interface, the content of those communications may be
            transmitted and processed in order to provide the requested response or service.
          </p>
          <p>
            <strong className="text-foreground">User activity.</strong> The Companion may process actions taken within
            the extension, such as opening Companion features, granting or withdrawing consent, initiating a capture, or
            selecting a Companion command, where necessary to perform that action and maintain the reliability and
            security of the service.
          </p>
          <p>
            The Companion is not designed to perform keystroke logging, mouse-position tracking or indiscriminate
            monitoring of browsing behavior.
          </p>
        </Section>

        <Section title="3. Consent and browser observation">
          <p>Browser context capabilities are consent-controlled.</p>
          <p>
            metaMe Companion does not treat installation of the extension alone as consent to unrestricted collection of
            webpage content.
          </p>
          <p>
            Where a Companion feature requires access to browser context, the user is provided with controls governing
            that access. Content capture, including the Companion’s “Pull Across” capability, is performed in response to
            user authorisation.
          </p>
          <p>Users can change or withdraw applicable Companion permissions and consent settings.</p>
        </Section>

        <Section title="4. How information is used">
          <p>Information processed by metaMe Companion is used only as necessary to:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>provide the Companion’s browser-context, observation and capture functionality;</li>
            <li>respond to actions and requests initiated by the user;</li>
            <li>maintain user consent and Companion configuration;</li>
            <li>provide interactions with supported metaMe services;</li>
            <li>maintain the security, reliability and integrity of the Companion; and</li>
            <li>diagnose and correct technical problems directly related to these functions.</li>
          </ul>
          <p>
            We do not use Companion browsing data for advertising, behavioral advertising, unrelated profiling,
            creditworthiness assessment or lending decisions.
          </p>
        </Section>

        <Section title="5. Browser permissions">
          <p>
            metaMe Companion may request browser permissions including activeTab, contextMenus, scripting, sidePanel,
            storage, and access to HTTP and HTTPS webpages.
          </p>
          <p>
            These permissions support the Companion’s user-facing functionality, including displaying the Companion
            alongside a webpage, responding to user-initiated capture commands, processing approved webpage context,
            maintaining consent and configuration state, and operating consistently across websites selected by the user.
          </p>
          <p>The Companion does not use these permissions to download and execute remote program code.</p>
        </Section>

        <Section title="6. Local storage">
          <p>
            metaMe Companion may store limited information locally in the browser, including Companion settings, consent
            preferences, configuration and operational state required for the extension to function reliably.
          </p>
          <p>Browser storage is not intended to serve as an unrestricted archive of webpages viewed by the user.</p>
        </Section>

        <Section title="7. Information transmitted to metaMe services">
          <p>
            When a feature requires server-side processing, information necessary to perform the user’s requested
            Companion function may be securely transmitted to metaMe-operated services or service providers necessary to
            deliver that function.
          </p>
          <p>
            This may include authorised browser context, intentionally captured content, Companion communications and
            associated technical information necessary to process the request.
          </p>
          <p>User data transmitted by the Companion is transmitted using secure encrypted connections.</p>
        </Section>

        <Section title="8. Service providers and disclosure">
          <p>
            We may use service providers to operate infrastructure or technical capabilities necessary to provide metaMe
            Companion.
          </p>
          <p>
            Such providers may process information only as necessary to provide services to metaMe on our behalf and
            subject to applicable contractual, confidentiality and security requirements.
          </p>
          <p>
            We may also disclose information where required by applicable law or where reasonably necessary to protect
            the security and integrity of users, metaMe or the service.
          </p>
          <p>
            We do not sell Companion user data to data brokers, advertising platforms or other third parties.
          </p>
        </Section>

        <Section title="9. Human access to user data">
          <p>
            metaMe does not permit humans to access Companion user data except where permitted under applicable law and
            platform policies, such as when:
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>a user explicitly requests support requiring access to specific information;</li>
            <li>access is necessary to investigate security, fraud or abuse;</li>
            <li>access is required by applicable law; or</li>
            <li>information has been appropriately aggregated and anonymized for legitimate internal operations.</li>
          </ul>
        </Section>

        <Section title="10. Data retention and deletion">
          <p>
            We retain information only for as long as reasonably necessary to provide the applicable Companion
            functionality, maintain security and reliability, satisfy legitimate operational requirements, or comply with
            applicable legal obligations.
          </p>
          <p>
            Where applicable, users may request access to or deletion of personal information associated with their
            metaMe services.
          </p>
          <p>
            Local extension information may also be removed by clearing the extension’s data or uninstalling metaMe
            Companion.
          </p>
        </Section>

        <Section title="11. Security">
          <p>
            We use technical and organizational safeguards designed to protect information processed through metaMe
            Companion.
          </p>
          <p>
            User data transmitted between the Companion and remote services is transmitted using secure encrypted
            connections.
          </p>
          <p>
            No system can guarantee absolute security, and we continually review the safeguards appropriate to the
            Companion’s functionality.
          </p>
        </Section>

        <Section title="12. Children">
          <p>
            metaMe Companion is not directed to children under the minimum age required to independently consent to the
            processing of personal information in their jurisdiction.
          </p>
        </Section>

        <Section title="13. Changes to this policy">
          <p>
            We may update this policy as metaMe Companion evolves or as legal and platform requirements change.
          </p>
          <p>
            Where an update materially changes how the Companion collects, uses or shares user data, we will provide
            appropriate notice and, where required, obtain additional consent before applying the new practice.
          </p>
        </Section>

        <Section title="14. Chrome Web Store Limited Use disclosure">
          <p>
            The use of information received through metaMe Companion complies with the Chrome Web Store User Data Policy,
            including the Limited Use requirements.
          </p>
          <p>In particular:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              user data is used only to provide or improve metaMe Companion’s disclosed single purpose and directly
              related security, reliability and operational functionality;
            </li>
            <li>user data is not sold;</li>
            <li>user data is not transferred for personalized, retargeted or interest-based advertising;</li>
            <li>user data is not used or transferred for purposes unrelated to the Companion’s single purpose;</li>
            <li>user data is not used or transferred to determine creditworthiness or for lending purposes; and</li>
            <li>human access to user data is restricted as described in this policy.</li>
          </ul>
        </Section>

        <Section title="15. Contact">
          <p>For questions, privacy requests or concerns relating to metaMe Companion, contact:</p>
          <p>
            metaProof / metaMe
            <br />
            Privacy contact:{" "}
            <a className="underline underline-offset-2 hover:text-foreground" href="mailto:info@metame.com">
              info@metame.com
            </a>
            <br />
            Website: metaMe.com
          </p>
        </Section>

        <footer className="mt-10 border-t border-border pt-6 text-xs text-muted-foreground">
          <a className="underline underline-offset-2 hover:text-foreground" href="/">
            Back to metaMe Runtime
          </a>
        </footer>
      </article>
    </main>
  );
};

export default CompanionPrivacy;
