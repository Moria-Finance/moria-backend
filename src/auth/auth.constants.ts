export const EXPIRATION_TIME = 86400; // supabase jwt (access token) and browser cookie only valid for this 24 hrs
export const VALID_PERIOD = 30; // user must submit signed response within 30 seconds
export const ERGO_PAY_SUB_PERIOD = 120 * 1000; // browser only waits 2 minutes for user to scan qr
export const STATEMENT = // one of the messages the user signs
  'Please sign this message to verify address ownership.';
