import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { AuthCarousel } from '@/components/AuthCarousel';
import { useAuth } from '@/context/AuthContext';
import GoogleAuth from '@/components/GoogleAuth';

export default function Signup() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = React.useState({
        firstName: '',
        lastName: '',
        email: '',
        password: ''
    });
    const [error, setError] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: `${formData.firstName} ${formData.lastName}`.trim(),
                    email: formData.email,
                    password: formData.password
                }),
            });

            let data;
            try {
                data = await response.json();
            } catch (e) {
                throw new Error('Server error. Please check your connection or try again later.');
            }

            if (!response.ok) {
                throw new Error(data.message || 'Signup failed');
            }

            login(data.token, data.user);
            navigate('/survey');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex">
            {/* Left Side - Form */}
            <div className="w-full lg:w-1/2 flex flex-col p-8 relative z-10">
                <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-12 w-fit">
                    <ArrowLeft size={20} />
                    <span>Back to Home</span>
                </Link>

                <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="p-2 bg-primary/10 rounded-xl border border-primary/20">
                                <img src="/logo.png" alt="CinePick Logo" className="w-6 h-6" />
                            </div>
                            <span className="text-xl font-bold text-white tracking-tight">
                                CinePick
                            </span>
                        </div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent mb-2">Create Account</h1>
                        <p className="text-muted-foreground">Start discovering movies you'll love</p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSignup} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground" htmlFor="firstName">First Name</label>
                                <input
                                    type="text"
                                    id="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    className="w-full bg-background/50 border border-border/50 rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                    placeholder="John"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground" htmlFor="lastName">Last Name</label>
                                <input
                                    type="text"
                                    id="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    className="w-full bg-background/50 border border-border/50 rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                    placeholder="Doe"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground" htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full bg-background/50 border border-border/50 rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                placeholder="hello@example.com"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground" htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full bg-background/50 border border-border/50 rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button
                            disabled={isLoading}
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 rounded-lg transition-all duration-300 shadow-lg shadow-primary/25 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Creating Account...' : 'Create Account'}
                        </button>

                        <div className="relative my-6 flex justify-center text-xs uppercase">
                            <span className="text-muted-foreground">Or continue with</span>
                        </div>

                        <GoogleAuth />
                    </form>

                    <div className="mt-6 text-center text-sm text-muted-foreground">
                        Already have an account?{' '}
                        <Link to="/login" className="text-primary hover:underline font-medium">Sign in</Link>
                    </div>
                </div>
            </div>

            {/* Right Side - Carousel */}
            <div className="hidden lg:block w-1/2 p-4">
                <AuthCarousel />
            </div>
        </div>
    );
}
