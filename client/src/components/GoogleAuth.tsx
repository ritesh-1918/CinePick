import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

declare global {
    interface Window {
        google: any;
    }
}

export default function GoogleAuth() {
    const { login } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // Check if Google script is loaded
        if (window.google) {
            try {
                window.google.accounts.id.initialize({
                    client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
                    callback: handleCredentialResponse
                });

                window.google.accounts.id.renderButton(
                    document.getElementById("googleSignInBtn"),
                    { theme: "outline", size: "large", width: "100%" } // Customization attributes
                );
            } catch (error) {
                console.error("Google Auth Error:", error);
            }
        }
    }, []);

    const handleCredentialResponse = async (response: any) => {
        try {
            const res = await fetch('http://localhost:5000/api/auth/google', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: response.credential })
            });

            const data = await res.json();

            if (data.success) {
                login(data.token, data.user);
                navigate('/dashboard');
            } else {
                console.error("Google Login Failed:", data.message);
                alert("Google Sign-In failed. Please try again.");
            }
        } catch (error) {
            console.error("Google Login Error:", error);
            alert("Something went wrong with Google Sign-In.");
        }
    };

    return (
        <div className="w-full flex justify-center items-center mt-4">
            <div id="googleSignInBtn"></div>
        </div>
    );
}
