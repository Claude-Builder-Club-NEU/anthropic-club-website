/**
 * POST /hackathon/api/register
 *
 * Step one of three. Takes the form's text fields and a description of the two
 * files (type and size, not the bytes), stores a PENDING registration, and
 * hands back one signed upload URL per file. The browser then uploads straight
 * to the private bucket, so a 5MB resume never passes through this function.
 *
 * Step two is the upload; step three is /hackathon/api/finish.
 *
 * All validation that matters is in hackathon_register() in SQL. The checks
 * here are only the ones SQL cannot see: the files.
 */
import {
  HEADSHOT_TYPES,
  MAX_FILE_BYTES,
  configured,
  json,
  notConfigured,
  rpc,
  signedUploadUrl,
} from "../lib/hackathon.mjs";

const str = (v, max = 400) => (typeof v === "string" ? v.slice(0, max) : "");

export default async (req) => {
  if (!configured()) return notConfigured();

  let body;
  try {
    body = await req.json();
  } catch {
    return json(400, { ok: false, reason: "bad_request" });
  }

  const resume = body?.resume || {};
  const headshot = body?.headshot || {};

  if (resume.type !== "application/pdf") {
    return json(400, { ok: false, reason: "resume_type" });
  }
  if (!(resume.size > 0 && resume.size <= MAX_FILE_BYTES)) {
    return json(400, { ok: false, reason: "resume_size" });
  }
  const ext = HEADSHOT_TYPES[headshot.type];
  if (!ext) return json(400, { ok: false, reason: "headshot_type" });
  if (!(headshot.size > 0 && headshot.size <= MAX_FILE_BYTES)) {
    return json(400, { ok: false, reason: "headshot_size" });
  }

  try {
    const result = await rpc("hackathon_register", {
      p_name: str(body.name, 200),
      p_email: str(body.email, 300),
      p_phone: str(body.phone, 40),
      p_class_year: str(body.year, 40),
      p_college: str(body.college, 40),
      p_linkedin: str(body.linkedin, 300),
      p_dietary: str(body.dietary, 400),
      p_consent: body.consent === true,
      p_headshot_ext: ext,
    });

    if (!result.ok) return json(422, result);

    const [resumeUrl, headshotUrl] = await Promise.all([
      signedUploadUrl(result.resume_path),
      signedUploadUrl(result.headshot_path),
    ]);

    return json(200, {
      ok: true,
      id: result.id,
      full: result.full,
      uploads: { resume: resumeUrl, headshot: headshotUrl },
    });
  } catch (err) {
    console.error("[hackathon] register", err.message);
    return json(502, { ok: false, reason: "backend" });
  }
};

// Netlify's own per-IP limit: ten forms a minute is far above anyone filling
// it in by hand and far below a script trying to flood the table.
export const config = {
  path: "/hackathon/api/register",
  method: "POST",
  rateLimit: { windowLimit: 10, windowSize: 60, aggregateBy: ["ip", "domain"] },
};
