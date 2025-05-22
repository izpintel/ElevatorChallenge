import {DingSound} from "./sound.js";
import { ELEVATOR_SPEED, FLOOR_HEIGHT, STOP_TIME } from "./constants.js"

type ElevatorRequest = {
    floorNumber: number;
    isCommingCallback: () => void;
    arrivalTime?: number;
    isComming?: boolean;
    isMoving?: boolean;
    isDone?: boolean;
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

    appendElementTo(parent: Element) {
        this.#elevatorEl = parent.appendChild(this.#elevatorEl);
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
        if (floorNumber === this.#currentFloor 
            || this.#queue.map(request => request.floorNumber).includes(floorNumber))
            return 0;
        
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
        this.#currentFloor = floorNumber;
        isCommingCallback(); // Call the callback function
        DingSound.play(); // Play the sound
        await new Promise(resolve => setTimeout(resolve, STOP_TIME)); // wait for elevator to stop
        this.#isMoving = false;
        this.#processQueue(); // Continue to next floor
    }

    async #moveTo(floorNumber: number) {
        await new Promise(resolve => {
            const bottom = (floorNumber - 1) * FLOOR_HEIGHT;
            const time_to_move = Math.abs(this.#currentFloor - floorNumber) * ELEVATOR_SPEED;
            let elevator_cabinEl = this.#elevatorEl.querySelector('.elevator-cabin') as HTMLElement;
            elevator_cabinEl.style.transitionDuration = `${time_to_move}ms`;
            elevator_cabinEl.style.bottom = `${bottom}px`;
            elevator_cabinEl.style.transitionTimingFunction = 'linear';
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
        const elevator = this.#chooseElevator(floorNumber);
        this.activeRequests.add(floorNumber);
        const handleElevatorArrival = (...args: any[]) => {
            this.activeRequests.delete(floorNumber);
            onComingCallback(...args);
        };
        const arrivalTime = elevator.requestFloor(floorNumber, handleElevatorArrival);
        if(arrivalTime === 0) this.activeRequests.delete(floorNumber);
        return arrivalTime;
        
    }
}
