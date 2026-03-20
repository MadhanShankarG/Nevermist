**Nevermist**

Design & Architecture Document

Version 1.0 · Combined Visual + Technical Reference

  --------------------- ---------------------
  **Document** Design + **Product** Nevermist
  Architecture Doc      PWA

  **Version** 1.0 ---   **Status** Draft ---
  V1 Scope              locked for build
  --------------------- ---------------------

**Part 1 --- Design System**

*Colors, typography, spacing, component patterns, motion*

**1. Design Philosophy**

+-----------------------------------------------------------------------+
| The empty state is the product.                                       |
|                                                                       |
| A dark background. A blinking cursor. Nothing competing for           |
| attention.                                                            |
|                                                                       |
| The app earns trust by being so simple that no explanation is needed, |
|                                                                       |
| and then by being surprisingly smart the moment you give it           |
| something.                                                            |
+-----------------------------------------------------------------------+

**1.1 Core Principles**

- Invisible until needed --- the UI disappears when you\'re typing.
  Nothing should demand attention except the cursor.

- Dark as material --- the background is not a void. Grain texture at 4%
  opacity makes it feel like dark paper, like a surface that holds
  things.

- Three layers of type --- user content (serif), UI chrome (sans),
  system data (mono). You can tell at a glance what is yours vs the
  interface vs metadata.

- One accent, one semantic --- amber means active/yours, sage means
  Notion/confirmed/done. Everything else is a shade of dark to light.

- The left border is the signature --- editorial pull-quote pattern from
  print design. The input has no box, no background, just a left border
  that glows on focus. Nobody in productivity uses this.

**1.2 What Nevermist Is Not Visually**

- Not a Notion clone --- the connection to Notion is expressed only in
  the sage green destination tag.

- Not another dark mode SaaS --- the serif font and grain texture
  separate it from Linear, Raycast, and Vercel\'s aesthetic language.

- Not generic AI --- no purple gradients, no Inter font, no predictable
  card-heavy layout.

**2. Color System**

**2.1 Background Scale**

  ------------ ---------------- ---------------- -------------------------
  **Token**    **Hex**          **Usage**        **Role**

  \--bg        #0A0A0A          App background   Near-black with warmth.
                                                 Not pure #000.

  \--bg2       #121212          Elevated         Screen cards, input
                                surfaces         container

  \--bg3       #1A1A1A          Preview card,    Second elevation layer
                                toast            

  \--bg4       #262626          Chip backgrounds Highest elevation before
                                                 border

  \--line      #222222          Structural       Hairline separators
                                dividers         

  \--line2     #2E2E2E          Component        Default border color
                                borders          
  ------------ ---------------- ---------------- -------------------------

**2.2 Text Scale**

  ------------ ---------------- ---------------- -------------------------
  **Token**    **Hex**          **Usage**        **Role**

  \--ink       #EDEAE4          Primary text     User input, task text,
                                                 headings

  \--ink2      #8A847C          Secondary text   Labels, descriptions,
                                                 placeholders

  \--ink3      #454240          Tertiary / muted Wordmark, dim labels,
                                                 hints
  ------------ ---------------- ---------------- -------------------------

**2.3 Accent Colors**

  ------------ ---------------- ---------------- -------------------------
  **Token**    **Hex**          **Usage**        **Role**

  \--accent    #C49A6C          Amber --- active Focus border, cursor,
                                state            send hover, your action

  \--sage      #6BA888          Sage --- Notion  Destination tag, status
                                / done           dot, confirmation bar

  \--amber     #C4944A          P2 priority      Medium priority tag text

  \--red       #B86B5A          P1 priority      High priority tag text
  ------------ ---------------- ---------------- -------------------------

**2.4 Semantic Backgrounds**

  ------------ ---------------- ---------------- -------------------------
  **Token**    **Hex**          **Usage**        **Role**

  \--sage-bg   #101F18          Notion tag bg    Destination badge fill

  \--amb-bg    #1E1608          P2 tag bg        Medium priority fill

  \--red-bg    #1E0E0A          P1 tag bg        High priority fill
  ------------ ---------------- ---------------- -------------------------

+-----------------------------------------------------------------------+
| Color rule: only two non-dark colors appear on screen at any time.    |
|                                                                       |
| Amber (#C49A6C) = something active, your action, in progress.         |
|                                                                       |
| Sage (#6BA888) = Notion, confirmed, successfully sent.                |
|                                                                       |
| Everything else is a shade between #0A0A0A and #EDEAE4.               |
+-----------------------------------------------------------------------+

**3. Typography**

  -----------------------------------------------------------------------
  Three fonts. Three jobs. They never cross over.

  -----------------------------------------------------------------------

**3.1 Font Roles**

  ------------------ ---------------- ------------------------------------
  **Font**           **Role**         **Used For**

  Lora (serif)       User content     Input textarea, task text, preview
                                      card task, photo extract chip text,
                                      headline \'what\'s on your mind?\'

  DM Sans            UI body          Labels, descriptions, confirmation
                                      message, onboarding step text,
                                      button labels on cards

  DM Mono            System chrome    Tags (priority, date, page), send
                                      button, status pill, screen labels,
                                      metadata, all mono data
  ------------------ ---------------- ------------------------------------

**3.2 Type Scale**

  ------------------------ ------------------ ----------------------------
  **Element**              **Size / Weight**  **Font**

  Main headline (desktop)  48--56px / 500     Lora serif

  Main headline (mobile)   32--40px / 500     Lora serif

  Input text               24px / 400         Lora serif

  Italic sublabel          11px / 400 italic  Lora serif

  Preview task text        14px / 400         Lora serif

  Chip text (photo         13px / 400         Lora serif
  extract)                                    

  Body UI labels           13px / 400         DM Sans

  Onboarding text          12px / 400         DM Sans

  Confirmation toast main  13px / 400         DM Sans

  Tag text                 11px / 300         DM Mono

  Send button              12px / 300         DM Mono

  Status pill              10px / 300         DM Mono

  Screen labels            10px / 300         DM Mono

  Wordmark                 14px / 400         Lora --- letter-spacing
                                              0.2em
  ------------------------ ------------------ ----------------------------

**3.3 Placeholder Text**

  ----------------------------------- -----------------------------------
  **State**                           **Placeholder Text**

  Standard (all sessions)             \"What\'s on your mind?\" ---
                                      italic, \--ink3, 70% opacity

  First launch only                   \"Try it --- say \'buy groceries
                                      tomorrow\' and hit send\" ---
                                      italic, \--ink3, 40% opacity
                                      (warmer)

  Input textarea                      \"a thought, a task, anything ---\"
                                      --- italic, trailing em-dash
  ----------------------------------- -----------------------------------

**4. Spacing & Layout**

**4.1 Spacing Tokens**

  ----------------------------------- -----------------------------------
  **Token**                           **Value**

  Page padding (mobile)               28px horizontal

  Page padding (desktop)              40px horizontal, centered max-width
                                      800px

  Top bar height                      22px padding-top, elements at
                                      natural height

  Headline to input gap               64px margin-top on main area

  Label to input gap                  16px margin-bottom

  Input padding                       4px top, 4px bottom, 20px left
                                      (indented from border)

  Input to actions gap                16px margin-top

  Icon button size                    32×32px, border-radius 50%

  Send button padding                 8px vertical, 18px horizontal

  Chip grid gap                       8px

  Screen card padding                 15px top, 14px sides, 14px bottom

  Component border radius             12px cards, 9px inner cards, 20px
                                      pills

  Tag padding                         3px vertical, 8px horizontal
  ----------------------------------- -----------------------------------

**4.2 Input Left Border**

- Border position: left edge only --- border-left: 1.5px solid

- Resting state: #2E2E2E (\--line2)

- Focus state: #C49A6C (\--accent) --- transition 250ms ease

- Text indented 20px from the border --- same axis as the italic label
  above

- No background fill, no border-radius, no box shadow --- the border IS
  the container

**4.3 Desktop vs Mobile Layout**

  ----------------------------------- -----------------------------------
  **Desktop**                         **Mobile**

  Four chips in one horizontal row    Four chips in 2×2 grid above input
  above input                         

  Input box: left-border style, full  Input box: pill shape, mic+camera
  width                               inside right

  Bottom bar: destination dropdown +  No bottom bar --- icons inside
  settings                            input pill

  User avatar top right               Wordmark only top left

  Wordmark top left, tracked Lora     Same wordmark treatment

  Max content width 800px, centered   Full width minus 28px horizontal
                                      padding

  Quick action chips: rectangular,    Quick action chips: square 2×2,
  icon+text                           icon+text
  ----------------------------------- -----------------------------------

**5. Component Specifications**

**5.1 CaptureInput**

The central element of the entire app. Everything else serves this.

+-----------------------------------------------------------------------+
| **CaptureInput**                                                      |
|                                                                       |
| The main textarea --- always focused, always ready                    |
|                                                                       |
| font: Lora serif, 24px, color \--ink                                  |
|                                                                       |
| border: none except border-left: 1.5px solid \--line2                 |
|                                                                       |
| focus: border-left-color transitions to \--accent over 250ms          |
|                                                                       |
| caret-color: \--accent (amber cursor)                                 |
|                                                                       |
| background: transparent                                               |
|                                                                       |
| resize: none, min-height: 80px                                        |
|                                                                       |
| placeholder: italic, \--ink3                                          |
|                                                                       |
| auto-focus on every app open                                          |
+-----------------------------------------------------------------------+

**5.2 QuickChips**

Four shortcut chips above the input. Desktop: horizontal row. Mobile:
2×2 grid.

+-----------------------------------------------------------------------+
| **QuickChip**                                                         |
|                                                                       |
| Shortcut to a specific capture mode or Notion page                    |
|                                                                       |
| background: \--bg3, border: 1px solid \--line2, border-radius: 10px   |
|                                                                       |
| padding: 10px 11px, display: flex, gap: 8px                           |
|                                                                       |
| icon: 14px SVG, stroke \--ink2                                        |
|                                                                       |
| text: 11px DM Sans, color \--ink2                                     |
|                                                                       |
| hover: border-color \--accent, background \--bg2                      |
|                                                                       |
| chips: \'Quick brain dump\', \'Add to \[Page\]\', \'Record a voice    |
| note\', \'Scan handwritten notes\'                                    |
+-----------------------------------------------------------------------+

**5.3 VoiceButton**

Microphone icon button. Tap to start, tap to stop.

+-----------------------------------------------------------------------+
| **VoiceButton**                                                       |
|                                                                       |
| Controls voice recording state                                        |
|                                                                       |
| idle: 32px circle, border 1px \--line2, SVG mic icon \--ink2          |
|                                                                       |
| recording: border-color \--accent, icon pulses                        |
| scale(1)→scale(1.15)→scale(1) 1.2s loop                               |
|                                                                       |
| radiating ring: opacity 0.3→0, scale 1→2, 1.2s loop                   |
|                                                                       |
| transcription: typewriter effect, 30ms per character into             |
| CaptureInput                                                          |
|                                                                       |
| hover: border-color \--accent                                         |
|                                                                       |
| iOS: re-initialize recognition on each use, show \'Listening\...\'    |
| state, manual Retry button                                            |
+-----------------------------------------------------------------------+

**5.4 CameraButton**

Camera icon button. Opens camera or file picker.

+-----------------------------------------------------------------------+
| **CameraButton**                                                      |
|                                                                       |
| Triggers photo capture flow                                           |
|                                                                       |
| identical size and style to VoiceButton                               |
|                                                                       |
| orange dot badge (top-right of icon): #E8773A, 6px, border 1px \--bg  |
|                                                                       |
| iOS: \<input type=\'file\' accept=\'image/\*\'                        |
| capture=\'environment\'\>                                             |
|                                                                       |
| Android/Desktop: getUserMedia with file input fallback                |
|                                                                       |
| on capture: compress to 1600px max, JPEG 0.8, via canvas before API   |
| call                                                                  |
+-----------------------------------------------------------------------+

**5.5 SendButton**

Appears only when input has content. The highest contrast element on
screen.

+-----------------------------------------------------------------------+
| **SendButton**                                                        |
|                                                                       |
| Submits the capture for AI processing                                 |
|                                                                       |
| opacity: 0 at rest, opacity: 1 when input.value.length \> 0           |
|                                                                       |
| transition: opacity 150ms ease                                        |
|                                                                       |
| background: \--ink (near-white), color: \--bg (near-black)            |
|                                                                       |
| font: DM Mono 12px/300, letter-spacing 0.1em, lowercase \'send →\'    |
|                                                                       |
| border-radius: 20px, padding: 8px 18px                                |
|                                                                       |
| hover: background \--accent                                           |
|                                                                       |
| press: scale(0.95) 100ms then back to 1.0                             |
|                                                                       |
| keyboard: Enter to send on desktop, Shift+Enter for newline           |
+-----------------------------------------------------------------------+

**5.6 PreviewCard**

Slides up from bottom after AI processing. All fields editable.

+-----------------------------------------------------------------------+
| **PreviewCard**                                                       |
|                                                                       |
| Shows AI result before sending to Notion                              |
|                                                                       |
| background: \--bg3, border: 1px solid \--line2, border-radius: 9px    |
|                                                                       |
| slides up: translateY(100%)→translateY(0), 300ms                      |
| cubic-bezier(0.16,1,0.3,1)                                            |
|                                                                       |
| input shifts up simultaneously (same easing)                          |
|                                                                       |
| backdrop: opacity 0→0.1 black behind card                             |
|                                                                       |
| task text: Lora 13px \--ink, editable inline                          |
|                                                                       |
| destination badge: tappable → bottom sheet page picker                |
|                                                                       |
| priority pill: tappable → cycles P1/P2/P3                             |
|                                                                       |
| due date: tappable → date picker                                      |
|                                                                       |
| send: prominent, DM Mono lowercase                                    |
|                                                                       |
| cancel: text link, slides card back down 200ms ease-in, input retains |
| text                                                                  |
|                                                                       |
| keyboard: Enter=send, Escape=cancel                                   |
+-----------------------------------------------------------------------+

**5.7 TaskChip (Photo Extract)**

One chip per task extracted from a photo. Editable before sending.

+-----------------------------------------------------------------------+
| **TaskChip**                                                          |
|                                                                       |
| Represents a single task extracted from photo capture                 |
|                                                                       |
| confirmed: background \--bg3, border 1px solid \--line2, solid border |
|                                                                       |
| uncertain \[?\]: background \--bg3, border 1px dashed \--line, italic |
| text \--ink3                                                          |
|                                                                       |
| text: Lora 12px \--ink (or \--ink3 italic if uncertain)               |
|                                                                       |
| actions: ✕ to remove, \'edit\' to inline-edit text, destination       |
| re-route via tap                                                      |
|                                                                       |
| each chip sends independently to Notion on confirm                    |
+-----------------------------------------------------------------------+

**5.8 ConfirmationToast**

+-----------------------------------------------------------------------+
| **ConfirmationToast**                                                 |
|                                                                       |
| 5-second confirmation after successful Notion send                    |
|                                                                       |
| background: \--bg3, border: 1px solid \--line2, border-radius: 9px    |
|                                                                       |
| slides up: translateY(100%)→translateY(0), 250ms                      |
| cubic-bezier(0.16,1,0.3,1)                                            |
|                                                                       |
| main text: DM Sans 13px \--ink, \'Added to \[Page Name\]\'            |
|                                                                       |
| sub text: DM Mono 10px \--sage, \'p2 · due mar 31 · done\'            |
|                                                                       |
| progress bar: 1px height, background \--sage, animates width 100%→0%  |
| over 5s                                                               |
|                                                                       |
| auto-dismiss: fade out 300ms after 5s                                 |
|                                                                       |
| input resets to empty immediately on send (not on toast dismiss)      |
|                                                                       |
| first capture only: tagline fades in for 4s after toast --- \'That\'s |
| it. Every thought, straight to Notion.\'                              |
+-----------------------------------------------------------------------+

**5.9 StatusPill**

+-----------------------------------------------------------------------+
| **StatusPill**                                                        |
|                                                                       |
| Top-right system status indicator                                     |
|                                                                       |
| font: DM Mono 10px/300, letter-spacing 0.08em, color \--ink3          |
|                                                                       |
| border: 1px solid \--line2, border-radius: 20px, padding: 4px 10px    |
|                                                                       |
| sage dot: 5px circle, background \--sage (connected/online)           |
|                                                                       |
| content: \'2 queued\' when offline items exist                        |
|                                                                       |
| content: \'connected\' when synced                                    |
|                                                                       |
| amber dot variant: when Notion auth broken                            |
+-----------------------------------------------------------------------+

**6. Motion Specifications**

**6.1 Page Load --- Staggered Reveal**

On every app open, elements fade up with sequential delays. One
orchestrated entrance.

  --------------------- ------------ -------------------------------------
  **Element**           **Delay**    **Duration + Easing**

  Wordmark              0ms          600ms ease-out --- fadeUp (opacity
                                     0→1, translateY 10px→0)

  Italic label          100ms        600ms ease-out --- same fadeUp

  Input block           200ms        600ms ease-out --- same fadeUp

  Input actions row     300ms        600ms ease-out --- same fadeUp

  Divider line          400ms        400ms ease-out --- same fadeUp

  Screens section       500ms        600ms ease-out --- same fadeUp
  --------------------- ------------ -------------------------------------

**6.2 Interaction Animations**

  ---------------------- ---------------------------- ---------------------------
  **Interaction**        **Timing**                   **Notes**

  Preview slides up      300ms                        Spring feel, physical
                         cubic-bezier(0.16,1,0.3,1)   

  Input shifts up with   300ms                        Simultaneous
  card                   cubic-bezier(0.16,1,0.3,1)   

  Backdrop dims          300ms ease-out               opacity 0→0.1 black

  Send --- card exits    200ms ease-in                scale 1→0.95 + fade

  Toast slides up        250ms                        Immediately after send
                         cubic-bezier(0.16,1,0.3,1)   

  Toast progress bar     5s linear                    width 100%→0%

  Toast dismiss          300ms ease-out               After 5s

  Cancel --- card slides 200ms ease-in                Input retains text
  down                                                

  Send button appears    150ms ease-out               opacity 0→1

  Send button press      100ms ease-in-out            scale 0.95→1.0

  Input focus border     250ms ease                   #2E2E2E→#C49A6C

  Voice pulse            1.2s loop ease-in-out        scale 1→1.15→1

  Voice ring             1.2s loop ease-out           opacity 0.3→0, scale 1→2

  Transcription          30ms per character           Left to right reveal
  typewriter                                          

  First-capture tagline  400ms ease-in-out            Once only, after toast
  ---------------------- ---------------------------- ---------------------------

+-----------------------------------------------------------------------+
| All animations respect prefers-reduced-motion.                        |
|                                                                       |
| When set, all transitions are instant --- no motion, no delay.        |
|                                                                       |
| Use \@media (prefers-reduced-motion: no-preference) to wrap all       |
| keyframes.                                                            |
+-----------------------------------------------------------------------+

**Part 2 --- Architecture**

*Component tree, state management, data flow, Notion integration,
offline queue*

**7. Architecture Overview**

+-----------------------------------------------------------------------+
| Nevermist is a single-screen PWA with layered state on top of it.     |
|                                                                       |
| There is no router with multiple pages.                               |
|                                                                       |
| Onboarding gates the capture screen. Settings is a gesture-accessed   |
| overlay.                                                              |
|                                                                       |
| The AI call is the pivot point --- everything before it collects      |
| input, everything after displays output.                              |
+-----------------------------------------------------------------------+

**7.1 The Three Boundaries**

- Client --- the browser/PWA. Owns the UI, collects input, stores
  offline queue in IndexedDB, shows confirmations.

- Server --- API routes (Next.js or equivalent). Owns the Claude API
  call, the Notion API call, Notion OAuth, encrypted token storage. The
  API key never touches the client.

- Third-party --- Claude API (AI processing) and Notion API (task
  creation). Both called server-side only.

**7.2 Framework Decision**

The architecture is designed to be framework-agnostic but is optimized
for Next.js 14 (App Router). The key requirement is server-side API
routes to protect the ANTHROPIC_API_KEY and NOTION credentials. Any
framework with server functions (Next.js, Remix, SvelteKit, Nuxt)
satisfies this.

  ----------------------------------- -----------------------------------
  **Recommended**                     **Why**

  Next.js 14 (App Router)             API routes built-in, Vercel
                                      deployment, PWA support via
                                      \@serwist/next, TypeScript
                                      first-class

  Remix                               Equally valid --- excellent
                                      server/client boundary model, good
                                      for forms and mutations

  Vite + separate API                 Works but requires a separate
                                      Express/Fastify server for API
                                      routes --- more complexity
  ----------------------------------- -----------------------------------

**8. Component Tree**

**8.1 Full Tree**

> App
>
> ├── OnboardingGate // checks auth, routes to onboarding if needed
>
> │ ├── ConnectStep // Notion OAuth button
>
> │ ├── PagesStep // select + describe pages
>
> │ └── DoneStep // transition to capture screen
>
> │
>
> ├── CaptureScreen // the one and only main screen
>
> │ ├── TopBar
>
> │ │ ├── Wordmark
>
> │ │ └── StatusPill // online/offline/queued count
>
> │ │
>
> │ ├── MainArea
>
> │ │ ├── ItalicLabel // \'what\'s on your mind?\'
>
> │ │ ├── CaptureInput // the textarea
>
> │ │ └── InputActions
>
> │ │ ├── VoiceButton
>
> │ │ ├── CameraButton
>
> │ │ └── SendButton
>
> │ │
>
> │ ├── QuickChips // desktop: row, mobile: 2×2 grid
>
> │ │ └── QuickChip ×4
>
> │ │
>
> │ ├── PreviewCard // conditional, slides up
>
> │ │ ├── TaskText // editable
>
> │ │ ├── DestinationBadge // tappable → PagePickerSheet
>
> │ │ ├── PriorityPill // tappable → cycles P1/P2/P3
>
> │ │ ├── DueDatePill // tappable → DatePicker
>
> │ │ ├── TaskChipList // photo mode only
>
> │ │ │ └── TaskChip ×n
>
> │ │ ├── SendToNotionBtn
>
> │ │ └── CancelBtn
>
> │ │
>
> │ ├── PagePickerSheet // bottom sheet (mobile) / dropdown (desktop)
>
> │ │ └── PageOption ×n // max 6
>
> │ │
>
> │ ├── ConfirmationToast // conditional, 5s then gone
>
> │ └── OfflineBanner // conditional, amber when auth broken
>
> │
>
> └── SettingsOverlay // gesture-accessed, not in main nav
>
> ├── PageConfigList
>
> ├── TextPolishToggle
>
> └── NudgeTimePicker

**8.2 Component Ownership Rules**

- CaptureScreen owns nothing --- it renders based on store state only.

- CaptureInput is uncontrolled --- it reads from and writes to the
  capture store directly.

- PreviewCard is conditionally rendered --- mounts when preview.visible
  is true, unmounts after confirmation.

- PagePickerSheet is a portal --- renders outside the PreviewCard DOM
  tree to avoid z-index issues.

- ConfirmationToast uses AnimatePresence --- clean mount/unmount
  transitions.

**9. State Architecture**

**9.1 State Management Recommendation**

Zustand is recommended for its minimal boilerplate, direct store access
in hooks, and easy DevTools integration. React Context + useReducer is
an acceptable alternative for teams that prefer it. The state shape is
identical either way.

**9.2 State Slices**

+-----------------------------------------------------------------------+
| **capture store**                                                     |
|                                                                       |
| inputValue: string // current textarea content                        |
|                                                                       |
| inputMode: \'text\'\|\'voice\'\|\'photo\'\|\'url\'                    |
|                                                                       |
| isProcessing: boolean // AI call in flight                            |
|                                                                       |
| processingError: string\|null                                         |
+-----------------------------------------------------------------------+

+-----------------------------------------------------------------------+
| **preview store**                                                     |
|                                                                       |
| visible: boolean                                                      |
|                                                                       |
| cleanedTask: string                                                   |
|                                                                       |
| destinationPageId: string                                             |
|                                                                       |
| destinationName: string                                               |
|                                                                       |
| priority: \'P1\'\|\'P2\'\|\'P3\'                                      |
|                                                                       |
| dueDate: string\|null // ISO 8601                                     |
|                                                                       |
| isRecurring: boolean                                                  |
|                                                                       |
| recurringPattern: string\|null                                        |
|                                                                       |
| isUrl: boolean                                                        |
|                                                                       |
| sourceUrl: string\|null                                               |
|                                                                       |
| tasks: TaskObject\[\] // photo mode --- array of extracted tasks      |
+-----------------------------------------------------------------------+

+-----------------------------------------------------------------------+
| **queue store**                                                       |
|                                                                       |
| items: QueueItem\[\] // offline captured tasks                        |
|                                                                       |
| isSyncing: boolean                                                    |
|                                                                       |
| isOnline: boolean                                                     |
|                                                                       |
| failedItems: FailedItem\[\] // items needing re-routing               |
+-----------------------------------------------------------------------+

+-----------------------------------------------------------------------+
| **user store**                                                        |
|                                                                       |
| isAuthenticated: boolean                                              |
|                                                                       |
| notionWorkspace: string                                               |
|                                                                       |
| pages: PageConfig\[\] // max 6, from DB                               |
|                                                                       |
| textPolish: boolean // default true, settings only                    |
|                                                                       |
| nudgeTime: string\|null // \'21:00\' or null                          |
|                                                                       |
| hasCompletedFirstCapture: boolean // localStorage                     |
|                                                                       |
| hasSeenTagline: boolean // localStorage                               |
+-----------------------------------------------------------------------+

**9.3 Persistent vs Session State**

  ----------------------------------- -----------------------------------
  **Stored in Database (server)**     **Stored in localStorage (client)**

  Notion access token (encrypted)     hasCompletedFirstCapture

  Page configurations                 hasSeenTagline

  Text polish preference              nudge time opt-out

  Nudge time setting                  
  ----------------------------------- -----------------------------------

  ----------------------------------- -----------------------------------
  **Stored in IndexedDB (client)**    **Session only (in-memory)**

  Offline queue items                 capture.inputValue

  Queue item status                   capture.isProcessing

                                      preview.\* (all preview fields)
  ----------------------------------- -----------------------------------

**10. Data Flow**

**10.1 The Happy Path --- Text Capture**

This is the core flow. Every other mode (voice, photo, URL) follows this
same path after their input collection step.

+:-----:+----------------------------------------------------------------+
| **1** | **User types in CaptureInput**                                 |
|       |                                                                |
|       | inputValue updates in capture store. SendButton becomes        |
|       | visible at opacity 1.                                          |
+-------+----------------------------------------------------------------+

+:-----:+----------------------------------------------------------------+
| **2** | **User taps Send**                                             |
|       |                                                                |
|       | capture.isProcessing = true. PreviewCard does not show yet.    |
|       | Input is disabled.                                             |
+-------+----------------------------------------------------------------+

+:-----:+----------------------------------------------------------------+
| **3** | **Client calls POST /api/capture**                             |
|       |                                                                |
|       | Sends: inputValue, inputMode, userId. Never sends the API key. |
+-------+----------------------------------------------------------------+

+:-----:+----------------------------------------------------------------+
| **4** | **Server builds system prompt**                                |
|       |                                                                |
|       | Fetches user\'s PageConfig from DB. Builds dynamic prompt with |
|       | page descriptions and current datetime.                        |
+-------+----------------------------------------------------------------+

+:-----:+----------------------------------------------------------------+
| **5** | **Server calls Claude API**                                    |
|       |                                                                |
|       | Single call: claude-sonnet model, user message + system        |
|       | prompt. For text: plain string. For photo: base64 image block. |
+-------+----------------------------------------------------------------+

+:-----:+----------------------------------------------------------------+
| **6** | **Claude returns structured JSON**                             |
|       |                                                                |
|       | cleanedTask, destinationPageId, priority, dueDate,             |
|       | isRecurring, isUrl, sourceUrl.                                 |
+-------+----------------------------------------------------------------+

+:-----:+----------------------------------------------------------------+
| **7** | **Server returns JSON to client**                              |
|       |                                                                |
|       | Client sets preview store fields. preview.visible = true.      |
+-------+----------------------------------------------------------------+

+:-----:+----------------------------------------------------------------+
| **8** | **PreviewCard slides up**                                      |
|       |                                                                |
|       | 300ms spring animation. User sees the AI result. All fields    |
|       | editable.                                                      |
+-------+----------------------------------------------------------------+

+:-----:+----------------------------------------------------------------+
| **9** | **User taps \'Send to Notion\'**                               |
|       |                                                                |
|       | Client calls POST /api/notion/send with preview fields.        |
+-------+----------------------------------------------------------------+

+:------:+----------------------------------------------------------------+
| **10** | **Server calls Notion API**                                    |
|        |                                                                |
|        | Creates checkbox task in the target page/database with all     |
|        | properties.                                                    |
+--------+----------------------------------------------------------------+

+:------:+----------------------------------------------------------------+
| **11** | **Notion returns 200**                                         |
|        |                                                                |
|        | Server returns success to client.                              |
+--------+----------------------------------------------------------------+

+:------:+----------------------------------------------------------------+
| **12** | **Confirmation toast**                                         |
|        |                                                                |
|        | preview.visible = false. Toast slides up. Input resets. 5s     |
|        | countdown. Done.                                               |
+--------+----------------------------------------------------------------+

**10.2 Voice Flow (before step 1)**

+:------:+----------------------------------------------------------------+
| **V1** | **User taps VoiceButton**                                      |
|        |                                                                |
|        | inputMode = \'voice\'. Web Speech API initializes.             |
+--------+----------------------------------------------------------------+

+:------:+----------------------------------------------------------------+
| **V2** | **User speaks**                                                |
|        |                                                                |
|        | Continuous transcription streams into CaptureInput via         |
|        | typewriter effect.                                             |
+--------+----------------------------------------------------------------+

+:------:+----------------------------------------------------------------+
| **V3** | **User taps to stop**                                          |
|        |                                                                |
|        | Recognition stops. inputValue is the transcribed text.         |
+--------+----------------------------------------------------------------+

+:------:+----------------------------------------------------------------+
| **V4** | **Continues from step 2**                                      |
|        |                                                                |
|        | Same happy path from here --- AI processes the transcribed     |
|        | text.                                                          |
+--------+----------------------------------------------------------------+

**10.3 Photo Flow (before step 1)**

+:------:+----------------------------------------------------------------+
| **P1** | **User taps CameraButton**                                     |
|        |                                                                |
|        | Camera/file picker opens. iOS uses file input, Android uses    |
|        | getUserMedia.                                                  |
+--------+----------------------------------------------------------------+

+:------:+----------------------------------------------------------------+
| **P2** | **User takes/selects photo**                                   |
|        |                                                                |
|        | Image captured as File object.                                 |
+--------+----------------------------------------------------------------+

+:------:+----------------------------------------------------------------+
| **P3** | **Client compresses image**                                    |
|        |                                                                |
|        | Canvas: resize to max 1600px, JPEG quality 0.8. Target:        |
|        | 150--300KB.                                                    |
+--------+----------------------------------------------------------------+

+:------:+----------------------------------------------------------------+
| **P4** | **Client calls POST /api/capture**                             |
|        |                                                                |
|        | Sends base64 image + inputMode=\'photo\'.                      |
+--------+----------------------------------------------------------------+

+:------:+----------------------------------------------------------------+
| **P5** | **Claude Vision extracts tasks**                               |
|        |                                                                |
|        | Returns array of task objects. Uncertain words marked \[?\].   |
+--------+----------------------------------------------------------------+

+:------:+----------------------------------------------------------------+
| **P6** | **PreviewCard shows TaskChipList**                             |
|        |                                                                |
|        | One TaskChip per extracted task. Each editable and deletable.  |
+--------+----------------------------------------------------------------+

+:------:+----------------------------------------------------------------+
| **P7** | **User confirms**                                              |
|        |                                                                |
|        | Each chip sent as a separate Notion entry sequentially.        |
+--------+----------------------------------------------------------------+

**10.4 Offline Flow**

+:------:+----------------------------------------------------------------+
| **O1** | **User captures while offline**                                |
|        |                                                                |
|        | navigator.onLine is false. Task saved to IndexedDB             |
|        | immediately.                                                   |
+--------+----------------------------------------------------------------+

+:------:+----------------------------------------------------------------+
| **O2** | **StatusPill updates**                                         |
|        |                                                                |
|        | Shows \'1 queued\' (or N queued). Muted color, not alarming.   |
+--------+----------------------------------------------------------------+

+:------:+----------------------------------------------------------------+
| **O3** | **Connection returns**                                         |
|        |                                                                |
|        | online event fires. Sync starts automatically.                 |
+--------+----------------------------------------------------------------+

+:------:+----------------------------------------------------------------+
| **O4** | **Sequential sync**                                            |
|        |                                                                |
|        | Items processed one by one in creation order. Not parallel.    |
+--------+----------------------------------------------------------------+

+:------:+----------------------------------------------------------------+
| **O5** | **Success path**                                               |
|        |                                                                |
|        | Item removed from IndexedDB. Confirmation toast per item       |
|        | (staggered 1s).                                                |
+--------+----------------------------------------------------------------+

+:------:+----------------------------------------------------------------+
| **O6** | **401 failure**                                                |
|        |                                                                |
|        | Sync stops entirely. Amber banner: \'Notion disconnected.      |
|        | \[Reconnect\]\'. All items safe.                               |
+--------+----------------------------------------------------------------+

+:------:+----------------------------------------------------------------+
| **O7** | **404 failure**                                                |
|        |                                                                |
|        | Sync continues past failed item. Item flagged. User prompted   |
|        | to re-route.                                                   |
+--------+----------------------------------------------------------------+

+:------:+----------------------------------------------------------------+
| **O8** | **429 rate limit**                                             |
|        |                                                                |
|        | Exponential backoff: 2s, 4s, 8s. Automatic. No user action.    |
+--------+----------------------------------------------------------------+

**11. Notion Integration**

**11.1 OAuth Flow**

+:-----:+----------------------------------------------------------------+
| **1** | **Onboarding ConnectStep**                                     |
|       |                                                                |
|       | User taps \'Connect Notion\'. App redirects to Notion OAuth    |
|       | page.                                                          |
+-------+----------------------------------------------------------------+

+:-----:+----------------------------------------------------------------+
| **2** | **User authorises**                                            |
|       |                                                                |
|       | Notion redirects to /api/auth/callback with code parameter.    |
+-------+----------------------------------------------------------------+

+:-----:+----------------------------------------------------------------+
| **3** | **Server exchanges code**                                      |
|       |                                                                |
|       | POST to Notion token endpoint. Receives access_token and       |
|       | workspace info.                                                |
+-------+----------------------------------------------------------------+

+:-----:+----------------------------------------------------------------+
| **4** | **Token stored encrypted**                                     |
|       |                                                                |
|       | AES-256 encryption. Stored in database against userId. Never   |
|       | in localStorage.                                               |
+-------+----------------------------------------------------------------+

+:-----:+----------------------------------------------------------------+
| **5** | **Session created**                                            |
|       |                                                                |
|       | httpOnly secure cookie. User is now authenticated.             |
+-------+----------------------------------------------------------------+

**11.2 Page Type Detection**

During page selection in onboarding, the app must detect whether each
selected item is a Notion database or a plain page. They require
completely different API calls to create entries.

  ----------------------------------- -----------------------------------
  **Notion Database**                 **Notion Plain Page**

  Detected via: GET                   Detected via: database call fails →
  /v1/databases/{id} returns 200      GET /v1/pages/{id}

  Create entry: POST /v1/pages with   Create entry: PATCH
  parent.database_id                  /v1/blocks/{id}/children --- append
                                      to_do block

  Properties: Priority (Select), Due  Properties: embedded in text ---
  Date (Date), Title                  \'Task text \[P2\] \[Due: Mar
                                      20\]\'

  Auto-map: Select named \'Priority\' No property mapping needed
  → priority field                    

  If mapping ambiguous: brief         Works immediately, less structured
  onboarding step shown               

  Recommended path --- shown in       Fallback --- fully supported
  onboarding hint                     
  ----------------------------------- -----------------------------------

**11.3 Auto-Generated Page Descriptions**

After page selection, a single Claude API call receives each page\'s
name and property list. Claude generates a 1-sentence routing
description per page. These are shown pre-filled to the user who can
edit inline. Most users will not edit them.

+-----------------------------------------------------------------------+
| Example: \'Sprint Planning\' with properties \[Sprint, Story Points,  |
| Assignee\]                                                            |
|                                                                       |
| → Auto-description: \'Work tasks --- sprint items, deliverables, and  |
| team assignments\'                                                    |
|                                                                       |
| Example: \'Groceries\' with existing items \[Milk, Eggs, Bread\]      |
|                                                                       |
| → Auto-description: \'Shopping --- grocery and household items to     |
| buy\'                                                                 |
|                                                                       |
| These descriptions are what the AI uses to route every future         |
| capture.                                                              |
+-----------------------------------------------------------------------+

**12. API Routes**

**12.1 Route Map**

  -------------------- ------------ ----------------------------------------------
  **Route**            **Method**   **Purpose**

  POST /api/capture    POST         Main capture endpoint. Calls Claude, returns
                                    structured JSON. Never calls Notion.

  POST                 POST         Sends confirmed task to Notion. Called after
  /api/notion/send                  user approves preview.

  GET                  GET          Returns user\'s accessible Notion pages for
  /api/notion/pages                 onboarding selection.

  GET /api/auth/notion GET          Initiates OAuth redirect to Notion.

  GET                  GET          Handles OAuth callback. Exchanges code for
  /api/auth/callback                token. Creates session.

  GET                  GET          Checks if user is authenticated. Returns user
  /api/auth/session                 config.

  GET /api/user/config GET          Returns user\'s PageConfig entries.

  PUT /api/user/config PUT          Updates PageConfig (descriptions, order,
                                    polish setting).

  POST /api/queue/sync POST         Processes offline queue items. Called on
                                    reconnect.
  -------------------- ------------ ----------------------------------------------

**12.2 /api/capture Request + Response**

**Request body:**

> {
>
> \"inputValue\": \"call dentist before end of month, important\",
>
> \"inputMode\": \"text\", // \"text\" \| \"voice\" \| \"photo\" \|
> \"url\"
>
> \"imageData\": null, // base64 string for photo mode
>
> \"userId\": \"cuid\...\"
>
> }

**Response body (text/voice/url):**

> {
>
> \"cleanedTask\": \"Call dentist before end of month\",
>
> \"destinationPageId\": \"notion-page-id-here\",
>
> \"destinationName\": \"Personal\",
>
> \"priority\": \"P2\",
>
> \"dueDate\": \"2025-03-31\",
>
> \"isRecurring\": false,
>
> \"recurringPattern\": null,
>
> \"isUrl\": false,
>
> \"sourceUrl\": null
>
> }

**Response body (photo mode):**

> {
>
> \"tasks\": \[
>
> { \"cleanedTask\": \"Buy whiteboard markers\", \"destinationPageId\":
> \"\...\", \... },
>
> { \"cleanedTask\": \"Call Ravi --- return 500\",
> \"destinationPageId\": \"\...\", \... },
>
> { \"cleanedTask\": \"Movie friday \[?\]\", \"destinationPageId\":
> \"\...\", \... }
>
> \]
>
> }

**13. Security**

**13.1 Key Rules**

- ANTHROPIC_API_KEY is server-side only --- never in client code, never
  in environment variables exposed to the browser.

- Notion access tokens stored AES-256 encrypted in the database ---
  never in localStorage, never in cookies.

- All API routes protected by session middleware --- unauthenticated
  requests return 401.

- Session cookie: httpOnly, secure, sameSite strict.

- Image data (base64) never stored server-side --- passed directly to
  Claude API and discarded.

- User data never stored beyond what is needed --- no task content in
  the database, only routing configs.

**13.2 Environment Variables**

  ----------------------------------- -----------------------------------
  **Variable**                        **Where it lives**

  ANTHROPIC_API_KEY                   Server only (.env.local, never
                                      NEXT_PUBLIC\_)

  NOTION_CLIENT_ID                    Server only

  NOTION_CLIENT_SECRET                Server only

  NOTION_REDIRECT_URI                 Server only

  DATABASE_URL                        Server only

  ENCRYPTION_KEY                      Server only (AES-256 key for token
                                      encryption)

  VAPID_PUBLIC_KEY                    Client safe (push notifications)

  VAPID_PRIVATE_KEY                   Server only
  ----------------------------------- -----------------------------------

Nevermist --- Design & Architecture Doc v1.0

*Your thought never mists.*
