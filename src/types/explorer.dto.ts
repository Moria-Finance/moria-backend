import { AxiosPromise } from 'axios';
import {
  Balance,
  BlockSummary,
  BoxAssetsQuery,
  BoxQuery,
  EpochInfo,
  ErgoTreeConversionRequest,
  ErgoTreeHuman,
  ItemsA,
  ItemsB,
  ListBlockInfo,
  ListBlockSummaryV1,
  ListOutputInfo,
  ListTransactionInfo,
  MOutputInfo,
  NetworkState,
  NetworkStats,
  OutputInfo,
  TokenInfo,
  TotalBalance,
  TxIdResponse,
} from '../explorerApi';
import { TransactionInfo } from '@meshsdk/core';

export interface ExplorerClient {
  getApiV1AddressesP1BalanceConfirmed(
    p1: string,
    minConfirmations?: number,
    options?: any,
  ): AxiosPromise<Balance>;
  getApiV1AddressesP1BalanceTotal(
    p1: string,
    options?: any,
  ): AxiosPromise<TotalBalance>;
  getApiV1AddressesP1Transactions(
    p1: string,
    offset?: number,
    limit?: number,
    concise?: boolean,
    fromHeight?: number,
    toHeight?: number,
    options?: any,
  ): AxiosPromise<ItemsA>;
  getApiV1Assets(
    offset?: number,
    limit?: number,
    sortDirection?: string,
    hideNfts?: boolean,
    options?: any,
  ): AxiosPromise<ItemsA>;
  getApiV1AssetsSearchBytokenid(
    query: string,
    offset?: number,
    limit?: number,
    options?: any,
  ): AxiosPromise<ItemsA>;
  getApiV1Blocks(
    offset?: number,
    limit?: number,
    sortBy?: string,
    sortDirection?: string,
    options?: any,
  ): AxiosPromise<ItemsA>;
  getApiV1BlocksByglobalindexStream(
    minGix: number,
    limit: number,
    options?: any,
  ): AxiosPromise<ListBlockInfo>;
  getApiV1BlocksHeaders(
    offset?: number,
    limit?: number,
    sortBy?: string,
    sortDirection?: string,
    options?: any,
  ): AxiosPromise<ItemsA>;
  getApiV1BlocksP1(p1: string, options?: any): AxiosPromise<BlockSummary>;
  getApiV1BlocksStreamSummary(
    offset?: number,
    limit?: number,
    sortBy?: string,
    sortDirection?: string,
    options?: any,
  ): AxiosPromise<ListBlockSummaryV1>;
  getApiV1BoxesByaddressP1(
    p1: string,
    offset?: number,
    limit?: number,
    options?: any,
  ): AxiosPromise<ItemsA>;
  getApiV1BoxesByergotreeP1(
    p1: string,
    offset?: number,
    limit?: number,
    options?: any,
  ): AxiosPromise<ItemsA>;
  getApiV1BoxesByergotreetemplatehashP1(
    p1: string,
    offset?: number,
    limit?: number,
    options?: any,
  ): AxiosPromise<ItemsA>;
  getApiV1BoxesByergotreetemplatehashP1Stream(
    p1: string,
    minHeight: number,
    maxHeight: number,
    options?: any,
  ): AxiosPromise<ListOutputInfo>;
  getApiV1BoxesByglobalindexStream(
    minGix: number,
    limit: number,
    options?: any,
  ): AxiosPromise<ListOutputInfo>;
  getApiV1BoxesBytokenidP1(
    p1: string,
    offset?: number,
    limit?: number,
    options?: any,
  ): AxiosPromise<ItemsA>;
  getApiV1BoxesP1(p1: string, options?: any): AxiosPromise<OutputInfo>;
  getApiV1BoxesUnspentByaddressP1(
    p1: string,
    offset?: number,
    limit?: number,
    sortDirection?: string,
    options?: any,
  ): AxiosPromise<ItemsB>;
  getApiV1BoxesUnspentByergotreeP1(
    p1: string,
    offset?: number,
    limit?: number,
    sortDirection?: string,
    options?: any,
  ): AxiosPromise<ItemsA>;
  getApiV1BoxesUnspentByergotreetemplatehashP1(
    p1: string,
    offset?: number,
    limit?: number,
    options?: any,
  ): AxiosPromise<ItemsA>;
  getApiV1BoxesUnspentByergotreetemplatehashP1Stream(
    p1: string,
    minHeight: number,
    maxHeight: number,
    options?: any,
  ): AxiosPromise<ListOutputInfo>;
  getApiV1BoxesUnspentByglobalindexStream(
    minGix: number,
    limit: number,
    options?: any,
  ): AxiosPromise<ListOutputInfo>;
  getApiV1BoxesUnspentBylastepochsStream(
    lastEpochs: number,
    options?: any,
  ): AxiosPromise<ListOutputInfo>;
  getApiV1BoxesUnspentBytokenidP1(
    p1: string,
    offset?: number,
    limit?: number,
    sortDirection?: string,
    options?: any,
  ): AxiosPromise<ItemsB>;
  getApiV1BoxesUnspentStream(
    minHeight: number,
    maxHeight: number,
    options?: any,
  ): AxiosPromise<ListOutputInfo>;
  getApiV1BoxesUnspentUnconfirmedByaddressP1(
    p1: string,
    sortDirection?: string,
    options?: any,
  ): AxiosPromise<MOutputInfo[]>;
  getApiV1EpochsParams(options?: any): AxiosPromise<EpochInfo>;
  getApiV1Info(options?: any): AxiosPromise<NetworkState>;
  getApiV1MempoolBoxesUnspent(options?: any): AxiosPromise<ListOutputInfo>;
  getApiV1MempoolTransactionsByaddressP1(
    p1: string,
    offset?: number,
    limit?: number,
    options?: any,
  ): AxiosPromise<ItemsA>;
  getApiV1Networkstate(options?: any): AxiosPromise<NetworkState>;
  getApiV1Networkstats(options?: any): AxiosPromise<NetworkStats>;
  getApiV1Tokens(
    offset?: number,
    limit?: number,
    sortDirection?: string,
    hideNfts?: boolean,
    options?: any,
  ): AxiosPromise<ItemsA>;
  getApiV1TokensBysymbolP1(
    p1: string,
    options?: any,
  ): AxiosPromise<TokenInfo[]>;
  getApiV1TokensP1(p1: string, options?: any): AxiosPromise<TokenInfo>;
  getApiV1TokensSearch(
    query: string,
    offset?: number,
    limit?: number,
    options?: any,
  ): AxiosPromise<ItemsA>;
  getApiV1TransactionsByglobalindexStream(
    minGix: number,
    limit: number,
    options?: any,
  ): AxiosPromise<ListTransactionInfo>;
  getApiV1TransactionsByinputsscripttemplatehashP1(
    p1: string,
    offset?: number,
    limit?: number,
    sortDirection?: string,
    options?: any,
  ): AxiosPromise<ItemsA>;
  getApiV1TransactionsP1(
    p1: string,
    options?: any,
  ): AxiosPromise<TransactionInfo>;
  postApiV1BoxesSearch(
    boxQuery: BoxQuery,
    offset?: number,
    limit?: number,
    options?: any,
  ): AxiosPromise<ItemsA>;
  postApiV1BoxesUnspentSearch(
    boxQuery: BoxQuery,
    offset?: number,
    limit?: number,
    options?: any,
  ): AxiosPromise<ItemsA>;
  postApiV1BoxesUnspentSearchUnion(
    boxAssetsQuery: BoxAssetsQuery,
    offset?: number,
    limit?: number,
    options?: any,
  ): AxiosPromise<ItemsA>;
  postApiV1ErgotreeConvert(
    ergoTreeConversionRequest: ErgoTreeConversionRequest,
    options?: any,
  ): AxiosPromise<ErgoTreeHuman>;
  postApiV1MempoolTransactionsSubmit(
    body: object,
    options?: any,
  ): AxiosPromise<TxIdResponse>;
}
