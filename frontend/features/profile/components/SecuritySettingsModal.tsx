import React, { useState } from "react";
import { Lock, Mail, X, CheckCircle2, Loader2, AlertCircle, KeyRound, ArrowRight } from "lucide-react";
import { useChangePassword, useChangeEmail, useForgotPassword, useResetPassword, useSession } from "@/features/auth/auth.queries";

interface SecuritySettingsModalProps {
  onClose: () => void;
}

export function SecuritySettingsModal({ onClose }: SecuritySettingsModalProps) {
  const { data: session } = useSession();
  
  // Tabs: password | email | reset (forgot password flow inside modal)
  const [activeTab, setActiveTab] = useState<"password" | "email" | "reset">("password");
  
  // Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Email State
  const [newEmail, setNewEmail] = useState("");
  
  // Reset Flow State
  const [resetEmail, setResetEmail] = useState("");
  const [resetOtp, setResetOtp] = useState("");
  const [resetStep, setResetStep] = useState<1 | 2 | 3>(1); // 1 = enter email, 2 = loading, 3 = enter OTP & pass
  
  // UI State
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const changePasswordMutation = useChangePassword();
  const changeEmailMutation = useChangeEmail();
  const forgotPasswordMutation = useForgotPassword();
  const resetPasswordMutation = useResetPassword();

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match" });
      return;
    }

    changePasswordMutation.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          setMessage({ type: "success", text: "Password updated successfully!" });
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
        },
        onError: (err: any) => {
          setMessage({ type: "error", text: err.response?.data?.message || "Failed to change password" });
        }
      }
    );
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    changeEmailMutation.mutate(
      { newEmail, currentPassword },
      {
        onSuccess: () => {
          setMessage({ type: "success", text: "Email updated successfully!" });
          setCurrentPassword("");
        },
        onError: (err: any) => {
          setMessage({ type: "error", text: err.response?.data?.message || "Failed to change email" });
        }
      }
    );
  };

  const handleForgotPasswordClick = () => {
    setMessage(null);
    setActiveTab("reset");
    setResetStep(1);
    setResetEmail(session?.user?.email || ""); // Pre-fill but let them edit
  };

  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;
    setMessage(null);
    setResetStep(2); // Loading state
    
    forgotPasswordMutation.mutate(
      { email: resetEmail },
      {
        onSuccess: () => {
          setResetStep(3);
          setMessage({ type: "success", text: `OTP sent to ${resetEmail}` });
        },
        onError: (err: any) => {
          setResetStep(1);
          setMessage({ type: "error", text: err.response?.data?.message || "Failed to send OTP" });
        }
      }
    );
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match" });
      return;
    }

    resetPasswordMutation.mutate(
      { email: resetEmail, otp: resetOtp, newPassword },
      {
        onSuccess: () => {
          setMessage({ type: "success", text: "Password reset successful! You can now use your new password." });
          setResetOtp("");
          setNewPassword("");
          setConfirmPassword("");
          // Go back to standard password tab after success
          setTimeout(() => setActiveTab("password"), 3000);
        },
        onError: (err: any) => {
          setMessage({ type: "error", text: err.response?.data?.message || "Failed to reset password" });
        }
      }
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="relative bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h2 className="text-xl font-bold font-serif text-gray-900">Security Settings</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        {activeTab !== "reset" && (
          <div className="flex border-b border-gray-100">
            <button 
              onClick={() => { setActiveTab("password"); setMessage(null); }}
              className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab === "password" ? "text-brand-900 border-b-2 border-brand-900" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}
            >
              <Lock className="w-4 h-4 inline-block mr-2 -mt-0.5" />
              Password
            </button>
            <button 
              onClick={() => { setActiveTab("email"); setMessage(null); }}
              className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab === "email" ? "text-brand-900 border-b-2 border-brand-900" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}
            >
              <Mail className="w-4 h-4 inline-block mr-2 -mt-0.5" />
              Email
            </button>
          </div>
        )}
        
        {activeTab === "reset" && (
          <div className="flex border-b border-gray-100 items-center px-4 py-3 bg-brand-50/50">
            <button onClick={() => { setActiveTab("password"); setMessage(null); }} className="p-2 mr-2 hover:bg-brand-100 rounded-full text-brand-900">
              <X className="w-4 h-4" />
            </button>
            <span className="text-sm font-bold text-brand-900 flex items-center">
              <KeyRound className="w-4 h-4 mr-2" />
              Reset Password
            </span>
          </div>
        )}

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          
          {message && (
            <div className={`p-4 rounded-xl mb-6 flex items-start ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
              {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 mr-3 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />}
              <p className="text-sm font-medium">{message.text}</p>
            </div>
          )}

          {activeTab === "password" && (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Current Password</label>
                  <button 
                    type="button" 
                    onClick={handleForgotPasswordClick}
                    className="text-xs font-bold text-brand-900 hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <input 
                  type="password" 
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200 transition-all"
                  placeholder="Enter current password"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">New Password</label>
                <input 
                  type="password" 
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200 transition-all"
                  placeholder="At least 8 characters"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Confirm New Password</label>
                <input 
                  type="password" 
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200 transition-all"
                  placeholder="Retype new password"
                />
              </div>
              <button 
                type="submit"
                disabled={changePasswordMutation.isPending}
                className="w-full mt-6 bg-brand-900 hover:bg-brand-800 text-white font-bold rounded-xl py-3.5 transition-colors flex justify-center items-center shadow-sm"
              >
                {changePasswordMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Update Password"}
              </button>
            </form>
          )}

          {activeTab === "email" && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
                <p className="text-sm text-blue-800">Your current email is <strong>{session?.user?.email}</strong>.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">New Email Address</label>
                <input 
                  type="email" 
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200 transition-all"
                  placeholder="e.g. adil@example.com"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Current Password (for security)</label>
                <input 
                  type="password" 
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200 transition-all"
                  placeholder="Verify your password"
                />
              </div>
              <button 
                type="submit"
                disabled={changeEmailMutation.isPending}
                className="w-full mt-6 bg-brand-900 hover:bg-brand-800 text-white font-bold rounded-xl py-3.5 transition-colors flex justify-center items-center shadow-sm"
              >
                {changeEmailMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Update Email"}
              </button>
            </form>
          )}
          
          {activeTab === "reset" && (
            <div className="space-y-4">
              {resetStep === 1 && (
                <form onSubmit={handleRequestOtp} className="space-y-4">
                  <div className="mb-4">
                    <p className="text-sm text-gray-600">Please confirm your email address to receive a password reset OTP.</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Email Address</label>
                    <input 
                      type="email" 
                      required
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200 transition-all"
                      placeholder="Enter your account email"
                    />
                  </div>
                  <button 
                    type="submit"
                    className="w-full mt-6 bg-brand-900 hover:bg-brand-800 text-white font-bold rounded-xl py-3.5 transition-colors flex justify-center items-center shadow-sm"
                  >
                    Send OTP <ArrowRight className="w-4 h-4 ml-2" />
                  </button>
                </form>
              )}
              
              {resetStep === 2 && (
                <div className="text-center py-8 flex flex-col items-center">
                  <Loader2 className="w-10 h-10 animate-spin text-brand-900 mb-4" />
                  <p className="text-gray-600 font-medium">Sending verification OTP to your email...</p>
                </div>
              )}
              
              {resetStep === 3 && (
                <form onSubmit={handleResetSubmit} className="space-y-4">
                  <div className="bg-brand-50 border border-brand-100 rounded-xl p-4 mb-4">
                    <p className="text-sm text-brand-900">An OTP has been sent to <strong>{resetEmail}</strong>. Enter it below to reset your password.</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Enter OTP</label>
                    <input 
                      type="text" 
                      required
                      maxLength={6}
                      value={resetOtp}
                      onChange={(e) => setResetOtp(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200 transition-all text-center tracking-[0.5em] font-mono text-lg"
                      placeholder="------"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">New Password</label>
                    <input 
                      type="password" 
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200 transition-all"
                      placeholder="At least 8 characters"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Confirm New Password</label>
                    <input 
                      type="password" 
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200 transition-all"
                      placeholder="Retype new password"
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={resetPasswordMutation.isPending}
                    className="w-full mt-6 bg-brand-900 hover:bg-brand-800 text-white font-bold rounded-xl py-3.5 transition-colors flex justify-center items-center shadow-sm"
                  >
                    {resetPasswordMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Reset & Save Password"}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
