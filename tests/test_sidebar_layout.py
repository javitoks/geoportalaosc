import re
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


class SidebarLayoutTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.template = (ROOT / "index.html").read_text(encoding="utf-8")
        cls.css = (ROOT / "src/styles/css/dashboard.css").read_text(encoding="utf-8")
        cls.main_css = (ROOT / "src/styles/css/main.css").read_text(encoding="utf-8")
        cls.auth = (ROOT / "src/js/auth-session.js").read_text(encoding="utf-8")
        cls.login_template = (ROOT / "login.html").read_text(encoding="utf-8")

    def test_logout_is_in_top_navigation_not_sidebar(self):
        sidebar = re.search(
            r'<aside id="sidebar-container".*?</aside>', self.template, re.DOTALL
        ).group()
        navbar = re.search(
            r'<nav class="navbar .*?</nav>', self.template, re.DOTALL
        ).group()

        self.assertIn('class="sidebar-header"', sidebar)
        self.assertIn('class="sidebar-nav"', sidebar)
        self.assertNotIn("data-auth-logout", sidebar)
        self.assertIn('id="portal-logout-button"', navbar)
        self.assertIn("data-auth-logout", navbar)

    def test_menu_is_the_only_scrollable_sidebar_region(self):
        nav_rule = re.search(r"\.sidebar-nav\s*\{(.*?)\}", self.css, re.DOTALL).group(1)
        sidebar_rule = re.search(r"\.sidebar\s*\{(.*?)\}", self.css, re.DOTALL).group(1)

        self.assertIn("min-height: 0", nav_rule)
        self.assertIn("overflow-y: auto", nav_rule)
        self.assertIn("overflow: hidden", sidebar_rule)

    def test_single_application_logout_control(self):
        self.assertEqual(self.template.count("data-auth-logout"), 1)

    def test_logout_label_collapses_on_small_screens(self):
        self.assertIn(".portal-logout-label", self.main_css)
        self.assertIsNotNone(
            re.search(
                r"@media \(max-width: 600px\).*?\.portal-logout-label\s*\{\s*display: none;",
                self.main_css,
                re.DOTALL,
            )
        )

    def test_session_expires_after_two_hours_of_inactivity(self):
        self.assertIn("const SESSION_TIMEOUT_MS = 2 * 60 * 60 * 1000", self.auth)
        self.assertIn('const LAST_ACTIVITY_COOKIE = "lastActivityAt"', self.auth)
        self.assertIn("Date.now() - lastActivity < SESSION_TIMEOUT_MS", self.auth)
        self.assertIn("global.setInterval(verifySession, SESSION_CHECK_INTERVAL_MS)", self.auth)

    def test_session_is_not_persisted_for_thirty_days(self):
        self.assertNotIn("remember ? 30", self.auth)
        self.assertNotIn("options.push(`Expires", self.auth)
        self.assertNotIn("inp-recuerdame", self.login_template)


if __name__ == "__main__":
    unittest.main()
