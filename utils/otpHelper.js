import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

export async function askForOtp(browserName) {
  return askForCode({
    browserName,
    pattern: /^\d{6}$/,
    validationMessage: 'OTP must be exactly 6 digits.'
  });
}

export async function askForAlphaNumericOtp(browserName) {
  return askForCode({
    browserName,
    pattern: /^[a-zA-Z0-9]{6}$/,
    validationMessage: 'OTP must be exactly 6 letters/numbers.'
  });
}

async function askForCode({ browserName, pattern, validationMessage }) {
  const rl = createInterface({
    input,
    output
  });

  try {
    const otp = await rl.question(
      `Enter OTP for ${browserName}: `
    );

    const trimmedOtp = otp.trim();

    if (!pattern.test(trimmedOtp)) {
      throw new Error(validationMessage);
    }

    return trimmedOtp;
  } finally {
    rl.close();
  }
}
