import React from 'react';
import { LegalLayout } from './LegalLayout';

export function Terms() {
    return (
        <LegalLayout title="Terms and Conditions">
            <p>Last updated: {new Date().toLocaleDateString()}</p>

            <h3>1. Introduction</h3>
            <p>Welcome to CinePick. By accessing our website, you agree to be bound by these Terms and Conditions, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws.</p>

            <h3>2. Use License</h3>
            <p>Permission is granted to temporarily download one copy of the materials (information or software) on CinePick's website for personal, non-commercial transitory viewing only.</p>

            <h3>3. Disclaimer</h3>
            <p>The materials on CinePick's website are provided on an 'as is' basis. CinePick makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>

            <h3>4. Limitations</h3>
            <p>In no event shall CinePick or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on CinePick's website.</p>
        </LegalLayout>
    );
}
