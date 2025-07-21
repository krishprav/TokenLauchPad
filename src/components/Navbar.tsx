// Requires: npm install react-router-dom
import React from "react";
import { NavLink } from "react-router-dom";
import { WalletMultiButton, WalletDisconnectButton } from '@solana/wallet-adapter-react-ui';

const navItems = [
  { name: "Airdrop", path: "/airdrop" },
  { name: "Create Token", path: "/create-token" },
  { name: "Send Token", path: "/send-token" },
  { name: "Balances", path: "/balances" },
  { name: "Transactions", path: "/transactions" }
];

const Navbar: React.FC = () => {
  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-5xl px-6 py-2 bg-white/10 border border-white/30 rounded-full shadow-xl backdrop-blur-2xl flex items-center gap-2">
      {/* Connect Wallet (left) */}
      <div className="flex-shrink-0">
        <WalletMultiButton/>
      </div>
      {/* Nav Links (center) */}
      <div className="flex gap-2 flex-1 justify-center min-w-0">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={(props: { isActive: boolean }) =>
              `px-5 py-2 rounded-full font-semibold text-white transition-all duration-200 flex items-center justify-center text-base whitespace-nowrap ${
                props.isActive
                  ? "bg-white/20 shadow text-white"
                  : "hover:bg-white/10 hover:text-blue-200 text-white/90"
              }`
            }
          >
            {item.name}
          </NavLink>
        ))}
      </div>
      {/* Disconnect Wallet (right) */}
      <div className="flex-shrink-0">
        <WalletDisconnectButton/>
      </div>
    </nav>
  );
};

export default Navbar; 