import { GameState } from './GameState';
import { GameController } from '../gameController.service';

export class ShootingState implements GameState {

    private readonly MAX_INITIAL_SPEED = 5;
    private readonly MAX_HOLD_TIME_MS = 2000;
    private readonly INTERVAL_DELAY_MS = 100;

    private timer: any;
    private initialSpeedCounter = 0;
    private gameController : GameController;

    constructor(gameController: GameController) {
        this.gameController = gameController;
    }

    onMouseDown(event: any): void {
        this.timer = setInterval(() => {
            if (this.initialSpeedCounter < this.MAX_INITIAL_SPEED) {
                this.initialSpeedCounter += this.MAX_INITIAL_SPEED / (this.MAX_HOLD_TIME_MS / this.INTERVAL_DELAY_MS);
            }
        }, this.INTERVAL_DELAY_MS);
    }

    onMouseUp(event: any): void {
        clearInterval(this.timer);
        this.gameController.getCurlingStones()[this.gameController.getCurlingStones().length - 1].velocity.
            add(new THREE.Vector3(0, 0, -this.initialSpeedCounter));
        this.initialSpeedCounter = 0;
    }

    onMouseMove(event: any): void {
        //Do nothing
    }

}