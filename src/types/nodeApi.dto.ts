import { RegisterType } from '../explorerApi';

export interface ErgoTransaction {
  id: string;
  inputs: Array<ErgoTransactionInput>;
  dataInputs: Array<ErgoTransactionDataInput>;
  outputs: Array<ErgoTransactionOutput>;
  size: number;
}

export interface ErgoTransactionInput {
  boxId: string;
  spendingProof: SpendingProof;
  extension: Extension;
}

export interface SpendingProof {
  proofBytes: string;
  extension: Extension;
}

export interface Extension {
  [key: string]: string;
}

export interface ErgoTransactionDataInput {
  boxId: string;
  extension: Extension;
}

export interface ErgoTransactionOutput {
  boxId: string;
  value: number;
  ergoTree: string;
  creationHeight: number;
  assets: Array<Asset>;
  additionalRegisters: Registers;
  transactionId: string;
  index: number;
  spentTransactionId?: string;
}

export interface Asset {
  tokenId: string;
  amount: number;
}

export type Registers = Partial<Record<RegisterType, string>>;
