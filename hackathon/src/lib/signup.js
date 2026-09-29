import { withBase } from "./base";

/**
 * The signup form's options, checks and network calls.
 *
 * YEARS and COLLEGES are the club site's lists (src/lib/join.js at the repo
 * root), copied rather than imported because this app builds on its own. The
 * database stores the `value`s and bounds their shape, not their membership,
 * so a label can change here without a migration.
 *
 * Every check here is repeated in hackathon_register() in SQL, which is the
 * one that counts. These exist so a mistake is pointed at before anything is
 * sent, next to the field that caused it.
 */

export const YEARS = [
  { value: "first", label: "1st year" },
  { value: "second", label: "2nd year" },
  { value: "third", label: "3rd year" },
  { value: "fourth", label: "4th year" },
  { value: "fifth_plus", label: "5th+" },
  { value: "grad", label: "Grad" },
];

export const COLLEGES = [
  { value: "khoury", label: "Khoury College of Computer Sciences" },
  { value: "coe", label: "College of Engineering" },
  { value: "cos", label: "College of Science" },
  { value: "dmsb", label: "D'Amore-McKim School of Business" },
  { value: "camd", label: "College of Arts, Media and Design" },
  { value: "cssh", label: "College of Social Sciences and Humanities" },
  { value: "bouve", label: "Bouvé College of Health Sciences" },
  { value: "cps", label: "College of Professional Studies" },
  { value: "law", label: "School of Law" },
  { value: "mills", label: "Mills College at Northeastern" },
  { value: "explore", label: "Explore Program (undeclared)" },
  { value: "other", label: "Something else" },
];

export const labelFor = (list, value) => list.find((o) => o.value === value)?.label || "";

export const MAX_FILE_BYTES = 5 * 1024 * 1024;
export const HEADSHOT_TYPES = ["image/jpeg", "image/png", "image/webp"];

const NEU_EMAIL = /^[^\s@]+@(northeastern\.edu|husky\.neu\.edu|neu\.edu)$/i;
const LINKEDIN =
  /^(?:https?:\/\/)?(?:[a-z]{2,3}\.)?linkedin\.com\/in\/[A-Za-z0-9_%-]{2,100}\/?(?:[?#].*)?$/i;

/** Digits and a leading +, as the database will store it. */
export function normalizePhone(raw) {
  const cleaned = (raw || "").replace(/[^0-9+]/g, "");
  if (/^[0-9]{10}$/.test(cleaned)) return `+1${cleaned}`;
  if (/^1[0-9]{10}$/.test(cleaned)) return `+${cleaned}`;
  return cleaned;
}

/** +16175550142 → (617) 555-0142; anything else as stored. */
export function formatPhone(e164) {
  const m = /^\+1(\d{3})(\d{3})(\d{4})$/.exec(e164 || "");
  return m ? `(${m[1]}) ${m[2]}-${m[3]}` : e164 || "";
}

export function validate(form) {
  const errors = {};
  const name = form.name.trim();
  if (!name) errors.name = "Tell us your name.";
  else if (name.length > 120) errors.name = "Use a shorter name.";
  else if ("=+-@".includes(name[0])) errors.name = "Start with a letter.";

  const email = form.email.trim();
  if (!email) errors.email = "Add your Northeastern email.";
  else if (!NEU_EMAIL.test(email)) errors.email = "Use your @northeastern.edu address.";

  if (!/^\+[0-9]{8,15}$/.test(normalizePhone(form.phone))) {
    errors.phone = "Add a phone number, with the country code if it isn't a US number.";
  }

  if (!form.year) errors.year = "Pick your year.";
  if (!form.college) errors.college = "Pick your college.";

  if (!LINKEDIN.test(form.linkedin.trim())) {
    errors.linkedin = "Paste your profile link, like linkedin.com/in/your-name.";
  }

  if (!form.resume) errors.resume = "Attach your resume.";
  else if (form.resume.type !== "application/pdf") errors.resume = "Resumes have to be a PDF.";
  else if (form.resume.size > MAX_FILE_BYTES) errors.resume = "That file is over 5MB.";

  if (!form.headshot) errors.headshot = "Add a headshot.";
  else if (!HEADSHOT_TYPES.includes(form.headshot.type)) errors.headshot = "Use a JPG, PNG or WebP image.";
  else if (form.headshot.size > MAX_FILE_BYTES) errors.headshot = "That image is over 5MB.";

  if (form.dietary.length > 300) errors.dietary = "Keep it under 300 characters.";
  if (!form.consent) errors.consent = "We need this to share your profile with sponsors.";

  return errors;
}

/** Server reasons, mapped back to the field they belong to. */
const REASONS = {
  name_required: ["name", "Tell us your name."],
  name_invalid: ["name", "Start with a letter."],
  email_invalid: ["email", "Check that address and try again."],
  email_domain: ["email", "Use your @northeastern.edu address."],
  phone_invalid: ["phone", "Check that number and try again."],
  year_required: ["year", "Pick your year."],
  college_required: ["college", "Pick your college."],
  linkedin_invalid: ["linkedin", "Paste your profile link, like linkedin.com/in/your-name."],
  dietary_too_long: ["dietary", "Keep it under 300 characters."],
  consent_required: ["consent", "We need this to share your profile with sponsors."],
  resume_type: ["resume", "Resumes have to be a PDF."],
  resume_size: ["resume", "That file is over 5MB."],
  headshot_type: ["headshot", "Use a JPG, PNG or WebP image."],
  headshot_size: ["headshot", "That image is over 5MB."],
  already_registered: [
    "email",
    "That email already has a ticket or a waitlist place. Lost it? Email the organizers.",
  ],
};

const GENERAL = {
  not_configured: "Registration isn't open yet. Check back soon.",
  files_missing: "Your files didn't finish uploading. Try again.",
  rate_limited: "Too many tries in a row. Wait a minute and try again.",
  not_found: "We couldn't find that registration. Start again below.",
};

export function reasonToError(reason) {
  if (REASONS[reason]) {
    const [field, message] = REASONS[reason];
    return { field, message };
  }
  return { field: null, message: GENERAL[reason] || "Something went wrong. Try again in a moment." };
}

async function post(path, body) {
  let res;
  try {
    res = await fetch(withBase(path), {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    return { ok: false, reason: "network" };
  }
  if (res.status === 429) return { ok: false, reason: "rate_limited" };
  return res.json().catch(() => ({ ok: false, reason: "backend" }));
}

export const register = (fields) => post("api/register", fields);
export const finish = (id) => post("api/finish", { id });

/**
 * PUT one file to its signed upload URL, reporting progress. XHR rather than
 * fetch because fetch still cannot report upload progress, and a 5MB PDF on
 * campus Wi-Fi is long enough that a frozen button looks broken.
 */
export function upload(url, file, onProgress) {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.setRequestHeader("x-upsert", "false");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(e.loaded / e.total);
    };
    xhr.onload = () => resolve(xhr.status >= 200 && xhr.status < 300);
    xhr.onerror = () => resolve(false);
    xhr.send(file);
  });
}

// ---------------------------------------------------------------------------
// Remembered state. Both are conveniences; the page works without them.
// ---------------------------------------------------------------------------

const PENDING_KEY = "hk1984-pending";
const TICKET_KEY = "hk1984-ticket";

function safe(fn, fallback = null) {
  try {
    return fn();
  } catch {
    return fallback;
  }
}

/** The registration someone filled in but has not paid for yet. */
export const pending = {
  get: () => safe(() => window.sessionStorage.getItem(PENDING_KEY)),
  set: (id) => safe(() => window.sessionStorage.setItem(PENDING_KEY, id)),
  clear: () => safe(() => window.sessionStorage.removeItem(PENDING_KEY)),
};

/** The last ticket this browser was shown, so /hackathon/ticket/ finds it. */
export const savedTicket = {
  get: () => safe(() => window.localStorage.getItem(TICKET_KEY)),
  set: (token) => safe(() => window.localStorage.setItem(TICKET_KEY, token)),
};
