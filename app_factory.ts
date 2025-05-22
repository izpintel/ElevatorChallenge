import { Building } from "./building.js";
import { Elevator, ElevatorController } from "./elevator.js";
import { Floor } from "./floor.js";


export class AppFactory {
    static createElevator() {
        return new Elevator();
    }
    static createFloor(number: number, onClick: (floorNumber: number, onCommingCallback: () => void) => number) {
        return new Floor(number, onClick);
    }
    static createBuilding(numFloors: number, elevatorController: ElevatorController) {
        return new Building(numFloors, elevatorController);
    }
    static createElevatorController(elevators: Elevator[]) {
        return new ElevatorController(elevators);
    }
}