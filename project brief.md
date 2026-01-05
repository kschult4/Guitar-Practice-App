# Guitar Practice App - Project Brief

**Created:** January 3, 2026  
**Project Type:** Daily guitar warmup routine and practice tracker  
**Status:** Phase 1 Planning Complete

-----

## Project Overview

A focused, daily guitar warmup app designed to provide structured practice routines. The app will display a rotating schedule of exercises targeting different practice areas, with integrated timer and metronome functionality. Designed to be saved as a PWA on iPad for daily use.

-----

## Three-Phase Roadmap

### Phase 1: Prove the Concept (Current Phase)

**Timeline:** 1-2 weeks to build  
**Goal:** Create working app to validate daily usage

**Features:**

- 7-day fixed rotation of practice routines
- Timer with multi-rep support
- Integrated metronome with progressive tempo
- PWA support for iPad installation
- Exercise detail pages with tablature support

**No AI automation yet** - Just a working app to prove you’ll use it daily.

-----

### Phase 2: Add Intelligence

**Trigger:** After 30+ days of actual Phase 1 use  
**Goal:** Make the app adaptive based on usage data

**Features:**

- Practice completion tracking (Firebase)
- n8n webhook integration for logging
- AI analysis of practice patterns
- Adaptive routine selection based on your data
- “You’ve been skipping X - let’s focus there” insights

-----

### Phase 3: Full Coach Mode

**Trigger:** If Phase 2 proves valuable  
**Goal:** Dynamic coaching and exercise generation

**Features:**

- AI-generated new exercises based on progress
- Personalized difficulty scaling
- True dynamic coaching
- Historical progress visualization

-----

## Phase 1 Specifications

### Practice Focus Areas (7-Day Rotation)

1. **Monday:** Synchronization & Speed
1. **Tuesday:** String Skipping & Crossing
1. **Wednesday:** Picking Control & Articulation
1. **Thursday:** Finger Mobility & Stretching
1. **Friday:** Fretboard Accuracy & Position Shifts
1. **Saturday:** Rhythm & Timing
1. **Sunday:** Chord Transitions & Musical Flow

*Note: Actual exercises for each focus to be defined during development*

-----

### Timer/Metronome Behavior

#### Exercise Flow

1. **Count-in:** 2 bars of metronome with visual dots display and wood block audio
1. **Timer starts:** After count-in, timer counts down from exercise duration
1. **Rep complete:** Timer hits 0:00
1. **Break:** Fixed 10-second countdown displayed (metronome visual continues but audio is muted)
1. **Next rep:** If more reps remain, return to step 1 (potentially at faster BPM)
1. **Exercise complete:** After final rep, automatically return to Daily Routine list

#### Exercise Controls

During exercise execution (including count-in), the following controls are available:

- **Pause/Resume:** Pauses timer and stops metronome, resume from same point
- **Stop:** Stops timer and metronome, returns to beginning of current rep
- **Restart:** Returns to rep 1 of the exercise
- **Back to List:** Exits to Daily Routine view (progress is lost, no confirmation prompt)

**Note:** Both Pause and Stop will halt the metronome. All controls are active during count-in.

#### BPM Progression Rules

- **All exercises use metronome** (always in 4/4 time)
- **Metronome sound:** Wood block click with emphasized first beat (LOUD-soft-soft-soft pattern)
- **Some exercises increase tempo** each rep (exercise defines start BPM and increment)
- **Some exercises stay constant** (set `bpmIncrement: 0`)

**Example:**

- Exercise 1: Start 60 BPM, increase 10 BPM per rep → 60, 70, 80
- Exercise 2: Stay at 80 BPM all reps → 80, 80, 80

-----

### Exercise Data Structure

Each exercise is defined with the following fields:

```json
{
  "name": "Chromatic Runs",
  "description": "Markdown-formatted description. Can include code blocks for tabs:\n\n```\ne|----5-7-8-\nB|--5-6-8---\n```",
  "tips": "Additional practice tips and focus points",
  "duration": 300,        // seconds per rep (e.g., 300 = 5 minutes)
  "reps": 3,              // number of times to repeat
  "startBPM": 60,         // starting metronome tempo
  "bpmIncrement": 10      // BPM increase per rep (0 = constant tempo)
}
```

#### Full Routine Structure

```json
{
  "monday": {
    "focus": "Speed Building",
    "description": "Today's focus is developing picking speed while maintaining accuracy",
    "exercises": [
      {
        "name": "Exercise 1",
        "description": "...",
        "tips": "...",
        "duration": 300,
        "reps": 3,
        "startBPM": 60,
        "bpmIncrement": 10
      },
      {
        "name": "Exercise 2",
        "description": "...",
        "tips": "...",
        "duration": 300,
        "reps": 3,
        "startBPM": 80,
        "bpmIncrement": 0
      }
    ]
  },
  "tuesday": {
    "focus": "String Skipping",
    ...
  }
}
```

-----

## Technical Architecture

### Tech Stack

- **Frontend Framework:** React + Vite
- **Styling:** Tailwind CSS
- **Metronome:** Tone.js (audio generation and timing)
- **Timer:** Custom React hooks (countdown logic)
- **Markdown Rendering:** React markdown library (for exercise descriptions/tabs)
- **PWA Support:** Vite PWA plugin

### Target Device & Orientation

- **Device:** Latest iPad model only
- **Orientation:** Landscape (locked)
- **Screen Optimization:** No responsive breakpoints needed - optimized for single device/orientation
- **Touch Targets:** Follow iOS Human Interface Guidelines (minimum 44x44pt)

### Component Structure

```
App
├── Router
├── DailyRoutine (Home Page)
│   ├── FocusHeader (shows today's focus + description)
│   └── ExerciseList (clickable exercise cards)
│
└── ExerciseDetail (Detail Page)
    ├── ExerciseInfo (name, description with markdown, tips)
    ├── Metronome (Tone.js integration, BPM display)
    └── Timer (countdown display, rep counter, start/pause)
```

### Pages/Routes

- **`/`** - Daily Routine View
  - Displays current day’s focus
  - Lists 2-3 exercises as clickable cards
  - Shows day of week indicator
- **`/exercise/:exerciseId`** - Exercise Detail Page
  - Exercise name and full description (with tablature support)
  - Tips section
  - Metronome controls and BPM indicator
  - Timer with rep counter (e.g., “Rep 2 of 3”)
  - Start/Pause controls
  - Back button to routine view

### State Management

- **App-level:**
  - `routines.json` data (loaded once on mount)
  - Current day calculation
- **ExerciseDetail-level:**
  - Current rep number (1-based)
  - Timer state (idle/running/paused/break)
  - Current time remaining
  - Metronome state (running/stopped)
  - Current BPM

-----

## Data Storage (Phase 1)

**Approach:** Static JSON file in the app

**Location:** `/src/data/routines.json`

**Rationale:**

- Simplest for Phase 1
- No backend needed
- Easy to edit and version control
- Works offline (PWA requirement)

**Phase 2 Migration:** Move to Firebase when adding practice tracking

-----

## Deployment

### Infrastructure

**Container:** New LXC on Proxmox  
**IP Address:** 192.168.1.17  
**Hostname:** web-server (or similar)  
**OS:** Debian 12

**Resources:**

- **RAM:** 512MB (static hosting needs very little)
- **CPU:** 1 core
- **Disk:** 8GB

### Web Server

**Software:** Nginx  
**Purpose:** Serve static built React app  
**Configuration:** Simple static file serving, no PHP/dynamic content needed

### Access

**Local:** http://192.168.1.17  
**External (if needed):** Cloudflare Tunnel (to be configured later)  
**PWA Installation:** Add to iPad home screen via Safari

-----

## Features NOT in Phase 1

To maintain “simplicity until demonstrated need” philosophy:

- ❌ Practice history/logging
- ❌ Progress tracking
- ❌ AI recommendations or exercise generation
- ❌ Exercise modification in-app
- ❌ Multiple user profiles
- ❌ Social features or sharing
- ❌ Advanced analytics
- ❌ Calendar view of past routines
- ❌ Manual day override (always shows today)
- ❌ Completion checkboxes (no persistence)

These features deferred to Phase 2/3 based on actual usage patterns.

-----

## Success Criteria for Phase 1

**Technical:**

- ✅ App loads and displays correct day’s routine
- ✅ Timer counts down accurately
- ✅ Metronome plays at correct BPM
- ✅ BPM increases between reps as configured
- ✅ Break timer works between reps
- ✅ All reps cycle correctly
- ✅ PWA installs on iPad
- ✅ Works offline after initial load
- ✅ Markdown/tablature renders correctly

**User Experience:**

- ✅ Actually used for 30 consecutive days
- ✅ Generates practice data to inform Phase 2
- ✅ Proves the concept is valuable
- ✅ Identifies which features are actually needed vs nice-to-have

**Failure Condition:**

- If not used for 30 days → Phase 2 is premature, don’t build it

-----

## Development Workflow

### Phase 1 Build Steps

1. Create web server container (192.168.1.17)
1. Install Nginx and configure static hosting
1. Set up React + Vite project
1. Install dependencies (Tone.js, Tailwind, React Router, markdown renderer)
1. Create `routines.json` with 7 days of exercises
1. Build DailyRoutine component
1. Build ExerciseDetail component
1. Implement timer logic
1. Implement metronome with Tone.js
1. Add PWA configuration
1. Style with Tailwind
1. Build and deploy to Nginx
1. Test PWA installation on iPad
1. Use daily for 30 days

### Exercise Content Creation

- Define 2-3 exercises per focus (14-21 total exercises)
- Write descriptions with tablature where needed
- Set appropriate durations and rep counts
- Configure BPM progressions
- Add practice tips for each exercise

-----

## Migration Path to Phase 2

When Phase 1 proves valuable (30+ days of use):

### What Gets Added

1. **Firebase integration**
- Firestore for practice logs
- Track completions, skipped exercises, time spent
1. **n8n webhook endpoint**
- POST completion data from app
- Log to Firebase
- Trigger weekly analysis
1. **Claude analysis workflow**
- Review week’s practice data
- Identify patterns (skipped exercises, inconsistent focuses)
- Generate recommendations
1. **Adaptive routine selection**
- Override daily rotation based on AI insights
- “This week, focus more on string skipping - you’ve been avoiding it”

### What Stays the Same

- Core timer/metronome functionality
- Exercise data structure (just more of it)
- Component architecture
- Deployment infrastructure

-----

## Open Questions / To Be Decided

1. **Cloudflare Tunnel setup** - Do we need external access, or local-only?
1. **Container hostname** - "web-server" or something more specific?

-----

## Related Documentation

**Homelab Planning:**

- See existing Obsidian vault for homelab architecture
- Container IP allocations: .10-.16 already taken
- Proxmox VE host: 192.168.1.200

**Similar Projects:**

- Family Hub (React + Firebase, PWA)
- ESP32 Scene Controllers (ESPHome integration)

**Infrastructure Principles:**

- “Simplicity until demonstrated need”
- Complete one phase before starting next
- Finish projects before jumping to new ones

-----

## Next Steps

1. **Define exercise content** - Create actual exercises for all 7 focuses
1. **Create web server container** - Set up LXC at 192.168.1.17
1. **Begin development** - Initialize React + Vite project
1. **Build core features** - Timer, metronome, routing
1. **Deploy and test** - Install as PWA on iPad
1. **Use daily** - 30-day validation period before Phase 2

-----

*Project brief created: January 3, 2026*  
*Next review: After Phase 1 completion*  
*Remember: Prove the concept works before adding complexity*