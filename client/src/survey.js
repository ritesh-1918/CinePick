document.addEventListener('DOMContentLoaded', () => {
    const surveyForm = document.getElementById('survey-form');

    // Protect this page
    const currentUser = JSON.parse(localStorage.getItem('cinepick_user'));
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    // If already completed survey, go to home
    if (currentUser.hasCompletedSurvey) {
        window.location.href = 'app.html';
        return;
    }

    if (surveyForm) {
        surveyForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const favoriteGenre = document.getElementById('favorite-genre').value;
            const frequency = document.querySelector('input[name="frequency"]:checked').value;

            // Update User Data
            const updatedUser = {
                ...currentUser,
                favoriteGenre,
                watchFrequency: frequency,
                hasCompletedSurvey: true
            };

            // Update Session
            localStorage.setItem('cinepick_user', JSON.stringify(updatedUser));

            // Update Database (localStorage 'cinepick_users')
            const allUsers = JSON.parse(localStorage.getItem('cinepick_users') || '[]');
            const userIndex = allUsers.findIndex(u => u.email === currentUser.email);

            if (userIndex !== -1) {
                allUsers[userIndex] = updatedUser;
                localStorage.setItem('cinepick_users', JSON.stringify(allUsers));
            }

            // Redirect to Home
            alert('Thanks! Your profile is set up.');
            window.location.href = 'app.html';
        });
    }
});
