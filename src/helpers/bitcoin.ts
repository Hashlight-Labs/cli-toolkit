import bip39 from "bip39";
export * as ecc from "tiny-secp256k1";
import * as ecc from "tiny-secp256k1";
import { BIP32Factory } from "bip32";
import bitcoinjs, {
  initEccLib,
  networks,
  payments,
  Signer,
} from "bitcoinjs-lib";
import { ECPairFactory } from "ecpair";
import { Db } from "@/lib/db";

initEccLib(ecc);
export const ECPair = ECPairFactory(ecc);
export const bip32 = BIP32Factory(ecc);

export const mnemonicToPrivateKey = (
  mnemonic: string,
  index: number = 0,
  network = bitcoinjs.networks.bitcoin
) => {
  const seed = bip39.mnemonicToSeedSync(mnemonic);
  const node = bip32.fromSeed(seed, network);
  const child = node.derivePath(`m/86'/0'/0'/0/${index}`);
  const privateKey = child.privateKey?.toString("hex");

  if (!privateKey) throw new Error("Private key not found");

  return privateKey;
};

export const privateKeyToAddress = (
  privateKey: string,
  network = bitcoinjs.networks.bitcoin
) => {
  const keypair = ECPair.fromPrivateKey(Buffer.from(privateKey, "hex"));
  const { address } = bitcoinjs.payments.p2tr({
    internalPubkey: keypair.publicKey.subarray(1, 33),
    network,
  });

  return address;
};

export const satsToBtc = (sats: number) => sats / 1e8;

export const tapTweakHash = (pubKey: Buffer, h: Buffer | undefined): Buffer => {
  return bitcoinjs.crypto.taggedHash(
    "TapTweak",
    Buffer.concat(h ? [pubKey, h] : [pubKey])
  );
};

export const tweakSigner = (
  privateKey: Buffer,
  signer: Signer,
  opts: {
    tweakHash?: Buffer;
  } = {}
): Signer => {
  if (signer.publicKey[0] === 3) {
    privateKey = Buffer.from(ecc.privateNegate(privateKey));
  }

  const tweakedPrivateKey = ecc.privateAdd(
    privateKey,
    tapTweakHash(signer.publicKey.subarray(1, 33), opts.tweakHash)
  );

  if (!tweakedPrivateKey) {
    throw new Error("Invalid tweaked private key!");
  }

  return ECPair.fromPrivateKey(Buffer.from(tweakedPrivateKey), {
    network: networks.bitcoin,
  });
};
