# Contributing to BlockDAG MCP Server

Thank you for your interest in contributing to the BlockDAG MCP Server! This document provides guidelines and information for contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Code Review Process](#code-review-process)

## Code of Conduct

This project is committed to providing a welcoming and inclusive environment for all contributors. Please be respectful and considerate in all interactions.

## Getting Started

### Prerequisites

- Node.js 20 or higher
- npm or yarn
- Git
- Basic knowledge of TypeScript and blockchain concepts

### Development Setup

1. **Fork the repository**
   ```bash
   # Fork on GitHub, then clone your fork
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
   # Edit .env with your BlockDAG RPC details
   ```

4. **Verify setup**
   ```bash
   npm run type-check
   npm run build
   ```

## Making Changes

### Code Style Guidelines

- **TypeScript**: Use strict mode and follow TypeScript best practices
- **Error Handling**: Always use the `handleError` function for consistent error responses
- **Logging**: Add appropriate console.error logs for debugging
- **Validation**: Use Zod schemas for all input validation
- **Documentation**: Add JSDoc comments for public functions

### File Structure

```
src/
├── index.ts          # Main server entry point
├── chain.ts          # BlockDAG chain configuration
├── types.ts          # Shared types and utilities
└── tools/            # Individual tool implementations (if needed)
```

### Adding New Tools

1. **Define the tool** in the `tools` array in `src/index.ts`
2. **Add input validation** using Zod schemas
3. **Implement the handler** function with proper error handling
4. **Add logging** for debugging and monitoring
5. **Update documentation** in README.md

Example tool addition:

```typescript
// In tools array
{
  name: 'new_tool',
  description: 'Description of what this tool does',
  inputSchema: z.object({
    // Define input validation
  }),
}

// In switch statement
case 'new_tool':
  result = await handleNewTool(client, validatedArgs);
  break;

// Handler function
async function handleNewTool(client: any, args: any) {
  try {
    console.error('[MCP] Executing new tool...');
    // Implementation
    return result;
  } catch (error) {
    console.error('[MCP] New tool failed:', error);
    throw new Error(`Failed to execute new tool: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
```

## Testing

### Manual Testing

1. **Start the development server**
   ```bash
   npm run dev
   ```

2. **Use MCP Inspector**
   ```bash
   npm install -g @modelcontextprotocol/inspector
   mcp-inspector
   ```

3. **Test each tool** with various inputs and edge cases

### Automated Testing

Run the test suite:
```bash
npm test
```

### Testing Checklist

- [ ] Tool responds correctly to valid inputs
- [ ] Tool handles invalid inputs gracefully
- [ ] Error messages are clear and helpful
- [ ] Logging provides useful debugging information
- [ ] Performance is acceptable for expected use cases

## Submitting Changes

### Commit Guidelines

Use conventional commit messages:

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:
```
feat(tools): add new_block_tool for querying block details
fix(error-handling): improve error messages for invalid addresses
docs(readme): add troubleshooting section
```

### Pull Request Process

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following the guidelines above

3. **Test your changes** thoroughly

4. **Update documentation** if needed

5. **Commit your changes** with clear commit messages

6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Create a Pull Request** with:
   - Clear description of changes
   - Link to any related issues
   - Screenshots or examples if applicable
   - Testing checklist completed

### Pull Request Template

```markdown
## Description
Brief description of the changes made.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Code refactoring
- [ ] Other (please describe)

## Testing
- [ ] Manual testing completed
- [ ] MCP Inspector testing completed
- [ ] Error scenarios tested
- [ ] Performance impact considered

## Checklist
- [ ] Code follows style guidelines
- [ ] Error handling implemented
- [ ] Logging added where appropriate
- [ ] Documentation updated
- [ ] No breaking changes introduced
```

## Code Review Process

1. **Automated Checks**: All PRs must pass CI checks
2. **Review**: At least one maintainer must approve
3. **Testing**: Changes must be tested before merging
4. **Documentation**: Documentation must be updated if needed

### Review Criteria

- **Functionality**: Does the code work as intended?
- **Error Handling**: Are errors handled appropriately?
- **Performance**: Is the performance acceptable?
- **Security**: Are there any security concerns?
- **Maintainability**: Is the code maintainable and readable?
- **Documentation**: Is the documentation clear and complete?

## Getting Help

If you need help with your contribution:

1. **Check existing issues** for similar problems
2. **Search documentation** for relevant information
3. **Ask in discussions** or create an issue
4. **Join our community** channels

## Recognition

Contributors will be recognized in:
- Repository contributors list
- Release notes
- Documentation acknowledgments

Thank you for contributing to the BlockDAG MCP Server!
