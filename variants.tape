# claude-blip variants showcase
# Run: cd ~/code/claude-blip && vhs variants.tape

Output variants.gif

# --- Visual (2x, compact) ---
Set Width 1400
Set Height 550
Set FontSize 28
Set FontFamily "Menlo"
Set LineHeight 1.5
Set Padding 40
Set WindowBar Colorful
Set WindowBarSize 60
Set BorderRadius 12
Set Theme "Catppuccin Mocha"

# --- Playback ---
Set Framerate 24
Set PlaybackSpeed 1.0
Set CursorBlink false
Set LoopOffset 50%

# --- Shell ---
Set Shell bash
Env PS1 ""

# --- Pre-render all 3 states (hidden) ---
Hide
Type "cd /Users/dawid/code/claude-blip"
Enter
Sleep 200ms

# Normal (~20%, dim)
Type `echo '{"session_id":"","workspace":{"current_dir":"/Users/dawid/code/claude-blip"},"model":{"display_name":"Opus"},"context_window":{"used_percentage":16,"context_window_size":200000}}' | node statusline.js > /tmp/bv1`
Enter
Sleep 100ms

# Warm (~70%, yellow)
Type `echo '{"session_id":"","workspace":{"current_dir":"/Users/dawid/code/claude-blip"},"model":{"display_name":"Sonnet"},"context_window":{"used_percentage":56,"context_window_size":200000}}' | node statusline.js > /tmp/bv2`
Enter
Sleep 100ms

# Hot (~90%, red)
Type `echo '{"session_id":"","workspace":{"current_dir":"/Users/dawid/code/claude-blip"},"model":{"display_name":"Haiku"},"context_window":{"used_percentage":72,"context_window_size":200000}}' | node statusline.js > /tmp/bv3`
Enter
Sleep 100ms

# Build showcase script — clear wipes the typed command from screen
Type `cat > /tmp/bv-show.sh << 'SCRIPT'`
Enter
Type `#!/bin/bash`
Enter
Type `clear`
Enter
Type `printf '\e[?25l'`
Enter
Type `echo`
Enter
Type `printf "  "; cat /tmp/bv1; echo; echo`
Enter
Type `printf "  "; cat /tmp/bv2; echo; echo`
Enter
Type `printf "  "; cat /tmp/bv3; echo`
Enter
Type `sleep 6`
Enter
Type "SCRIPT"
Enter
Type "chmod +x /tmp/bv-show.sh"
Enter
Sleep 100ms

# Run the script while hidden — clear wipes screen, variants display
Type "/tmp/bv-show.sh"
Enter
Sleep 1s

# Show captures the clean static frame (variants already displayed)
Show

Sleep 4s
