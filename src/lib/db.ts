import { DB_FILE } from "@/lib/env";
import { JSONFilePreset } from "lowdb/node";

export namespace Db {
  enum AddressType {
    Bitcoin = "bitcoin",
    // Evm = "evm",
    // Solana = "solana",
  }

  export enum Network {
    FractalTestnet = "FractalTestnet",
  }

  type FractalData = {
    cfClearance: string;
    nextClaim: number;
    userAgent: string;
  };

  type ModuleData = {
    fractal?: FractalData;
  };

  export type Wallet = {
    id: string;
    mnemonic: string;
    addresses: Record<AddressType, string>;
    balances?: Record<Network, number>;
    proxy?: string;
    moduleCache?: ModuleData;
  };

  export type Data = {
    wallets: Wallet[];
  };
}

export const db = await JSONFilePreset<Db.Data>(DB_FILE, { wallets: [] });

export const saveWallet = async (wallet: Db.Wallet) => {
  await db.read();
  const index = db.data.wallets.findIndex((w) => w.id === wallet.id);

  if (index === -1) throw new Error("Wallet not found");

  db.data.wallets[index] = wallet;
  await db.write();
};

await db.write();
