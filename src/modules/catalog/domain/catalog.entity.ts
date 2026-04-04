export class Catalog {
    constructor(
        readonly id: string,
        private name: string,
        private status: boolean
    ) { }

    getName() { return this.name; }
    getStatus() { return this.status; }

    rename(name: string) { this.name = name; }
    activate() { this.status = true; }
    deactivate() { this.status = false; }
}
