import axios from 'axios';
import { ErgoTransaction } from '../types/nodeApi.dto';

export class NodeApi {
  private readonly nodeBaseURI: string;
  constructor(nodeBaseURI: string) {
    this.nodeBaseURI = nodeBaseURI.replace(/[\\/]+$/, '');
  }

  async transactionsUnconfirmedByTransactionId(
    txId: string,
  ): Promise<ErgoTransaction> {
    const url = `${this.nodeBaseURI}/transactions/unconfirmed/byTransactionId/${txId}`;
    const response = await axios.get(url);
    return response.data;
  }
}
