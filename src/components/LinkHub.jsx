import {
  INSTAGRAM,
  LINKEDIN,
  SLACK_WORKSPACE,
  INTEREST_FORM,
} from "../lib/links";
import {
  InstagramIcon,
  LinkedInIcon,
  SlackIcon,
  MailIcon,
  ExternalIcon,
} from "./Icons";

/**
 * First-screen link row, not a footer afterthought. Shares the page container
 * with the hero so its left edge lines up with the headline.
 *
 * Two asset gaps are handled honestly rather than faked:
 *
 * 1. The club's custom emoji set has not been delivered, so these are the
 *    authored SVG marks from Icons.jsx. Swapping them is a change to this file
 *    alone.
 * 2. There is no email-list endpoint, so the "Get updates" slot points at the
 *    interest form, which does collect contact details, instead of shipping a
 *    dead subscribe box.
 *
 * Slack is framed as the community rather than as a sign-in, per revision 2
 * §5. Note the underlying URL is still a workspace link, so it only resolves
 * for existing members; a shared-invite link would make the invitation real.
 */

const LINKS = [
  {
    href: INTEREST_FORM,
    label: "Get updates",
    hint: "Interest form",
    Icon: MailIcon,
  },
  {
    href: SLACK_WORKSPACE,
    label: "Slack",
    hint: "Where our community lives",
    Icon: SlackIcon,
  },
  {
    href: INSTAGRAM,
    label: "Instagram",
    hint: "@claudeclub.nu",
    Icon: InstagramIcon,
  },
  {
    href: LINKEDIN,
    label: "LinkedIn",
    hint: "Follow the club",
    Icon: LinkedInIcon,
  },
];

const LinkHub = () => (
  <section
    aria-labelledby="linkhub-heading"
    className="border-y border-rule bg-gray-light"
  >
    <div className="mx-auto w-full max-w-6xl px-6 py-10 sm:px-10 lg:px-16">
      <h2 id="linkhub-heading" className="meta m-0">
        Find us
      </h2>
      <ul className="mt-5 grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2 lg:grid-cols-4">
        {LINKS.map(({ href, label, hint, Icon }) => (
          <li key={label}>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="link-card flex items-center gap-3 rounded border border-rule bg-paper px-4 py-3.5 no-underline"
            >
              <span className="text-coral-text">
                <Icon />
              </span>
              <span className="min-w-0">
                <span className="block font-display text-small font-medium text-ink">
                  {label}
                </span>
                <span className="block text-meta text-gray-text">{hint}</span>
              </span>
              <span className="ml-auto text-gray-text">
                <ExternalIcon />
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  </section>
);

export default LinkHub;
