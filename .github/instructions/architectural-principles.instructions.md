---
description: "Use when designing, creating, moving, or reviewing app architecture, folder boundaries, imports, shared modules, core domains, or feature structure. Defines the project's screaming architecture and module extraction rules."
applyTo: "src/app/**/*.{ts,html,scss}"
---

# Architectural Principles

## Core Principle

Organize the application by domain, not by technical artifact type.

- Prefer `core/auth`, `core/navigation`, `core/errors` over global folders such as `services/`, `guards/`, or `models/`
- The folder structure must communicate business intent first
- The directory tree is an outcome of these rules, not the source of truth

## Screaming Architecture

The project structure should make the main domains obvious at first glance.

- `core/` contains cross-cutting domains with reusable behavior
- `features/` contains user-facing business capabilities and pages
- `ui-kit/` contains reusable presentation primitives and compositions
- `layout/` contains the application shell and layout orchestration

Do not optimize the structure for symmetry alone. Optimize it so a new developer can quickly answer where a responsibility belongs.

## Core Domain Modularity

Each folder inside `core/` represents a domain that should be independently understandable and, in principle, extractable into its own library.

A core domain should:

- Own its internal models, services, directives, guards, interceptors, providers, and testing helpers when needed
- Expose a deliberate public API through `index.ts` files where appropriate
- Avoid leaking internal implementation details across domains
- Remain cohesive around one domain purpose

Use this extraction test:

- If the domain were moved to a standalone library, would its responsibilities still make sense together?
- If not, the boundary is probably wrong

## Internal Organization by Responsibility

Inside a domain folder, organize by responsibility when the domain needs it.

- Use subfolders such as `services/`, `directives/`, `interceptors/`, `guards/`, `models/`, `contracts/`, `tokens/`, `testing/`
- Create a new subfolder when a distinct responsibility emerges
- Do not create catch-all folders for unrelated logic

Not every domain needs the same subfolders. The internal structure should follow the domain's real needs.

## Dependency Direction

Respect these dependency rules:

- `features/` may depend on `core/`, `ui-kit/`, and shared Angular/platform primitives
- `layout/` may orchestrate `core/`, `features/`, and `ui-kit/` as needed
- `core/` must never depend on `features/`
- `core/` must never depend on `ui-kit/`
- Cross-domain `core/` collaboration must happen through stable public APIs, not deep imports into internals

When a dependency would invert these rules, the design is wrong. Move the responsibility or introduce a clearer boundary.

## Public API Boundaries

Prefer imports from a domain's public surface over deep imports into its internals.

- Good: importing from a domain root or documented barrel
- Bad: importing from an internal helper path just because it is convenient

This keeps domains replaceable and reduces accidental coupling.

## Placement Heuristics

When adding new code, decide placement with these questions:

1. Which domain owns this behavior?
2. Is it cross-cutting or feature-specific?
3. Is it business logic, UI composition, or app shell orchestration?
4. Does it introduce a new responsibility inside an existing domain?

Use the answers to choose the folder. Do not start from the current tree and look for the nearest empty spot.

## Documentation Rule

Do not document the app with a rigid directory snapshot unless there is a specific temporary need.

- Document the architectural rules that generate the structure
- Document domain boundaries and ownership
- Treat folder names and subfolders as an implementation of these principles

If the tree changes but these principles still hold, the documentation is still correct.

## Contracts and Models

### core/contracts

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

### core/models

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

### Mapper Rule

Never mix external DTOs with internal models. Always map at the boundary.

```typescript
// ✅ Map at the service/repository layer
function toUser(dto: UserDto): User {
  return { id: dto.user_id, fullName: dto.full_name };
}
```

DTOs must never appear in components, feature modules, or ui-kit. Components only consume internal models.