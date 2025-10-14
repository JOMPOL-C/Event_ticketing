const { render } = require("ejs");

function Page(view, title) {
    return (req, res,) => res.render(view, { title });
}

/* ---------- Page render (EJS pages) ---------- */
module.exports = {
    renderHome: Page('home', 'Home Page'),
    renderattendee: Page('attendee', 'Register as Attendee'),
    renderorganizer: Page('organizer', 'Register as Organizer'),
    renderSelectlogin: Page('login_select', 'Select Login Type'),
    renderProfile: Page('profile', 'User Profile'),
};