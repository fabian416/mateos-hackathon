"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";

interface WalletContextType {
  connected: boolean;
  address: string | null;
  chainId: number | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  switchToBase: () => Promise<void>;
  isOnBase: boolean;
  ownedSquads: string[];
  isOwner: (squadId: string) => boolean;
  currentSquadView: string;
  setCurrentSquadView: (id: string) => void;
}

const BASE_CHAIN_ID = 8453;

const WalletContext = createContext<WalletContextType>({
  connected: false,
  address: null,
  chainId: null,
  connect: async () => {},
  disconnect: () => {},
  switchToBase: async () => {},
  isOnBase: false,
  ownedSquads: [],
  isOwner: () => false,
  currentSquadView: "hq",
  setCurrentSquadView: () => {},
});

function getEthereum(): (typeof window)["ethereum"] | undefined {
  if (typeof window !== "undefined") {
    return window.ethereum;
  }
  return undefined;
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [ownedSquads] = useState<string[]>(["hq"]);
  const [currentSquadView, setCurrentSquadView] = useState("hq");

  const isOnBase = chainId === BASE_CHAIN_ID;

  // Listen for account/chain changes
  useEffect(() => {
    const ethereum = getEthereum();
    if (!ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        setConnected(false);
        setAddress(null);
      } else {
        setAddress(accounts[0]);
        setConnected(true);
      }
    };

    const handleChainChanged = (chainIdHex: string) => {
      setChainId(parseInt(chainIdHex, 16));
    };

    ethereum.on?.("accountsChanged", handleAccountsChanged);
    ethereum.on?.("chainChanged", handleChainChanged);

    return () => {
      ethereum.removeListener?.("accountsChanged", handleAccountsChanged);
      ethereum.removeListener?.("chainChanged", handleChainChanged);
    };
  }, []);

  const connect = useCallback(async () => {
    const ethereum = getEthereum();

    if (!ethereum) {
      // Fallback: mock wallet for demo / no-extension environments
      setConnected(true);
      setAddress("0xFab1...4n16");
      setChainId(BASE_CHAIN_ID);
      return;
    }

    try {
      const accounts = (await ethereum.request({
        method: "eth_requestAccounts",
      })) as string[];

      if (accounts.length > 0) {
        setAddress(accounts[0]);
        setConnected(true);
      }

      const chainHex = (await ethereum.request({
        method: "eth_chainId",
      })) as string;
      setChainId(parseInt(chainHex, 16));
    } catch (err) {
      console.error("Wallet connect failed:", err);
      // Fallback to mock
      setConnected(true);
      setAddress("0xFab1...4n16");
      setChainId(BASE_CHAIN_ID);
    }
  }, []);

  const switchToBase = useCallback(async () => {
    const ethereum = getEthereum();
    if (!ethereum) return;

    try {
      await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${BASE_CHAIN_ID.toString(16)}` }],
      });
    } catch (switchErr: unknown) {
      // Chain not added — add it
      if (
        typeof switchErr === "object" &&
        switchErr !== null &&
        "code" in switchErr &&
        (switchErr as { code: number }).code === 4902
      ) {
        try {
          await ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: `0x${BASE_CHAIN_ID.toString(16)}`,
                chainName: "Base",
                nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
                rpcUrls: ["https://mainnet.base.org"],
                blockExplorerUrls: ["https://basescan.org"],
              },
            ],
          });
        } catch (addErr) {
          console.error("Failed to add Base chain:", addErr);
        }
      }
    }
  }, []);

  const disconnect = useCallback(() => {
    setConnected(false);
    setAddress(null);
    setChainId(null);
  }, []);

  const isOwner = useCallback(
    (squadId: string) => connected && ownedSquads.includes(squadId),
    [connected, ownedSquads],
  );

  return (
    <WalletContext.Provider
      value={{
        connected,
        address,
        chainId,
        connect,
        disconnect,
        switchToBase,
        isOnBase,
        ownedSquads,
        isOwner,
        currentSquadView,
        setCurrentSquadView,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  return useContext(WalletContext);
}
