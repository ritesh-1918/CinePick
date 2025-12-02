import { useState } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';

interface ProfilePictureUploadProps {
    currentImage: string;
    onImageUpdate: (newUrl: string) => void;
}

export default function ProfilePictureUpload({ currentImage, onImageUpdate }: ProfilePictureUploadProps) {
    const { updateUser } = useAuth();
    const [uploading, setUploading] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image must be less than 5MB');
            return;
        }

        const formData = new FormData();
        formData.append('avatar', file);

        setUploading(true);
        const toastId = toast.loading('Uploading profile picture...');

        try {
            const res = await fetch('/api/profile/avatar', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            });
            const data = await res.json();

            if (data.success) {
                const newImageUrl = data.fileUrl;
                onImageUpdate(newImageUrl);
                updateUser({ profileImage: newImageUrl });
                toast.success('Profile picture updated!', { id: toastId });
            } else {
                toast.error(data.message || 'Failed to upload image', { id: toastId });
            }
        } catch (error) {
            console.error('Upload failed:', error);
            toast.error('Upload failed. Please try again.', { id: toastId });
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="relative group w-32 h-32 md:w-40 md:h-40 mx-auto">
            <div className="w-full h-full rounded-full overflow-hidden border-4 border-primary/20 shadow-xl">
                <img
                    src={currentImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                />
            </div>

            <label className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer backdrop-blur-sm">
                {uploading ? (
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                ) : (
                    <>
                        <Camera className="w-8 h-8 text-white mb-1" />
                        <span className="text-xs font-medium text-white">Change</span>
                    </>
                )}
                <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={uploading}
                />
            </label>
        </div>
    );
}
