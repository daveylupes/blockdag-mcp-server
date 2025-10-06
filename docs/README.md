# Documentation

Complete documentation for the BlockDAG MCP Server.

## Guides

### Getting Started
- **[Main README](../README.md)** - Quick start and overview
- **[Testing Guide](guides/TESTING_GUIDE.md)** - How to test the server
- **[Troubleshooting](guides/TROUBLESHOOTING.md)** - Common issues and solutions

### Development
- **[Contributing Guide](../CONTRIBUTING.md)** - How to contribute
- **[Changelog](../CHANGELOG.md)** - Version history

## Features

Detailed documentation for each major feature:

- **[ERC20 Token Support](features/FEATURE_TOKEN_SUPPORT.md)** - Token balance and metadata queries
- **[Transaction History](features/FEATURE_TRANSACTION_HISTORY.md)** - Historical transaction tracking
- **[Network Statistics](features/FEATURE_NETWORK_STATS.md)** - Real-time network metrics

## API Reference

### Core Tools

| Tool | Documentation |
|------|--------------|
| `net_info` | Get network information (chain ID, latest block) |
| `get_balance` | Query BDAG balance for an address |
| `tx_receipt` | Get transaction receipt by hash |
| `get_block` | Fetch block data by tag |
| `get_logs` | Query event logs with filters |
| `read_contract` | Call read-only contract functions |

### Token Tools

| Tool | Documentation |
|------|--------------|
| `get_token_balance` | [Token Support](features/FEATURE_TOKEN_SUPPORT.md) |
| `get_token_info` | [Token Support](features/FEATURE_TOKEN_SUPPORT.md) |

### Analytics Tools

| Tool | Documentation |
|------|--------------|
| `get_transaction_history` | [Transaction History](features/FEATURE_TRANSACTION_HISTORY.md) |
| `get_network_stats` | [Network Statistics](features/FEATURE_NETWORK_STATS.md) |

## Quick Links

- **Setup Issues?** → [Troubleshooting Guide](guides/TROUBLESHOOTING.md)
- **Want to Contribute?** → [Contributing Guide](../CONTRIBUTING.md)
- **Testing?** → [Testing Guide](guides/TESTING_GUIDE.md)
- **Feature Requests?** → [Open an Issue](https://github.com/daveylupes/blockdag-mcp-server/issues)

## Examples

See the [main README](../README.md#examples) for usage examples with Cursor and Claude Desktop.

---

**Need help?** Open an issue or check the troubleshooting guide!

