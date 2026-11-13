import { useState } from 'react';
import Input from '../components/Input';
import Label from '../components/Label';
import ErrorMessage from '../components/ErrorMessage';

const MAX_EMAIL = 254;
const MAX_URL = 300;

export default function ContactsStep({ data, updateField }) {
  const profile = data?.profile || {};
  const [errors, setErrors] = useState({});

  const validateEmail = (value) => {
    if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setErrors((prev) => ({ ...prev, email: 'Please enter a valid email address.' }));
    } else {
      setErrors((prev) => ({ ...prev, email: '' }));
    }
  };

  const validateUrl = (field, value) => {
    if (value && !value.startsWith('https://')) {
      setErrors((prev) => ({ ...prev, [field]: 'URL must start with https://' }));
    } else {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-serif font-semibold">Contacts</h2>
        <p className="text-sm text-muted mt-1">Provide channels where employers and recruiters can reach you.</p>
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={profile.email || ''}
          onChange={(e) => updateField('profile.email', e.target.value.slice(0, MAX_EMAIL))}
          onBlur={(e) => validateEmail(e.target.value)}
          placeholder="developer@example.com"
          maxLength={MAX_EMAIL}
          error={!!errors.email}
        />
        <ErrorMessage>{errors.email}</ErrorMessage>
      </div>

      <div>
        <Label htmlFor="github">GitHub</Label>
        <Input
          id="github"
          type="url"
          value={profile.github || ''}
          onChange={(e) => updateField('profile.github', e.target.value.slice(0, MAX_URL))}
          onBlur={(e) => validateUrl('github', e.target.value)}
          placeholder="https://github.com/your-username"
          maxLength={MAX_URL}
          error={!!errors.github}
        />
        <ErrorMessage>{errors.github}</ErrorMessage>
      </div>

      <div>
        <Label htmlFor="linkedin">LinkedIn</Label>
        <Input
          id="linkedin"
          type="url"
          value={profile.linkedin || ''}
          onChange={(e) => updateField('profile.linkedin', e.target.value.slice(0, MAX_URL))}
          onBlur={(e) => validateUrl('linkedin', e.target.value)}
          placeholder="https://linkedin.com/in/your-profile"
          maxLength={MAX_URL}
          error={!!errors.linkedin}
        />
        <ErrorMessage>{errors.linkedin}</ErrorMessage>
      </div>
    </div>
  );
}
