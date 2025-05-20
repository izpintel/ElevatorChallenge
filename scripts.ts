
const ELEVATOR_SPEED = 500; // milliseconds per floor
const STOP_TIME = 2000; // milliseconds to stop at a floor
const FLOOR_HEIGHT = 110; // height of each floor in pixels

class DingSound {
    static audio = (() => {
        let audio = new Audio('ding.mp3');
        audio.preload = "none";
        return audio;})();
    static play() {
        this.audio.currentTime = 0; // Reset sound to start
        this.audio.play().catch(error => {
            console.error('Error playing sound:', error);
        });
    }
}


type ElevatorRequest = {
    floorNumber: number;
    isCommingCallback: () => void;
};

export class Elevator {
    #busy_until: number; // Declare the private field
    #queue: ElevatorRequest[];
    #currentFloor: number;
    #isMoving: boolean;
    #elevatorEl: HTMLElement;

    constructor() {
        this.#elevatorEl = this.#createElement();
        this.#currentFloor = 0;
        this.#queue = [];
        this.#isMoving = false;
        this.#busy_until = 0;
    }
    #createElement() {
        let elevator_shaftEl = document.createElement('div');
        elevator_shaftEl.className = 'elevator-shaft'; // Added class name for elevator shaft
        let elevator_cabinEl = document.createElement('img');
        elevator_cabinEl.className = 'elevator-cabin';
        elevator_cabinEl.src = 'elv.png'; // Set the source for the elevator cabin image
        elevator_shaftEl.appendChild(elevator_cabinEl);
        return elevator_shaftEl;
    }
    getElement() {
        return this.#elevatorEl;
    }
    getCurrentFloor() {
        return this.#currentFloor;
    }

    busyUntil() {
        return Math.max(this.#busy_until, Date.now());
    }
    lastFloor() {
        if (this.#queue.length === 0) return this.#currentFloor;
        return this.#queue[this.#queue.length - 1];
    }
    calculateArrivalTime(floorNumber: number) {
        return this.busyUntil() + (Math.abs(this.#currentFloor - floorNumber) * ELEVATOR_SPEED);
    }

    requestFloor(floorNumber: number, isCommingCallback: () => void): number {
        if (this.#queue.map(request => request.floorNumber).includes(floorNumber)) return 0;
        if (floorNumber === this.#currentFloor) {
            isCommingCallback();
            return Date.now(); 
        }
        let arrivalTime = this.calculateArrivalTime(floorNumber);
        this.#busy_until = arrivalTime + STOP_TIME;
        this.#queue.push({
            floorNumber: floorNumber,
            isCommingCallback: isCommingCallback
        });
        this.#processQueue();
        return arrivalTime;
    }

    async #processQueue() {
        if (this.#isMoving || this.#queue.length === 0) return;

        this.#isMoving = true;
        const { floorNumber, isCommingCallback } = this.#queue.shift() as ElevatorRequest;

        await this.#moveTo(floorNumber); // Pass the floor number
        isCommingCallback(); // Call the callback function
        DingSound.play(); // Play the sound
        await new Promise(resolve => setTimeout(resolve, STOP_TIME)); // wait for elevator to stop
        this.#isMoving = false;
        this.#processQueue(); // Continue to next floor
    }

    #moveTo(floorNumber: number) {
        return new Promise(resolve => {
            const bottom = (floorNumber - 1) * FLOOR_HEIGHT;
            const time_to_move = Math.abs(this.#currentFloor - floorNumber) * ELEVATOR_SPEED;
            let elevator_cabinEl = this.#elevatorEl.querySelector('.elevator-cabin') as HTMLElement;
            elevator_cabinEl.style.transitionDuration = `${time_to_move}ms`;
            elevator_cabinEl.style.bottom = `${bottom}px`;
            elevator_cabinEl.style.transitionTimingFunction = 'linear';
            this.#currentFloor = floorNumber;
            setTimeout(resolve, time_to_move); // wait for animation to complete
        });
    }
}


export class ElevatorController {
    elevators: Elevator[];
    activeRequests: Set<number>;
    constructor(elevators: Elevator[]) {
        this.elevators = elevators;
        this.activeRequests = new Set<number>();
    }
    #chooseElevator(floorNumber: number) {
        return this.elevators.reduce((bestElevator, elevator) =>
            elevator.calculateArrivalTime(floorNumber) < bestElevator.calculateArrivalTime(floorNumber)
                ? elevator
                : bestElevator
        );
    }
    requestFloor(floorNumber: number, onComingCallback: (...args: any[]) => void = () => {})  {
        if (this.activeRequests.has(floorNumber)) return 0;
        this.activeRequests.add(floorNumber);
        const elevator = this.#chooseElevator(floorNumber);
        const handleElevatorArrival = (...args: any[]) => {
            this.activeRequests.delete(floorNumber);
            onComingCallback(...args);
        };
        return elevator.requestFloor(floorNumber, handleElevatorArrival);
    }
}

export class ElevatorFactory {
    static createElevator() {
        return new Elevator();
    }
}

export class Floor {
    #number: number;
    #element : HTMLElement;
    #buttonClicked : boolean;
    #buttonCallback: (floorNumber: number, onCommingCallback: () => void) => number;
    #expectedArrivalTime : number;
    #intervalHandler: number | null;
    constructor(number: number, onClickCallback: (floorNumber: number, onCommingCallback: () => void) => number) {
        this.#number = number;
        this.#element = this.createFloorElement();
        this.#buttonClicked = false;
        this.#buttonCallback = onClickCallback;
        this.#expectedArrivalTime = 0;
        this.#intervalHandler = null;
    }
    #setButtonClicked() {
        const button = this.#element.querySelector('button') as HTMLElement;
        this.#buttonClicked = true;
        button.classList.add('clicked');
    }
    #setButtonUnClicked() {
        const buttonElm = this.#element.querySelector('button') as HTMLElement;
        this.#buttonClicked = false;
        buttonElm.classList.remove('clicked');
    }
    
    startTimer() {
        if(this.#expectedArrivalTime < Date.now()){
            return
        }
        this.#updateTimer();
        this.#intervalHandler = setInterval(() => {
            if (this.#expectedArrivalTime > Date.now()) {
                this.#updateTimer();
            } else {
                this.#stopTimer();
            }
        }, 1000);
    }

    #updateTimer() {
        const timerElement = this.#element.querySelector('.timer') as HTMLElement;
        const remainingTime = this.#expectedArrivalTime ? Math.floor((this.#expectedArrivalTime - Date.now()) / 1000) : 0;
        timerElement.textContent = remainingTime.toString();
    }

    #stopTimer() {
        if (this.#intervalHandler) {
            const timerElement = this.#element.querySelector('.timer') as HTMLElement;
            clearInterval(this.#intervalHandler);
            timerElement.textContent = '';
            this.#intervalHandler = null;
        }
    }

    onClickButton() {
        if (this.#buttonClicked) return;
        this.#setButtonClicked();
        this.#expectedArrivalTime = this.#buttonCallback(this.#number, () => {
            this.elevatorIsComing();
        });
        this.startTimer();
    }

    elevatorIsComing() {
        this.#setButtonUnClicked();
        this.#stopTimer();
    }

    createFloorElement() : HTMLElement {
        const floorRow = document.createElement('div');
        floorRow.className = 'floor-row';

        const floorDiv = document.createElement('div');
        floorDiv.className = 'floor';

        const timerElm = document.createElement('span');
        timerElm.className = 'timer';
        timerElm.style.backgroundColor = 'white';
        floorDiv.appendChild(timerElm); // Append timerElm to floorDiv

        const button = document.createElement('button');
        button.className = 'metal linear';
        button.textContent = this.#number.toString();

        button.addEventListener('click', () => this.onClickButton());

        floorDiv.appendChild(button);
        floorRow.appendChild(floorDiv);

        return floorRow;
    }
    getElement() : HTMLElement {
        return this.#element;
    }
}

export class FloorFactory {
    static createFloor(number: number, onClick: (floorNumber: number, onCommingCallback: () => void) => number) : Floor {
        return new Floor(number, onClick);
    }
}

export class Building {
    buildingEl: HTMLDivElement;
    numFloors: number;
    elevatorController: ElevatorController;
    constructor(numFloors: number, elevatorController: ElevatorController) {
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
            const floor = FloorFactory.createFloor(i, (floorNumber: number, onCommingCallback: () => void) => {
                return this.elevatorController.requestFloor(floorNumber, onCommingCallback);
            });
            this.buildingEl.appendChild(floor.getElement());
        }
    }
}

export class BuildingFactory {
    static createBuilding(numFloors: number, elevatorController: ElevatorController) {
        return new Building(numFloors, elevatorController);
    }
}

export class Factory {
    static createElevator() {
        return ElevatorFactory.createElevator();
    }
    static createFloor(number: number, onClick: (floorNumber: number, onCommingCallback: () => void) => number) {
        return FloorFactory.createFloor(number, onClick);
    }
    static createBuilding(numFloors: number, elevatorController: ElevatorController) {
        return BuildingFactory.createBuilding(numFloors, elevatorController);
    }
    static createElevatorController(elevators: Elevator[]) {
        return new ElevatorController(elevators);
    }
}

