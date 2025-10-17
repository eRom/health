'use client'

import { useEffect } from 'react'

/**
 * Composant pour migrer de StorageType.persistent vers navigator.storage
 * Nettoie les anciens caches et configure l'API moderne
 */
export function StorageMigration() {
  useEffect(() => {
    // Vérifier si l'API navigator.storage est disponible
    if (!("storage" in navigator)) {
      console.warn("navigator.storage API not available");
      return;
    }

    // Nettoyer les anciens caches qui utilisent StorageType.persistent
    // if ('caches' in window) {
    //   caches.keys().then((cacheNames) => {
    //     const oldCacheNames = cacheNames.filter(name =>
    //       name.includes('persistent') ||
    //       name.includes('serwist') ||
    //       name.includes('workbox')
    //     )

    //     return Promise.all(
    //       oldCacheNames.map(cacheName => caches.delete(cacheName))
    //     )
    //   }).then(() => {
    //     console.log('Old caches cleaned up')
    //   }).catch((error) => {
    //     console.error('Error cleaning up old caches:', error)
    //   })
    // }

    // Configurer l'API moderne de stockage
    if ("storage" in navigator && "estimate" in navigator.storage) {
      navigator.storage
        .estimate()
        .then((estimate) => {
          console.log("Storage estimate:", estimate);
        })
        .catch((error) => {
          console.error("Error getting storage estimate:", error);
        });
    }

    // Demander un stockage persistant si nécessaire
    if ("storage" in navigator && "persist" in navigator.storage) {
      navigator.storage
        .persist()
        .then((persistent) => {
          if (persistent) {
            console.log("Storage is persistent");
          } else {
            console.log("Storage is not persistent");
          }
        })
        .catch((error) => {
          console.error("Error checking storage persistence:", error);
        });
    }
  }, [])

  return null
}
