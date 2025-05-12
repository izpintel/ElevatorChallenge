
const ELEVATOR_SPEED = 500; // milliseconds per floor
const STOP_TIME = 2000; // milliseconds to stop at a floor

class DingSound {
    static audio = new Audio('ding.mp3');
    static play() {
        this.audio.currentTime = 0; // Reset sound to start
        this.audio.play().catch(error => {
            console.error('Error playing sound:', error);
        });
    }
}

class Elevator {
    constructor() {
        this.elevatorEl = this.#createElement();
        this.floorHeight = 110;
        this.currentFloor = 0;
        this.queue = [];
        this.isMoving = false;
        this.busy_until = 0;
    }
    #createElement() {
        let elevator_shaftEl = document.createElement('div');
        elevator_shaftEl.className = 'elevator-shaft'; // Added class name for elevator shaft
        let elevator_cabinEl = document.createElement('img');
        elevator_cabinEl.className = 'elevator-cabin';
        elevator_cabinEl.src = 'elv.png'; // Set the source for the elevator cabin image
        elevator_shaftEl.appendChild(elevator_cabinEl);
        return elevator_shaftEl;
        // return elevator_cabinEl; 
    }
    getElement() {
        return this.elevatorEl;
    }
    getCurrentFloor() {
        return this.currentFloor;
    }

    elevatorBusy_until() {
        return Math.max(this.busy_until, Date.now());
    }
    lastFloor() {
        if (this.queue.length === 0) return this.currentFloor;
        return this.queue[this.queue.length - 1];
    }
    calculateArrivalTime(floorNumber) {
        let ret = this.elevatorBusy_until() + (Math.abs(this.currentFloor - floorNumber) * ELEVATOR_SPEED);
        // console.log('calculateArrivalTime', this.currentFloor, floorNumber, ret);
        return ret; // Added return statement to return the calculated arrival time
    }
    elevatorIsBusy() {
        return this.busy_until > Date.now();
    }

    requestFloor(floorNumber, isCommingCallback) {
        if (this.queue.map(request => request.number).includes(floorNumber)) return;
        if (floorNumber === this.currentFloor) {
            isCommingCallback();
            return; 
        }
        let arrivalTime = this.calculateArrivalTime(floorNumber);
        this.busy_until = arrivalTime + STOP_TIME;
        this.queue.push({
            floorNumber: floorNumber,
            isCommingCallback: isCommingCallback
        });
        this.processQueue();
        return arrivalTime;
    }

    async processQueue() {
        if (this.isMoving || this.queue.length === 0) return;

        this.isMoving = true;
        const { floorNumber: floorNumber, isCommingCallback: isCommingCallback } = this.queue.shift();

        await this.moveTo(floorNumber); // Pass the floor number
        isCommingCallback(); // Call the callback function
        DingSound.play(); // Play the sound
        await new Promise(resolve => setTimeout(resolve, STOP_TIME)); // wait for elevator to stop
        this.isMoving = false;
        this.processQueue(); // Continue to next floor
    }

    moveTo(floorNumber) {
        return new Promise(resolve => {
            const bottom = (floorNumber - 1) * this.floorHeight;
            const time_to_move = Math.abs(this.currentFloor - floorNumber) * ELEVATOR_SPEED;
            let elevator_cabinEl = this.elevatorEl.querySelector('.elevator-cabin');
            elevator_cabinEl.style.transitionDuration = `${time_to_move}ms`;
            elevator_cabinEl.style.bottom = `${bottom}px`;
            elevator_cabinEl.style.transitionTimingFunction = 'linear';
            this.currentFloor = floorNumber;
            setTimeout(resolve, time_to_move); // wait for animation to complete
        });
    }
}


class ElevatorController {
    constructor(elevators) {
        this.elevators = elevators;
        this.activeRequests = new Set();
    }
    chooseElevator(floorNumber) {
        return this.elevators.reduce((bestElevator, elevator) =>
            elevator.calculateArrivalTime(floorNumber) < bestElevator.calculateArrivalTime(floorNumber)
                ? elevator
                : bestElevator
        );
    }
    requestFloor(floorNumber, onComingCallback) {
        if (this.activeRequests.has(floorNumber)) return;
        this.activeRequests.add(floorNumber);
        const elevator = this.chooseElevator(floorNumber);
        const handleElevatorArrival = (...args) => {
            this.activeRequests.delete(floorNumber);
            onComingCallback(...args);
        };
        return elevator.requestFloor(floorNumber, handleElevatorArrival);
    }
}

class ElevatorFactory {
    static createElevator(elementId, floorHeight) {
        return new Elevator(elementId, floorHeight);
    }
}
// class CountDownTimer {
//     constructor(duration, onStepCallback = () => {}, onEndCallback= () => {}) {
//         this.onStepCallback = onStepCallback; // Store the onStepCallback
//         this.onEndCallback = onEndCallback;
//         this.duration = duration;
//         this.remainingTime = duration;
//         this.element = document.createElement('span');
//     }
//     start() {
//         this.updateDisplay();              
//         let timer = window.setInterval( () => {
//             if (this.remainingTime < 0) return;
//             this.remainingTime--;
//             this.updateDisplay();
//         }, 1000);
//         setTimeout(() => {
//             clearInterval(timer);
//             this.element.textContent = '';
//             this.onEndCallback();
//         }, this.duration * 1000);
//     }
//     updateDisplay() {
//         this.element.textContent = this.remainingTime;
//     }
//     getElement() {
//         return this.element;
//     }
//     getRemainingTime() {
//         return this.remainingTime;
//     }
// }


// class CountDownTimer {
//     constructor(duration, onStepCallback = () => { }, onEndCallback = () => { }) {
//         this.intervalNumber = null;
//         this.onStepCallback = onStepCallback;
//         this.onEndCallback = onEndCallback;
//         this.duration = duration;
//         this.remainingTime = duration;
//     }
//     start() {
//         this.intervalNumber = window.setInterval(() => {
//             console.log("remainingTime: ", this.remainingTime);
//             if (this.remainingTime >= 0) {
//                 this.onStepCallback(this.remainingTime);
//                 this.remainingTime--;
//             } else {
//                 this.onEndCallback();
//                 clearInterval(this.intervalNumber);
//                 return;
//             }
//             // console.assert(this.remainingTime >= 0, "remainingTime should be greater than or equal to 0");
//         }, 1000);
//         // setTimeout(() => {
//         //     window.clearInterval(timer);
//         //     this.onEndCallback();
//         // }, this.duration * 1000);
//     }
//     getRemainingTime() {
//         return this.remainingTime;
//     }
// }



class Floor {
    constructor(number, onClickCallback) {
        this.number = number;
        this.element = this.createFloorElement(onClickCallback);
        this.ButtonClicked = false;
        this.buttonCallback = onClickCallback;
        this.expectedArrivalTime = 0;
        this.intervalNumber = null;
    }
    setButtonClicked(button) {
        this.ButtonClicked = true;
        button.classList.add('clicked');
    }
    setButtonUnClicked(button) {
        this.ButtonClicked = false;
        button.classList.remove('clicked');
    }
    
    startTimer() {
        if(this.expectedArrivalTime < Date.now()){
            return
        }
        this.updateTimer();
        this.intervalNumber = setInterval(() => {
            if (this.expectedArrivalTime > Date.now()) {
                this.updateTimer();
            } else {
                this.stopTimer();
            }
        }, 1000);
    }

    updateTimer() {
        const timerElement = this.element.querySelector('.timer');
        const remainingTime = this.expectedArrivalTime ? Math.floor((this.expectedArrivalTime - Date.now()) / 1000) : 0;
        timerElement.textContent = remainingTime;
    }

    stopTimer() {
        if (this.intervalNumber) {
            const timerElement = this.element.querySelector('.timer');
            clearInterval(this.intervalNumber);
            timerElement.textContent = '';
            this.intervalNumber = null;
        }
    }

    onClickButton() {
        if (this.ButtonClicked) return;
        this.setButtonClicked(this.button);
        this.expectedArrivalTime = this.buttonCallback(this.number, () => {
            this.elevatorIsComing();
        });
        this.startTimer();
    }

    elevatorIsComing() {
        this.setButtonUnClicked(this.button);
        this.stopTimer();
    }

    createFloorElement(onClick) {
        const floorRow = document.createElement('div');
        floorRow.className = 'floor-row';

        const floorDiv = document.createElement('div');
        floorDiv.className = 'floor';

        const timerElm = document.createElement('span');
        timerElm.className = 'timer';
        timerElm.style.backgroundColor = 'white';
        floorDiv.appendChild(timerElm); // Append timerElm to floorDiv

        this.button = document.createElement('button');
        this.button.className = 'metal linear';
        this.button.textContent = this.number;

        this.button.addEventListener('click', () => this.onClickButton());

        floorDiv.appendChild(this.button);
        floorRow.appendChild(floorDiv);

        return floorRow;
        // return floorDiv;
    }

    // setTimer(duration) {
    //     const timerElement = this.element.querySelector('.timer');
    //     timerElement.textContent = duration;
    //     console.log('setTimer', duration);
    //     const timer = new CountDownTimer(duration, (remainingTime) => {
    //         timerElement.textContent = remainingTime;
    //     }, () => {
    //         timerElement.textContent = '';
    //     });
    //     timer.start();
    // }

    getElement() {
        return this.element;
    }

}

class FloorFactory {
    static createFloor(number, onClick) {
        return new Floor(number, onClick);
    }
}

class Building {
    constructor(numFloors, elevatorController) {
        this.buildingEl = this.createBuildingElement();
        this.numFloors = numFloors;
        this.elevatorController = elevatorController; // Update to use elevatorController
        this.renderFloors();
    }
    createBuildingElement() {
        const buildingEl = document.createElement('div');
        buildingEl.className = 'building';
        return buildingEl;
    }
    getElement() {
        return this.buildingEl;
    }

    renderFloors() {
        for (let i = 1; i <= this.numFloors; i++) {
            const floor = FloorFactory.createFloor(i, (floorNumber, onCommingCallback) => {
                return this.elevatorController.requestFloor(floorNumber, onCommingCallback);
            });
            this.buildingEl.appendChild(floor.getElement());
        }
    }
}
