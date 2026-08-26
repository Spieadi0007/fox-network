import type { Metadata } from "next";
import { LegalPage, Section, Rows } from "@/components/marketing/legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy — FoxNetwork",
  description:
    "What personal data FoxNetwork collects, why we hold it, who processes it on our behalf, and the rights you have over it.",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="26 August 2026"
      intro="FoxNetwork is a maintenance platform for physical infrastructure networks. This policy explains what personal data we collect, why we hold it, who else processes it on our behalf, and what you can ask us to do with it."
    >
      <Section title="Who we are">
        <p>
          FoxNetwork Inc. operates the FoxNetwork platform. Where an
          organisation uses FoxNetwork to manage its own field operations,
          that organisation is the data controller for the records it creates
          and we act as its processor. For account and billing data we are the
          controller ourselves.
        </p>
      </Section>

      <Section title="What we collect">
        <Rows
          rows={[
            {
              term: "Account details",
              detail:
                "Name, work email address, role, and the organisation you belong to. Supplied when an account is created or when a colleague invites you.",
            },
            {
              term: "Work records",
              detail:
                "Work orders, sites, assets, and the visits carried out against them, including who performed the visit and when it started and finished.",
            },
            {
              term: "Photographs",
              detail:
                "Images technicians capture on site as evidence of work done. These may incidentally include people, vehicles or premises in the background.",
            },
            {
              term: "Signatures",
              detail:
                "The typed name of a technician or a site representative confirming a visit, together with the time it was given.",
            },
            {
              term: "Location",
              detail:
                "Where a submission was made, when a technician's device provides it. Used to confirm a visit happened at the site it claims.",
            },
            {
              term: "Uploaded documents",
              detail:
                "Standard Operating Procedures and similar documents an organisation uploads so we can derive the steps a technician follows.",
            },
            {
              term: "Technical data",
              detail:
                "IP address, browser and device type, and timestamps, recorded when you use the service so we can keep it secure and working.",
            },
          ]}
        />
      </Section>

      <Section title="Why we hold it">
        <p>
          To provide the service you or your employer signed up for: assigning
          work, recording what was done, and producing the report that proves
          it. To keep accounts secure and investigate misuse. To meet legal and
          contractual obligations, including retaining evidence of completed
          work. Where we rely on legitimate interests, that interest is
          operating and securing a maintenance platform; you can object using
          the contact address below.
        </p>
        <p>
          We do not sell personal data, and we do not use it for advertising or
          profiling.
        </p>
      </Section>

      <Section title="Automated processing of uploaded documents">
        <p>
          When an organisation uploads a Standard Operating Procedure, its
          contents are sent to Anthropic&rsquo;s API so a model can read it and
          propose the fields and steps a technician should follow. Anthropic
          processes the document on our instructions and does not use it to
          train its models.
        </p>
        <p>
          The output is always reviewed by a person at your organisation before
          it takes effect. No decision with a legal or similarly significant
          effect on an individual is made by automated means. Do not upload
          documents containing personal data you would not want processed this
          way.
        </p>
      </Section>

      <Section title="Who else processes your data">
        <Rows
          rows={[
            {
              term: "Supabase",
              detail:
                "Database, authentication and file storage. Data is held in the EU (eu-west-1).",
            },
            {
              term: "Vercel",
              detail: "Application hosting and delivery.",
            },
            {
              term: "Anthropic",
              detail:
                "Reads uploaded SOP documents to derive procedures, as described above.",
            },
          ]}
        />
        <p>
          Each is bound by a data processing agreement and may only act on our
          instructions. We will update this list before adding a processor that
          handles personal data.
        </p>
      </Section>

      <Section title="How long we keep it">
        <p>
          Work records, photographs and reports are retained for as long as
          your organisation&rsquo;s account is active, because they are the
          evidence that work was carried out and are often required for
          contractual or warranty reasons. Account data is deleted within 90
          days of an account closing, unless we are required to keep it longer.
          Technical logs are kept for up to 12 months.
        </p>
      </Section>

      <Section title="Your rights">
        <p>
          Under the UK GDPR and EU GDPR you can ask for a copy of your personal
          data, ask us to correct it, ask us to delete it, ask us to restrict
          how we use it, object to processing based on legitimate interests, or
          ask for your data in a portable format.
        </p>
        <p>
          If your data sits inside an organisation&rsquo;s account, that
          organisation controls it — we will pass your request to them and
          support them in answering it. Write to{" "}
          <a
            href="mailto:contact@foxnetwork.io"
            className="font-medium text-fox-orange hover:underline"
          >
            contact@foxnetwork.io
          </a>{" "}
          and we will respond within 30 days. You also have the right to
          complain to your local data protection authority.
        </p>
      </Section>

      <Section title="Security">
        <p>
          Access is restricted by role, and every record is scoped to the
          organisation that owns it and enforced at the database. Uploaded
          documents and photographs are held in private storage reachable only
          through short-lived links issued to authorised users. Data is
          encrypted in transit and at rest.
        </p>
      </Section>

      <Section title="Cookies">
        <p>
          We set only what the service needs to work: a session cookie to keep
          you signed in and a preference cookie for choices such as your
          default view. We do not use advertising or third-party tracking
          cookies.
        </p>
      </Section>

      <Section title="Changes to this policy">
        <p>
          If we make a material change we will update the date at the top of
          this page and, where the change affects how we handle personal data,
          notify account administrators by email before it takes effect.
        </p>
      </Section>
    </LegalPage>
  );
}
