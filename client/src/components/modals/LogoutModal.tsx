import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, X } from 'lucide-react';

interface LogoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export default function LogoutModal({ isOpen, onClose, onConfirm }: LogoutModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-card border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            >
                <div className="flex flex-col items-center text-center space-y-4">
                    <div className="p-4 bg-red-500/10 rounded-full text-red-500">
                        <LogOut size={32} />
                    </div>

                    <div>
                        <h3 className="text-xl font-bold mb-2">Log Out?</h3>
                        <p className="text-muted-foreground">
                            Are you sure you want to log out? You'll need to sign in again to access your library.
                        </p>
                    </div>

                    <div className="flex gap-3 w-full pt-2">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 px-4 bg-white/5 hover:bg-white/10 rounded-xl font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            className="flex-1 py-3 px-4 bg-red-500 hover:bg-red-600 rounded-xl font-medium transition-colors"
                        >
                            Log Out
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
