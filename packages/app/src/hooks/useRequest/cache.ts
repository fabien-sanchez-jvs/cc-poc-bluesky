/* eslint-disable @typescript-eslint/no-explicit-any */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface PendingRequest<T> {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (error: Error) => void;
}

export const SECOND = 1000;
export const MINUTE = 60 * SECOND;
export const HOUR = 60 * MINUTE;

class ApiCache {
  private cache = new Map<string, CacheEntry<any>>();
  private pendingRequests = new Map<string, PendingRequest<any>>();
  private defaultTTL = 5 * MINUTE;

  /**
   * Récupère une valeur du cache si elle existe et n'est pas expirée
   */
  private getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Stocke une valeur dans le cache
   */
  private setCache<T>(key: string, data: T, ttl?: number): void {
    const timestamp = Date.now();
    const expiresAt = timestamp + (ttl || this.defaultTTL);

    this.cache.set(key, {
      data,
      timestamp,
      expiresAt,
    });
  }

  /**
   * Génère une clé de cache basée sur la fonction et ses paramètres
   */
  private generateCacheKey(functionName: string, params?: any[]): string {
    if (!params || params.length === 0) {
      return functionName;
    }
    return `${functionName}:${JSON.stringify(params)}`;
  }

  /**
   * Exécute une requête avec mise en cache et gestion des appels simultanés
   */
  async request<T>(
    functionName: string,
    requestFn: () => Promise<T>,
    params?: any[],
    ttl?: number
  ): Promise<T> {
    const cacheKey = this.generateCacheKey(functionName, params);

    // Vérifier le cache d'abord
    const cachedData = this.getFromCache<T>(cacheKey);
    if (cachedData !== null) {
      return cachedData;
    }

    // Vérifier s'il y a une requête en cours pour cette clé
    const pendingRequest = this.pendingRequests.get(cacheKey);
    if (pendingRequest) {
      // Retourner la promesse existante
      return pendingRequest.promise;
    }

    // Créer une nouvelle requête
    let resolve: (value: T) => void;
    let reject: (error: Error) => void;

    const promise = new Promise<T>((res, rej) => {
      resolve = res;
      reject = rej;
    });

    // Stocker la requête en cours
    this.pendingRequests.set(cacheKey, {
      promise,
      resolve: resolve!,
      reject: reject!,
    });

    try {
      const result = await requestFn();

      // Mettre en cache le résultat
      this.setCache(cacheKey, result, ttl);

      // Résoudre toutes les promesses en attente
      resolve!(result);

      return result;
    } catch (error) {
      // Rejeter toutes les promesses en attente
      const err = error instanceof Error ? error : new Error(String(error));
      reject!(err);
      throw err;
    } finally {
      // Nettoyer la requête en cours
      this.pendingRequests.delete(cacheKey);
    }
  }

  /**
   * Invalide une entrée spécifique du cache
   */
  invalidate(functionName: string, params?: any[]): void {
    const cacheKey = this.generateCacheKey(functionName, params);
    this.cache.delete(cacheKey);
  }

  /**
   * Invalide toutes les entrées du cache qui commencent par le nom de fonction donné
   */
  invalidateByFunction(functionName: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(functionName)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Vide complètement le cache
   */
  clear(): void {
    this.cache.clear();
    this.pendingRequests.clear();
  }

  /**
   * Nettoie les entrées expirées du cache
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Retourne les statistiques du cache
   */
  getStats() {
    return {
      cacheSize: this.cache.size,
      pendingRequests: this.pendingRequests.size,
      entries: Array.from(this.cache.entries()).map(([key, entry]) => ({
        key,
        timestamp: entry.timestamp,
        expiresAt: entry.expiresAt,
        isExpired: Date.now() > entry.expiresAt,
      })),
    };
  }
}

// Instance globale du cache
export const apiCache = new ApiCache();

// Nettoyage automatique du cache toutes les 10 minutes
setInterval(
  () => {
    apiCache.cleanup();
  },
  10 * 60 * 1000
);
