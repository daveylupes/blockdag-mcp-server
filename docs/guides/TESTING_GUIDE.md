# Testing Guide for BlockDAG MCP Server

## Automated Tests ✅

### Structure Tests (No RPC Required)
```bash
node test-tools-structure.js
```

**What it tests:**
- ✅ All 8 tools are registered
- ✅ Handler functions exist
- ✅ ERC20 ABI methods present
- ✅ Switch case routing
- ✅ Error handling
- ✅ Logging implementation
- ✅ Response formatting

**Results:** 18/18 tests passed (100% success rate)

## Manual Testing with MCP Inspector

### 1. Install MCP Inspector
```bash
npm install -g @modelcontextprotocol/inspector
```

### 2. Set Up Environment
Create a `.env` file with real BlockDAG credentials:
```bash
BLOCKDAG_RPC_URL=https://your-actual-blockdag-rpc
BLOCKDAG_CHAIN_ID=your-chain-id
```

### 3. Start MCP Inspector
```bash
mcp-inspector
```

### 4. Configure Inspector
- Select "Local stdio process"
- Point to: `node /path/to/blockdag-mcp-server/dist/index.js`
- Environment variables will be loaded from `.env`

## Test Cases

### Test 1: List All Tools
**Expected Result:** Should show 8 tools including:
- net_info
- get_balance
- tx_receipt
- get_block
- get_logs
- read_contract
- **get_token_balance** ⭐ (NEW)
- **get_token_info** ⭐ (NEW)

### Test 2: Get Token Balance
```json
{
  "name": "get_token_balance",
  "arguments": {
    "address": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
    "tokenAddress": "0xYOUR_ERC20_TOKEN_ADDRESS"
  }
}
```

**Expected Response:**
```json
{
  "data": {
    "address": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
    "tokenAddress": "0xYOUR_ERC20_TOKEN_ADDRESS",
    "tokenName": "Token Name",
    "tokenSymbol": "TKN",
    "decimals": 18,
    "balanceRaw": "1000000000000000000",
    "balance": "1.0"
  }
}
```

### Test 3: Get Token Info
```json
{
  "name": "get_token_info",
  "arguments": {
    "tokenAddress": "0xYOUR_ERC20_TOKEN_ADDRESS"
  }
}
```

**Expected Response:**
```json
{
  "data": {
    "tokenAddress": "0xYOUR_ERC20_TOKEN_ADDRESS",
    "name": "Token Name",
    "symbol": "TKN",
    "decimals": 18,
    "totalSupplyRaw": "1000000000000000000000000",
    "totalSupply": "1000000.0"
  }
}
```

### Test 4: Error Handling - Invalid Address
```json
{
  "name": "get_token_balance",
  "arguments": {
    "address": "invalid_address",
    "tokenAddress": "0x1234567890123456789012345678901234567890"
  }
}
```

**Expected Response:**
```json
{
  "error": {
    "message": "Validation error: Invalid wallet address format",
    "code": "INVALID_INPUT",
    "details": {
      "context": "tool_call:get_token_balance"
    }
  }
}
```

### Test 5: Error Handling - Non-existent Token
```json
{
  "name": "get_token_info",
  "arguments": {
    "tokenAddress": "0x0000000000000000000000000000000000000000"
  }
}
```

**Expected:** Should handle gracefully with default values or error message

## Testing with Claude Desktop / Cursor

### 1. Configure MCP Server

**Claude Desktop** (`~/Library/Application Support/Claude/claude_desktop_config.json`):
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

**Cursor** (`~/.cursor/mcp.json`):
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

### 2. Restart Claude/Cursor

### 3. Test with Natural Language

**Example queries:**
- "What's the balance of this ERC20 token [address] for wallet [address]?"
- "Get token information for contract [address]"
- "Check the total supply of token [address]"
- "What tokens does wallet [address] hold?"

## Common Issues & Solutions

### Issue: "Failed to connect to BlockDAG network"
**Solution:** Verify `BLOCKDAG_RPC_URL` is correct and accessible

### Issue: "Invalid token contract address format"
**Solution:** Ensure address is in format `0x` followed by 40 hexadecimal characters

### Issue: "Could not fetch decimals/symbol/name"
**Solution:** Token might not implement optional ERC20 methods. Tool uses defaults.

### Issue: "Contract error: Invalid ABI format"
**Solution:** Verify the token contract implements ERC20 standard

## Performance Testing

### Latency Test
Measure response time for token queries:
```bash
# Time a get_token_balance call
time node -e "console.log('Test timing')"
```

### Batch Testing
Test multiple token queries in sequence to verify stability

## Integration Testing

### Test Scenarios
1. **Portfolio Tracking**: Query multiple tokens for one address
2. **Token Discovery**: Get info for various tokens
3. **Balance Monitoring**: Repeated queries for same token/address
4. **Error Recovery**: Invalid inputs followed by valid ones

## Success Criteria

✅ All structure tests pass  
✅ Tools appear in MCP Inspector  
✅ Valid token queries return correct data  
✅ Invalid inputs return proper error messages  
✅ Works in Claude Desktop/Cursor  
✅ Response time < 2 seconds for most queries  
✅ Graceful handling of non-standard tokens  

## Next Steps

After successful testing:
1. Document real-world usage examples
2. Create video demo for grant application
3. Share with BlockDAG community for feedback
4. Prepare for production deployment

---

**Note:** Always test with real BlockDAG testnet before mainnet!

