# BlockDAG MCP Server

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org/)

A Model Context Protocol (MCP) server that provides read-only access to EVM-compatible BlockDAG nodes via JSON-RPC. This server exposes blockchain data through a standardized interface that can be used by Claude Desktop, Cursor, and other MCP-compatible clients.

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/daveylupes/blockdag-mcp-server.git
cd blockdag-mcp-server

# Install dependencies
npm install

# Configure environment
cp env.example .env
# Edit .env with your BlockDAG RPC details

# Start development server
npm run dev
```

## 📋 Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Available Tools](#available-tools)
- [Testing](#testing)
- [Configuration](#configuration)
- [Error Handling](#error-handling)
- [Security](#security)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

- **🔒 Read-only operations**: No private keys or signing capabilities for security
- **🛠️ Six core tools**: Network info, balance queries, transaction receipts, block data, event logs, and contract reads
- **🔧 Type-safe**: Built with TypeScript and strict validation using Zod
- **🚀 Production-ready**: Proper error handling, logging, and graceful shutdown
- **⚡ EVM-compatible**: Works with any EVM-compatible BlockDAG implementation
- **📊 Enhanced logging**: Comprehensive error tracking and debugging information
- **🔄 Connection health checks**: Automatic validation of BlockDAG network connectivity
- **🎯 Structured error responses**: Detailed error codes and context for better debugging

## Prerequisites

- Node.js 20 or higher
- Access to a BlockDAG RPC endpoint
- BlockDAG chain ID

## Installation

1. Clone this repository:
```bash
git clone https://github.com/daveylupes/blockdag-mcp-server.git
cd blockdag-mcp-server
```

2. Install dependencies:
```bash
npm install
```

3. Copy the environment template and configure:
```bash
cp env.example .env
```

4. Edit `.env` with your BlockDAG configuration:
```bash
BLOCKDAG_RPC_URL=https://your-blockdag-rpc-endpoint
BLOCKDAG_CHAIN_ID=12345
```

## Development

Start the server in development mode:
```bash
npm run dev
```

## Building and Running

Build the TypeScript code:
```bash
npm run build
```

Run the production server:
```bash
npm start
```

## Available Tools

### 1. `net_info`
Returns network information including chain ID and latest block number.

**Input**: None

**Output**:
```json
{
  "data": {
    "chainId": "12345",
    "latestBlockNumber": "1000000"
  }
}
```

### 2. `get_balance(address)`
Returns BDAG balance for a given address in both wei and human-readable format.

**Input**:
```json
{
  "address": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"
}
```

**Output**:
```json
{
  "data": {
    "address": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
    "wei": "1000000000000000000",
    "bdag": "1.0"
  }
}
```

### 3. `tx_receipt(hash)`
Returns transaction receipt by hash.

**Input**:
```json
{
  "hash": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
}
```

**Output**: Full transaction receipt object

### 4. `get_block(tag)`
Fetches a block by tag. Supports "latest", hex block numbers, or decimal block numbers.

**Input**:
```json
{
  "tag": "latest"
}
```

**Output**: Full block object

### 5. `get_logs({ address?, topic0?, fromBlock?, toBlock? })`
Retrieves event logs with optional filtering.

**Input**:
```json
{
  "address": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
  "topic0": "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
  "fromBlock": "0x0",
  "toBlock": "latest"
}
```

**Output**: Array of log objects

### 6. `read_contract({ address, abi, functionName, args? })`
Performs read-only contract calls.

**Input**:
```json
{
  "address": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
  "abi": "[{\"inputs\":[],\"name\":\"totalSupply\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"}]",
  "functionName": "totalSupply",
  "args": []
}
```

**Output**:
```json
{
  "data": {
    "result": "1000000000000000000000000"
  }
}
```

## Testing with MCP Inspector

1. Install the MCP Inspector globally:
```bash
npm install -g @modelcontextprotocol/inspector
```

2. Start the inspector:
```bash
mcp-inspector
```

3. Select "Local stdio process" and point to your built server:
```
node /path/to/your/project/dist/index.js
```

4. Test the tools with example invocations.

## Configuration

### Claude Desktop

Add to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "blockdag": {
      "command": "node",
      "args": ["/ABSOLUTE/PATH/TO/dist/index.js"],
      "env": {
        "BLOCKDAG_RPC_URL": "https://YOUR-BLOCKDAG-RPC",
        "BLOCKDAG_CHAIN_ID": "12345"
      }
    }
  }
}
```

### Cursor

Create or edit `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "blockdag": {
      "command": "node",
      "args": ["/ABSOLUTE/PATH/TO/dist/index.js"],
      "env": {
        "BLOCKDAG_RPC_URL": "https://YOUR-BLOCKDAG-RPC",
        "BLOCKDAG_CHAIN_ID": "12345"
      }
    }
  }
}
```

## 🚨 Error Handling

The MCP server provides comprehensive error handling with structured responses and detailed logging.

### Error Response Format

All tools return structured error responses in the following format:

```json
{
  "error": {
    "message": "Human-readable error message",
    "code": "ERROR_CODE",
    "cause": "Optional stack trace or additional context",
    "details": {
      "context": "Additional error context"
    }
  }
}
```

### Error Codes

| Code | Description | Common Causes |
|------|-------------|---------------|
| `INVALID_INPUT` | Input validation failed | Invalid address format, missing required fields |
| `RPC_ERROR` | Network/RPC communication error | Connection timeout, invalid RPC endpoint |
| `NETWORK_ERROR` | Network connectivity issues | DNS resolution, firewall blocking |
| `CONTRACT_ERROR` | Smart contract interaction failed | Invalid ABI, contract not found |
| `VALIDATION_ERROR` | Data validation failed | Invalid hex format, out of range values |
| `UNKNOWN_ERROR` | Unexpected error occurred | Internal server errors, unhandled exceptions |

### Common Error Scenarios

#### Input Validation Errors
```json
{
  "error": {
    "message": "Validation error: Invalid Ethereum address format",
    "code": "INVALID_INPUT",
    "details": {
      "context": "tool_call:get_balance"
    }
  }
}
```

#### Network Connection Errors
```json
{
  "error": {
    "message": "Network error: Failed to connect to BlockDAG RPC endpoint",
    "code": "RPC_ERROR",
    "cause": "Connection timeout after 30 seconds",
    "details": {
      "context": "tool_call:net_info"
    }
  }
}
```

#### Contract Interaction Errors
```json
{
  "error": {
    "message": "Contract error: Invalid ABI format",
    "code": "CONTRACT_ERROR",
    "cause": "Failed to parse ABI: Unexpected token",
    "details": {
      "context": "tool_call:read_contract"
    }
  }
}
```

### Debugging Tips

1. **Check Environment Variables**: Ensure `BLOCKDAG_RPC_URL` and `BLOCKDAG_CHAIN_ID` are correctly set
2. **Verify Network Connectivity**: Test your RPC endpoint manually
3. **Review Logs**: Check stderr output for detailed error information
4. **Validate Inputs**: Ensure addresses and hashes are in correct format
5. **Test with MCP Inspector**: Use the inspector to debug tool calls

## Security Notes

- **Read-only by default**: This server only provides read access to blockchain data
- **No private keys**: The server does not handle or store private keys
- **Input validation**: All inputs are validated using Zod schemas
- **Error sanitization**: Errors are normalized and don't expose sensitive information

### Optional Write Operations

If you need to add write operations in the future, consider implementing:

1. `send_raw_tx(rawTxHex)` - Only accepts pre-signed raw transaction hex
2. Environment flag `ENABLE_WRITE_OPS=false` to control availability
3. Additional validation for transaction format and gas limits

## Development

### Project Structure

```
src/
├── index.ts          # Main server entry point with all tool implementations
├── chain.ts          # BlockDAG chain configuration
└── types.ts          # Shared types and utilities
```

### Adding New Tools

1. Add a new tool definition to the `tools` array in `src/index.ts`
2. Add a new case in the switch statement for the tool handler
3. Implement the handler function following the existing pattern
4. Use Zod for input validation in the tool definition
5. Ensure proper error handling and response formatting

### Type Checking

Run TypeScript type checking:
```bash
npm run type-check
```

### Code Style

- Use TypeScript strict mode
- Follow existing error handling patterns
- Add comprehensive logging for debugging
- Include input validation with Zod schemas
- Write clear, descriptive error messages

## 🤝 Contributing

We welcome contributions to improve the BlockDAG MCP server!

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**: Follow the coding standards above
4. **Add tests**: Ensure your changes work correctly
5. **Commit your changes**: `git commit -m 'Add amazing feature'`
6. **Push to the branch**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**: Describe your changes and their benefits

### Development Guidelines

- **Error Handling**: Always use the `handleError` function for consistent error responses
- **Logging**: Add appropriate console.error logs for debugging
- **Validation**: Use Zod schemas for all input validation
- **Documentation**: Update README.md for any new features
- **Testing**: Test with MCP Inspector before submitting

### Reporting Issues

When reporting issues, please include:
- **Error messages**: Full error response from the tool
- **Environment**: Node.js version, OS, configuration
- **Steps to reproduce**: Clear steps to trigger the issue
- **Expected behavior**: What you expected to happen
- **Actual behavior**: What actually happened

## License

MIT License - see LICENSE file for details.
