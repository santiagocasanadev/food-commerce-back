export class Catalog {
    constructor(
        readonly id: string,
        readonly name: string,
        private active: boolean
    ) { }

    activate() { this.active = true; }
    desactivate() { this.active = false; }
}
