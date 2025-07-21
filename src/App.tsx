
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import {
    WalletModalProvider,
} from '@solana/wallet-adapter-react-ui';
import '@solana/wallet-adapter-react-ui/styles.css';
import { Routes, Route } from 'react-router-dom';
import TokenLaunchpad from './components/TokenLaunchpad';
import AirdropPage from './components/airdrop';
import SendTokenPage from './components/send-token';
import BalancesPage from './components/balances';
import TransactionsPage from './components/transactions';

function App() {
  return (
    <div>
      <ConnectionProvider endpoint={"https://api.devnet.solana.com"}>
        <WalletProvider wallets={[]} autoConnect>
          <WalletModalProvider>
            <Routes>
              <Route path="/" element={<TokenLaunchpad />} />
              <Route path="/airdrop" element={<AirdropPage />} />
              <Route path="/create-token" element={<TokenLaunchpad />} />
              <Route path="/send-token" element={<SendTokenPage />} />
              <Route path="/balances" element={<BalancesPage />} />
              <Route path="/transactions" element={<TransactionsPage />} />
            </Routes>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </div>
  );
}

export default App;