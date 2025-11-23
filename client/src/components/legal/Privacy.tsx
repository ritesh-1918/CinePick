import React from 'react';
import { LegalLayout } from './LegalLayout';

export function Privacy() {
    return (
        <LegalLayout title="Privacy Policy">
            <p>Last updated: {new Date().toLocaleDateString()}</p>

            <h3>1. Information We Collect</h3>
            <p>We collect information you provide directly to us, such as when you create an account, subscribe to our newsletter, or contact us for support.</p>

            <h3>2. How We Use Your Information</h3>
            <p>We use the information we collect to provide, maintain, and improve our services, to develop new ones, and to protect CinePick and our users.</p>

            <h3>3. Sharing of Information</h3>
            <p>We do not share your personal information with companies, organizations, or individuals outside of CinePick except in the following cases: with your consent, for legal reasons, or for external processing.</p>

            <h3>4. Security</h3>
            <p>We work hard to protect CinePick and our users from unauthorized access to or unauthorized alteration, disclosure, or destruction of information we hold.</p>
        </LegalLayout>
    );
}
