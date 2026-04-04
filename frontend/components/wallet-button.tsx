"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";

export function WalletButton() {
  return (
    <ConnectButton.Custom>
      {({ account, chain, openConnectModal, openAccountModal, openChainModal, mounted }) => {
        const connected = mounted && account && chain;
        return (
          <div {...(!mounted && { "aria-hidden": true, style: { opacity: 0, pointerEvents: "none" as const } })}>
            {!connected ? (
              <button onClick={openConnectModal}
                className="rounded-full bg-blue-400 px-4 py-1.5 text-xs font-medium text-white hover:bg-blue-400/90 transition-colors">
                Connect Wallet
              </button>
            ) : chain?.unsupported ? (
              <button onClick={openChainModal}
                className="rounded-full bg-red-400/10 border border-red-400/20 px-4 py-1.5 text-xs font-medium text-red-400">
                Wrong Network
              </button>
            ) : (
              <button onClick={openAccountModal}
                className="rounded-full bg-secondary border border-border px-4 py-1.5 text-xs font-mono text-foreground hover:bg-secondary/80 transition-colors">
                {account.displayName}
              </button>
            )}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
