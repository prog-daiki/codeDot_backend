declare namespace NodeJS {
  interface ProcessEnv {
    ADMIN_USER_ID: string;
    DATABASE_URL: string;
    MUX_TOKEN_ID: string;
    MUX_TOKEN_SECRET: string;
  }
}
