export class PlatformTenant {
  constructor(
    readonly id: string,
    private slug: string,
    private name: string,
    private dbConnectionUrl: string,
    private active: boolean,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {}

  getSlug() {
    return this.slug;
  }

  getName() {
    return this.name;
  }

  getDbConnectionUrl() {
    return this.dbConnectionUrl;
  }

  isActive() {
    return this.active;
  }

  update(data: {
    slug?: string;
    name?: string;
    dbConnectionUrl?: string;
    active?: boolean;
  }) {
    if (data.slug !== undefined) {
      this.slug = data.slug;
    }

    if (data.name !== undefined) {
      this.name = data.name;
    }

    if (data.dbConnectionUrl !== undefined) {
      this.dbConnectionUrl = data.dbConnectionUrl;
    }

    if (data.active !== undefined) {
      this.active = data.active;
    }
  }
}
