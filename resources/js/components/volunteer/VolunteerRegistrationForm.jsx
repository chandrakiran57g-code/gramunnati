import { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Send, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { apiFetch } from '@/api/apiClient';
import {
  VOLUNTEER_SKILLS,
  VOLUNTEER_STATES,
  VOLUNTEER_AVAILABILITY,
} from '@/lib/adminSections';

const EMPTY = {
  full_name: '',
  email: '',
  mobile: '',
  state: '',
  district: '',
  occupation: '',
  availability: 'flexible',
  skills: [],
  experience: '',
  program_category: '',
  age: '',
};

export default function VolunteerRegistrationForm({ programs = [] }) {
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(null);

  const toggleSkill = (skill) => {
    setForm((f) => ({
      ...f,
      skills: f.skills.includes(skill)
        ? f.skills.filter((s) => s !== skill)
        : [...f.skills, skill],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.full_name.trim() || !form.mobile.trim() || !form.state) {
      setError('Full name, mobile, and state are required.');
      return;
    }

    setLoading(true);
    try {
      const res = await apiFetch('/volunteers/register', {
        method: 'POST',
        body: {
          ...form,
          age: form.age ? Number(form.age) : null,
          email: form.email || null,
        },
      });
      setSubmitted(res?.data?.volunteer_code || true);
      setForm(EMPTY);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-green-200 bg-green-50 p-8 text-center"
      >
        <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-600" />
        <h3 className="font-heading text-xl font-bold">Request submitted!</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Your volunteering request has been submitted successfully. We&apos;ll notify you upon approval.
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-6"
          onClick={() => setSubmitted(null)}
        >
          Register another volunteer
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      onSubmit={handleSubmit}
      className="rounded-2xl border border-border bg-white p-6 shadow-sm sm:p-8"
    >
      <div className="mb-6">
        <h2 className="font-heading text-2xl font-bold">Become a Volunteer</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Share your skills and availability. Join our network driving change across villages and schools.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="vol-name">Full Name *</Label>
          <Input
            id="vol-name"
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            className="mt-1"
            required
          />
        </div>
        <div>
          <Label htmlFor="vol-mobile">Mobile *</Label>
          <Input
            id="vol-mobile"
            type="tel"
            value={form.mobile}
            onChange={(e) => setForm({ ...form, mobile: e.target.value })}
            className="mt-1"
            required
          />
        </div>
        <div>
          <Label htmlFor="vol-email">Email</Label>
          <Input
            id="vol-email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="vol-age">Age</Label>
          <Input
            id="vol-age"
            type="number"
            min={16}
            max={100}
            value={form.age}
            onChange={(e) => setForm({ ...form, age: e.target.value })}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="vol-state">State *</Label>
          <select
            id="vol-state"
            value={form.state}
            onChange={(e) => setForm({ ...form, state: e.target.value })}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            required
          >
            <option value="">Select state</option>
            {VOLUNTEER_STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="vol-district">District</Label>
          <Input
            id="vol-district"
            value={form.district}
            onChange={(e) => setForm({ ...form, district: e.target.value })}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="vol-occupation">Occupation</Label>
          <Input
            id="vol-occupation"
            value={form.occupation}
            onChange={(e) => setForm({ ...form, occupation: e.target.value })}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="vol-availability">Availability</Label>
          <select
            id="vol-availability"
            value={form.availability}
            onChange={(e) => setForm({ ...form, availability: e.target.value })}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {VOLUNTEER_AVAILABILITY.map((a) => (
              <option key={a.value} value={a.value}>{a.label}</option>
            ))}
          </select>
        </div>
        {programs.length > 0 && (
          <div className="sm:col-span-2">
            <Label htmlFor="vol-program">Program interest</Label>
            <select
              id="vol-program"
              value={form.program_category}
              onChange={(e) => setForm({ ...form, program_category: e.target.value })}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Any / General</option>
              {programs.map((p) => (
                <option key={p.id} value={p.slug}>{p.title}</option>
              ))}
            </select>
          </div>
        )}
        <div className="sm:col-span-2">
          <Label>Skills (select all that apply)</Label>
          <div className="mt-2 flex flex-wrap gap-2">
            {VOLUNTEER_SKILLS.map((skill) => (
              <button
                key={skill}
                type="button"
                onClick={() => toggleSkill(skill)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  form.skills.includes(skill)
                    ? 'bg-green-600 text-white'
                    : 'bg-muted text-muted-foreground hover:bg-green-50'
                }`}
              >
                {skill}
              </button>
            ))}
          </div>
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="vol-experience">Experience / Why you want to volunteer</Label>
          <Textarea
            id="vol-experience"
            value={form.experience}
            onChange={(e) => setForm({ ...form, experience: e.target.value })}
            className="mt-1 min-h-[100px]"
            placeholder="Tell us about your background and how you'd like to contribute..."
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white sm:w-auto"
      >
        {loading ? (
          <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting…</>
        ) : (
          <><Send className="mr-2 h-4 w-4" />Submit Registration</>
        )}
      </Button>
    </motion.form>
  );
}
