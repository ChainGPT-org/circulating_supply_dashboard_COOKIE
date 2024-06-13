
const NodeCache = require('node-cache');
const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = 3000;

// BSCSCAN API Key (ENV)
const apiKey = process.env.BSCSCAN_API_KEY;

// Contract address of COOKIE token (ENV)
const cgptContractAddress = process.env.CGPT_CONTRACT_ADDRESS;

// Maximum Supply of COOKIE token (ENV)
const MaxSupply = process.env.CGPT_MAX_SUPPLY;

const cache = new NodeCache({ stdTTL: 600 }); // Set the cache expiration time to 600 seconds (10 minutes)

// List of contract addresses with additional information
const contractAddresses = [
  {
    address: '0xe869e7b9DA52AAC17A856693b57d4cB22CB52B90',
    chain: 'BNB',
    type: 'TeamFinance Vesting',
    wallet: 'Pre-Seed Round (ref: tokenomics)', 
  },
  {
    address: '0xbf2220496d9AD85F89198D88AcE3D2BF2CdAcB3f',
    chain: 'BNB',
    type: 'TeamFinance Vesting',
    wallet: 'Seed Round (ref: tokenomics)', 
  },
  {
    address: '0xA98827db3Bd5F9FAD43141A48526AE110199Edd0',
    chain: 'BNB',
    type: 'TeamFinance Vesting',
    wallet: 'Strategic Round (ref: tokenomics)', 
  },
  {
    address: '0x2c71243F83575fE271c2E1B0240E7bcb2243dd36',
    chain: 'BNB',
    type: 'TeamFinance Vesting',
    wallet: 'KOLs Round (ref: tokenomics)', 
  },
  {
    address: '0x3D833b5a7C554ded47accBdc12E709E871F238e5',
    chain: 'BNB',
    type: 'TeamFinance Vesting',
    wallet: 'Pre-Sale Round (ref: tokenomics)', 
  },
  {
    address: '0xb26e08a9040f994a89f8a15a9165a217a3bc1141',
    chain: 'BNB',
    type: 'TeamFinance Vesting',
    wallet: 'Ecosystem Incentives Round (ref: tokenomics)', 
  },
  {
    address: '0x08f08790b51B622412ac11567C3933cce637EDAa',
    chain: 'BNB',
    type: 'TeamFinance Vesting',
    wallet: 'Advisory Round (ref: tokenomics)', 
  },
  {
    address: '0xA880f512efbc14058Df9287915DBe0963e73b5AF',
    chain: 'BNB',
    type: 'TeamFinance Vesting',
    wallet: 'Marketing Round (ref: tokenomics)', 
  },
  {
    address: '0xAD43f0A15C3A2b103a582d82da9a61A4A132429a',
    chain: 'BNB',
    type: 'TeamFinance Vesting',
    wallet: 'Team Round (ref: tokenomics)', 
  },
  {
    address: '0x458eeF8f007A9193Fc4d5a277bf4b172F1Ddb992',
    chain: 'BNB',
    type: 'TeamFinance Vesting',
    wallet: 'Treasury Round (ref: tokenomics)', 
  },
  {
    address: '0x40AF9DF73b731760CECe6609c60fA40aFD9810fa',
    chain: 'BNB',
    type: 'TeamFinance Vesting',
    wallet: 'Advisory Round [ChainGPT Labs Fee] (ref: tokenomics)', 
  },
  {
    address: '0x6Aa5B9F75fd8f3C44d336B9753090159942187bd',
    chain: 'BNB',
    type: 'TeamFinance Vesting',
    wallet: 'Advisory Round [ChainGPT Labs Fee] (ref: tokenomics)', 
  },
  {
    address: '0xbA80Cb24185EF36deb1607Ab4CA17aC1389a6957',
    chain: 'BNB',
    type: 'ChainGPT Pad Vesting',
    wallet: 'Advisory Round [ChainGPT Pad Giveaway] (ref: tokenomics)', 
  },
  {
    address: '0x0946D75e2ae97A3D070266d58d219296005E57b4',
    chain: 'BNB',
    type: 'ChainGPT Pad IDO Vesting',
    wallet: 'Public Round (ref: tokenomics)', 
  },
  {
    address: '0xb9380598B379F704E128c28011525DD8a9BaF524',
    chain: 'BNB',
    type: 'Polkastarter Pad IDO Vesting',
    wallet: 'Public Round (ref: tokenomics)', 
  },
  {
    address: '0x0ECa5f003a8D2471c6089AfCB0C8fD972c4615A8',
    chain: 'BNB',
    type: 'Airdrop Community',
    wallet: 'Airdrop Round (ref: tokenomics)', 
  },
  {
    address: '0x538656823f1a5F82502D8A7328d7F57975fF3B72',
    chain: 'BNB',
    type: 'Airdrop Affiliate',
    wallet: 'Airdrop Round (ref: tokenomics)', 
  },
  {
    address: '0x45242f3520cf610abffcc0e3315c4fc6080b6154',
    chain: 'BNB',
    type: 'Liquidity (MS)',
    wallet: 'Liquidity Round (ref: tokenomics)', 
  },
  {
    address: '0x4589481a385A5Fa77b2003efD4Feb34E4693254f',
    chain: 'BNB',
    type: 'Liquidity (MS)',
    wallet: 'Liquidity Round (ref: tokenomics)', 
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
  
  <h1>COOKIE Circulating Supply Tracker</h1>
  <p>Total Supply: 1,000,000,000</p>
  <p>Burnt COOKIE: ${burntTokens.toLocaleString()}</p>
  <p>Live Circulating Supply of COOKIE: ${totalSupply.toLocaleString()} </p>
  <br><br>
  <table>
    <tr class="title-row">
      <th>Contract Address</th>
      <th>Balance (COOKIE)</th>
      <th>Chain</th>
      <th>Type</th>
      <th>Name</th>
    </tr>
    ${tableRows}
    <tr class="empty-row">
      <td colspan="5"></td>
    </tr>
    <tr class="total-supply-row">
      <td>COOKIE Circulating Supply</td>
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
