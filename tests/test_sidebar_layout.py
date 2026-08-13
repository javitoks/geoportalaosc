import re
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


class SidebarLayoutTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.template = (ROOT / "index.html").read_text(encoding="utf-8")
        cls.css = (ROOT / "src/styles/css/dashboard.css").read_text(encoding="utf-8")

    def test_sidebar_regions_keep_logout_outside_scrollable_menu(self):
        sidebar = re.search(
            r'<aside id="sidebar-container".*?</aside>', self.template, re.DOTALL
        ).group()
        nav_end = sidebar.index("</nav>")
        footer_start = sidebar.index('class="sidebar-footer"')

        self.assertIn('class="sidebar-header"', sidebar)
        self.assertIn('class="sidebar-nav"', sidebar)
        self.assertLess(nav_end, footer_start)
        self.assertIn("loginatic.logout()", sidebar[footer_start:])

    def test_menu_is_the_only_scrollable_sidebar_region(self):
        nav_rule = re.search(r"\.sidebar-nav\s*\{(.*?)\}", self.css, re.DOTALL).group(1)
        sidebar_rule = re.search(r"\.sidebar\s*\{(.*?)\}", self.css, re.DOTALL).group(1)

        self.assertIn("min-height: 0", nav_rule)
        self.assertIn("overflow-y: auto", nav_rule)
        self.assertIn("overflow: hidden", sidebar_rule)

    def test_single_application_logout_control(self):
        self.assertEqual(self.template.count("loginatic.logout();"), 1)


if __name__ == "__main__":
    unittest.main()
