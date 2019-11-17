import { EHealth } from "./EHealth";

export class Health {
    private health: EHealth;

    constructor() {
        this.health = EHealth.DOWN;
    }

    /**
     * Get health.
     */
    getHealth() {
        return this.health;
    }

    /**
     * Set health.
     */
    setHealth(health: EHealth) {
        this.health = health;
        return this.health;
    }

    /**
     * Generate JSON object.
     */
    toJson() {
        return {
            "health": this.health
        }
    }
}