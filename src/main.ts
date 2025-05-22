import { AppFactory } from "./app_factory.js";
import { DEFAULT_ELEVATORS_NUMBER, DEFAULT_FLOORS_NUMBER } from "./constants.js";

function addBuilding(floorsNum: number, elevatorsNum: number) {
    const elevators = Array.from({ length: elevatorsNum }, () => AppFactory.createElevator());
    const elevatorController =  AppFactory.createElevatorController(elevators);
    const building =  AppFactory.createBuilding(floorsNum, elevatorController);

    let buildingArea = document.querySelector('.buildings-area')!;

    let buildingColumn = ((document.querySelector('#building-template') as HTMLTemplateElement)
        .content.cloneNode(true) as DocumentFragment)
        .querySelector('.building-container-column') as HTMLElement;

    buildingColumn = buildingArea.appendChild(buildingColumn);

    building.appendElementTo(buildingColumn.querySelector('.building-container')!);
    const buildin_container = buildingColumn.querySelector('.building-container')!;
    elevators.forEach(elev => {
        elev.appendElementTo(buildin_container);
    });
    
    const removeButton = buildingColumn.querySelector('.remove-building-button') as HTMLButtonElement;
    removeButton.onclick = () => {
        buildingColumn.remove();
    };
}
addBuilding(DEFAULT_FLOORS_NUMBER, DEFAULT_ELEVATORS_NUMBER);


const add_building_form = document.querySelector('.add-building-form')!;
const addBuildingButton = add_building_form.querySelector('#add-building-button') as HTMLButtonElement;
const floorsInput = add_building_form.querySelector('#floors') as HTMLInputElement;
const elevatorsInput = add_building_form.querySelector('#elevators') as HTMLInputElement;
addBuildingButton.onclick = () => {
    const floors = parseInt(floorsInput.value, 10);
    const elevators = parseInt(elevatorsInput.value, 10);
    if (floors > 0 && elevators > 0) {
        addBuilding(floors, elevators);
        floorsInput.value = '';
        elevatorsInput.value = '';
    } else {
        alert('Please enter valid numbers for floors and elevators.');
    }
};
