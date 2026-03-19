declare global {
  interface ImportMetaEnv {
    readonly MODE?: string;
    // Add more env vars here as needed for tests or runtime.
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

export {};
