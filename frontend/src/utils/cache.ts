export interface CacheEntry {
    data: any;
    timestamp: number;
}

const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in ms

export class YelpCache {
    private static cache: Map<string, CacheEntry> = new Map();

    static generateKey(params: any): string {
        return JSON.stringify(params);
    }

    static get(key: string): any | null {
        const entry = this.cache.get(key);
        if (!entry) return null;

        if (Date.now() - entry.timestamp > CACHE_EXPIRY) {
            this.cache.delete(key);
            return null;
        }

        return entry.data;
    }

    static set(key: string, data: any): void {
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
        });
    }
}
