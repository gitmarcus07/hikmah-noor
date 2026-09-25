// Central donation config — Indian UPI.
// Privacy: the full VPA contains a phone number, so the UI NEVER renders it
// as visible text. We show only "Hikmah Noor • …@ybl" plus Copy / Scan actions.
// NOTE: view-source still contains the VPA (unavoidable — the QR + upi:// link
// must encode it). For a fully number-free address, create an alias VPA like
// hikmahnoor@ybl in your UPI app and replace DONATE_VPA below.

export const DONATE_PAYEE = 'Hikmah Noor';

/**
 * Exact account-holder name as shown by UPI apps at payment confirmation.
 * UPI always reveals the registered name — `pn` is only a hint and cannot
 * rename the account. Set this to the real name once the owner confirms it,
 * so the site matches what donors see in PhonePe / GPay / Paytm.
 * Empty = owner hasn't confirmed yet → UI shows a generic verify-payee note.
 */
export const DONATE_ACCOUNT_HOLDER = '';

// Full VPA kept in one place. Assembled from parts only to avoid accidental
// display via naive text search in templates — still present in built JS.
const P1 = '9906273197';
const P2 = '-2';
const P3 = '@ybl';

export const DONATE_VPA = `${P1}${P2}${P3}`;

/** Masked for UI: hides the phone digits, keeps trust cues. */
export const DONATE_VPA_MASKED = '•••••• ••••@ybl';

export function upiQrPayload(note = 'Hikmah Noor Donation'): string {
  // NOTE: `pa` keeps the raw `@` (not %40) — PhonePe rejects over-encoded VPAs.
  // `pn` prefers the real account-holder name when known (matches what the
  // UPI app shows); falls back to the site name.
  const pn = DONATE_ACCOUNT_HOLDER || DONATE_PAYEE;
  return (
    `upi://pay?pa=${DONATE_VPA}` +
    `&pn=${encodeURIComponent(pn)}` +
    `&cu=INR` +
    `&tn=${encodeURIComponent(note)}`
  );
}

/** upi:// intent URL for "Pay via UPI app" buttons (mobile). */
export function upiIntentUrl(note = 'Hikmah Noor Donation'): string {
  return upiQrPayload(note);
}
