'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import Image from 'next/image';
import { Bell, Lock, User, LogOut } from 'lucide-react';

export default function SettingsPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [notificationPreferences, setNotificationPreferences] = useState({
    messages: true,
    likes: true,
    comments: true,
    follows: true,
    transactions: true
  });
  const [profileData, setProfileData] = useState({
    bio: '',
    profileImage: null as File | null
  });
  const [previewImage, setPreviewImage] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  if (!session?.user) {
    redirect('/auth/signin');
  }

  useEffect(() => {
    setProfileData(prev => ({
      ...prev,
      bio: session.user.bio || ''
    }));
    setPreviewImage(session.user.image || '');
  }, [session]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileData(prev => ({ ...prev, profileImage: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('bio', profileData.bio);
      if (profileData.profileImage) {
        formData.append('profileImage', profileData.profileImage);
      }

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      setSuccess('Profile updated successfully');
      window.location.reload();
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationPreferenceChange = async (key: string) => {
    setNotificationPreferences(prev => {
      const updated = {
        ...prev,
        [key]: !prev[key as keyof typeof prev]
      };
      
      fetch('/api/notifications/subscribe', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      }).catch(console.error);

      return updated;
    });
  };

  const handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData(e.currentTarget);
    const currentPassword = formData.get('currentPassword');
    const newPassword = formData.get('newPassword');
    const confirmPassword = formData.get('confirmPassword');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/user/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      if (!response.ok) {
        throw new Error('Failed to update password');
      }

      setSuccess('Password updated successfully');
      e.currentTarget.reset();
    } catch (err: any) {
      setError(err.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone.'
    );

    if (!confirmed) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/user/account', {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete account');
      }

      window.location.href = '/';
    } catch (err: any) {
      setError(err.message || 'Failed to delete account');
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Account Settings</h1>

      <div className="grid gap-8">
        {/* Profile Section */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title mb-6">
              <User className="w-5 h-5" />
              Profile Settings
            </h2>

            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Profile Image</span>
                </label>
                <div className="flex items-center gap-6">
                  <div className="avatar">
                    <div className="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                      <Image
                        src={previewImage || `https://ui-avatars.com/api/?name=${session.user.name}`}
                        alt={session.user.name || 'Profile'}
                        width={96}
                        height={96}
                      />
                    </div>
                  </div>
                  <input 
                    type="file" 
                    className="file-input file-input-bordered file-input-primary w-full max-w-xs" 
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Bio</span>
                </label>
                <textarea 
                  className="textarea textarea-bordered h-24" 
                  placeholder="Tell us about yourself..."
                  value={profileData.bio}
                  onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                />
              </div>

              {error && (
                <div className="alert alert-error">
                  <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="alert alert-success">
                  <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span>{success}</span>
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 
                  <span className="loading loading-spinner"></span> 
                  : 'Save Changes'
                }
              </button>
            </form>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title mb-6">
              <Bell className="w-5 h-5" />
              Notification Preferences
            </h2>

            <div className="space-y-4">
              {Object.entries(notificationPreferences).map(([key, enabled]) => (
                <div key={key} className="form-control">
                  <label className="label cursor-pointer justify-start gap-4">
                    <input
                      type="checkbox"
                      className="toggle toggle-primary"
                      checked={enabled}
                      onChange={() => handleNotificationPreferenceChange(key)}
                    />
                    <span className="label-text capitalize">{key.replace('_', ' ')}</span>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title mb-6">
              <Lock className="w-5 h-5" />
              Security Settings
            </h2>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Current Password</span>
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  required
                  className="input input-bordered w-full max-w-md"
                  placeholder="Enter your current password"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">New Password</span>
                </label>
                <input
                  type="password"
                  name="newPassword"
                  required
                  minLength={8}
                  className="input input-bordered w-full max-w-md"
                  placeholder="Enter your new password"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Confirm New Password</span>
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  minLength={8}
                  className="input input-bordered w-full max-w-md"
                  placeholder="Confirm your new password"
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 
                  <span className="loading loading-spinner"></span> 
                  : 'Update Password'
                }
              </button>
            </form>

            <div className="divider"></div>

            <div>
              <h3 className="text-lg font-semibold mb-4 text-error">Danger Zone</h3>
              <button
                onClick={handleDeleteAccount}
                className="btn btn-error"
                disabled={loading}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}