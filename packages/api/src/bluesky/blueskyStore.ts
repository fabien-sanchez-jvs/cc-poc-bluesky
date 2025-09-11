export class BlueskyStore<T> {
  private data = new Map<string, T>();

  set(key: string, value: T): void {
    this.data.set(key, value);
  }

  get(key: string): T | undefined {
    return this.data.get(key);
  }

  del(key: string): boolean {
    return this.data.delete(key);
  }
}
