export class DingSound {
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
