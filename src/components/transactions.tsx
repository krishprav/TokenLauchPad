import { useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import Navbar from "./Navbar";

export default function TransactionsPage() {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const [txs, setTxs] = useState<any[]>([]);

  useEffect(() => {
    if (!publicKey) return;
    (async () => {
      const sigs = await connection.getConfirmedSignaturesForAddress2(publicKey, { limit: 10 });
      const details = await Promise.all(
        sigs.map(sig => connection.getParsedTransaction(sig.signature))
      );
      setTxs(details);
    })();
  }, [publicKey]);

  return (
    <>
      <Navbar />
      <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-gray-950 font-sans p-4">
        <div className="relative z-10 w-full max-w-md max-h-[80vh] overflow-y-auto backdrop-blur-2xl bg-white/1 rounded-3xl border border-white/30 shadow-2xl shadow-black/60 ring-1 ring-white/20 ring-inset">
          <div className="p-8 border-b border-white/10 relative">
            <h1 className="text-3xl font-bold text-center text-white mt-6">Recent Transactions</h1>
            <p className="text-center text-white/60 mt-2">Last 10 transactions for your wallet</p>
          </div>
          <ul className="p-8 space-y-4">
            {txs.length === 0 && (
              <li className="text-center text-white/50">No transactions found.</li>
            )}
            {txs.map((tx, i) => (
              <li key={i} className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                <span className="text-2xl">🔗</span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white truncate">{tx?.transaction.signatures[0]}</div>
                  <div className="text-white/70 text-sm truncate">Slot: {tx?.slot ?? 'N/A'}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
} 