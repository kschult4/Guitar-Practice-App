# Claude Development Guide - Daily Warmup Guitar Practice App

## Project Overview

This is a Phase 1 PWA for daily guitar practice routines. The app displays a different practice routine each day of the week, with integrated timer and metronome functionality, designed for iPad use.

**Philosophy:** "Simplicity until demonstrated need" - Build only what's needed for Phase 1, prove the concept works with 30 days of usage, then decide on Phase 2.

## Key Project Files

- **`project brief.md`** - Complete project specifications and architecture
- **`src/data/routines.json`** - Exercise data for all 7 days (static JSON)
- **`claude.md`** - This file (development guide)

## Technology Stack

- **Frontend:** React + Vite
- **Styling:** Tailwind CSS
- **Metronome:** Tone.js (Web Audio API)
- **Timer:** Custom React hooks
- **Markdown:** React markdown library (for exercise descriptions/tabs)
- **PWA:** Vite PWA plugin
- **Storage:** localStorage (same-day completion tracking only)

## Target Environment

- **Device:** Latest iPad only
- **Orientation:** Landscape (locked)
- **Access:** Local network only (http://192.168.1.17)
- **Deployment:** Nginx on Debian 12 LXC (hostname: web-server)

## Development Principles

### 1. Minimal Error Handling (Phase 1)
- Assume valid data in routines.json
- No browser compatibility checks (known target device)
- Graceful degradation for Wake Lock API
- Focus on core functionality over edge cases

### 2. No Over-Engineering
- Don't add features not in the spec
- Don't add comments unless logic is complex
- Don't create abstractions for one-time operations
- Three similar lines > premature abstraction
- Only validate at system boundaries (user input, external APIs)

### 3. State Management
- Keep it simple - use React hooks and context
- localStorage ONLY for same-day completion tracking
- No Firebase, no backend in Phase 1
- Purge localStorage at midnight (device timezone)

## Critical Specifications

### Timer/Metronome Behavior

**Exercise Flow:**
1. 2-bar count-in with visual dots + wood block audio
2. Timer counts down from exercise duration
3. 10-second break with countdown (silent metronome visual)
4. Repeat for remaining reps (with BPM progression if configured)
5. Auto-return to Daily Routine list when complete

**Metronome:**
- Visual: 4 dots in a row, beat 1 larger/brighter, active beat lights up
- Audio: Wood block with LOUD-soft-soft-soft pattern (emphasized beat 1)
- Always in 4/4 time
- Audio requires user gesture (Web Audio API), visual always works

**Controls:**
- Available during count-in, exercise, and break
- Pause/Resume, Stop (returns to start of rep), Restart (rep 1), Back to List
- Pause and Stop halt metronome

### Day Rotation

- **Calendar-based** (not rotation-based)
- Monday (calendar) always shows Monday routine
- Uses device local timezone
- If user skips a day, app moves to next day's routine

### Same-Day Completion Tracking

- Store completed exercise IDs in localStorage
- Show checkmark on Daily Routine view
- Persist during same-day sessions
- **Purge ALL data at midnight** (device timezone)
- Fresh start each calendar day

### Exercise Data Structure

```json
{
  "id": "unique-exercise-id",
  "name": "Exercise Name",
  "description": "Markdown with tablature in code blocks",
  "tips": "Practice tips",
  "duration": 240,           // seconds per rep
  "reps": 3,                 // number of repetitions
  "startBPM": 60,            // initial tempo
  "bpmIncrement": 10         // BPM increase per rep (0 = constant)
}
```

### UI Layout

**Daily Routine View:**
- Focus header (today's focus + description)
- Day of week indicator
- Exercise list showing: name, total duration, BPM range, completion ✓

**Exercise Detail Page:**
- **Persistent Control Bar** (fixed/floating, always visible):
  - Large timer countdown
  - Rep counter ("Rep 2 of 3")
  - Metronome visual (4 dots)
  - Current BPM
  - Control buttons
- **Scrollable Content:**
  - Exercise name
  - Full description (markdown with tablature)
  - Tips section

### PWA Configuration

- **App Name:** Daily Warmup
- **Display Mode:** Standalone (hide Safari UI)
- **Orientation:** Landscape (locked)
- **Wake Lock:** Enable during exercises (count-in, running, break states)
- **Icon:** Placeholder for Phase 1 (TBD colors/theme)

## Code Organization

```
src/
├── data/
│   └── routines.json          # Exercise data (7 days)
├── components/
│   ├── DailyRoutine/
│   │   ├── FocusHeader.jsx
│   │   └── ExerciseList.jsx
│   └── ExerciseDetail/
│       ├── ControlBar.jsx     # Persistent timer/metronome/controls
│       ├── ExerciseInfo.jsx   # Scrollable content
│       ├── Metronome.jsx      # Tone.js integration
│       └── Timer.jsx          # Countdown logic
├── hooks/
│   ├── useTimer.js            # Timer countdown state
│   ├── useMetronome.js        # Tone.js wrapper
│   ├── useWakeLock.js         # Screen wake lock
│   └── useCompletion.js       # localStorage completion tracking
├── utils/
│   ├── dayCalculation.js      # Get current day routine
│   └── midnightPurge.js       # Clear localStorage at midnight
└── App.jsx                    # Router + main app
```

## Testing Checklist

Before marking Phase 1 complete, verify:

- [ ] App loads and displays correct day's routine
- [ ] Timer counts down accurately
- [ ] Metronome plays at correct BPM
- [ ] BPM increases between reps as configured
- [ ] Break timer works (10 seconds, silent metronome visual)
- [ ] All reps cycle correctly
- [ ] Auto-return to list after completion
- [ ] PWA installs on iPad
- [ ] Works offline after initial load
- [ ] Markdown/tablature renders correctly
- [ ] Wake Lock prevents screen sleep during exercises
- [ ] Same-day completion tracking persists
- [ ] Completion data purges at midnight
- [ ] All controls work during all states (count-in, running, break)

## Common Development Tasks

### Adding a New Exercise

1. Open `src/data/routines.json`
2. Add exercise to appropriate day with unique `id`
3. Include all required fields (id, name, description, tips, duration, reps, startBPM, bpmIncrement)
4. Use markdown in `description` field, code blocks for tablature
5. Test that exercise loads and displays correctly

### Modifying Timer/Metronome Logic

- Timer logic in `hooks/useTimer.js`
- Metronome in `hooks/useMetronome.js` (Tone.js)
- Count-in is part of timer flow (2 bars at current BPM)
- Break is also part of timer flow (10 seconds between reps)
- Remember: Pause/Stop must halt metronome

### Adjusting Break Duration

Currently hardcoded to 10 seconds. To change:
1. Update `hooks/useTimer.js` break duration
2. Update `project brief.md` line 86 for documentation

### Changing Metronome Sound

Currently: Wood block with emphasized beat 1
- Sound generation is in `hooks/useMetronome.js`
- Uses Tone.js synth/sampler
- Beat 1 should be louder than beats 2-4

## Things NOT to Add (Phase 1)

- ❌ Multi-day history/logging
- ❌ Progress tracking across days
- ❌ Exercise editing in-app
- ❌ Multiple users
- ❌ Calendar view
- ❌ Manual day override
- ❌ Completion persistence beyond same day
- ❌ Analytics
- ❌ External access / Cloudflare Tunnel

If asked to add these, remind that they're Phase 2 features (after 30 days of Phase 1 usage).

## Deployment

**Local Development:**
```bash
npm install
npm run dev
```

**Production Build:**
```bash
npm run build
# Output to dist/
# Copy to /var/www/html on web-server (192.168.1.17)
```

**Server Setup:**
- Nginx serves static files from `/var/www/html`
- PWA must be served over HTTPS (or localhost/local IP for testing)
- Configure Nginx to serve index.html for all routes (SPA routing)

## Important Notes

1. **Audio Initialization:** Tone.js audio context must start on user gesture. Initialize on first exercise start button click, not on page load.

2. **Midnight Purge:** localStorage completion data must clear at midnight device time. Set up interval/timeout to check and purge.

3. **Wake Lock:** Use Screen Wake Lock API if available, gracefully degrade if not supported (no error to user).

4. **Day Calculation:** Always use device local timezone. Monday = Monday routine, etc.

5. **BPM Display:** Show range if increment > 0 (e.g., "60-80 BPM"), single value if constant (e.g., "80 BPM").

6. **Total Duration:** Calculate as `duration * reps` (don't include break time in display).

7. **Completion Marking:** Mark exercise complete only when ALL reps finish, not per-rep.

## Phase 2 Considerations (Future)

When Phase 1 proves valuable (30+ days of usage):
- Add Firebase for persistent tracking
- Implement n8n webhooks for practice logging
- AI analysis of practice patterns
- Adaptive routine selection
- Historical progress visualization

Until then: **Keep it simple. Prove the concept.**

---

**Last Updated:** January 5, 2026
**Current Phase:** Phase 1 - Requirements Complete, Development Ready
