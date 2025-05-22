import { AppFactory } from "./app_factory.js";
import { ElevatorController } from "./elevator.js";

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
    appendElementTo(parent: HTMLElement) {
        this.buildingEl = parent.appendChild(this.buildingEl);
    }
    renderFloors() {
        for (let i = 1; i <= this.numFloors; i++) {
            const floor = AppFactory.createFloor(i, (floorNumber: number, onCommingCallback: () => void) => {
                return this.elevatorController.requestFloor(floorNumber, onCommingCallback);
            });
            floor.appendElementTo(this.buildingEl);
        }
    }
}
