# NetDefend Roadmap

This roadmap keeps the prototype focused on the part that already feels good: manually managing a messy physical network under pressure. The goal is not pure automation or tower-defense optimization. The goal is controlled chaos: moving cables, balancing heat and traffic, responding to weird events, and barely saving the rack because the player made fast, readable decisions.

## Design Pillars

1. **Manual routing is the game.**
   The player should win by actively moving cables, not by building one perfect static network.

2. **Chaos should be legible.**
   Every disaster needs a clear visual or audio tell: flashing ports, pulsing cables, warning logs, packet color, heat bloom, event banners, and countdowns.

3. **Pressure comes in waves.**
   The game should alternate between panic and recovery: short prep windows, intense traffic, chaos spikes, then time to repair and rewire.

4. **Buffs should create tradeoffs.**
   Upgrades and temporary powers should solve one problem while creating another interesting risk.

5. **Failure should be partial before final.**
   Prefer degraded modules, jammed ports, overheated racks, corrupted cables, or slower tools before instant game over.

## Core Loop Target

1. Prep the rack.
2. Connect routes from WAN outputs through balancers, firewalls, and mainframe inputs.
3. Watch packet traffic, cable load, and thermals.
4. React to events by unplugging, rerouting, slicing, cooling, throttling, or buying modules.
5. Survive the wave.
6. Choose a buff or upgrade.
7. Repair and prepare for the next wave.

## Phase 1: Make Manual Routing Juicy

Status: **Completed in first implementation pass.**

Implemented:

- Port hover, selected-port, connected-port, and valid-target feedback.
- Cable load labels and clearer normal/stressed/critical cable states.
- Distinct packet shapes for clean, malware, ransomware, and DDoS traffic.
- Route feedback labels for delivery, firewall scanning, balancer splitting, missing outputs, and saturated cables.
- Prep, active, and recovery wave phases.
- Throttled warnings for missing WAN routes and dropped module output.

Goal: make cable movement, cable state, and routing feedback feel great before adding lots of new systems.

### Features

- Improve port hover and selected-port feedback.
- Add clearer cable load states:
  - Normal glow.
  - Stressed pulse.
  - Sparking overload.
  - Break/failure warning.
- Make packet types more visually distinct.
- Add route feedback when a packet successfully reaches a module.
- Add a short recovery/prep phase between waves.
- Add clearer warnings when WAN has no connected routes.
- Improve tooltip/help affordances without adding large tutorial text.

### Acceptance Criteria

- The player can understand why a packet succeeded or failed by looking at the canvas.
- Overloaded cables are visually obvious before they fail.
- Between waves, the player has enough time to rewire without panic.
- No major layout overlap when adding blades.

## Phase 2: Event System Foundation

Status: **Completed in first implementation pass.**

Implemented:

- Event HUD panel with active event name, countdown, progress bar, and short operational detail.
- One-event-per-wave scheduling during active traffic.
- Event lifecycle with start, update, cleanup, and log messages.
- Port Surge, Brownout, DDoS Rain, Port Lockdown, and Cable Heat Bloom.
- Event-specific canvas tells on ports, modules, and cables.

Goal: create the system that makes each wave chaotic in a readable way.

### Features

- Add a formal event state machine:
  - Event name.
  - Duration.
  - Countdown.
  - Start effect.
  - Update effect.
  - End cleanup.
- Add event banner in the HUD.
- Add event countdown timer.
- Add event-specific log messages.
- Add event intensity scaling by wave.
- Prevent too many events from stacking early.

### First Events

- **Port Surge**
  A random WAN output gets increased traffic for a short duration. Player must split or reroute the load.

- **Brownout**
  One rack column loses partial power. Modules still work but slower, pushing the player to route around that side.

- **DDoS Rain**
  Many small packets spawn across all connected WAN outputs. Individually manageable, collectively dangerous.

- **Port Lockdown**
  A connected port locks temporarily. The player cannot unplug it and must route around it.

- **Cable Heat Bloom**
  Overloaded cables heat nearby modules, making cable paths matter physically.

### Acceptance Criteria

- Events are announced clearly before or as they begin.
- The player can tell what changed without reading a paragraph.
- Each event creates a routing problem, not just a stat penalty.
- Events clean up correctly when finished.

## Phase 3: Buffs, Tradeoffs, And Panic Buttons

Status: **Completed in first implementation pass.**

Implemented:

- Hot-Swap Gloves active ability with cooldown and lockdown override.
- Firewall Overclock active ability with faster shredding and extra heat risk.
- Diagnostic Lens active ability that highlights live outputs and open inputs.
- Ability buttons, keyboard shortcuts, active states, and cooldown display.
- Post-wave recovery buff choice: Patch Reel, Coolant Cache, or Tactical Macros.

Goal: give the player active ways to survive chaos while keeping choices interesting.

### Buff Types

- Temporary active abilities.
- Passive upgrades.
- One-wave modifiers.
- Emergency tools with cooldowns.

### Buff Ideas

- **Hot-Swap Gloves**
  Unplug cables instantly without dropping packets for a short time.

- **Signal Splitter**
  One cable can temporarily feed two inputs, but each branch has reduced capacity.

- **Cryo Foam**
  Freezes one module's temperature, but slows its processing.

- **Packet Preview**
  Shows upcoming packet types on WAN ports.

- **Auto-Clamp**
  Prevents one cable from breaking when overloaded, then goes on cooldown.

- **Emergency Bypass**
  Good packets can skip one intermediate module, but malware can too if misrouted.

- **Firewall Overclock**
  Firewalls shred faster but generate much more heat.

- **Balancer Turbo**
  Load balancers redistribute faster, but only while at least three outputs are connected.

- **Spare Cable Reel**
  Allows one temporary extra cable over an occupied port.

- **Diagnostic Lens**
  Highlights a strong current route for a few seconds.

### Acceptance Criteria

- Buffs are useful during chaos, not only between waves.
- Buffs have visible cooldowns or durations.
- The player has at least one emergency lever during bad events.
- No buff fully removes the need for manual routing.

## Phase 4: Make The Rack More Physical

Status: **Completed in first implementation pass.**

Implemented:

- Drag repositioning for load balancer and firewall blades during prep/recovery.
- Live traffic lockout for rack movement during active waves.
- Custom blade positions persist while playing and after buying additional blades.
- Cable crossing/interference detection.
- Noisy cables visibly pulse, display `NOISE xN`, slow packet travel, spark, and add heat to connected modules.

Goal: make the rack layout itself matter, so the player manages space and cable shape as well as connections.

### Features

- Draggable/repositionable modules during prep phases.
- Optional risky live module movement during waves.
- Rack slots with adjacency effects.
- Cable crossings create interference/noise.
- Cable sag and pathing become meaningful.
- Nearby heat can affect cables and modules.

### Physical Rules

- Too many cable crossings in one area increases signal noise.
- Signal noise can slow packets, reduce firewall accuracy, or increase heat.
- Some slots may cool better than others.
- Some modules may benefit from being near cooling equipment.
- Dense cable layouts can work temporarily but become dangerous if ignored.

### Acceptance Criteria

- Moving a module changes gameplay, not just visuals.
- Messy cable layouts are allowed but risky.
- The player can see where interference or heat is coming from.
- Prep phase becomes a meaningful planning moment.

## Phase 5: Advanced Events And Debuffs

Goal: expand chaos variety once the basic event system is stable.

### Event Ideas

- **Packet Polarity Shift**
  Certain malware packets can only be filtered through matching cable colors.

- **Firewall Desync**
  Firewalls temporarily process only every other malicious packet unless traffic is slowed.

- **Black Ice Pulse**
  A slow dangerous packet destroys the cable it reaches unless routed into a firewall.

- **False Good Packets**
  Some green packets flicker red at the last moment unless inspected.

- **Thermal Inversion**
  Cooling one module heats adjacent modules.

- **Cable Tangle**
  Crossing too many cables creates signal noise and slows traffic.

- **Ransomware Anchor**
  A purple packet sticks inside a module and raises heat until cleaned.

- **Manual Patch Audit**
  Critical ports must be unplugged and replugged before a countdown ends.

- **Spoofed Ports**
  Some input ports temporarily display misleading status.

- **Overclock Storm**
  Packet speed increases, but rewards double.

### Debuff Ideas

- **Sticky Cable**
  A cable takes longer to unplug.

- **Signal Ghosting**
  Packets appear slightly offset from their real cable path.

- **Port Corrosion**
  A port's capacity drops until traffic is routed away for a cooldown period.

- **UI Interference**
  Telemetry updates slower during a wave.

- **Cable Drift**
  Cables sag more over time, increasing crossing risk.

- **Heat Mirage**
  One temperature readout is unreliable until inspected.

### Acceptance Criteria

- Advanced events only appear after the player has learned simpler events.
- Events can combine, but combinations remain readable.
- Debuffs create temporary adaptation, not permanent frustration.

## Phase 6: Boss Waves

Goal: create memorable named threats that stress specific mechanics.

### Boss Concepts

- **The Flood**
  Massive DDoS. Win by splitting traffic evenly rather than brute forcing one route.

- **The Impostor**
  Malware hides as good packets unless scanned.

- **The Furnace**
  Heat generation doubles. Player must rotate load manually.

- **The Leech**
  A packet drains budget until routed into a firewall.

- **The Split Brain**
  The mainframe only accepts packets alternating between two input ports.

- **The Blackout**
  Half the rack cycles offline. Player must chase the active path.

### Acceptance Criteria

- Each boss has one strong identity.
- Each boss teaches or stress-tests one major mechanic.
- Boss warnings and visuals are distinct from regular events.
- Surviving a boss grants a meaningful reward.

## Phase 7: New Modules

Goal: expand strategic options without removing manual play.

### Module Ideas

- **Packet Inspector**
  Reveals hidden malware but adds latency.

- **Traffic Shaper**
  Slows packets on one route, useful for timing and heat control.

- **Quarantine Buffer**
  Holds bad packets temporarily, but overloads if ignored.

- **Cooling Manifold**
  Reduces nearby heat but has no packet ports.

- **Mirror Blade**
  Duplicates good packets for bonus money, but can duplicate malware too.

- **Scrubber**
  Converts some malware into clean packets if fed slowly.

- **Patch Hub**
  Many ports, low capacity. Useful for emergency rerouting.

### Acceptance Criteria

- Every new module creates a distinct routing behavior.
- New modules introduce tradeoffs.
- The player still needs to manually connect and maintain routes.

## Phase 8: Meta Progression And Replayability

Goal: make the game replayable once the moment-to-moment loop is strong.

### Features

- Unlockable starting loadouts.
- Challenge modifiers.
- Score grades.
- Event difficulty tiers.
- Endless mode.
- Daily challenge seed.
- Module unlock tree.
- Cosmetic cable palettes.

### Score Grade Ideas

- Stable Operator.
- Clean Room.
- Scrappy Save.
- Overclock Survivor.
- Meltdown Artist.

### Acceptance Criteria

- Meta progression gives variety, not raw mandatory power.
- Challenge modifiers encourage different routing styles.
- Endless mode remains readable as chaos increases.

## Immediate Build Order

1. Add formal wave phases: prep, active, chaos spike, recovery.
2. Add event banner and event timer.
3. Implement Port Surge.
4. Implement Brownout.
5. Improve cable load visualization.
6. Add Cable Heat Bloom.
7. Add DDoS Rain.
8. Add Port Lockdown.
9. Add first post-wave buff choice.
10. Add two active buffs: Hot-Swap Gloves and Firewall Overclock.
11. Add cable crossing/interference.
12. Add first boss wave: The Flood.

## Balancing Notes

- Early waves should create one problem at a time.
- Mid waves can stack one event plus one environmental pressure.
- Late waves can stack multiple events, but never hide the cause of failure.
- Good panic lasts 10-30 seconds.
- Recovery should be long enough to make a plan, not long enough to become idle.
- A messy but clever solution should work.
- A static perfect solution should eventually break.

## Open Questions

- Should cable colors become functional, cosmetic, or both?
- Should modules be movable only during prep, or also during waves with risk?
- Should packet routing remain deterministic enough for planning, or chaotic enough for improvisation?
- Should the game lean more arcade-like or more sim-like?
- Should the player be allowed to pause during prep?
- Should there be keyboard shortcuts for cable colors, tools, and emergency buffs?

## Working Rule

When adding a feature, ask:

- Does this make the player manually manage lines?
- Does this create readable chaos?
- Does this preserve a way to recover?
- Does this make the rack feel more physical?
- Does this avoid turning the game into passive automation?
