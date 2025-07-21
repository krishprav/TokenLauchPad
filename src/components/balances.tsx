import { useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import Navbar from "./Navbar";

export default function BalancesPage() {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const [tokens, setTokens] = useState<any[]>([]);

  useEffect(() => {
    if (!publicKey) return;
    connection.getParsedTokenAccountsByOwner(publicKey, { programId: TOKEN_PROGRAM_ID })
      .then((res) => {
        const balances = res.value.map((acc) => acc.account.data.parsed.info);
        setTokens(balances);
      });
  }, [publicKey]);

  return (
    <>
      <Navbar />
      <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-gray-950 font-sans p-4">
        <div className="relative z-10 w-full max-w-md max-h-[80vh] overflow-y-auto backdrop-blur-2xl bg-white/1 rounded-3xl border border-white/30 shadow-2xl shadow-black/60 ring-1 ring-white/20 ring-inset">
          <div className="p-8 border-b border-white/10 relative">
            <h1 className="text-3xl font-bold text-center text-white mt-6">Token Balances</h1>
            <p className="text-center text-white/60 mt-2">All SPL tokens in your wallet</p>
          </div>
          <ul className="p-8 space-y-4">
            {tokens.length === 0 && (
              <li className="text-center text-white/50">No tokens found.</li>
            )}
            {tokens.map((t, i) => (
              <li key={i} className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                <span className="text-2xl">💰</span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white truncate group relative">
                    <span title={t.mint}>{t.mint}</span>
                    <button
                      className="ml-2 text-xs text-blue-300 hover:text-blue-500 underline"
                      title="Copy Mint Address"
                      onClick={async (e) => {
                        e.preventDefault();
                        try {
                          await navigator.clipboard.writeText(t.mint);
                          alert("Mint address copied!");
                        } catch (err) {
                          // Fallback for older browsers or if clipboard API fails
                          try {
                            const textarea = document.createElement("textarea");
                            textarea.value = t.mint;
                            document.body.appendChild(textarea);
                            textarea.select();
                            document.execCommand("copy");
                            document.body.removeChild(textarea);
                            alert("Mint address copied!");
                          } catch (err2) {
                            alert("Failed to copy. Please copy manually.");
                          }
                        }
                      }}
                    >
                      Copy
                    </button>
                  </div>
                  <div className="text-white/70 text-sm truncate">Balance: {Number(t.tokenAmount.uiAmountString)}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
} 