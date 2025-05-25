import { FLOOR_HEIGHT } from "./constants.js";

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
        timerElement.style.visibility = 'visible';
    }

    #stopTimer() {
        if (this.#intervalHandler) {
            const timerElement = this.#element.querySelector('.timer') as HTMLElement;
            clearInterval(this.#intervalHandler);
            timerElement.style.visibility = 'hidden';
            this.#intervalHandler = null;
        }
    }

    onClickButton() {
        if (this.#buttonClicked) return;
        const expectedArrivalTime = this.#buttonCallback(this.#number, () => {
            this.elevatorIsComing();
        });
        if(expectedArrivalTime == 0){
            return;
        }
        this.#expectedArrivalTime = expectedArrivalTime;
        this.#setButtonClicked();
        this.startTimer();
    }

    elevatorIsComing() {
        this.#setButtonUnClicked();
        this.#stopTimer();
    }

    createFloorElement() : HTMLElement {
        const floorRow = ((document.querySelector('#floor-template') as HTMLTemplateElement)
            .content.cloneNode(true) as DocumentFragment)
            .querySelector('.floor-row') as HTMLElement;
            
        const floorDiv = floorRow.querySelector('.floor') as HTMLElement;
        floorRow.style.height = FLOOR_HEIGHT + 'px';
        floorDiv.style.height = FLOOR_HEIGHT + 'px';
        const button = floorDiv.querySelector('button') as HTMLElement;
        button.textContent = this.#number.toString();

        button.addEventListener('click', () => this.onClickButton());
        return floorRow;
    }
    appendElementTo(parent: HTMLElement) {
        this.#element = parent.appendChild(this.#element);
    }
}

