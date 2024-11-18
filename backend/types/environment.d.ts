declare global {
    namespace NodeJS {
        interface ProcessEnv {
            NODE_ENV: 'development' | 'production' | 'test';
            PORT?: string;
            DB_USER?: string;
            DB_HOST?: string;
            DB_NAME?: string;
            DB_PASSWORD?: string;
            DB_PORT?: string;
            TEST_DB_USER?: string;
            TEST_DB_HOST?: string;
            TEST_DB_NAME?: string;
            TEST_DB_PASSWORD?: string;
            TEST_DB_PORT?: string;
        }
    }
}

export {};
