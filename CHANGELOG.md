# Changelog

All notable changes to the BlockDAG MCP Server.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Network statistics tool with comprehensive metrics
- Transaction history with pagination and token transfer support
- ERC20 token balance and metadata tools
- Enhanced error handling with error codes
- Comprehensive logging system
- Connection health checks on startup

### Fixed
- Gas price sorting comparator in `get_network_stats` now properly handles BigInt equality
- Fixed potential division by zero error in gas price statistics calculation
- Corrected `eth_gasPrice` RPC call to properly parse hex string response to BigInt
- Prevented negative block number iteration in network statistics analysis
- Fixed dynamic block tag handling in `get_transaction_history` to maintain 'latest' behavior
- Added proper TypeScript type safety for potentially undefined values

### Documentation
- Feature documentation in `docs/features/`
- User guides in `docs/guides/`
- Testing guide with examples
- Troubleshooting guide (including WSL2 setup)

## [0.1.0] - 2025-08-18

### Added
- Initial release with 6 core tools
- MCP server implementation using `@modelcontextprotocol/sdk`
- Viem integration for EVM blockchain interactions
- Zod input validation
- TypeScript with strict mode
- Environment-based configuration
- Stdio transport for AI assistants
- Graceful shutdown handling

### Tools
- `net_info` - Network information
- `get_balance` - BDAG balance queries
- `tx_receipt` - Transaction receipts
- `get_block` - Block data by tag
- `get_logs` - Event log filtering
- `read_contract` - Read-only contract calls

### Documentation
- README with setup instructions
- Contributing guidelines
- Issue and PR templates
- MIT License

---

## Tool Evolution

| Version | Tools | Major Features |
|---------|-------|---------------|
| 0.1.0 | 6 | Core blockchain queries |
| Current | 10 | + Tokens + Analytics |

## Breaking Changes

None. All versions are backward compatible.

## Deprecations

None.

---

For more details, see individual feature documentation in `docs/features/`.
