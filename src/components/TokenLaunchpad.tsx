import { SiSolana } from "react-icons/si";
import { useState } from "react";
import {
  Keypair,
  SystemProgram,
  Transaction,
  PublicKey,
} from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  TOKEN_2022_PROGRAM_ID,
  createMintToInstruction,
  createAssociatedTokenAccountInstruction,
  getMintLen,
  createInitializeMetadataPointerInstruction,
  createInitializeMintInstruction,
  TYPE_SIZE,
  LENGTH_SIZE,
  ExtensionType,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import { createInitializeInstruction, pack } from "@solana/spl-token-metadata";
import toast, { Toaster } from "react-hot-toast";
import Navbar from "./Navbar";

interface TokenMetadata {
  mint: PublicKey;
  name: string;
  symbol: string;
  uri: string;
  additionalMetadata: [];
}

export default function TokenLaunchpad() {
  const { connection } = useConnection();
  const wallet = useWallet();

  const [tokenData, setTokenData] = useState({
    name: "",
    symbol: "",
    imageURL: "",
    initialSupply: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTokenData({ ...tokenData, [e.target.name]: e.target.value });
  };

  const createToken = async () => {
    if (!wallet.publicKey) {
      toast.error("❌ Wallet not connected.");
      return;
    }

    if (!tokenData.name || !tokenData.symbol || !tokenData.initialSupply) {
      toast.error("⚠️ Please fill all fields.");
      return;
    }

    try {
      const mintKeypair = Keypair.generate();
      const metadata: TokenMetadata = {
        mint: mintKeypair.publicKey,
        name: tokenData.name.trim(),
        symbol: tokenData.symbol.trim(),
        uri: tokenData.imageURL.trim() || "https://cdn.100xdevs.com/metadata.json",
        additionalMetadata: [],
      };

      const mintLen = getMintLen([ExtensionType.MetadataPointer]);
      const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length;
      const lamports = await connection.getMinimumBalanceForRentExemption(
        mintLen + metadataLen
      );

      const transaction = new Transaction().add(
        SystemProgram.createAccount({
          fromPubkey: wallet.publicKey,
          newAccountPubkey: mintKeypair.publicKey,
          space: mintLen,
          lamports,
          programId: TOKEN_2022_PROGRAM_ID,
        }),
        createInitializeMetadataPointerInstruction(
          mintKeypair.publicKey,
          wallet.publicKey,
          mintKeypair.publicKey,
          TOKEN_2022_PROGRAM_ID
        ),
        createInitializeMintInstruction(
          mintKeypair.publicKey,
          9,
          wallet.publicKey,
          null,
          TOKEN_2022_PROGRAM_ID
        ),
        createInitializeInstruction({
          programId: TOKEN_2022_PROGRAM_ID,
          mint: mintKeypair.publicKey,
          metadata: mintKeypair.publicKey,
          name: metadata.name,
          symbol: metadata.symbol,
          uri: metadata.uri,
          mintAuthority: wallet.publicKey,
          updateAuthority: wallet.publicKey,
        })
      );

      transaction.feePayer = wallet.publicKey;
      transaction.recentBlockhash = (await connection.getLatestBlockhash())
        .blockhash;
      transaction.partialSign(mintKeypair);

      await wallet.sendTransaction(transaction, connection);
      toast.success(`✅ Token Mint Created at ${mintKeypair.publicKey.toBase58()}`, { position: "bottom-right" });

      // Create Associated Token Account
      const associatedToken = getAssociatedTokenAddressSync(
        mintKeypair.publicKey,
        wallet.publicKey,
        false,
        TOKEN_2022_PROGRAM_ID
      );

      const transaction2 = new Transaction().add(
        createAssociatedTokenAccountInstruction(
          wallet.publicKey,
          associatedToken,
          wallet.publicKey,
          mintKeypair.publicKey,
          TOKEN_2022_PROGRAM_ID
        )
      );

      await wallet.sendTransaction(transaction2, connection);
      toast.success(`✅ Associated Token Account Created!`, { position: "bottom-right" });

      // Mint Initial Supply
      const mintAmount = parseFloat(tokenData.initialSupply) || 1000;
      const transaction3 = new Transaction().add(
        createMintToInstruction(
          mintKeypair.publicKey,
          associatedToken,
          wallet.publicKey,
          mintAmount * 10 ** 9,
          [],
          TOKEN_2022_PROGRAM_ID
        )
      );

      await wallet.sendTransaction(transaction3, connection);
      toast.success(`✅ Minted ${mintAmount} Tokens!`, { position: "bottom-right" });

    } catch (error) {
      console.error("❌ Token Creation Failed:", error);
      toast.error("❌ Token Creation Failed. Check console for details.", { position: "bottom-right" });
    }
  };

  return (
    <>
      <Navbar />
      <Toaster position="bottom-right" />
      <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-gray-950 font-sans p-4">
        <div className="relative z-10 w-full max-w-md backdrop-blur-2xl bg-white/1 rounded-3xl border border-white/30 shadow-2xl shadow-black/60 ring-1 ring-white/20 ring-inset p-8 flex flex-col items-center gap-4">
          <h1 className="text-3xl font-bold flex items-center gap-2 text-purple-500 mb-2"><SiSolana color="white" />olana Token Launchpad</h1>
          <input
            type="text"
            name="name"
            placeholder="Token Name"
            className="w-full py-3.5 pr-4 pl-4 backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl focus:border-blue-400/50 focus:ring-2 focus:ring-blue-500/40 focus:outline-none transition-all duration-300 text-white placeholder-white/50"
            value={tokenData.name}
            onChange={handleChange}
          />
          <input
            type="text"
            name="symbol"
            placeholder="Symbol"
            className="w-full py-3.5 pr-4 pl-4 backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl focus:border-blue-400/50 focus:ring-2 focus:ring-blue-500/40 focus:outline-none transition-all duration-300 text-white placeholder-white/50"
            value={tokenData.symbol}
            onChange={handleChange}
          />
          <input
            type="text"
            name="imageURL"
            placeholder="Image URL"
            className="w-full py-3.5 pr-4 pl-4 backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl focus:border-blue-400/50 focus:ring-2 focus:ring-blue-500/40 focus:outline-none transition-all duration-300 text-white placeholder-white/50"
            value={tokenData.imageURL}
            onChange={handleChange}
          />
          <input
            type="number"
            name="initialSupply"
            placeholder="Initial Supply"
            className="w-full py-3.5 pr-4 pl-4 backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl focus:border-blue-400/50 focus:ring-2 focus:ring-blue-500/40 focus:outline-none transition-all duration-300 text-white placeholder-white/50"
            value={tokenData.initialSupply}
            onChange={handleChange}
          />
          <button
            onClick={createToken}
            className="w-full py-4 rounded-xl text-white bg-blue-600 hover:bg-blue-700 transition-all duration-200 font-semibold mt-2"
          >
            Create Token
          </button>
        </div>
      </div>
    </>
  );
}