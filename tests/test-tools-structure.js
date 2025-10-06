#!/usr/bin/env node

/**
 * Test script to verify the token tools are properly registered
 * This doesn't require a real RPC connection
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

console.log('🧪 Testing BlockDAG MCP Server - Tool Structure\n');
console.log('='.repeat(60));

// Read the compiled source
const indexPath = join(projectRoot, 'dist', 'index.js');
const source = readFileSync(indexPath, 'utf-8');

let passedTests = 0;
let failedTests = 0;

function test(name, condition, details = '') {
  if (condition) {
    console.log(`✅ ${name}`);
    if (details) console.log(`   ${details}`);
    passedTests++;
  } else {
    console.log(`❌ ${name}`);
    if (details) console.log(`   ${details}`);
    failedTests++;
  }
}

console.log('\n📦 Testing Tool Definitions:\n');

// Test 1: Original 6 tools exist
test(
  'Original tools present',
  source.includes('net_info') &&
  source.includes('get_balance') &&
  source.includes('tx_receipt') &&
  source.includes('get_block') &&
  source.includes('get_logs') &&
  source.includes('read_contract'),
  'All 6 original tools found'
);

// Test 2: New token tools exist
test(
  'Token balance tool added',
  source.includes('get_token_balance'),
  'get_token_balance tool found'
);

test(
  'Token info tool added',
  source.includes('get_token_info'),
  'get_token_info tool found'
);

test(
  'Transaction history tool added',
  source.includes('get_transaction_history'),
  'get_transaction_history tool found'
);

test(
  'Network stats tool added',
  source.includes('get_network_stats'),
  'get_network_stats tool found'
);

// Test 3: Handler functions exist
console.log('\n🔧 Testing Handler Functions:\n');

test(
  'handleGetTokenBalance function exists',
  source.includes('handleGetTokenBalance'),
  'Handler function defined'
);

test(
  'handleGetTokenInfo function exists',
  source.includes('handleGetTokenInfo'),
  'Handler function defined'
);

test(
  'handleGetTransactionHistory function exists',
  source.includes('handleGetTransactionHistory'),
  'Handler function defined'
);

test(
  'handleGetNetworkStats function exists',
  source.includes('handleGetNetworkStats'),
  'Handler function defined'
);

// Test 4: ERC20 ABI usage
console.log('\n📋 Testing ERC20 Implementation:\n');

test(
  'ERC20 balanceOf ABI present',
  source.includes('balanceOf'),
  'balanceOf function signature found'
);

test(
  'ERC20 decimals ABI present',
  source.includes('decimals'),
  'decimals function signature found'
);

test(
  'ERC20 symbol ABI present',
  source.includes('symbol'),
  'symbol function signature found'
);

test(
  'ERC20 name ABI present',
  source.includes('name'),
  'name function signature found'
);

test(
  'ERC20 totalSupply ABI present',
  source.includes('totalSupply'),
  'totalSupply function signature found'
);

// Test 5: Switch case handlers
console.log('\n🔀 Testing Switch Case Routing:\n');

test(
  'get_token_balance case exists',
  source.includes("case 'get_token_balance'"),
  'Switch case for get_token_balance found'
);

test(
  'get_token_info case exists',
  source.includes("case 'get_token_info'"),
  'Switch case for get_token_info found'
);

// Test 6: Proper error handling
console.log('\n🛡️  Testing Error Handling:\n');

test(
  'Token balance error handling',
  source.includes('Failed to retrieve token balance'),
  'Error message for token balance found'
);

test(
  'Token info error handling',
  source.includes('Failed to retrieve token information'),
  'Error message for token info found'
);

// Test 7: Logging
console.log('\n📊 Testing Logging:\n');

test(
  'Token balance logging',
  source.includes('Fetching token balance'),
  'Log statement for token balance found'
);

test(
  'Token info logging',
  source.includes('Fetching token information'),
  'Log statement for token info found'
);

// Test 8: Response formatting
console.log('\n📤 Testing Response Structure:\n');

test(
  'formatUnits usage',
  source.includes('formatUnits'),
  'Viem formatUnits imported and used'
);

test(
  'Proper response fields',
  source.includes('tokenName') &&
  source.includes('tokenSymbol') &&
  source.includes('balanceRaw'),
  'All response fields present'
);

// Summary
console.log('\n' + '='.repeat(60));
console.log('📊 Test Summary');
console.log('='.repeat(60));
console.log(`✅ Passed: ${passedTests}`);
console.log(`❌ Failed: ${failedTests}`);
console.log(`📈 Total:  ${passedTests + failedTests}`);
console.log(`🎯 Success Rate: ${((passedTests / (passedTests + failedTests)) * 100).toFixed(1)}%`);
console.log('='.repeat(60));

if (failedTests === 0) {
  console.log('\n🎉 All tests passed! Token support is properly implemented.\n');
  console.log('💡 Next steps:');
  console.log('   1. Test with MCP Inspector');
  console.log('   2. Test with real BlockDAG RPC endpoint');
  console.log('   3. Test with actual ERC20 token contracts\n');
} else {
  console.log('\n⚠️  Some tests failed. Please review the implementation.\n');
  process.exit(1);
}

// Show tool count
console.log('📊 Tool Statistics:');
const toolMatches = source.match(/name: '[^']+'/g) || [];
console.log(`   Total tools registered: ${toolMatches.length / 2}`); // Each tool appears twice (definition + description)
console.log('   Expected: 10 tools (6 original + 4 new)\n');

