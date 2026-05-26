# Changelog

All notable changes to the HighLevel Voice AI Agent Optimizer.

## [1.0.0] - 2026-05-26

### ⚙️ Maintenance

- Update deps ([a92c987](https://github.com/chitrank2050/agent-optimizer/commit/a92c987cd3aca3052b9ede095de11760b1841a62))
- Wip ([e5f7207](https://github.com/chitrank2050/agent-optimizer/commit/e5f7207f8f2920f8e485a58ce70aac8a0f117435))
- Polish final deliverable notes ([e6985d2](https://github.com/chitrank2050/agent-optimizer/commit/e6985d2567c2a6ec57d47f8d0963c05b6edeac6e))
- Upgrade postgres image to version 18 and update data volume path ([0be51e5](https://github.com/chitrank2050/agent-optimizer/commit/0be51e5dab5d057d802a2a1c02bad0245723c935))
- Simplify highlevel sandbox env names ([91f30ac](https://github.com/chitrank2050/agent-optimizer/commit/91f30ac07ed2efc21e00e4388ad029f04dd3be83))
- Use provider neutral llm env names ([03a8243](https://github.com/chitrank2050/agent-optimizer/commit/03a824342e645b8b44e7182c850508a8752c6933))
- Remove redundant CORS_ORIGINS environment variable ([a91577f](https://github.com/chitrank2050/agent-optimizer/commit/a91577f6310d8edfd1eb79767154a1165a247fe2))
- Standardize linting with ESLint, update project configuration, and refactor analysis logic ([58c8c58](https://github.com/chitrank2050/agent-optimizer/commit/58c8c58d872d794d7ebb15ccfc89de2341b4c039))
- Implement project-wide code quality improvements ([e79b057](https://github.com/chitrank2050/agent-optimizer/commit/e79b057ad40ceba760718a6f6c1de04edc2f774b))
- Configure git user identity for docs workflow actions ([d006367](https://github.com/chitrank2050/agent-optimizer/commit/d006367c834508a2cbda921f46ead5aa23ae5d87))

### 🐛 Bug Fixes

- Migrate prisma config to v7 ([0d8a9ad](https://github.com/chitrank2050/agent-optimizer/commit/0d8a9ad4182c34cbcdbca9e509eaccc6a2825ed0))
- Harden local runtime startup ([fa08af9](https://github.com/chitrank2050/agent-optimizer/commit/fa08af974e846c5db06c5aa5b97ef422bdb68f78))
- Resolve root .env file path using absolute path in prisma configuration ([4474439](https://github.com/chitrank2050/agent-optimizer/commit/4474439bbe0f7521d5fb03f9683a78fe0be59c08))
- Align highlevel voice agent pagination ([bcf2427](https://github.com/chitrank2050/agent-optimizer/commit/bcf242781f0a9695ff0b026db78d87ac09078dc2))
- Cascade delete agent-related analytics data and update API prefixing and LLM response format schema ([87e7162](https://github.com/chitrank2050/agent-optimizer/commit/87e7162c046547e4ef3105379f3d4d4ddef9d65a))

### 👷 CI/CD & Infra

- Add E2E testing job, include linting in verify job, and update workflow trigger path filters ([b1e63d7](https://github.com/chitrank2050/agent-optimizer/commit/b1e63d7b4cd78d196ae02b881133f247a73afce7))

### 📚 Documentation

- Document transcript analysis phase ([77a5fb1](https://github.com/chitrank2050/agent-optimizer/commit/77a5fb185b41e4b25f1dde4386f51573a2a36151))
- Document optimization loop phase ([39ce677](https://github.com/chitrank2050/agent-optimizer/commit/39ce677761f4880943da119a67eb7ca80d4f5d5f))
- Add install demo and qa notes ([e110aa9](https://github.com/chitrank2050/agent-optimizer/commit/e110aa939a965ec612abf82010ff5205d64316fe))
- Present optimizer as finished product ([b5b7633](https://github.com/chitrank2050/agent-optimizer/commit/b5b7633b6df43bda0533e09b3c711fe7d07f21fd))
- Add module and component file docstrings ([59787bb](https://github.com/chitrank2050/agent-optimizer/commit/59787bb4737678b7c5fd403f3898dda72c6d09ed))
- Polish submission and deployment guides ([6e61487](https://github.com/chitrank2050/agent-optimizer/commit/6e6148736581fa22ba54114d6aa05cc214d09d0f))
- Add mkdocs documentation site ([938b07a](https://github.com/chitrank2050/agent-optimizer/commit/938b07a57e0927e0d23175ecbfa1e1c513ead2e8))
- Slim readme and defer details to docs ([d0f330b](https://github.com/chitrank2050/agent-optimizer/commit/d0f330bdfdb5d72efe40c9994214e50c32530c27))
- Refine readme presentation ([1484913](https://github.com/chitrank2050/agent-optimizer/commit/148491332d3b5f46dbf67b94322e8b9d2dfed84d))
- Expand readme governance sections ([737b300](https://github.com/chitrank2050/agent-optimizer/commit/737b300a4def448ff354f9f5fcea1806b36bc75f))
- Split setup details into guides ([fdc3eb1](https://github.com/chitrank2050/agent-optimizer/commit/fdc3eb157dd7c571b47afcf7fcfaeab8f92f2605))
- Link published documentation in readme ([6925b76](https://github.com/chitrank2050/agent-optimizer/commit/6925b766ad8a0dc8a3e0b1bb9b3050e9a7c56593))

### 🚀 Features

- Added prettier, .gitignore ([c9c7be0](https://github.com/chitrank2050/agent-optimizer/commit/c9c7be065981efa8c7b6a7f94cfab0b5fda037ed))
- Init docker ([4175f40](https://github.com/chitrank2050/agent-optimizer/commit/4175f40cab0104e62a5cb52b4d70a03f8eb8157b))
- Turbo and pnpm init ([df0bea2](https://github.com/chitrank2050/agent-optimizer/commit/df0bea271a6bb3bee74e64263eb5cf5927a1d019))
- Initialize monorepo with NestJS API, Vue web app, and shared contract packages ([c1a07fc](https://github.com/chitrank2050/agent-optimizer/commit/c1a07fcbe4ba38fb2330b99c4e2aa034bd4edd12))
- Implement HighLevel integration sync service with automated agent and call-log synchronization ([8f180f9](https://github.com/chitrank2050/agent-optimizer/commit/8f180f9d94de5acfae1dc7094469352e699d38cf))
- Add transcript analysis core ([dd6e970](https://github.com/chitrank2050/agent-optimizer/commit/dd6e97078624ca67df145e9623de8b99b9cfb2a1))
- Persist transcript analysis results ([ab39775](https://github.com/chitrank2050/agent-optimizer/commit/ab3977593998dd5ae7e3f9a363cb1840bfd5f69a))
- Add analysis dashboard view ([f48bf89](https://github.com/chitrank2050/agent-optimizer/commit/f48bf89a5031d27c155bd9d0c1609c55ee47b3ac))
- Add optimization loop core ([fc85a88](https://github.com/chitrank2050/agent-optimizer/commit/fc85a8880325206362052a800dc081bbd1028b51))
- Persist optimization loop results ([0ebdc44](https://github.com/chitrank2050/agent-optimizer/commit/0ebdc445fdcfca8b7d9a0ea3dddb75cf61327443))
- Add optimizer loop dashboard ([bae130f](https://github.com/chitrank2050/agent-optimizer/commit/bae130fb04de483d041b892f145d1c7d39698042))
- Add optional llm recommendation refinement ([b4ea3ea](https://github.com/chitrank2050/agent-optimizer/commit/b4ea3ea576b9427698a386ea406ecb8e12b21d8a))
- Implement API health checks using @nestjs/terminus with a custom Prisma health indicator ([0041dc0](https://github.com/chitrank2050/agent-optimizer/commit/0041dc0814ff3e0c7765f2e7ef4e8112062b6420))
- Implement Winston logging, request compression, global validation, and Scalar API documentation ([0c9baa4](https://github.com/chitrank2050/agent-optimizer/commit/0c9baa445b5dd341933da6cc24ae242782caf818))
- Add logger to PrismaService and export Prisma components via index file ([51f741c](https://github.com/chitrank2050/agent-optimizer/commit/51f741c640d4954ed8ec95e8fd51db60628db9bb))
- Add API versioning to HighLevel integrations controller and clean up route definition ([46fb743](https://github.com/chitrank2050/agent-optimizer/commit/46fb74395705a23aefd5aa56c5e6986b84e9d0e0))
- Add CODEOWNERS file to define repository ownership and maintainer responsibilities ([de2ab39](https://github.com/chitrank2050/agent-optimizer/commit/de2ab3994a64ce6c8f4dca8ef2f0b40423480036))

### 🚜 Refactoring

- Move api config to nest module ([dd61339](https://github.com/chitrank2050/agent-optimizer/commit/dd613395a9cdbd430e510793ce8789ab9588b3b9))
- Align modular monolith structure ([d301fc4](https://github.com/chitrank2050/agent-optimizer/commit/d301fc491e1a0f2c506743cad2213f0883c1b975))
- Centralize common utilities and add RequestLoggerMiddleware ([c828b86](https://github.com/chitrank2050/agent-optimizer/commit/c828b8669090089a3f616a9e975df1e92f0a4532))
- Update health check endpoint to /health and migrate Tailwind CSS colors to functional syntax ([c67b254](https://github.com/chitrank2050/agent-optimizer/commit/c67b2542590487495272c512242f4ca27cd9acd4))
- Add explicit injection decorators to health controller service dependencies ([83636ba](https://github.com/chitrank2050/agent-optimizer/commit/83636ba6e5dc10ddc4ef782e253fdccee17a5938))
- Standardise app branding in logger and overhaul health check response handling ([d21b85c](https://github.com/chitrank2050/agent-optimizer/commit/d21b85c314d8bb71bb112a2a59f2a2f14842472e))
- Implement request logging, enhance transcript parsing, update LLM prompt integration, and migrate to modern Tailwind CSS syntax ([c716372](https://github.com/chitrank2050/agent-optimizer/commit/c716372ebe82361d2719d12947451dea369581fb))
- Improve frontend state synchronization, optimize prompt recommendation instructions, and normalize recommendation targets. ([6cafb62](https://github.com/chitrank2050/agent-optimizer/commit/6cafb6212f533e0cf3db6642745fa1e544394a88))
- Migrate CSS variable syntax to Tailwind arbitrary value brackets across components ([d5347b7](https://github.com/chitrank2050/agent-optimizer/commit/d5347b7db43374659f76be803476323929fe5991))
- Simplify docs workflow by removing redundant triggers and streamlining deployment logic ([897e1cf](https://github.com/chitrank2050/agent-optimizer/commit/897e1cf326f3088375da12e106d16ed78e58f051))

### 🧪 Testing

- Add dashboard browser qa ([510e345](https://github.com/chitrank2050/agent-optimizer/commit/510e345662655e9d294427384bf41d85fea66eca))
- Run vitest through swc ([d8afbc9](https://github.com/chitrank2050/agent-optimizer/commit/d8afbc95bd3abbe7728baeba1b8b5cf2c9c0d786))

