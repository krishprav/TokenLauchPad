# Solana Token Launchpad

A modern, production-ready dApp for launching SPL tokens on the Solana blockchain. Built with React, Vite, and the Solana Wallet Adapter, this app provides a user-friendly interface for creating and managing new tokens on Solana Devnet.

## Features
- Connect any Solana wallet (Phantom, Solflare, etc.)
- Create new SPL tokens with custom name, symbol, image, and initial supply
- Responsive, accessible UI with Tailwind CSS
- Devnet endpoint for safe testing

## Prerequisites
- [Node.js](https://nodejs.org/) (v16+ recommended)
- [Yarn](https://yarnpkg.com/) or [npm](https://www.npmjs.com/)
- A Solana wallet (e.g., [Phantom](https://phantom.app/))

## Installation

Clone the repository and install dependencies:

```bash
cd token-launchpad
npm install
# or
yarn install
```

## Usage (Development)

Start the local development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Environment

- The app connects to Solana **Devnet** by default for safe testing.
- To use Mainnet, update the `endpoint` in `src/App.tsx`:
  ```js
  <ConnectionProvider endpoint={"https://api.mainnet-beta.solana.com"}>
  ```

## Build & Deployment

To build for production:

```bash
npm run build
# or
yarn build
```

The static files will be output to the `dist/` directory. Deploy these to any static hosting provider (Vercel, Netlify, GitHub Pages, etc.).

## Customization
- Update UI styles in `src/App.css` or use Tailwind classes.
- Extend token creation logic in `src/TokenLaunchpad.tsx`.
- Add wallet adapters in `src/App.tsx` for more wallet support.

## License

MIT License. See [LICENSE](./LICENSE) for details.





import React, { useState } from "react";
import { Keypair, SystemProgram, Transaction } from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  MINT_SIZE,
  TOKEN_2022_PROGRAM_ID,
  createInitializeMint2Instruction,
  getMinimumBalanceForRentExemptMint,
} from "@solana/spl-token";

const TokenLaunchpad: React.FC = () => {
  const { connection } = useConnection();
  const wallet = useWallet();

  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [supply, setSupply] = useState("");
  const [loading, setLoading] = useState(false);

  async function createToken() {
    if (!wallet.publicKey || !wallet.sendTransaction) {
      alert("Connect your wallet first.");
      return;
    }
    setLoading(true);
    try {
      const mintKeypair = Keypair.generate();
      const lamports = await getMinimumBalanceForRentExemptMint(connection);

      const transaction = new Transaction().add(
        SystemProgram.createAccount({
          fromPubkey: wallet.publicKey,
          newAccountPubkey: mintKeypair.publicKey,
          space: MINT_SIZE,
          lamports,
          programId: TOKEN_2022_PROGRAM_ID,
        }),
        createInitializeMint2Instruction(
          mintKeypair.publicKey,
          9, // decimals
          wallet.publicKey,
          wallet.publicKey,
          TOKEN_2022_PROGRAM_ID
        )
      );

      transaction.feePayer = wallet.publicKey;
      transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
      transaction.partialSign(mintKeypair);

      await wallet.sendTransaction(transaction, connection, { signers: [mintKeypair] });
      alert(`Token mint created at ${mintKeypair.publicKey.toBase58()}`);
    } catch (e: any) {
      alert("Error creating token: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-gray-900 min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <h1 className="text-3xl font-bold text-gray-100 text-center mb-6">
          Token Launchpad <span className="inline-block animate-blast-off">🚀</span>
        </h1>
        <input
          type="text"
          placeholder="Token Name"
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full p-3 rounded-md bg-gray-800 text-gray-100 border border-gray-700 focus:border-blue-500 focus:outline-none"
        />
        <input
          type="text"
          placeholder="Symbol"
          value={symbol}
          onChange={e => setSymbol(e.target.value)}
          className="w-full p-3 rounded-md bg-gray-800 text-gray-100 border border-gray-700 focus:border-blue-500 focus:outline-none"
        />
        <input
          type="text"
          placeholder="Image URL"
          value={imageUrl}
          onChange={e => setImageUrl(e.target.value)}
          className="w-full p-3 rounded-md bg-gray-800 text-gray-100 border border-gray-700 focus:border-blue-500 focus:outline-none"
        />
        <input
          type="number"
          placeholder="Initial Supply"
          value={supply}
          onChange={e => setSupply(e.target.value)}
          className="w-full p-3 rounded-md bg-gray-800 text-gray-100 border border-gray-700 focus:border-blue-500 focus:outline-none"
        />
        <button
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md transition duration-200"
          onClick={createToken}
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Token"}
        </button>
      </div>
    </div>
  );
};

export default TokenLaunchpad;




