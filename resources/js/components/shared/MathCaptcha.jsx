import { useMemo, useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createCaptchaChallenge, verifyCaptchaAnswer } from '@/lib/captcha';

export default function MathCaptcha({ onValidChange }) {
  const challenge = useMemo(() => createCaptchaChallenge(), []);
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const ok = verifyCaptchaAnswer(challenge.token, answer);
    onValidChange?.(ok, challenge.token, answer);
    setError('');
  }, [answer, challenge.token, onValidChange]);

  const handleBlur = () => {
    if (answer && !verifyCaptchaAnswer(challenge.token, answer)) {
      setError('Incorrect answer');
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="captcha">Security check *</Label>
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium bg-muted px-3 py-2 rounded-lg border border-border whitespace-nowrap">
          {challenge.question}
        </span>
        <Input
          id="captcha"
          type="number"
          inputMode="numeric"
          placeholder="Answer"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onBlur={handleBlur}
          className="h-12 max-w-[120px]"
          required
        />
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export function validateCaptchaOrThrow(token, answer) {
  if (!verifyCaptchaAnswer(token, answer)) {
    throw new Error('Incorrect captcha answer. Please try again.');
  }
}
