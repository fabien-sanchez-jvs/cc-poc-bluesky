import { useState, useCallback } from "react";

/**
 * Custom hook pour stocker un state dans le localStorage
 * Le state est JSON stringifié et encodé en base 64
 *
 * @param key - La clé de stockage dans le localStorage
 * @param initialValue - La valeur initiale si aucune donnée en cache
 * @returns [value, setValue] - La valeur et une fonction pour la mise à jour
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);

      if (!item) {
        return initialValue;
      }

      // Décoder depuis base64 et parser le JSON
      const decodedString = atob(item);
      const parsed = JSON.parse(decodedString);

      return parsed as T;
    } catch (error) {
      console.error(`Error reading from localStorage (key: ${key}):`, error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        // Gérer la fonction de mise à jour comme dans useState
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;

        // Mettre à jour le state
        setStoredValue(valueToStore);

        // Encoder en JSON puis en base64 et stocker
        const jsonString = JSON.stringify(valueToStore);
        const encodedString = btoa(jsonString);

        window.localStorage.setItem(key, encodedString);
      } catch (error) {
        console.error(`Error writing to localStorage (key: ${key}):`, error);
      }
    },
    [key, storedValue],
  );

  return [storedValue, setValue];
}
