import React from 'react';
import { LegalLayout } from './LegalLayout';

export function FAQ() {
    return (
        <LegalLayout title="Frequently Asked Questions">
            <div className="space-y-8">
                <div>
                    <h3 className="text-xl font-semibold mb-2 text-white">How does the AI recommendation work?</h3>
                    <p>Our AI analyzes thousands of data points including genre, mood, director style, and plot elements to match movies with your specific preferences.</p>
                </div>

                <div>
                    <h3 className="text-xl font-semibold mb-2 text-white">Is CinePick free to use?</h3>
                    <p>Yes! CinePick is completely free to use for discovering movies. We may introduce premium features in the future.</p>
                </div>

                <div>
                    <h3 className="text-xl font-semibold mb-2 text-white">Do I need an account?</h3>
                    <p>You can browse basic recommendations without an account, but creating one allows you to save your favorites and get more personalized picks.</p>
                </div>

                <div>
                    <h3 className="text-xl font-semibold mb-2 text-white">Where does the movie data come from?</h3>
                    <p>We aggregate data from multiple reliable sources including TMDB and our proprietary AI analysis engine.</p>
                </div>
            </div>
        </LegalLayout>
    );
}
