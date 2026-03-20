**Nevermist**

Product Requirements Document

Version 1.0 · V1 Release

  -------------------------------------
      **Status**           Draft
  ------------------ ------------------
     **Product**       Nevermist PWA

      **Scope**         V1 --- Core
                          Capture
  -------------------------------------

# 1. Product Overview

  -----------------------------------------------------------------------
  *Your thought never mists. Even if you forget it, the notes have it
  all.*
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

## 1.1 What Nevermist Is

Nevermist is a universal capture layer that sits on top of Notion. It is
a Progressive Web App (PWA) that accepts thoughts in any format ---
typed text, spoken voice, or a photo of handwritten notes --- and lands
them in the user\'s Notion workspace as structured, actionable tasks.
The user never needs to open Notion to add a task again.

Nevermist is not a notes app. It is not a Notion replacement. It is the
front door to Notion --- the fastest possible path from thought to
structured task.

## 1.2 The Problem It Solves

When a thought hits, the path to capturing it in Notion is: switch apps
→ wait for load → navigate to the right page → scroll to the checkbox
block → click to add → type → manually set date and priority. That is
6--7 steps and 30--90 seconds. In that time, the thought either gets
lost or requires sustained mental effort to hold.

Beyond the steps, Notion\'s workspace shows everything --- other tasks,
pages, notifications --- which causes attention leakage. A user who
opened Notion to add one task finds themselves managing three others.

Nevermist collapses capture to: open app → input thought → send. Three
steps. Under 10 seconds. The app shows nothing except an input field.

## 1.3 Core Philosophy

- Zero friction above everything else. Every design and technical
  decision must serve this.

- Any format, one surface. Text, voice, and photo enter through the same
  interface. No mode switching.

- AI works silently. The user never manages the AI --- it routes,
  structures, and infers metadata automatically.

- Notion is the source of truth. Nevermist stores nothing permanently.
  Notion is the database. Nevermist is the keyboard.

- Trust through transparency. After every send, the user sees exactly
  what was sent, where it went, and what metadata was set.

- The empty state is the product. A blank input field with a blinking
  cursor is the entire interface. Nothing competes for attention.

## 1.4 What Nevermist Is Not

- Not a task manager --- no in-app task list, no completing tasks within
  the app.

- Not a Notion viewer --- no reading or browsing Notion from within
  Nevermist.

- Not a reminder system --- no alarms, no recurring push notifications
  beyond one optional daily nudge.

- Not a collaboration tool in V1 --- single user, single Notion
  workspace.

# 2. Target Users

## 2.1 Primary User

A single person who uses Notion as their primary productivity system and
regularly experiences the frustration of having thoughts, ideas, or
tasks slip away before they reach Notion. They may be using a phone
mid-activity, on a laptop while working, or away from any device
entirely when thoughts hit.

They are comfortable with technology but don\'t want to configure it.
They want something that works instantly and disappears --- a tool, not
an app demanding attention.

## 2.2 Usage Moments

- Mid-activity capture --- a thought hits while cooking, walking,
  driving, or in a conversation.

- Post-meeting --- a quick voice note of action items before the meeting
  ends.

- Physical note transfer --- a handwritten to-do list, sticky note, or
  whiteboard photographed and sent to Notion.

- Reading capture --- a URL from a browser, article, or tool saved to
  Notion with context.

- Late-night thought --- a task remembered at 11pm, captured in under 5
  seconds before sleep.

## 2.3 The Key Insight

  -----------------------------------------------------------------------
  *The value of Nevermist is not that it is faster than Notion. It is
  that it exists outside Notion --- a clean surface with no history, no
  sidebar, no competing tasks. The user opens it, inputs one thing, and
  leaves. The app earns trust by being invisible except when needed.*
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

# 3. Feature Specifications

## 3.1 Input Layer

### 3.1.1 Text Input

- Single textarea, centered, full focus on app load, auto-focus on every
  open.

- Placeholder text --- standard sessions: \"What\'s on your mind?\"

- Placeholder text --- first launch only: \"Try it --- say \'buy
  groceries tomorrow\' and hit send\"

- Placeholder rendered at 40% opacity on first launch (warmer, more
  suggestive) vs 30% on standard sessions.

- Accepts natural language including relative dates, urgency language,
  and project context.

- Multi-line supported for longer thoughts.

- Send button appears only when input has content --- fades in at 150ms.

- Keyboard shortcut: Enter to send (desktop), Shift+Enter for new line.

### 3.1.2 Voice Input

- Mic icon below the input field, left position.

- Label \"Speak\" shown underneath on first launch only --- fades
  permanently after first successful capture.

- Tap to start recording, tap again to stop. Not continuous recording.

- Visual state: mic icon pulses at 1.2s interval with radiating ring
  animation while recording.

- Transcription appears in the text field character by character
  (typewriter effect, 30ms per character).

- User can edit the transcribed text before sending --- voice fills the
  field, does not bypass the preview step.

- Web Speech API primary implementation.

- iOS specific: re-initialize recognition object on each use, add
  visible \"Listening\...\" state, manual Retry button if recognition
  fails silently.

- Graceful degradation: if Web Speech API unavailable, mic icon is
  hidden (not shown as disabled).

### 3.1.3 Photo Capture

- Camera icon below the input field, right position.

- Label \"Photo\" shown underneath on first launch only --- same fade
  behaviour as voice label.

- iOS: uses \<input type=\"file\" accept=\"image/\*\"
  capture=\"environment\"\> to directly open camera.

- Android/Desktop: uses getUserMedia for camera access with file input
  fallback.

- Before sending to API: compress image to max 1600px on longest
  dimension, JPEG quality 0.8, via canvas. Target output: 150--300KB.

- Accepts: handwritten lists, sticky notes, whiteboard photos, notebook
  pages, receipts with notes.

- AI extracts each distinct task as a separate item. Uncertain words
  marked with \[?\] in extraction.

- Preview shows editable TaskChip list --- one chip per extracted task.

- User can delete, edit text, or reassign destination page on any
  individual chip before sending.

- Each confirmed task is sent as a separate Notion entry.

### 3.1.4 URL Detection and Capture

- When input contains a URL (regex detection), the app automatically
  switches to URL mode.

- Server-side: fetches page title and meta description from the URL
  (HTML head parsing only --- no full render).

- Works for approximately 80% of sites. For sites that block or have no
  meta: uses URL domain as fallback title.

- AI uses the user\'s note text + page title + meta description to
  route, prioritize, and infer due date.

- Saved to Notion with: task text as title, URL as a page property, page
  title as a secondary property.

- URL capture does not summarise full page content --- that is a V2
  feature.

- The \"save as task or reading item\" routing is AI-inferred from the
  meta description content.

## 3.2 AI Processing Layer

### 3.2.1 Single API Call Architecture

All AI processing happens in one Claude Sonnet API call per capture. The
call receives the user\'s raw input (text, voice transcript, or image)
and the dynamically built system prompt, and returns a structured JSON
object.

### 3.2.2 System Prompt Structure

The system prompt is built per-user at request time and includes:

- The user\'s configured Notion pages with their auto-generated
  descriptions.

- Current date and time (for relative date resolution).

- Instruction to return structured JSON only --- no preamble, no
  explanation.

- For photo inputs: additional instruction to extract each task
  separately, mark uncertain words with \[?\].

### 3.2.3 JSON Output Schema

  -----------------------------------------------------------------------------
  **Field**               **Type**           **Description**
  ----------------------- ------------------ ----------------------------------
  **cleanedTask**         string             Polished task text, or raw input
                                             if polish disabled in settings

  **destinationPageId**   string             Notion page/database ID of best
                                             matching destination

  **destinationName**     string             Human-readable page name for
                                             display in preview

  **priority**            P1 \| P2 \| P3     Inferred from urgency language in
                                             input

  **dueDate**             string \| null     ISO 8601 date inferred from
                                             natural language, or null

  **isRecurring**         boolean            True if recurring pattern detected
                                             in input

  **recurringPattern**    string \| null     E.g. \"every monday\", \"daily\",
                                             \"weekly\"

  **isUrl**               boolean            True if input is or contains a URL

  **sourceUrl**           string \| null     The URL if isUrl is true
  -----------------------------------------------------------------------------

For photo inputs, the AI returns an array of these objects --- one per
extracted task.

## 3.3 Preview Card

- Slides up from the bottom of the viewport after AI processing
  completes.

- Animation: translateY(100%) to translateY(0), 300ms,
  cubic-bezier(0.16, 1, 0.3, 1).

- Simultaneously: input field shifts up to make room (same duration and
  easing).

- Subtle backdrop dim appears behind preview (opacity 0 to 0.1 black).

Preview card displays:

- Cleaned task text (editable inline).

- Destination page badge --- tappable, opens bottom sheet page picker
  with all configured pages.

- Priority pill (P1/P2/P3) --- tappable to cycle through options.

- Due date --- tappable to open a date picker.

- For photo captures: scrollable list of TaskChip components, one per
  extracted task.

Page picker bottom sheet (mobile) / dropdown (desktop):

- Shows all configured pages (max 6) --- each as icon + name + short
  description.

- Large tap targets (48px+ per row).

- Swipe down to dismiss on mobile.

- Selection is instant --- no confirmation step.

Actions:

- Send button (prominent) --- keyboard shortcut Enter on desktop.

- Cancel (text link) --- slides card back down, input retains original
  text, Escape key on desktop.

## 3.4 Confirmation and Reset

- Green toast slides up from bottom after successful send:
  translateY(100%) to translateY(0), 250ms, cubic-bezier(0.16, 1, 0.3,
  1).

- Toast content: \"Added to \[Page Name\] · P2 · Due Friday ✓\"

- Thin green progress bar at bottom of toast counts down 5 seconds
  visually.

- Auto-dismisses after 5 seconds --- fade out over 300ms.

- Input field resets to empty immediately after send (not after toast
  dismisses).

- First successful capture only: after toast dismisses, a single line
  fades in for 4 seconds below the input: \"That\'s it. Every thought,
  straight to Notion.\" --- appears once, never again.

- This message is stored as a flag (hasSeenTagline) in localStorage.

## 3.5 Onboarding Flow

### 3.5.1 Steps

Step 1 --- Connect Notion: OAuth 2.0 flow. User authorises Nevermist to
access their workspace. Single button: \"Connect Notion\". Redirects to
Notion OAuth, returns to app with token.

Step 2 --- Select Pages: User selects up to 6 Notion pages or databases
as capture destinations. The app calls the Notion API to list accessible
pages. Each page shown with its name and type (page vs database icon).
User taps to select, taps again to deselect.

Auto-generate descriptions: After selection, a single Claude API call
receives each page\'s name and (for databases) its property names.
Claude generates a 1-sentence routing description per page. User sees
the descriptions pre-filled and can edit inline before proceeding. Most
users will not edit them.

Step 3 --- Done: User lands on the capture screen. No nudge time step in
onboarding --- this is offered after the 3rd capture instead.

### 3.5.2 Database Property Mapping

- When a selected page is a Notion database, the app inspects its
  properties via the Notion API.

- Smart auto-mapping: a Select property named \"Priority\" or \"Status\"
  is mapped to priority. A Date property named \"Due\", \"Due Date\", or
  \"Deadline\" is mapped to due date.

- If properties are detected but ambiguous, a brief mapping step is
  shown: \"Which property is Priority?\" --- dropdown of the database\'s
  Select properties.

- For simple Notion pages (not databases): priority and due date are
  embedded inline in the task text as: ☐ Task text \[P2\] \[Due: Mar
  20\].

- During onboarding: a subtle hint nudges toward databases ---
  \"Databases support priority and due dates as properties. Plain pages
  work too but with less structure.\"

### 3.5.3 Post-Third-Capture Nudge Prompt

- After the user\'s 3rd successful capture, a subtle prompt appears
  below the confirmation toast:

- \"Want a daily reminder to capture? Set a nudge time →\"

- Tapping opens a simple time picker. User selects a time or dismisses.

- If dismissed, the prompt never appears again (stored in localStorage).

## 3.6 Offline Queue

- All captures work without internet connection.

- Tasks saved to IndexedDB immediately on submit --- before any API call
  is attempted.

- Online/offline detection via navigator.onLine and the online event.

- When offline: \"X items queued\" pill appears at top of screen in
  muted color.

- On reconnect: sync starts automatically, processes items sequentially
  (not parallel).

- Items removed from IndexedDB only after confirmed 200 response from
  Notion API.

- No data is ever lost --- IndexedDB is the source of truth until Notion
  confirms.

Error handling during sync:

  -----------------------------------------------------------------------
  **Error**        **Behaviour**                      **User Action**
  ---------------- ---------------------------------- -------------------
  401 Unauthorized Sync stops. Amber banner: \"Notion Reconnect Notion
                   disconnected. X items waiting.     via OAuth
                   \[Reconnect\]\"                    

  404 Page not     Sync continues. Failed item        Re-route via page
  found            flagged. Notification: \"1 item    picker
                   needs re-routing.\"                

  429 Rate limit   Sync pauses. Exponential backoff:  None --- automatic
                   2s, 4s, 8s. Retries automatically. 

  500 Server error Retries 3x then skips item. User   Manual retry from
                   notified if all retries fail.      queue

  Network drop     Sync stops. Resumes automatically  None --- automatic
                   when online.                       

  Claude API error Item skipped. User notified. Item  Manual retry
                   remains in queue.                  
  -----------------------------------------------------------------------

## 3.7 Daily Nudge Notification

- Optional --- set up after 3rd capture, not during onboarding.

- One push notification per day at user-chosen time.

- Content varies: \"You captured X things today. Anything else before
  tomorrow?\" or \"Quick thought before you sleep?\" (if no captures
  that day).

- iOS: only available on iOS 16.4+ when PWA is added to homescreen.
  Gracefully hidden otherwise.

- Uses Web Push API with VAPID keys --- not Firebase Cloud Messaging.

- Notification does not show capture count or task details --- no data
  exposed in notification.

# 4. Empty State and First Launch Experience

## 4.1 First Launch (After Onboarding)

- Input field centered, focused, cursor blinking. Identical layout to
  every future session.

- Placeholder: \"Try it --- say \'buy groceries tomorrow\' and hit
  send\"

- Placeholder rendered at 40% opacity (warmer than standard 30%).

- Mic icon has label \"Speak\" underneath. Camera icon has label
  \"Photo\" underneath.

- Labels fade out permanently after user\'s first successful capture
  (hasCompletedFirstCapture flag in localStorage).

- No welcome message, no tutorial overlay, no coach marks, no onboarding
  tooltip.

  -----------------------------------------------------------------------
  *The placeholder text is the entire tutorial. The app trusts the user
  to explore a three-element interface.*
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

## 4.2 Standard Empty State (Every Session After First)

- Input field, centered, focused, cursor blinking.

- Placeholder: \"What\'s on your mind?\" --- warm, open-ended, not
  task-specific.

- Mic and camera icons, no labels.

- No history, no recent items, no capture count, no streaks, no stats.

- If offline items queued: muted pill at top --- \"3 items queued ---
  will sync when online.\"

- If Notion auth broken: amber pill --- \"Notion disconnected.
  \[Reconnect\]\"

## 4.3 What Is Explicitly Not Shown

- No suggested tasks or \"try saying\...\" carousel.

- No illustration or decorative graphic.

- No task capture count or streak counter.

- No history of recent captures.

- No quick-action buttons beyond the input itself.

  -----------------------------------------------------------------------
  *The empty state should feel like opening a fresh notebook to a blank
  page --- not intimidating, not instructive, just ready. The blinking
  cursor is the invitation.*
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

# 5. Motion and Animation Specifications

## 5.1 Animation Principles

Every animation serves a spatial or feedback purpose. Nothing decorates.
Animations show where things came from and where they went. They confirm
that an action registered.

  ------------------------------------------------------------------------------
  **Interaction**       **Duration**    **Easing**           **Notes**
  --------------------- --------------- -------------------- -------------------
  Preview card slides   300ms           cubic-bezier(0.16,   Spring-like,
  up                                    1, 0.3, 1)           physical feel

  Input shifts up with  300ms           cubic-bezier(0.16,   Simultaneous with
  card                                  1, 0.3, 1)           card

  Backdrop dim appears  300ms           ease-out             Opacity 0 → 0.1
                                                             black

  Send --- card         200ms           ease-in              Scale 1.0 → 0.95,
  scales + fades                                             opacity 1 → 0

  Confirmation toast    250ms           cubic-bezier(0.16,   Immediately after
  slides up                             1, 0.3, 1)           card exits

  Toast auto-dismiss    300ms           ease-out             After 5s progress
                                                             bar empties

  Cancel --- card       200ms           ease-in              Input retains text
  slides down                                                

  Input shifts back     200ms           ease-in              Simultaneous with
  down                                                       cancel

  Send button appears   150ms           ease-out             Fades in when input
                                                             has content

  Send button press     100ms           ease-in-out          Scale 1.0 → 0.95 →
                                                             1.0

  Voice pulse           1.2s loop       ease-in-out          Scale 1.0 → 1.15 →
  (recording)                                                1.0

  Voice ring radiation  1.2s loop       ease-out             Opacity 0.3 → 0,
                                                             scale 1 → 2

  Transcription         30ms/char       linear               Characters revealed
  typewriter                                                 left-to-right

  First-capture tagline 400ms           ease-in-out          Fades in after
                                                             toast dismisses
  ------------------------------------------------------------------------------

Implementation: Framer Motion for React. AnimatePresence handles
mount/unmount transitions for the preview card and toast. CSS keyframes
for the voice pulse and ring. All animations respect
prefers-reduced-motion --- when set, transitions are instant (no
motion).

# 6. PWA and Platform Specifications

## 6.1 PWA Requirements

- Installable on iOS homescreen and Android homescreen via PWA manifest.

- App opens in under 1.5 seconds when installed (service worker caches
  app shell).

- Manifest includes: name \"Nevermist\", short_name \"Nevermist\",
  display \"standalone\", background_color, theme_color, icons at 192px
  and 512px.

- Service worker caches critical assets only --- small cache to avoid
  iOS aggressive eviction.

- IndexedDB used for offline queue (more persistent than Cache API on
  iOS).

- On app load: always verify service worker is registered, re-register
  if needed.

## 6.2 iOS Specific Handling

### Push Notifications

- Only available on iOS 16.4+ when PWA is added to homescreen.

- Uses Web Push API with VAPID keys --- not Firebase Cloud Messaging.

- If iOS \< 16.4 or not installed to homescreen: nudge feature is hidden
  entirely. No broken promise.

- Detect capability at runtime --- don\'t offer what can\'t be
  delivered.

### Voice Input

- webkitSpeechRecognition used, re-initialized on every use (not
  reused).

- Tap-to-start / tap-to-stop model only. No continuous recognition.

- Visible \"Listening\...\" state. Manual \"Retry\" button if
  recognition fails silently.

- Screen lock/unlock can silently kill recognition --- handle gracefully
  with auto-recovery attempt.

### Camera

- Uses \<input type=\"file\" accept=\"image/\*\"
  capture=\"environment\"\>.

- This directly opens camera on iOS without the ambiguous getUserMedia
  prompt.

### Layout and Viewport

- Use 100dvh (dynamic viewport height) --- not 100vh which ignores
  Safari address bar.

- Listen to visualViewport resize event to adjust layout when software
  keyboard appears.

- Test all interactions with keyboard open --- input field and buttons
  must remain accessible.

### Install Prompt

- iOS does not support beforeinstallprompt. No automatic install banner.

- Show a manual instruction banner on first visit from iOS Safari
  (detect via user agent):

- \"Add to Home Screen for the best experience\" with the iOS share icon
  illustrated.

- Dismissible --- stored in localStorage, never shown again after
  dismissal.

## 6.3 Speed Targets

  -----------------------------------------------------------------------
  **Interaction**                     **Target**
  ----------------------------------- -----------------------------------
  App open to cursor focused (PWA     \< 1.5 seconds
  installed)                          

  Text submission to Notion confirmed \< 4 seconds

  Voice capture to text in field      \< 2 seconds

  Photo to extracted task preview     \< 5 seconds

  URL detection and meta fetch        \< 3 seconds
  -----------------------------------------------------------------------

# 7. V1 Scope

## 7.1 Included in V1

- Text input with AI processing (route, priority, due date) and Notion
  send.

- Voice input via Web Speech API --- transcription fills text field.

- Photo capture --- Claude Vision extracts tasks, editable TaskChip
  preview.

- URL detection --- fetch title and meta, AI routes, URL saved as Notion
  property.

- Offline queue with IndexedDB and automatic background sync.

- Recurring task detection --- AI flags \"every monday\" patterns.

- Preview card --- editable destination, priority, due date before send.

- Destination re-routing via tappable badge and bottom sheet page
  picker.

- 5-second confirmation toast with progress bar, auto-reset.

- First-launch experience --- contextual placeholder, icon labels,
  one-time tagline.

- Onboarding --- Notion OAuth, page selection, auto-generated
  descriptions.

- Database vs plain page detection and handling.

- Property auto-mapping for Notion databases.

- Post-third-capture nudge time prompt.

- Daily nudge push notification (where platform supports it).

- PWA installable --- manifest and service worker.

- iOS and Android graceful degradation.

## 7.2 Deferred to V2

- Browser extension --- highlight text on any webpage and send to
  Notion.

- URL full-page summarisation --- AI reads full article content, not
  just meta.

- Smart duplicate detection --- checks Notion for near-identical
  existing tasks.

- Batch photo mode --- multiple images processed in one session.

- Whisper API voice fallback --- for unreliable Web Speech API
  environments.

- Weekly digest email --- summary of everything captured that week.

- WhatsApp / iMessage forwarding integration.

- Multi-workspace support.

# 8. Implementation Phases

*Estimated at single developer pace. Adjust for team size.*

+---------+------------------------------------------------------------+
| **Phase | **Project scaffold + Notion OAuth**                        |
| 1**     |                                                            |
|         | - Next.js 14 project setup with TypeScript and Tailwind    |
| Days    |                                                            |
| 1--2    | - Prisma schema: User, PageConfig models                   |
|         |                                                            |
|         | - Notion OAuth 2.0 end-to-end --- initiate, callback,      |
|         |   session                                                  |
|         |                                                            |
|         | - Encrypted Notion token storage                           |
|         |                                                            |
|         | - Session management with httpOnly cookies                 |
+=========+============================================================+

+---------+------------------------------------------------------------+
| **Phase | **Onboarding flow**                                        |
| 2**     |                                                            |
|         | - Page selection UI from Notion API                        |
| Day 3   |                                                            |
|         | - Auto-description generation via Claude API               |
|         |                                                            |
|         | - Database vs page type detection                          |
|         |                                                            |
|         | - Property auto-mapping step for databases                 |
|         |                                                            |
|         | - Store PageConfig entries to DB                           |
+=========+============================================================+

+---------+------------------------------------------------------------+
| **Phase | **Core capture --- text + AI + Notion send**               |
| 3**     |                                                            |
|         | - Capture UI: input, mic, camera buttons, send button      |
| Days    |                                                            |
| 4--5    | - Claude API call with dynamic system prompt builder       |
|         |                                                            |
|         | - Preview card with all editable fields                    |
|         |                                                            |
|         | - Bottom sheet page picker                                 |
|         |                                                            |
|         | - Notion API send --- database entries and plain page      |
|         |   to_do blocks                                             |
|         |                                                            |
|         | - Confirmation toast with 5s progress bar and auto-reset   |
+=========+============================================================+

+---------+------------------------------------------------------------+
| **Phase | **Voice input**                                            |
| 4**     |                                                            |
|         | - Web Speech API wrapper with iOS defensive handling       |
| Day 6   |                                                            |
|         | - VoiceButton component: idle, listening, processing       |
|         |   states                                                   |
|         |                                                            |
|         | - Typewriter transcription effect                          |
|         |                                                            |
|         | - Pulse and ring animations                                |
+=========+============================================================+

+---------+------------------------------------------------------------+
| **Phase | **Photo capture**                                          |
| 5**     |                                                            |
|         | - Camera access (file input for iOS, getUserMedia for      |
| Days    |   Android)                                                 |
| 7--8    |                                                            |
|         | - Canvas-based image compression to 1600px JPEG 0.8        |
|         |                                                            |
|         | - Claude Vision API integration                            |
|         |                                                            |
|         | - TaskChip editable list for multi-task extraction         |
|         |                                                            |
|         | - Per-chip destination re-routing                          |
+=========+============================================================+

+---------+------------------------------------------------------------+
| **Phase | **Offline queue**                                          |
| 6**     |                                                            |
|         | - IndexedDB setup via idb library                          |
| Day 9   |                                                            |
|         | - Sequential sync on reconnect with error classification   |
|         |                                                            |
|         | - Re-auth flow for 401 errors                              |
|         |                                                            |
|         | - Re-routing UI for 404 errors                             |
|         |                                                            |
|         | - OfflineBadge component                                   |
+=========+============================================================+

+---------+------------------------------------------------------------+
| **Phase | **PWA + push notifications**                               |
| 7**     |                                                            |
|         | - Service worker registration and app shell caching        |
| Day 10  |                                                            |
|         | - PWA manifest with icons                                  |
|         |                                                            |
|         | - Web Push API with VAPID keys                             |
|         |                                                            |
|         | - Daily nudge cron (Vercel Cron or similar)                |
|         |                                                            |
|         | - Post-third-capture nudge prompt                          |
|         |                                                            |
|         | - iOS install instruction banner                           |
+=========+============================================================+

+---------+------------------------------------------------------------+
| **Phase | **Polish, error handling, testing**                        |
| 8**     |                                                            |
|         | - Notion API failure handling --- token expiry, rate       |
| Days    |   limits                                                   |
| 11--12  |                                                            |
|         | - Loading states and skeleton screens                      |
|         |                                                            |
|         | - All animations implemented with Framer Motion            |
|         |                                                            |
|         | - Responsive testing --- mobile Safari, Chrome, desktop    |
|         |                                                            |
|         | - Performance audit against speed targets                  |
|         |                                                            |
|         | - First-launch experience and localStorage flags           |
+=========+============================================================+

# 9. Success Metrics

## 9.1 What Success Looks Like

  -----------------------------------------------------------------------
  *A user has a thought while cooking. They tap the Nevermist icon on
  their homescreen. They speak. They hit send. In under 4 seconds, a
  structured, prioritised, dated task is in the right Notion page. They
  go back to cooking. They never had to think about where to put it, how
  to format it, or whether it was saved. That is the entire product.*
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

## 9.2 Quantitative Targets

  -----------------------------------------------------------------------
  **Metric**                          **V1 Target**
  ----------------------------------- -----------------------------------
  Text to Notion confirmed            \< 4 seconds end-to-end

  Photo to preview shown              \< 5 seconds

  Onboarding completion rate          \> 80% of users who start

  Onboarding time                     \< 2 minutes

  AI routing accuracy                 \> 90% correct page on first try

  Offline queue loss rate             0% --- no captures ever lost

  App open to cursor focus (PWA)      \< 1.5 seconds
  -----------------------------------------------------------------------

## 9.3 Qualitative Signal

- User sends a task and does not open Notion to verify it arrived ---
  they trust the confirmation toast.

- User photographs a handwritten list and all tasks arrive in Notion
  correctly without editing any chip.

- User uses the app three days in a row without anyone explaining how it
  works.

- User says \"I just speak it now\" when describing their Notion
  workflow.

Nevermist --- PRD v1.0

*Your thought never mists.*
