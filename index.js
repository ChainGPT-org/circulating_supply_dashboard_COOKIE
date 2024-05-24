
const NodeCache = require('node-cache');
const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = 3000;

// BSCSCAN API Key (ENV)
const apiKey = process.env.BSCSCAN_API_KEY;

// Contract address of FURY token (ENV)
const cgptContractAddress = process.env.CGPT_CONTRACT_ADDRESS;

// Maximum Supply of FURY token (ENV)
const MaxSupply = process.env.CGPT_MAX_SUPPLY;

const cache = new NodeCache({ stdTTL: 600 }); // Set the cache expiration time to 600 seconds (10 minutes)

// List of contract addresses with additional information
const contractAddresses = [
  {
    address: '0x1439ddD594127924B2624C27689B150D1A6fb723',
    chain: 'BSC',
    type: 'TeamFinance Vesting',
    wallet: 'Private Round (ref: tokenomics)', 
  },
  {
    address: '0x9a12259e74ca8BB01AEfF93d71FB74636a60514d',
    chain: 'BSC',
    type: 'TeamFinance Vesting',
    wallet: 'KOLs Round (ref: tokenomics)', 
  },
  {
    address: '0x3B228e107686fa4BB19FF4F2752be1A05895ec90',
    chain: 'BSC',
    type: 'TeamFinance Vesting',
    wallet: 'Advisory/Partners Round (ref: tokenomics)', 
  },
  {
    address: '0x609f9B56e1EFBf0152B0f1212C354467842219b0',
    chain: 'BSC',
    type: 'TeamFinance Vesting',
    wallet: 'Team(EOF) Round (ref: tokenomics)', 
  },
  {
    address: '0xaA33Fa2fB63e6b6f3919855496c1F6Bb3c2b94C6',
    chain: 'BSC',
    type: 'TeamFinance Vesting',
    wallet: 'Team(Estonia) Round (ref: tokenomics)', 
  },
  {
    address: '0xcC7087bEaE57D30504735a64314489f4b98aD3bd',
    chain: 'BSC',
    type: 'TeamFinance Vesting',
    wallet: 'Marketing/Ecosystem Round (ref: tokenomics)', 
  },
  {
    address: '0x6ea9c78A6bd4699E133D2267099988165C4b896A',
    chain: 'BSC',
    type: 'TeamFinance Vesting',
    wallet: 'Development/Treasury Round (ref: tokenomics)', 
  },
  {
    address: '0x6293578A8d4bA23789765B2d9b1d8d047438C272',
    chain: 'BSC',
    type: 'TeamFinance Vesting',
    wallet: 'ChainGPT Labs Advisory/Partners Round (ref: tokenomics)', 
  },
  {
    address: '0x57c6e071Bc353cd9Fa4A5ae5aD1851AFfb5B2f6f',
    chain: 'BSC',
    type: 'TeamFinance Vesting',
    wallet: 'ChainGPT Labs Advisory/Partners Round (ref: tokenomics)', 
  },
  {
    address: '0xc0482f4218EA6753d88775c407B07cc7165d035C',
    chain: 'BSC',
    type: 'TeamFinance Vesting',
    wallet: 'ChainGPT Labs Advisory/Partners Round (ref: tokenomics)', 
  },
  {
    address: '0x1a97191beF61189045eDa67A67983750D6A4BCBd',
    chain: 'BSC',
    type: 'TeamFinance Vesting',
    wallet: 'ChainGPT Labs Marketing/Ecosystem Round (ref: tokenomics)', 
  },
  {
    address: '0x89822b918875a1782d89d932aac35763da369ba4',
    chain: 'BSC',
    type: 'TeamFinance Vesting',
    wallet: 'ChainGPT Labs Marketing/Ecosystem Round (ref: tokenomics)', 
  },
  {
    address: '0x69547C4098BDEC06CAf82FC35c6CcF4a2F19c4E6',
    chain: 'BSC',
    type: 'TeamFinance Vesting',
    wallet: 'ChainGPT Labs Marketing/Ecosystem Round (ref: tokenomics)', 
  },
  {
    address: '0x1ae65F6a841c839ceb9bb443e414993C2275C47f',
    chain: 'BSC',
    type: 'TeamFinance Vesting',
    wallet: 'ChainGPT Labs Marketing/Ecosystem Round (ref: tokenomics)', 
  },
  {
    address: '0xB0cD1942e959cAD1428D67A346050d2671C67D0F',
    chain: 'BSC',
    type: 'Multisig Liquidity Provision',
    wallet: 'Liquidity Provision Round (ref: tokenomics)', 
  },
  {
    address: '0x8D46D9f9cF0cee96BBfcbe780CF5A2245c74084F',
    chain: 'BSC',
    type: 'Public Round (IDO)',
    wallet: 'ChainGPT Pad IDO (ref: tokenomics)', 
  },
  {
    address: '0xf302C4ca0089CEc4f541260E2dB3913511C12255',
    chain: 'BSC',
    type: 'Public Round (IDO)',
    wallet: 'Sidus Pad IDO (ref: tokenomics)', 
  },
  {
    address: '0x66FF27A2a38250D3E4a959Ba525cb5B8789893be',
    chain: 'BSC',
    type: 'Public Round (IDO)',
    wallet: 'ApeTerminal Pad IDO (ref: tokenomics)', 
  },
  {
    address: '0x29892C3C017344cFe360689F456d29DC6672e68D',
    chain: 'BSC',
    type: 'Multisig Liquidity Provision',
    wallet: 'Liquidity Provision Round (ref: tokenomics)',
  },
  {
    address: '0x640199a4D52245e4590CDb5649f8644cE8aB2C2B',
    chain: 'BSC',
    type: 'Multisig Liquidity Provision',
    wallet: 'Liquidity Provision Round (ref: tokenomics)',
  },
];


async function getTotalSupply() {
  const cachedTotalSupply = cache.get('totalSupply');
  if (cachedTotalSupply !== undefined) {
    return cachedTotalSupply;
  }

  try {
    const url = `https://api.bscscan.com/api?module=stats&action=tokensupply&contractaddress=${cgptContractAddress}&apikey=${apiKey}`;
    const response = await axios.get(url);
    const result = response.data.result;

    cache.set('totalSupply', result); // Cache the total supply

    return result;
  } catch (error) {
    console.error('Error fetching total supply:', error);
    throw error;
  }
}

// This is the home-page URL that will show a detailed list of the excluded addresses from the supply and all the data such as total supply, burnt supply, circulating supply, etc.
app.get('/', async (req, res) => {
  const cachedBalances = cache.get('balances');
  if (cachedBalances !== undefined) {
    res.send(cachedBalances);
    return;
  }

  try {
    const balances = [];

    for (const { address, chain, type, wallet, name } of contractAddresses) {
      
        await new Promise(resolve => setTimeout(resolve, 250));

      const url = `https://api.bscscan.com/api?module=account&action=tokenbalance&contractaddress=${cgptContractAddress}&address=${address}&tag=latest&apikey=${apiKey}`;
      const response = await axios.get(url);
      const balance = parseInt(response.data.result);

      balances.push({ address, balance, chain, type, wallet, name });
    }

    balances.sort((a, b) => b.balance - a.balance); // Sort balances in descending order

    let totalBalance = 0;
    
    let tableRows = '';

    for (const { address, balance, chain, type, wallet } of balances) {
      totalBalance += balance;
      const bscScanLink = `https://bscscan.com/token/0x9840652DC04fb9db2C43853633f0F62BE6f00f98?a=${address}`;
 
      tableRows += `<tr>
      <td><a href="${bscScanLink}" target="_blank">${address}</a></td>
        <td>${Math.floor(balance / 10 ** 18).toLocaleString()}</td>
        <td>${chain}</td>
        <td>${type}</td>
        <td>${wallet}</td>
      </tr>`;
    }

    const totalSupplyEndpointResult = await getTotalSupply();
    const burntTokens = MaxSupply - Math.floor(totalSupplyEndpointResult / 10 ** 18);
    const totalSupply = MaxSupply - Math.floor(totalBalance / 10 ** 18) - burntTokens;

    const htmlResponse = ` <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 20px;
      background-color: #f5f5f5;
    }
  
    h1 {
      color: #333;
      font-size: 32px;
      margin-bottom: 20px;
      text-align: center;
    }
  
    p {
      color: #666;
      font-size: 16px;
      margin-bottom: 10px;
    }
  
    table {
      border-collapse: collapse;
      width: 100%;
      margin-bottom: 20px;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
      background-color: #fff;
    }
  
    th,
    td {
      border: 1px solid #ddd;
      padding: 12px;
      text-align: left;
    }
  
    th {
      background-color: #f9f9f9;
      font-weight: bold;
      font-size: 16px;
    }
  
    tr:nth-child(even) {
      background-color: #f2f2f2;
    }
  
    a {
      color: #337ab7;
      text-decoration: underline;
    }
  
    a:hover {
      color: #23527c;
    }
  
    .title-row {
      background-color: #333;
      color: black;
      font-weight: bold;
      font-size: 18px;
    }
  
    .total-supply-row {
      background-color: #f9f9f9;
    }
  
    .empty-row {
      background-color: transparent;
    }
  
    /* Responsive Styles */
    @media screen and (max-width: 600px) {
      h1 {
        font-size: 24px;
      }
  
      p {
        font-size: 14px;
      }
  
      th,
      td {
        padding: 8px;
      }
    }
  </style>
  
  <h1>FURY Circulating Supply Tracker</h1>
  <p>Total Supply: 120,000,000</p>
  <p>Burnt FURY: ${burntTokens.toLocaleString()}</p>
  <p>Live Circulating Supply of FURY: ${totalSupply.toLocaleString()} </p>
  <br><br>
  <table>
    <tr class="title-row">
      <th>Contract Address</th>
      <th>Balance (FURY)</th>
      <th>Chain</th>
      <th>Type</th>
      <th>Name</th>
    </tr>
    ${tableRows}
    <tr class="empty-row">
      <td colspan="5"></td>
    </tr>
    <tr class="total-supply-row">
      <td>FURY Circulating Supply</td>
      <td>${totalSupply.toLocaleString()}</td>
      <td></td>
      <td></td>
      <td></td>
    </tr>
  </table>

    `;

    cache.set('balances', htmlResponse); // Cache the response

    res.send(htmlResponse);
  } catch (error) {
    res.status(500).send('Error fetching data');
  }
});



// This is an API endpoint that will show only the number of the circulating supply (normally used for CMC supply tracking)
app.get('/supply', async (req, res) => {
  const cachedSupply = cache.get('supply');
  if (cachedSupply !== undefined) {
    res.send(cachedSupply);
    return;
  }

  try {
    const balances = [];

    for (const { address, chain, type, wallet, name } of contractAddresses) {
      // Introduce a delay of 250ms (1 second / 4) between each API call
      await new Promise(resolve => setTimeout(resolve, 250));

      const url = `https://api.bscscan.com/api?module=account&action=tokenbalance&contractaddress=${cgptContractAddress}&address=${address}&tag=latest&apikey=${apiKey}`;
      const response = await axios.get(url);
      const balance = parseInt(response.data.result);

      balances.push({ address, balance, chain, type, wallet, name });
    }

    balances.sort((a, b) => b.balance - a.balance); // Sort balances in descending order

    let totalBalance = 0;
    let tableRows = '';

    for (const { address, balance, chain, type, wallet } of balances) {
      totalBalance += balance;
      tableRows += `<tr>
        <td>${address}</td>
        <td>${Math.floor(balance / 10 ** 18)}</td>
        <td>${chain}</td>
        <td>${type}</td>
        <td>${wallet}</td>
      </tr>`;
    }

    const totalSupplyEndpointResult = await getTotalSupply();
    const burntTokens = MaxSupply - Math.floor(totalSupplyEndpointResult / 10 ** 18);
    const totalSupply = MaxSupply - Math.floor(totalBalance / 10 ** 18) - burntTokens;

    const htmlResponse = `${totalSupply}`;

    cache.set('supply', htmlResponse); // Cache the supply response

    res.send(htmlResponse);
  } catch (error) {
    res.status(500).send('Error fetching data');
  }
});


// This API endpoint will show the total supply
app.get('/totalsupply', async (req, res) => {
  const cachedSupply = cache.get('newtotal');
  if (cachedSupply !== undefined) {
    res.send(cachedSupply);
    return;
  }

  try {
    const balances = [];

    for (const { address, chain, type, wallet, name } of contractAddresses) {
        await new Promise(resolve => setTimeout(resolve, 250));

      const url = `https://api.bscscan.com/api?module=account&action=tokenbalance&contractaddress=${cgptContractAddress}&address=${address}&tag=latest&apikey=${apiKey}`;
      const response = await axios.get(url);
      const balance = parseInt(response.data.result);

      balances.push({ address, balance, chain, type, wallet, name });
    }

    balances.sort((a, b) => b.balance - a.balance); // Sort balances in descending order

    let totalBalance = 0;
    let tableRows = '';

    for (const { address, balance, chain, type, wallet } of balances) {
      totalBalance += balance;
      tableRows += `<tr>
        <td>${address}</td>
        <td>${Math.floor(balance / 10 ** 18)}</td>
        <td>${chain}</td>
        <td>${type}</td>
        <td>${wallet}</td>
      </tr>`;
    }

    const totalSupplyEndpointResult = await getTotalSupply();
    const burntTokens = MaxSupply - Math.floor(totalSupplyEndpointResult / 10 ** 18);
    const totalSupply = MaxSupply - Math.floor(totalBalance / 10 ** 18) - burntTokens;
    const newTotalS = MaxSupply - burntTokens; 
    const htmlResponse = `${newTotalS}`;

    cache.set('newtotal', htmlResponse); // Cache the newtotal response

    res.send(htmlResponse);
  } catch (error) {
    res.status(500).send('Error fetching data');
  }
});



// This API endpoint will show the total tokens burnt
app.get('/burn', async (req, res) => {
  const cachedSupply = cache.get('burn');
  if (cachedSupply !== undefined) {
    res.send(cachedSupply);
    return;
  }

  try {
    const balances = [];

    for (const { address, chain, type, wallet, name } of contractAddresses) {
        await new Promise(resolve => setTimeout(resolve, 250));

      const url = `https://api.bscscan.com/api?module=account&action=tokenbalance&contractaddress=${cgptContractAddress}&address=${address}&tag=latest&apikey=${apiKey}`;
      const response = await axios.get(url);
      const balance = parseInt(response.data.result);

      balances.push({ address, balance, chain, type, wallet, name });
    }

    balances.sort((a, b) => b.balance - a.balance); // Sort balances in descending order

    let totalBalance = 0;
    let tableRows = '';

    for (const { address, balance, chain, type, wallet } of balances) {
      totalBalance += balance;
      tableRows += `<tr>
        <td>${address}</td>
        <td>${Math.floor(balance / 10 ** 18).toLocaleString()}</td>
        <td>${chain}</td>
        <td>${type}</td>
        <td>${wallet}</td>
      </tr>`;
    }

    const totalSupplyEndpointResult = await getTotalSupply();
    const burntTokens = MaxSupply - Math.floor(totalSupplyEndpointResult / 10 ** 18);
    const totalSupply = MaxSupply - Math.floor(totalBalance / 10 ** 18) - burntTokens;

    const htmlResponse = `${burntTokens.toLocaleString()}`;

    cache.set('burn', htmlResponse); // Cache the burn response

    res.send(htmlResponse);
  } catch (error) {
    res.status(500).send('Error fetching data');
  }
});


app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
