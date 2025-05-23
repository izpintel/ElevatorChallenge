# Elevator Challenge

An interactive elevator simulation built with TypeScript and object-oriented design.

## 🏗️ Project Description

This project simulates a smart multi-elevator system within a building. Each building can be dynamically configured with any number of floors and elevators. Users can request elevators by clicking floor buttons, and the system dispatches elevators based on a smart queueing algorithm designed to minimize waiting time.

---

## 🧱 Architecture Overview

The application is built using **object-oriented programming (OOP)** principles and adheres to modular design. All components are implemented as distinct classes with clear responsibilities.

### Key Classes:

| Class              | Responsibility |
|-------------------|----------------|
| `Elevator`         | Represents a single elevator cabin, maintains state and movement logic. |
| `Floor`            | Represents a floor in a building, handles UI interactions and timers. |
| `Building`         | Manages all floors and connects them with elevators via a controller. |
| `ElevatorController` | Decides which elevator should serve each floor request, manages active requests. |
| `AppFactory`       | Implements the **Factory Pattern** to generate elevators, floors, controllers, and buildings. |
| `DingSound`        | Handles audio feedback when elevator arrives. |
| `constants.ts`     | Stores configurable constants such as elevator speed and stop duration. |

Each class is responsible for its own DOM manipulation using vanilla JavaScript (no frameworks).

---

## 🔄 Main Algorithm: Elevator Dispatch & Queue Management

The core logic lies in the `ElevatorController` class and the internal queue of each `Elevator`.

### Elevator Request Flow:
1. When a floor button is clicked, it checks if the floor is already in a queue or currently being served.
2. The controller selects the best elevator based on **estimated arrival time** (`calculateArrivalTime()`), taking into account:
   - Current floor of the elevator
   - Estimated busy time (current queue)
   - Travel time per floor
3. The selected elevator receives the floor request and adds it to its internal queue.
4. The elevator sequentially processes its queue, moving floor-by-floor with animation and stopping at each destination for a fixed duration.

This system ensures:
- No duplicate requests per floor
- Smart scheduling based on minimal arrival time
- Independent handling of multiple elevators in parallel

---

## 🧪 Features

- Multiple buildings with separate elevator systems
- Dynamic addition of buildings via UI
- Visual countdown timer on each floor for elevator arrival
- Animated elevator movement with per-floor transition speed
- Audio notification (`ding.mp3`) on arrival
- Responsive, extensible codebase using modern ES modules

---

## 🚀 How to Run

### 1. Build the project:

```bash
npm run build
```

### 2. Start a local development server:

```bash
npm run start
```

Then open your browser at `http://localhost:3000`.
