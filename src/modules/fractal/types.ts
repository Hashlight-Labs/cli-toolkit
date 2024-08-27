export namespace FractalApi {
  type SuccessResponse<D> = {
    code: 0;
    msg: "ok";
    data: D;
  };

  type ErrorResponse = {
    code: -1;
    msg: string;
  };

  export type Response<D> = SuccessResponse<D> | ErrorResponse;

  type Utxo = {
    txid: string;
    vout: number;
    satoshi: number;
    scriptType: string;
    scriptPk: string;
    codeType: number;
    address: string;
    height: number;
    idx: number;
    isOpInRBF: boolean;
    isSpent: boolean;
    inscriptions: any[];
  };

  export type UtxoData = {
    cursor: number;
    total: number;
    totalConfirmed: number;
    totalUnconfirmed: number;
    totalUnconfirmedSpend: number;
    totalRunes: number;
    utxo: Utxo[];
  };

  export type OrderData = {
    orderId: string;
    status: string;
    payAddress: string;
    receiveAddress: string;
    amount: number;
    paidAmount: number;
    outputValue: number;
    feeRate: number;
    minerFee: number;
    serviceFee: number;
    files: {
      filename: string;
      size: number;
      status: string;
    }[];
    count: number;
    pendingCount: number;
    unconfirmedCount: number;
    confirmedCount: number;
    createTime: number;
    devFee: number;
  };

  export type Brc20Data = {
    ticker: string;
    selfMint: boolean;
    holdersCount: number;
    historyCount: number;
    inscriptionNumber: number;
    inscriptionId: string;
    max: string;
    limit: string;
    minted: string;
    totalMinted: string;
    confirmedMinted: string;
    confirmedMinted1h: string;
    confirmedMinted24h: string;
    mintTimes: number;
    decimal: number;
    creator: string;
    txid: string;
    deployHeight: number;
    deployBlocktime: number;
    completeHeight: number;
    completeBlocktime: number;
    inscriptionNumberStart: number;
    inscriptionNumberEnd: number;
  };

  export type BalanceData = {
    address: string;
    satoshi: number;
    pendingSatoshi: number;
    utxoCount: number;
    btcSatoshi: number;
    btcPendingSatoshi: number;
    btcUtxoCount: number;
    inscriptionSatoshi: number;
    inscriptionPendingSatoshi: number;
    inscriptionUtxoCount: number;
  };

  export type ClaimData = {
    txid: string;
    value: number;
    address: string;
  };

  export type FeeRate = {
    fastestFee: number;
    halfHourFee: number;
    hourFee: number;
    economyFee: number;
    minimumFee: number;
  };
}
