import { useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import toast, { Toaster } from "react-hot-toast";
import Navbar from "./Navbar";

export default function SendTokens() {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();

  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const sendTokens = async () => {
    if (!publicKey) {
      toast.error("⚠️ Connect your wallet first!");
      return;
    }

    if (!recipient || !PublicKey.isOnCurve(new PublicKey(recipient))) {
      toast.error("⚠️ Enter a valid Solana address!");
      return;
    }

    const solAmount = parseFloat(amount);
    if (isNaN(solAmount) || solAmount <= 0) {
      toast.error("⚠️ Enter a valid SOL amount!");
      return;
    }

    try {
      setLoading(true);
      toast.loading("⏳ Sending transaction...", { id: "tx" });

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(recipient),
          lamports: solAmount * LAMPORTS_PER_SOL,
        })
      );

      const signature = await sendTransaction(transaction, connection);
      toast.success(
        <span>
          ✅ Transaction successful!{" "}
          <a
            href={`https://explorer.solana.com/tx/${signature}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-blue-300"
          >
            View on Explorer
          </a>
        </span>,
        { id: "tx", duration: 7000 }
      );

      setRecipient("");
      setAmount("");
    } catch (error) {
      toast.error(`❌ Transaction failed: ${error}`, { id: "tx" });
      console.error("Transaction Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <Toaster position="bottom-right" />
      <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-gray-950 font-sans p-4">
        <div className="relative z-10 w-full max-w-md backdrop-blur-2xl bg-white/1 rounded-3xl border border-white/30 shadow-2xl shadow-black/60 ring-1 ring-white/20 ring-inset p-8 flex flex-col items-center gap-4">
          <h2 className="text-3xl font-semibold text-center text-purple-500">Send SOL</h2>
          <input
            type="text"
            placeholder="Recipient Address"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            className="w-full py-3.5 pr-4 pl-4 backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl focus:border-blue-400/50 focus:ring-2 focus:ring-blue-500/40 focus:outline-none transition-all duration-300 text-white placeholder-white/50"
          />
          <input
            type="number"
            placeholder="Amount (SOL)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full py-3.5 pr-4 pl-4 backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl focus:border-blue-400/50 focus:ring-2 focus:ring-blue-500/40 focus:outline-none transition-all duration-300 text-white placeholder-white/50"
            min="0.01"
            step="0.01"
          />
          <button
            onClick={sendTokens}
            disabled={loading}
            className={`w-full py-4 rounded-xl text-white bg-blue-600 hover:bg-blue-700 transition-all duration-200 font-semibold mt-2 ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            {loading ? "Processing..." : "Send SOL"}
          </button>
        </div>
      </div>
    </>
  );
} 