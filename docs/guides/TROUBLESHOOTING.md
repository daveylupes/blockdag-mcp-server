# Troubleshooting Guide

Common issues and solutions for the BlockDAG MCP Server.

---

## WSL2 Installation Issues

### Problem: npm install fails with UNC path errors on WSL2

**Symptoms:**
```
npm error command C:\Windows\system32\cmd.exe /d /s /c node install.js
npm error UNC paths are not supported
npm error Error: Cannot find module 'C:\Windows\install.js'
```

**Cause:** Windows npm is being used instead of Linux npm in WSL2.

### Solutions

#### Solution 1: Use Linux Node.js (Recommended)

1. **Check which npm you're using:**
   ```bash
   which npm
   which node
   ```
   
   If you see paths like `/mnt/c/...` or `C:\...`, you're using Windows versions.

2. **Install Node.js in WSL2 (not Windows):**
   ```bash
   # Remove Windows npm from PATH if needed
   # Install Node.js using nvm (recommended)
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   
   # Restart terminal or source profile
   source ~/.bashrc
   
   # Install Node.js
   nvm install 20
   nvm use 20
   ```

3. **Verify Linux versions are being used:**
   ```bash
   which node   # Should show: /home/username/.nvm/versions/node/v20.x.x/bin/node
   which npm    # Should show: /home/username/.nvm/versions/node/v20.x.x/bin/npm
   ```

4. **Clean and reinstall:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

#### Solution 2: Fix PATH in WSL2

If Windows executables are in your WSL PATH before Linux ones:

1. **Edit your .bashrc or .zshrc:**
   ```bash
   nano ~/.bashrc
   ```

2. **Add this at the bottom:**
   ```bash
   # Prioritize Linux binaries over Windows
   export PATH=/usr/local/bin:/usr/bin:/bin:$PATH
   ```

3. **Reload shell:**
   ```bash
   source ~/.bashrc
   ```

4. **Retry installation:**
   ```bash
   cd ~/blockdag-mcp-server
   rm -rf node_modules package-lock.json
   npm install
   ```

#### Solution 3: Use Windows Terminal with Linux Profile

Instead of mixing Windows/WSL:

1. Open **Windows Terminal**
2. Select **Ubuntu** (or your WSL distribution)
3. Navigate to project directory
4. Run npm install

#### Solution 4: Clone to WSL Home Directory

Avoid Windows filesystem mounts:

```bash
# Clone to WSL home directory (not /mnt/c/)
cd ~
git clone https://github.com/daveylupes/blockdag-mcp-server.git
cd blockdag-mcp-server
npm install
```

WSL2 performs better with files in the Linux filesystem (`~`) than in mounted Windows drives (`/mnt/c/`).

---

## Environment Variable Issues

### Problem: Missing BLOCKDAG_RPC_URL or BLOCKDAG_CHAIN_ID

**Symptoms:**
```
Error: BLOCKDAG_RPC_URL environment variable is required
```

**Solution:**

1. **Create .env file:**
   ```bash
   cp env.example .env
   ```

2. **Edit .env with your values:**
   ```bash
   nano .env
   ```
   
   Add:
   ```
   BLOCKDAG_RPC_URL=https://your-blockdag-rpc-endpoint
   BLOCKDAG_CHAIN_ID=12345
   ```

3. **Verify it's loaded:**
   ```bash
   npm run dev
   # Should show: [MCP] Environment: { rpcUrl: 'Configured', chainId: '12345' }
   ```

---

## Connection Issues

### Problem: Failed to connect to BlockDAG network

**Symptoms:**
```
Failed to connect to BlockDAG network: HTTP request failed
```

**Solutions:**

1. **Verify RPC endpoint is accessible:**
   ```bash
   curl -X POST -H "Content-Type: application/json" \
     --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
     https://your-blockdag-rpc
   ```

2. **Check firewall/proxy settings**

3. **Try alternative RPC endpoint** if available

4. **Verify network connectivity:**
   ```bash
   ping your-blockdag-rpc-host
   ```

---

## TypeScript Compilation Errors

### Problem: TypeScript errors during build

**Solution:**

1. **Ensure you have the correct Node.js version:**
   ```bash
   node --version  # Should be v20.x.x or higher
   ```

2. **Clean and reinstall dependencies:**
   ```bash
   rm -rf node_modules package-lock.json dist
   npm install
   ```

3. **Run type check:**
   ```bash
   npm run type-check
   ```

---

## MCP Inspector Issues

### Problem: Inspector doesn't list tools

**Solution:**

1. **Ensure server is built:**
   ```bash
   npm run build
   ```

2. **Use absolute path in inspector:**
   ```
   node /absolute/path/to/blockdag-mcp-server/dist/index.js
   ```

3. **Set environment variables in inspector config**

4. **Check server logs for errors**

---

## Tool Execution Errors

### Problem: Invalid address format errors

**Solution:**

Ensure addresses are properly formatted:
- Must start with `0x`
- Followed by exactly 40 hexadecimal characters
- Example: `0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6`

### Problem: Invalid transaction hash format

**Solution:**

Ensure transaction hashes are:
- Must start with `0x`
- Followed by exactly 64 hexadecimal characters
- Example: `0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef`

---

## Performance Issues

### Problem: get_network_stats is slow

**Solutions:**

1. **Reduce blocks analyzed:**
   ```json
   {
     "blocks": 50  // Instead of 1000
   }
   ```

2. **Use during off-peak hours**

3. **Cache results** and refresh periodically

### Problem: get_transaction_history times out

**Solutions:**

1. **Reduce block range:**
   ```json
   {
     "fromBlock": "1000000",
     "toBlock": "1000100"  // Smaller range
   }
   ```

2. **Lower limit:**
   ```json
   {
     "limit": 5  // Instead of 100
   }
   ```

3. **Consider using block explorer API** for production

---

## Platform-Specific Issues

### macOS

**Permission Issues:**
```bash
sudo chown -R $(whoami) ~/.npm
```

### Linux

**Node.js Installation:**
```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Arch Linux
sudo pacman -S nodejs npm
```

### Windows (Native)

1. Install Node.js from https://nodejs.org/
2. Use PowerShell or CMD (not WSL)
3. Clone to Windows filesystem (C:\, not WSL)

### Windows (WSL2) - See detailed section above

---

## Getting Help

If you're still experiencing issues:

1. **Check existing issues:** https://github.com/daveylupes/blockdag-mcp-server/issues
2. **Open a new issue:** Use the bug report template
3. **Include:**
   - Operating system and version
   - Node.js and npm versions
   - Complete error message
   - Steps to reproduce

---

## Common Questions

### Q: Can I use this on Windows?
**A:** Yes, but we recommend using Linux/macOS or WSL2 with proper Linux Node.js installation.

### Q: Do I need a BlockDAG node?
**A:** No, just an RPC endpoint. Use BlockDAG's public RPC or a provider.

### Q: Is this safe to use?
**A:** Yes, it's read-only by default. No private keys, no signing operations.

### Q: Can I add write operations?
**A:** Not recommended in the MCP server itself. For writes, use pre-signed transactions only.

### Q: How do I update to the latest version?
**A:**
```bash
git pull origin main
npm install
npm run build
```

---

**Still stuck?** Open an issue with details and we'll help you out!

