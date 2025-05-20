import {Building, Factory, ElevatorFactory} from "./scripts.js"

let buildingUniqueID = 0;
export function addBuilding(floorsNum: number, elevatorsNum: number) {
    buildingUniqueID++;
    const elevators = Array.from({ length: elevatorsNum }, () => ElevatorFactory.createElevator());
    const elevatorController =  Factory.createElevatorController(elevators);
    const building = new Building(floorsNum, elevatorController);

    const buildingArea = document.querySelector('.buildings-area')!;
    {

        const buildingColumn = (document.querySelector('#building-template') as HTMLTemplateElement).content.cloneNode(true) as DocumentFragment;
        (buildingColumn.querySelector('.building-container-column') as HTMLElement).id = `building-column${buildingUniqueID}`;
        
        buildingArea.appendChild(buildingColumn);
    }
    const buildingColumn = buildingArea.querySelector(`#building-column${buildingUniqueID}`)!;
    buildingColumn.querySelector('.building-container')!.appendChild(building.getElement());
    elevators.forEach(elev => {
        buildingColumn.querySelector('.building-container')!.appendChild(elev.getElement());
    });
    
    const removeButton = buildingColumn.querySelector('.remove-building-button') as HTMLButtonElement;
    removeButton.onclick = () => {
        buildingColumn.remove();
    };
}
addBuilding(16, 3);


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
