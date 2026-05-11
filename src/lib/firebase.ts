import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import { getFirestore, type Firestore } from 'firebase/firestore'

type FirebaseEnvConfig = {
  VITE_FIREBASE_API_KEY?: string
  VITE_FIREBASE_AUTH_DOMAIN?: string
  VITE_FIREBASE_PROJECT_ID?: string
  VITE_FIREBASE_STORAGE_BUCKET?: string
  VITE_FIREBASE_MESSAGING_SENDER_ID?: string
  VITE_FIREBASE_APP_ID?: string
}

function getFirebaseEnv(): FirebaseEnvConfig {
  const env = import.meta.env as unknown as FirebaseEnvConfig
  return env
}

function isFirebaseConfigured(env: FirebaseEnvConfig): boolean {
  return Boolean(env.VITE_FIREBASE_API_KEY && env.VITE_FIREBASE_PROJECT_ID && env.VITE_FIREBASE_APP_ID)
}

export type FirebaseClients = {
  app: FirebaseApp
  db: Firestore
}

export function getFirebaseClients(): FirebaseClients | null {
  const env = getFirebaseEnv()
  if (!isFirebaseConfigured(env)) return null

  const app =
    getApps().length > 0
      ? getApps()[0]
      : initializeApp({
          apiKey: env.VITE_FIREBASE_API_KEY!,
          authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
          projectId: env.VITE_FIREBASE_PROJECT_ID!,
          storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
          messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
          appId: env.VITE_FIREBASE_APP_ID!,
        })

  return { app, db: getFirestore(app) }
}

