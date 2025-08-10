import { defineCliConfig } from '@prisma/cli';

export default defineCliConfig({
  seed: {
    exec: 'ts-node --compiler-options "{\"module\":\"CommonJS\"}" prisma/seed.ts',
  },
});
