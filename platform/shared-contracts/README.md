# @againerp/contracts — Shared Contracts

**Version:** 1.0.0  
**Location:** `againerp-center/platform/shared-contracts/`  
**Status:** ✅ Normalized layout (2026-06-30)

Cross-language DTOs, events, protocols, and error codes for Center, Runtime, and client ERPs.

## Layout

```
shared-contracts/
├── src/
│   ├── dto/           conversation, agents, context
│   ├── events/        platform domain events
│   ├── types/         ID type aliases
│   ├── protocols/     gateway protocol, contract version
│   ├── errors/        AI_ERROR_CODES, PlatformContractError
│   ├── permissions/   operator + agent tool scopes
│   ├── interfaces/    re-exported interface contracts
│   └── index.ts       barrel export
├── schemas/           JSON Schema v1
└── dist/              compiled output
```

Root-level `src/*.ts` files are **compatibility shims** re-exporting from subfolders.

## Build

```bash
npm install && npm run build
```

## Imports

```typescript
import {
  ConversationRequest,
  PROVIDER_IDS,
  CONTRACT_VERSION,
} from "@againerp/contracts";

import { OPERATOR_SCOPES } from "@againerp/contracts/permissions";
```

## MoharazNX link

```json
"@againerp/contracts": "file:../againerp-center/platform/shared-contracts"
```

Replace `apps/web/src/lib/conversation/types.ts` with contract imports (Phase 0 checklist).
