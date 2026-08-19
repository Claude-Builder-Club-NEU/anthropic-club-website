import CheckInForm from "../components/CheckInForm";

/**
 * Attendance. Mode: complete one task, in a room, standing up.
 *
 * Wears the site chrome, unlike the pitch flow. A student arriving here has
 * usually come from the events page or from a code on a slide, and the header
 * is how they get back to what the club actually is.
 *
 * The route is noindex (see lib/seo.js). It is a working surface for people who
 * are already in the room, not a page that should turn up in a search for the
 * club, and a crawler landing on a check-in form learns nothing about us.
 *
 * Everything below the heading is client-rendered: this is the first surface on
 * the site that reads live data rather than data baked in at build time. The
 * prerendered HTML therefore ships the frame and the form's idle state, which
 * is the correct thing to serve before the session is known.
 */
const Attendance = () => (
  <section className="mx-auto w-full max-w-6xl px-6 py-16 sm:px-10 sm:py-24 lg:px-16">
    <CheckInForm />
  </section>
);

export default Attendance;
