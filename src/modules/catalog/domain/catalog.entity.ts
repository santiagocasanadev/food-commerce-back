export class Catalog {
    constructor(
        readonly id: string,
        readonly name: string,
        private status: boolean
    ) { }

    getStatus() { return this.status; }

    activate() { this.status = true; }
    deactivate() { this.status = false; }
}
