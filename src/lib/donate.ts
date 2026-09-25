// Central donation config — Indian UPI.
// Privacy: the full VPA contains a phone number, so the UI NEVER renders it
// as visible text. We show only "Hikmah Noor • …@ybl" plus Copy / Scan actions.
// NOTE: view-source still contains the VPA (unavoidable — the QR + upi:// link
// must encode it). For a fully number-free address, create an alias VPA like
// hikmahnoor@ybl in your UPI app and replace DONATE_VPA below.

export const DONATE_PAYEE = 'Hikmah Noor';

// Full VPA kept in one place. Assembled from parts only to avoid accidental
// display via naive text search in templates — still present in built JS.
const P1 = '9906273197';
const P2 = '-2';
const P3 = '@ybl';

export const DONATE_VPA = `${P1}${P2}${P3}`;

/** Masked for UI: hides the phone digits, keeps trust cues. */
export const DONATE_VPA_MASKED = '•••••• ••••@ybl';

export function upiQrPayload(note = 'Hikmah Noor Donation'): string {
  const params = new URLSearchParams({
    pa: DONATE_VPA,
    pn: DONATE_PAYEE,
    cu: 'INR',
    tn: note,
  });
  return `upi://pay?${params.toString()}`;
}

/** upi:// intent URL for "Pay via UPI app" buttons (mobile). */
export function upiIntentUrl(note = 'Hikmah Noor Donation'): string {
  return upiQrPayload(note);
}
