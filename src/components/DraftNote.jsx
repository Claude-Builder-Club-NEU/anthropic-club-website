/**
 * A visible "this copy is not final" marker, shown in development only.
 *
 * The brief's instruction was to draft a first pass and mark it TODO: Jackson.
 * Rendering the marker in dev but not production means unreviewed copy is
 * obvious while working on the site, and invisible to visitors — so a forgotten
 * TODO degrades to plain prose rather than leaking a note to the public.
 *
 * Search for `DraftNote` to find everything still awaiting your wording.
 */
const DraftNote = ({ children }) => {
  if (!import.meta.env.DEV) return null;
  return (
    <p
      className="meta mt-2 text-coral-text"
      style={{ maxWidth: "none", textTransform: "none", letterSpacing: "0.02em" }}
    >
      TODO: Jackson — {children}
    </p>
  );
};

export default DraftNote;
