import React from 'react';
import { LegalLayout } from './LegalLayout';

export function Cookies() {
    return (
        <LegalLayout title="Cookie Policy">
            <p>Last updated: {new Date().toLocaleDateString()}</p>

            <h3>1. What Are Cookies</h3>
            <p>Cookies are small text files that are placed on your computer or mobile device by websites that you visit. They are widely used in order to make websites work, or work more efficiently, as well as to provide information to the owners of the site.</p>

            <h3>2. How We Use Cookies</h3>
            <p>We use cookies to understand how you use our website and to improve your experience. This includes personalizing content and ads, providing social media features, and analyzing our traffic.</p>

            <h3>3. Your Choices</h3>
            <p>You can choose to accept or decline cookies. Most web browsers automatically accept cookies, but you can usually modify your browser setting to decline cookies if you prefer.</p>
        </LegalLayout>
    );
}
