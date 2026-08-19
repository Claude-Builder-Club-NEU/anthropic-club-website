import { TYPES } from "../lib/polls";

/**
 * One question, rendered from its definition.
 *
 * Every type here is driven entirely by the poll's JSON, which is what lets a
 * new poll be a file rather than a component. Nothing in this file knows which
 * poll it is rendering.
 *
 * ACCESSIBILITY: each question is a <fieldset> with the prompt as its
 * <legend>, so a screen reader announces "Best night for a biweekly 90-minute
 * session, Monday, radio button, 1 of 4" instead of four unattached radios.
 * The visual styling of the legend is done with a span inside it, because a
 * legend cannot be laid out reliably across browsers.
 */

/* --- Ranked slots -------------------------------------------------------- *
 * Section 1 of the mockups. Tapping a pool item fills the next open slot and
 * tapping a filled slot clears it, so PICK ORDER IS THE RANKING.
 *
 * The array is POSITIONAL and keeps its holes: clearing the middle slot leaves
 * that slot empty rather than promoting the one after it. The slots carry real
 * dates, so a student reads this as "which workshop lands on Oct 29", and
 * having their third pick jump onto the second date because they cleared the
 * one between is a change they did not ask for. It also matches the spec
 * literally: a pick fills the next OPEN slot, which presumes holes exist.
 *
 * Stored as a list rather than a set because position is meaning. Empty slots
 * are null, and the tally in SQL only counts strings, so holes cost nothing
 * downstream.
 * ------------------------------------------------------------------------- */
const Slots = ({ question, value = [], onChange }) => {
  const slots = question.slots || [];
  const picks = Array.isArray(value) ? value : [];
  const filled = slots.map((_, i) => picks[i] || null);
  const taken = new Set(filled.filter(Boolean));

  const pick = (key) => {
    const next = [...filled];
    const open = next.findIndex((slot) => !slot);
    if (open === -1) return; // every slot full; clear one first
    next[open] = key;
    onChange(next);
  };

  const clear = (index) => {
    const next = [...filled];
    next[index] = null;
    onChange(next);
  };

  return (
    <div className="slots">
      <ol className="slots__row">
        {slots.map((slot, i) => {
          const key = filled[i];
          const item = question.pool?.find((p) => p.key === key);
          return (
            <li key={slot.label} className="slotcard">
              <p className="slotcard__head">
                <span className="slotcard__label">{slot.label}</span>
                <span className="slotcard__date">{slot.date}</span>
              </p>
              {item ? (
                <button
                  type="button"
                  className="slotcard__pick"
                  onClick={() => clear(i)}
                >
                  <span className="slotcard__title">{item.label}</span>
                  <span className="slotcard__meta">
                    {item.level} · tap to clear
                  </span>
                </button>
              ) : (
                <p className="slotcard__empty">Empty</p>
              )}
            </li>
          );
        })}
      </ol>

      <p className="slots__pooltitle">Still on the table</p>
      <ul className="slots__pool">
        {(question.pool || [])
          .filter((item) => !taken.has(item.key))
          .map((item) => (
            <li key={item.key}>
              <button
                type="button"
                className="poolitem"
                onClick={() => pick(item.key)}
              >
                <span className="poolitem__plus" aria-hidden="true">
                  +
                </span>
                <span>
                  <span className="poolitem__label">{item.label}</span>
                  {item.level && (
                    <span className="poolitem__level">{item.level}</span>
                  )}
                </span>
              </button>
            </li>
          ))}
      </ul>
    </div>
  );
};

/* --- Single choice, yes/no, multi ---------------------------------------- */

const Choice = ({ question, name, options, value, onChange, multi }) => {
  const selected = multi ? (Array.isArray(value) ? value : []) : value;

  const toggle = (key) => {
    if (!multi) {
      onChange(key);
      return;
    }
    const set = new Set(selected);
    if (set.has(key)) set.delete(key);
    else set.add(key);
    // Preserve the option order rather than click order: a multi-select has no
    // ranking, and stable order keeps the stored answer diffable.
    onChange(options.filter((o) => set.has(o.key)).map((o) => o.key));
  };

  return (
    <div
      className={`choices${question.layout === "inline" ? " choices--inline" : ""}`}
    >
      {options.map((option) => {
        const isOn = multi
          ? selected.includes(option.key)
          : selected === option.key;
        return (
          <label
            key={option.key}
            className={`choice${isOn ? " choice--on" : ""}`}
          >
            <input
              type={multi ? "checkbox" : "radio"}
              name={name}
              value={option.key}
              checked={isOn}
              onChange={() => toggle(option.key)}
              className="choice__input"
            />
            <span className="choice__mark" aria-hidden="true" />
            <span className="choice__label">{option.label}</span>
          </label>
        );
      })}
    </div>
  );
};

const YESNO = [
  { key: "yes", label: "Yes" },
  { key: "no", label: "No" },
];

const BallotQuestion = ({ question, name, value, onChange }) => {
  const body = () => {
    switch (question.type) {
      case TYPES.slots:
        return <Slots question={question} value={value} onChange={onChange} />;
      case TYPES.single:
        return (
          <Choice
            question={question}
            name={name}
            options={question.options || []}
            value={value}
            onChange={onChange}
          />
        );
      case TYPES.yesno:
        return (
          <Choice
            question={{ ...question, layout: "inline" }}
            name={name}
            options={YESNO}
            value={value}
            onChange={onChange}
          />
        );
      case TYPES.multi:
        return (
          <Choice
            question={question}
            name={name}
            options={question.options || []}
            value={value}
            onChange={onChange}
            multi
          />
        );
      case TYPES.text:
        return (
          <textarea
            id={name}
            className="ballot__text"
            rows={3}
            maxLength={question.maxLength || 400}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
          />
        );
      default:
        // An unknown type costs one question, not the session. See polls.js.
        return null;
    }
  };

  if (question.type === TYPES.text) {
    return (
      <div className="ballot__q">
        <label className="ballot__prompt" htmlFor={name}>
          {question.prompt}
        </label>
        {question.hint && <p className="ballot__hint">{question.hint}</p>}
        {body()}
      </div>
    );
  }

  return (
    <fieldset className="ballot__q">
      <legend className="ballot__legend">
        <span className="ballot__prompt">{question.prompt}</span>
      </legend>
      {question.hint && <p className="ballot__hint">{question.hint}</p>}
      {body()}
    </fieldset>
  );
};

export default BallotQuestion;
