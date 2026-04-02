---
applyTo: "src/app/core/**/*.ts"
---

# Architecture — Contracts and Models

## core/contracts

Agreements with external layers: APIs, SDKs, third-party providers.

- File naming: `*.contract.ts` or `*.dto.ts`
- These types mirror external data shapes exactly — do not add business logic here

```typescript
// core/contracts/user.contract.ts
export interface UserDto {
  user_id: string;
  full_name: string;
}
```

## core/models

Internal domain models. These are the types the application works with.

- File naming: `*.model.ts`, `*.value.ts`, or `*.types.ts`
- These types reflect domain concepts, not API shapes

```typescript
// core/models/user.model.ts
export interface User {
  id: string;
  fullName: string;
}
```

## Mapper Rule

Never mix external DTOs with internal models. Always map at the boundary.

```typescript
// ✅ Map at the service/repository layer
function toUser(dto: UserDto): User {
  return { id: dto.user_id, fullName: dto.full_name };
}
```

DTOs must never appear in components, feature modules, or ui-kit. Components only consume internal models.
