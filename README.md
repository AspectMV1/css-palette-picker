# CSS Palette Picker (PyQt5)

A lightweight PyQt5 desktop utility that lets you pick a color palette interactively and automatically writes CSS root variables (`:root { --c1: #...; }`) into a `style.css` stylesheet.

## Features
- Interactive color picker dialogs (`QColorDialog`).
- Dynamic button styling matching the chosen color.
- Exports hex codes directly to CSS `:root` custom properties.

## Setup & Running

1. **Install dependencies**:
   ```bash
   pip install PyQt5
   ```

2. **Run the tool**:
   ```bash
   python main.py
   ```

3. Pick your colors for each slot. Once you close the window, it generates/updates `style.css` with the chosen palette.
