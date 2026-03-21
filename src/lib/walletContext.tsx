"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface WalletContextType {
  connected: boolean;
  address: string | null;
  connect: () => void;
  disconnect: () => void;
  ownedSquads: string[];
  isOwner: (squadId: string) => boolean;
  currentSquadView: string;
  setCurrentSquadView: (id: string) => void;
}

const WalletContext = createContext<WalletContextType>({
  connected: false,
  address: null,
  connect: () => {},
  disconnect: () => {},
  ownedSquads: [],
  isOwner: () => false,
  currentSquadView: "hq",
  setCurrentSquadView: () => {},
});

export function WalletProvider({ children }: { children: ReactNode }) {
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [ownedSquads] = useState<string[]>(["hq"]);
  const [currentSquadView, setCurrentSquadView] = useState("hq");

  const connect = useCallback(() => {
    setConnected(true);
    setAddress("0xFab1...4n16");
  }, []);

  const disconnect = useCallback(() => {
    setConnected(false);
    setAddress(null);
  }, []);

  const isOwner = useCallback(
    (squadId: string) => connected && ownedSquads.includes(squadId),
    [connected, ownedSquads]
  );

  return (
    <WalletContext.Provider value={{ connected, address, connect, disconnect, ownedSquads, isOwner, currentSquadView, setCurrentSquadView }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  return useContext(WalletContext);
}
