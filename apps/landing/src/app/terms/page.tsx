import type { Metadata } from "next";
import { LegalPage, Section } from "@/components/marketing/legal-page";

export const metadata: Metadata = {
  title: "Terms of Use — FoxNetwork",
  description:
    "The terms on which FoxNetwork is provided: accounts, acceptable use, ownership of your data, availability, liability and termination.",
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Use"
      updated="26 August 2026"
      intro="These terms govern your use of the FoxNetwork platform. By creating an account, or by using an account created for you by your employer, you agree to them. If you are agreeing on behalf of an organisation, you confirm you are authorised to do so."
    >
      <Section title="The service">
        <p>
          FoxNetwork is a platform for managing maintenance across distributed
          physical infrastructure: raising work orders, configuring what a
          technician sees and records, deriving procedures from your Standard
          Operating Procedures, and producing a report from each completed
          visit.
        </p>
        <p>
          We may change or improve the service over time. Where a change
          materially reduces functionality you rely on, we will give
          reasonable notice.
        </p>
      </Section>

      <Section title="Accounts">
        <p>
          You are responsible for keeping your credentials secure and for
          activity carried out under your account. Tell us promptly at
          contact@foxnetwork.io if you believe an account has been compromised.
        </p>
        <p>
          Accounts are for named individuals and must not be shared. An
          organisation&rsquo;s administrators may invite, change the role of, or
          remove members of their organisation, and may access records created
          by those members.
        </p>
      </Section>

      <Section title="Your data stays yours">
        <p>
          You keep all rights in the content you put into FoxNetwork: your work
          orders, sites, assets, photographs, reports and the Standard
          Operating Procedures you upload. We claim no ownership of it.
        </p>
        <p>
          You grant us the limited licence needed to run the service — to
          store, transmit, display and process your content, including sending
          uploaded documents to our processors so procedures can be derived
          from them, as described in the Privacy Policy. That licence exists
          only to provide the service to you and ends when you delete the
          content or close your account.
        </p>
        <p>
          You can export your data, and can ask us for a copy at any time while
          your account is active.
        </p>
      </Section>

      <Section title="What you upload">
        <p>
          You confirm you have the right to upload the documents and images you
          put into the service, and that doing so does not breach anyone
          else&rsquo;s rights or a confidentiality obligation you owe a client.
        </p>
        <p>
          Do not upload material that is unlawful, or that contains personal
          data you have no basis to share. Uploaded procedures are read by an
          automated system, so treat that as you would any other processor.
        </p>
      </Section>

      <Section title="Acceptable use">
        <p>
          Do not use the service to break the law, to gain unauthorised access
          to any system or another organisation&rsquo;s data, to interfere with
          its operation, or to reverse engineer, resell or copy it except where
          the law allows.
        </p>
        <p>
          Do not misrepresent work in the records you create. Reports produced
          by FoxNetwork are relied on as evidence that work was carried out;
          falsifying them may be a breach of your contract with your client as
          well as of these terms.
        </p>
      </Section>

      <Section title="Availability">
        <p>
          We work to keep FoxNetwork available and will give advance notice of
          planned maintenance where we reasonably can. We do not guarantee
          uninterrupted availability unless a separate written agreement with
          your organisation says otherwise.
        </p>
        <p>
          Parts of the service depend on third parties, including our hosting
          and document-processing providers. An outage at one of those may
          affect features that rely on it.
        </p>
      </Section>

      <Section title="Procedures derived from your documents">
        <p>
          Where the platform proposes fields, modules or procedure steps from a
          document you upload, those proposals are suggestions. They are shown
          for review and take effect only once someone at your organisation
          publishes them.
        </p>
        <p>
          You remain responsible for the accuracy and safety of the procedures
          your technicians follow, including checking that a published
          procedure reflects the source document and your own safety
          obligations.
        </p>
      </Section>

      <Section title="Fees">
        <p>
          Where your organisation has a paid plan, fees, billing period and
          notice are set out in the agreement or order form between us. Unless
          that agreement says otherwise, fees are payable in advance and are
          non-refundable for a period already begun.
        </p>
      </Section>

      <Section title="Liability">
        <p>
          Nothing here limits liability for death or personal injury caused by
          negligence, for fraud, or for anything else that cannot lawfully be
          limited.
        </p>
        <p>
          Subject to that, neither party is liable for indirect or
          consequential loss, or for loss of profit, revenue, or anticipated
          savings. Our total liability in any twelve-month period is limited to
          the fees paid by your organisation in that period.
        </p>
        <p>
          The service is provided as it is. We do not warrant that it will meet
          every requirement or that it will be error-free.
        </p>
      </Section>

      <Section title="Suspension and termination">
        <p>
          You may stop using the service at any time, and an administrator can
          close your organisation&rsquo;s account. We may suspend or end access
          where these terms are seriously or repeatedly breached, where required
          by law, or where continued use puts the service or other customers at
          risk. We will tell you why unless we are prevented from doing so.
        </p>
        <p>
          After an account closes we retain data as described in the Privacy
          Policy. Ask us before closing if you need an export.
        </p>
      </Section>

      <Section title="Changes to these terms">
        <p>
          We may update these terms. If a change materially affects your rights
          we will notify account administrators by email before it takes
          effect. Continuing to use the service after that means you accept the
          updated terms.
        </p>
      </Section>

      <Section title="Governing law">
        <p>
          These terms are governed by the laws of the jurisdiction in which
          FoxNetwork Inc. is established, and the courts of that jurisdiction
          have exclusive jurisdiction over any dispute — except that either
          party may seek injunctive relief wherever appropriate.
        </p>
      </Section>
    </LegalPage>
  );
}
