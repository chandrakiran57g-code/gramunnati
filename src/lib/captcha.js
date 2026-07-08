/** Simple signed math captcha — token encodes expected answer */

const SECRET = import.meta.env.VITE_CAPTCHA_SECRET || 'cmsr-captcha-v1';

function hash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = ((h << 5) - h) + str.charCodeAt(i) | 0;
  return Math.abs(h).toString(36);
}

export function createCaptchaChallenge() {
  const a = Math.floor(Math.random() * 9) + 1;
  const b = Math.floor(Math.random() * 9) + 1;
  const answer = a + b;
  const token = `${a}:${b}:${hash(`${SECRET}:${answer}`)}`;
  return { question: `${a} + ${b} = ?`, token, answer };
}

export function verifyCaptchaAnswer(token, userAnswer) {
  if (!token || userAnswer === '' || userAnswer == null) return false;
  const [a, b, sig] = token.split(':');
  const expected = Number(a) + Number(b);
  const user = Number(String(userAnswer).trim());
  if (Number.isNaN(user)) return false;
  return user === expected && sig === hash(`${SECRET}:${expected}`);
}
