import { useState, type ChangeEvent } from 'react';
import { useAppStore } from '../store';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Upload, AlertCircle, CheckCircle } from 'lucide-react';

export function Profile() {
  const { currentUser, setCurrentUser } = useAppStore();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle'|'success'|'error'>('idle');

  if (!currentUser) {
    return null; // ProtectedRoute handles redirect
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUploadProof = async () => {
    if (!file) return;
    setIsUploading(true);
    setUploadStatus('idle');

    try {
      if (isSupabaseConfigured && supabase) {
        // Real implementation
        const fileExt = file.name.split('.').pop();
        const fileName = `${currentUser.id}-${Math.random()}.${fileExt}`;
        const filePath = `proofs/${fileName}`;

        const { error: uploadError } = await supabase.storage.from('verification').upload(filePath, file);
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage.from('verification').getPublicUrl(filePath);

        const { error: dbError } = await supabase.from('verification_requests').insert({
          user_id: currentUser.id,
          proof_image_url: urlData.publicUrl,
          status: 'pending'
        });
        if (dbError) throw dbError;
      }
      
      // We simulate success if no supabase, or real success block
      setUploadStatus('success');
      setTimeout(() => {
        // Also simulate updating the user if we don't have real DB hooked up
        if (!isSupabaseConfigured) {
          setCurrentUser({ ...currentUser, verified: false }); // waiting for admin
        }
      }, 1000);

    } catch (e) {
      console.error(e);
      setUploadStatus('error');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      
      {/* Profile Header */}
      <div className="bg-[#161821] rounded-2xl p-8 border border-[#24272F] flex items-center gap-6">
        <div className="w-24 h-24 rounded-full border border-[#24272F] overflow-hidden bg-[#0D0F16]">
          <img src={currentUser.avatar} alt="avatar" className="w-full h-full object-cover" />
        </div>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-[#E0E2E7]">
            {currentUser.username}
            {currentUser.verified && <CheckCircle className="w-5 h-5 text-blue-500" />}
          </h1>
          <p className="text-slate-400 text-sm mt-1">Role: <span className="capitalize">{currentUser.role}</span></p>
          <p className="text-slate-500 text-xs mt-1">Joined {new Date(currentUser.created_at).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Verification Gate */}
      {!currentUser.verified && (
        <div className="bg-gradient-to-br from-[#1A1814] to-[#12141C] rounded-2xl p-8 border border-yellow-900/40 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-yellow-600"></div>
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-yellow-500 mt-1" />
            <div className="space-y-4 flex-1">
              <div>
                <h2 className="text-xl font-bold text-white mb-2">Become a Verified Developer</h2>
                <p className="text-sm text-slate-400">
                  To keep the marketplace safe, sellers must purchase a VIP Gamepass to list items.
                  Purchase the gamepass, take a screenshot of your receipt, and upload it here.
                </p>
              </div>

              <div className="p-4 bg-[#0D0F16] rounded-xl border border-[#1F222C]">
                <a href="#" className="font-bold text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1">Link to VIP Gamepass (400 R$) &rarr;</a>
              </div>

              <div className="space-y-4 pt-2">
                <label className="block text-sm font-bold text-slate-300 uppercase tracking-widest text-[11px]">Upload Receipt Proof (PNG/JPG)</label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <label className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#161821] border border-[#24272F] rounded-lg cursor-pointer hover:bg-[#1F222C] transition">
                    <Upload className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-300">{file ? file.name : 'Choose File'}</span>
                    <input type="file" accept="image/png, image/jpeg" className="hidden" onChange={handleFileChange} />
                  </label>
                  {file && (
                    <button 
                      onClick={handleUploadProof}
                      disabled={isUploading}
                      className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-blue-500 transition disabled:opacity-50 shadow-lg shadow-blue-600/10 active:scale-[0.98]"
                    >
                      {isUploading ? 'Uploading...' : 'Submit Verification'}
                    </button>
                  )}
                </div>
                {uploadStatus === 'success' && <p className="text-green-400 text-sm font-medium bg-green-500/10 px-3 py-2 rounded border border-green-500/20 inline-block">Proof submitted! Pending admin approval.</p>}
                {uploadStatus === 'error' && <p className="text-red-400 text-sm font-medium bg-red-500/10 px-3 py-2 rounded border border-red-500/20 inline-block">Upload failed. Make sure Supabase is configured.</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Seller Toggle or Stats */}
      {currentUser.verified && (
        <div className="bg-[#12141C] rounded-2xl p-6 border border-[#1F222C]">
          <h3 className="text-sm font-bold mb-4">Seller Dashboard Quick Actions</h3>
          <p className="text-slate-400 text-sm font-light mb-6">
            You are a verified seller. You can now post new products and manage your inventory.
          </p>
          <div className="mt-2">
            <button onClick={() => window.location.href='/dashboard'} className="bg-blue-600 text-white font-bold px-6 py-2.5 rounded-lg text-sm hover:bg-blue-500 transition shadow-lg shadow-blue-600/10 active:scale-[0.98]">
              Create New Listing
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
