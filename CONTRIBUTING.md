# Contributing to BlockDAG MCP Server

Thank you for your interest in contributing! This project thrives on community contributions, whether you're fixing bugs, adding features, or improving documentation.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Getting Help](#getting-help)

## Code of Conduct

Be respectful and considerate. We're all here to build something useful together.

## Getting Started

### Prerequisites

- Node.js 20+
- Git
- Basic TypeScript knowledge
- Understanding of blockchain concepts (helpful but not required)

### Development Setup

1. **Fork and clone**
   ```bash
   git clone https://github.com/YOUR_USERNAME/blockdag-mcp-server.git
   cd blockdag-mcp-server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment**
   ```bash
   cp env.example .env
   # Edit .env with BlockDAG RPC details
   ```

4. **Verify setup**
   ```bash
   npm run build
   npm test
   ```

## Making Changes

### Code Style

- Use TypeScript strict mode
- Follow existing patterns for consistency
- Add comprehensive error handling
- Include helpful log messages
- Write clear, descriptive variable names

### File Organization

```
src/
├── index.ts          # Main server and all tool implementations
├── chain.ts          # BlockDAG chain configuration
└── types.ts          # Shared types and utilities
```

### Adding a New Tool

1. **Add tool definition** to the `tools` array in `src/index.ts`
2. **Create input schema** using Zod
3. **Add switch case** for routing
4. **Implement handler function** with proper error handling
5. **Update documentation** in README.md
6. **Test thoroughly**

Example:

```typescript
// 1. Tool definition
{
  name: 'my_new_tool',
  description: 'What this tool does',
  inputSchema: z.object({
    param: z.string(),
  }),
}

// 2. Switch case
case 'my_new_tool':
  result = await handleMyNewTool(client, validatedArgs);
  break;

// 3. Handler function
async function handleMyNewTool(client: any, args: { param: string }) {
  try {
    console.error('[MCP] Executing my_new_tool...');
    // Implementation
    return result;
  } catch (error) {
    console.error('[MCP] my_new_tool failed:', error);
    throw new Error(`Failed: ${error instanceof Error ? error.message : 'Unknown'}`);
  }
}
```

## Testing

### Run Tests

```bash
npm test
```

### Manual Testing

```bash
# Start dev server
npm run dev

# In another terminal, use MCP Inspector
mcp-inspector
```

### What to Test

- ✅ Valid inputs work correctly
- ✅ Invalid inputs show clear error messages
- ✅ Edge cases are handled
- ✅ Error logging is helpful
- ✅ Performance is acceptable

## Submitting Changes

### Commit Messages

Use conventional commits:

```
type(scope): brief description

type: feat, fix, docs, style, refactor, test, chore
```

Examples:
```
feat(tools): add gas estimation tool
fix(error): improve validation error messages
docs(readme): add usage examples
```

### Pull Request Process

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature
   ```

2. **Make your changes** following guidelines

3. **Test thoroughly**
   ```bash
   npm run build
   npm test
   npm run type-check
   ```

4. **Commit with clear messages**

5. **Push to your fork**
   ```bash
   git push origin feature/your-feature
   ```

6. **Open a Pull Request** with:
   - Clear description of changes
   - Why the change is needed
   - How you tested it
   - Any breaking changes

## Types of Contributions

### Bug Fixes
Found a bug? Please open an issue or submit a fix!

### New Tools
Ideas for new blockchain queries? Implement and submit a PR!

### Documentation
Improve explanations, add examples, fix typos - all welcome!

### Performance
Optimization ideas? Share them or implement them!

### Testing
Add more tests, improve test coverage, better test utilities!

## Development Guidelines

### Error Handling
Always use try-catch and the `handleError` function:

```typescript
try {
  // Your code
} catch (error) {
  console.error('[MCP] Operation failed:', error);
  throw new Error(`Clear message: ${error.message}`);
}
```

### Logging
Add helpful logs for debugging:

```typescript
console.error('[MCP] Starting operation...');
console.error('[MCP] Operation completed successfully');
```

### Input Validation
Use Zod schemas for all inputs:

```typescript
const schema = z.object({
  address: z.string().regex(/^0x[0-9a-fA-F]{40}$/),
});
```

### Type Safety
Leverage TypeScript:

```typescript
// Use proper types, avoid 'any' where possible
const result: BlockData = await client.getBlock();
```

## Getting Help

- **Check existing issues** for similar problems
- **Read the documentation** in `docs/`
- **Ask in discussions** or open an issue
- **Review closed PRs** for examples

## Recognition

Contributors are recognized in:
- GitHub contributors list
- Release notes
- Documentation

## Questions?

Feel free to open an issue or discussion. We're here to help!

---

**Thank you for contributing to BlockDAG MCP Server!** 🚀
