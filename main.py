import sys
import os
import webbrowser
from PyQt5.QtCore import Qt
from PyQt5.QtGui import QColor
from PyQt5.QtWidgets import QApplication, QColorDialog
from PyQt5.uic import loadUi

class PalettePickerApp:
    def __init__(self, num_colors=6):
        self.base_dir = os.path.dirname(os.path.abspath(__file__))
        self.ui_path = os.path.join(self.base_dir, "palette_picker.ui")
        self.css_path = os.path.join(self.base_dir, "style.css")
        self.html_path = os.path.join(self.base_dir, "index.html")
        
        self.num_colors = num_colors
        self.colors = [None] * num_colors
        
        self.window = loadUi(self.ui_path)
        self._load_existing_colors()
        self._setup_connections()

    def _load_existing_colors(self):
        """Read initial colors from style.css if present."""
        if not os.path.exists(self.css_path):
            return
        try:
            with open(self.css_path, "r", encoding="utf-8") as f:
                content = f.read()
            for i in range(1, self.num_colors + 1):
                key = f"--c{i}:"
                if key in content:
                    part = content.split(key)[1].split(";")[0].strip()
                    if part:
                        self.colors[i - 1] = part
                        line_edit = getattr(self.window, f"cl{i}", None)
                        btn = getattr(self.window, f"cb{i}", None)
                        if line_edit:
                            line_edit.setText(part)
                        if btn:
                            col = QColor(part)
                            text_col = "#000000" if col.lightness() > 128 else "#ffffff"
                            btn.setStyleSheet(
                                f"background-color: {part}; color: {text_col}; "
                                "font-weight: bold; border-radius: 4px; border: 1px solid #555;"
                            )
        except Exception as e:
            print(f"Could not load colors from style.css: {e}")

    def _setup_connections(self):
        # Connect color buttons
        for i in range(1, self.num_colors + 1):
            btn = getattr(self.window, f"cb{i}", None)
            if btn:
                btn.clicked.connect(lambda _, idx=i-1: self.pick_color(idx))

        # Connect manual text editing in QLineEdit
        for i in range(1, self.num_colors + 1):
            line_edit = getattr(self.window, f"cl{i}", None)
            if line_edit:
                line_edit.textEdited.connect(lambda text, idx=i-1: self.on_text_edited(idx, text))

        # Connect 'Open Web' button
        btn_open = getattr(self.window, "btnOpenWeb", None)
        if btn_open:
            btn_open.clicked.connect(self.open_webpage)

    def on_text_edited(self, index, text):
        cleaned = text.strip()
        if QColor.isValidColor(cleaned):
            self.colors[index] = cleaned
            btn = getattr(self.window, f"cb{index + 1}", None)
            if btn:
                col = QColor(cleaned)
                text_col = "#000000" if col.lightness() > 128 else "#ffffff"
                btn.setStyleSheet(
                    f"background-color: {cleaned}; color: {text_col}; "
                    "font-weight: bold; border-radius: 4px; border: 1px solid #555;"
                )
            self.save_css()

    def pick_color(self, index):
        current_hex = self.colors[index]
        initial_color = QColor(current_hex) if current_hex and QColor.isValidColor(current_hex) else QColor(Qt.white)
        color = QColorDialog.getColor(initial_color, self.window, f"Select Color {index + 1}")
        
        if color.isValid():
            hex_code = color.name()
            self.colors[index] = hex_code
            
            line_edit = getattr(self.window, f"cl{index + 1}", None)
            btn = getattr(self.window, f"cb{index + 1}", None)
            
            if line_edit:
                line_edit.setText(hex_code)
            if btn:
                text_col = "#000000" if color.lightness() > 128 else "#ffffff"
                btn.setStyleSheet(
                    f"background-color: {hex_code}; color: {text_col}; "
                    "font-weight: bold; border-radius: 4px; border: 1px solid #555;"
                )
            
            self.save_css()

    def generate_css_variables(self):
        lines = []
        for i in range(self.num_colors):
            col = self.colors[i] if self.colors[i] else "#ffffff"
            lines.append(f"    --c{i + 1}: {col};")
        return ":root {\n" + "\n".join(lines) + "\n}"

    def save_css(self):
        css_block = self.generate_css_variables()
        if not os.path.exists(self.css_path):
            with open(self.css_path, "w", encoding="utf-8") as f:
                f.write(css_block + "\n")
            return

        with open(self.css_path, "r", encoding="utf-8") as f:
            old = f.read()

        if "html {" in old:
            remaining = old[old.find("html {"):]
            updated = css_block + "\n" + remaining
        else:
            updated = css_block + "\n" + old

        with open(self.css_path, "w", encoding="utf-8") as f:
            f.write(updated)

    def open_webpage(self):
        """Open or reload the animated wallpaper webpage."""
        if os.path.exists(self.html_path):
            abs_path = os.path.abspath(self.html_path)
            webbrowser.open(f"file://{abs_path}")
        else:
            print(f"Warning: {self.html_path} does not exist.")

    def run(self):
        self.window.show()
        # Automatically launch web preview on start
        self.open_webpage()


def main():
    app = QApplication(sys.argv)
    picker = PalettePickerApp()
    picker.run()
    sys.exit(app.exec_())


if __name__ == "__main__":
    main()
