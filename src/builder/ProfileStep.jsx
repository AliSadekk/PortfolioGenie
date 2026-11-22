import Input from '../components/Input';
import Textarea from '../components/Textarea';
import Label from '../components/Label';

const MAX_NAME = 80;
const MAX_BIO = 1000;

export default function ProfileStep({ data, updateField }) {
  const profile = data?.profile || {};

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-serif font-semibold">Profile</h2>
        <p className="text-sm text-muted mt-1">Start with your basic professional introduction.</p>
      </div>

      <div>
        <Label htmlFor="fullName">Full name</Label>
        <Input
          id="fullName"
          value={profile.fullName || ''}
          onChange={(e) => updateField('profile.fullName', e.target.value.slice(0, MAX_NAME))}
          placeholder="e.g. Jane Developer"
          maxLength={MAX_NAME}
        />
        <p className="text-xs text-muted mt-1 text-right font-mono">
          {(profile.fullName || '').length}/{MAX_NAME}
        </p>
      </div>

      <div>
        <Label htmlFor="jobTitle">Job title</Label>
        <Input
          id="jobTitle"
          value={profile.jobTitle || ''}
          onChange={(e) => updateField('profile.jobTitle', e.target.value.slice(0, MAX_NAME))}
          placeholder="e.g. Junior Full-Stack Developer"
          maxLength={MAX_NAME}
        />
        <p className="text-xs text-muted mt-1 text-right font-mono">
          {(profile.jobTitle || '').length}/{MAX_NAME}
        </p>
      </div>

      <div>
        <Label htmlFor="bio">About me</Label>
        <Textarea
          id="bio"
          value={profile.bio || ''}
          onChange={(e) => updateField('profile.bio', e.target.value.slice(0, MAX_BIO))}
          placeholder="A brief bio summarizing your background, passions, and goals…"
          rows={5}
          maxLength={MAX_BIO}
        />
        <p className="text-xs text-muted mt-1 text-right font-mono">
          {(profile.bio || '').length}/{MAX_BIO}
        </p>
      </div>
    </div>
  );
}
