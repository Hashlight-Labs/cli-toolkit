import { getBitcoinKeypair, tweakSigner } from "@/helpers/bitcoin";
import { Db } from "@/lib/db";
import { FractalApi } from "@/modules/fractal/api";
import { networks, payments, Psbt } from "bitcoinjs-lib";
import _ from "lodash";

export const sendBtc = async (
  wallet: Db.Wallet,
  recipient: string,
  amount: number,
  minerFee: number
) => {
  const keypair = getBitcoinKeypair(wallet);
  const { address, output } = payments.p2tr({
    internalPubkey: keypair.publicKey.subarray(1, 33),
    network: networks.bitcoin,
  });

  if (!address) throw new Error("Address not found");
  if (!output) throw new Error("Output script not found");

  const utxosResponse = await FractalApi.getUtxo(address);

  if (!("data" in utxosResponse)) throw new Error("No data in utxosResponse");

  const utxos = utxosResponse.data.utxo;
  const feePlusAmount = amount + minerFee;
  const filteredUtxos = utxos.filter((utxo) => utxo.satoshi > feePlusAmount);
  const lowestUtxo = _.minBy(filteredUtxos, "satoshi");

  if (!lowestUtxo) throw new Error("Not enough utxo");

  const psbt = new Psbt({ network: networks.bitcoin });
  const change = lowestUtxo.satoshi - feePlusAmount;

  psbt.addInput({
    hash: lowestUtxo.txid,
    index: lowestUtxo.vout,
    witnessUtxo: {
      value: lowestUtxo.satoshi,
      script: output,
    },
    tapInternalKey: keypair.publicKey.subarray(1, 33),
  });

  psbt.addOutput({
    address: recipient,
    value: amount,
  });

  // if change is more than dust limit, add change output
  if (change > 546)
    psbt.addOutput({
      address: address,
      value: change,
    });

  if (!keypair.privateKey) throw new Error("Private key not found");

  const tweakedSigner = tweakSigner(keypair.privateKey, keypair);

  psbt.signAllInputs(tweakedSigner);

  psbt.finalizeAllInputs();
  const hex = psbt.extractTransaction().toHex();

  const result = await FractalApi.pushTx(hex);

  if (result.code !== 0) throw new Error(result.msg || "Could not push tx");

  const txid = result.data;

  return txid;
};
