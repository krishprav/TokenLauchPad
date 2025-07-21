import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import React, { useState } from "react";
import Navbar from "./Navbar";

const GlassInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { icon?: string }> = ({ icon, ...props }) => (
  <div className="relative">
    {icon && (
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl opacity-60 pointer-events-none">{icon}</span>
    )}
    <input
      {...props}
      className={`w-full py-3.5 pr-4 backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl focus:border-blue-400/50 focus:ring-2 focus:ring-blue-500/40 focus:outline-none transition-all duration-300 text-white placeholder-white/50 ${icon ? "pl-12" : "pl-4"}`}
    />
  </div>
);

export default function AirdropPage() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [amount, setAmount] = useState("2");

  async function requestAirdrop() {
    if (!publicKey) return alert("Connect wallet first");
    try {
      const lamports = Number(amount) * 1e9;
      const sig = await connection.requestAirdrop(publicKey, lamports);
      await connection.confirmTransaction(sig, "confirmed");
      alert(`${amount} SOL Airdropped`);
    } catch (e) {
      const err = e as any;
      console.error('Airdrop error:', err);
      alert("Airdrop failed: " + (err && (err.message || err.toString?.() || String(err))));
    }
  }

  return (
    <>
      <Navbar />
      <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-gray-950 font-sans p-4">
        <div className="relative z-10 w-full max-w-md backdrop-blur-2xl bg-white/1 rounded-3xl border border-white/30 shadow-2xl shadow-black/60 ring-1 ring-white/20 ring-inset">
          <div className="p-8 border-b border-white/10 relative">
            <h1 className="text-3xl font-bold text-center text-white mt-6">Request Airdrop</h1>
            <p className="text-center text-white/60 mt-2">Get free SOL on Devnet</p>
          </div>
          <div className="p-8 space-y-4">
            <GlassInput
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="Amount (SOL)"
              icon="💧"
            />
            <button
              onClick={requestAirdrop}
              className="w-full py-4 rounded-xl text-white bg-blue-600 hover:bg-blue-700 transition-all duration-200"
            >
              Airdrop {amount} SOL
            </button>
          </div>
        </div>
      </div>
    </>
  );
} 