# BlockDAG MCP Server

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org/)

A Model Context Protocol (MCP) server that brings BlockDAG blockchain data to your AI assistant. Query balances, transactions, tokens, and network stats directly from Claude Desktop or Cursor.

## Why This Exists

Working with blockchain data in AI workflows shouldn't require complex RPC calls or Web3 libraries. This MCP server bridges that gap - just ask your AI assistant in natural language, and get the data you need.

## Quick Start

```bash
git clone https://github.com/daveylupes/blockdag-mcp-server.git
cd blockdag-mcp-server
npm install
cp env.example .env
# Edit .env with your BlockDAG RPC details
npm run dev
```

## Features

- **10 comprehensive tools** for blockchain data access
- **Read-only operations** - secure by default, no private keys needed
- **ERC20 token support** - query token balances and metadata
- **Transaction analytics** - history tracking with pagination
- **Network monitoring** - real-time stats on gas, TPS, and activity
- **Type-safe** - TypeScript with strict validation
- **Production-ready** - comprehensive error handling and logging

## Tools

| Tool | Description |
|------|-------------|
| `net_info` | Get chain ID and latest block number |
| `get_balance` | Get BDAG balance for an address |
| `tx_receipt` | Get transaction receipt by hash |
| `get_block` | Fetch block by tag (latest, hex, or decimal) |
| `get_logs` | Query event logs with filters |
| `read_contract` | Call read-only contract functions |
| `get_token_balance` | Get ERC20 token balance and metadata |
| `get_token_info` | Get token details (name, symbol, supply) |
| `get_transaction_history` | Get transaction history with pagination |
| `get_network_stats` | Get network statistics and metrics |

## Installation

### Prerequisites

- Node.js 20 or higher
- npm or yarn
- BlockDAG RPC endpoint access

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/daveylupes/blockdag-mcp-server.git
   cd blockdag-mcp-server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env`:
   ```bash
   BLOCKDAG_RPC_URL=https://your-blockdag-rpc
   BLOCKDAG_CHAIN_ID=12345
   ```

4. **Build the project**
   ```bash
   npm run build
   ```

## Usage

### With Cursor

Create or edit `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "blockdag": {
      "command": "node",
      "args": ["/absolute/path/to/blockdag-mcp-server/dist/index.js"],
      "env": {
        "BLOCKDAG_RPC_URL": "https://your-blockdag-rpc",
        "BLOCKDAG_CHAIN_ID": "12345"
      }
    }
  }
}
```

Restart Cursor, then ask questions like:
- "What's the balance of address 0x..."
- "Show me network statistics"
- "Get token info for contract 0x..."

### With Claude Desktop

Edit your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "blockdag": {
      "command": "node",
      "args": ["/absolute/path/to/blockdag-mcp-server/dist/index.js"],
      "env": {
        "BLOCKDAG_RPC_URL": "https://your-blockdag-rpc",
        "BLOCKDAG_CHAIN_ID": "12345"
      }
    }
  }
}
```

### Testing with MCP Inspector

```bash
npm install -g @modelcontextprotocol/inspector
mcp-inspector
```

Select "Local stdio process" and point to `node dist/index.js`

## Development

```bash
# Run in development mode
npm run dev

# Build for production
npm run build

# Type checking
npm run type-check

# Run tests
npm test
```

## Project Structure

```
blockdag-mcp-server/
├── src/
│   ├── index.ts          # Main server and tool implementations
│   ├── chain.ts          # BlockDAG chain configuration
│   └── types.ts          # Shared types and utilities
├── docs/
│   ├── features/         # Feature documentation
│   └── guides/           # User guides
├── tests/                # Test files
├── dist/                 # Compiled output
└── README.md
```

## Documentation

- **[Testing Guide](docs/guides/TESTING_GUIDE.md)** - How to test the server
- **[Troubleshooting](docs/guides/TROUBLESHOOTING.md)** - Common issues and solutions
- **[Contributing](CONTRIBUTING.md)** - How to contribute
- **[Changelog](CHANGELOG.md)** - Version history

### Feature Docs

- **[ERC20 Token Support](docs/features/FEATURE_TOKEN_SUPPORT.md)**
- **[Transaction History](docs/features/FEATURE_TRANSACTION_HISTORY.md)**
- **[Network Statistics](docs/features/FEATURE_NETWORK_STATS.md)**

## Examples

### Get Network Info
```
"What's the current BlockDAG network status?"
```

### Check Balance
```
"What's the BDAG balance of 0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6?"
```

### Token Balance
```
"Check token balance for wallet 0x... and token contract 0x..."
```

### Network Statistics
```
"Show me current gas prices and network performance"
```

### Transaction History
```
"Get the last 10 transactions for address 0x..."
```

## Security

- **Read-only by default** - No private keys or signing operations
- **Input validation** - All inputs validated with Zod schemas
- **Error sanitization** - Errors don't expose sensitive information
- **Type-safe** - TypeScript strict mode prevents common bugs

## Contributing

We welcome contributions! Whether you're fixing bugs, adding features, or improving documentation - all contributions are valued.

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Ways to Contribute

- 🐛 Report bugs or issues
- 💡 Suggest new features
- 📝 Improve documentation
- 🔧 Submit pull requests
- ⭐ Star the repo if you find it useful

## Community

- **GitHub Issues** - Report bugs or request features
- **Pull Requests** - Contribute code improvements
- **Discussions** - Share ideas and get help

## Roadmap

- [ ] WebSocket support for real-time updates
- [ ] Caching layer for improved performance
- [ ] Multi-network configuration support
- [ ] Advanced filtering and aggregation
- [ ] Batch query support
- [ ] NFT (ERC721/ERC1155) support

## Performance Notes

For production use with high volume:
- Consider using a block explorer API for transaction history
- Implement caching for frequently queried data
- Use smaller block ranges for network stats
- See [performance guide](docs/guides/TROUBLESHOOTING.md#performance-issues)

## License

MIT License - see [LICENSE](LICENSE) for details.

## Acknowledgments

Built for the BlockDAG community. Thanks to everyone who has contributed, tested, and provided feedback.

---

**Made with ❤️ for blockchain developers**
