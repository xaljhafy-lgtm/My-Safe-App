import React, { useState, useEffect } from 'react';
import { LoginScreen } from './components/LoginScreen';
import { VaultDashboard } from './components/VaultDashboard';
import { getVaultData, saveVaultData } from './services/storage';
import { VaultData } from './types';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [vaultData, setVaultData] = useState<VaultData>(() => getVaultData());

  // Reload or synchronize from storage on mount
  useEffect(() => {
    const loaded = getVaultData();
    setVaultData(loaded);
  }, []);

  const handleUpdateVault = (newData: VaultData) => {
    setVaultData(newData);
    saveVaultData(newData);
  };

  const handleLogin = () => {
    // Subtle cyber click/beep audio feedback
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {
      // AudioContext unavailable or blocked
    }
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {
      // AudioContext unavailable
    }
    setIsLoggedIn(false);
  };

  return (
    <div className="min-h-screen bg-[#0d1b2a] font-sans" dir="rtl">
      {!isLoggedIn ? (
        <LoginScreen
          onLoginSuccess={handleLogin}
          vaultData={vaultData}
          onUpdateVault={handleUpdateVault}
        />
      ) : (
        <VaultDashboard
          vaultData={vaultData}
          onUpdateVault={handleUpdateVault}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}
