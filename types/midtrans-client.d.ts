declare module "midtrans-client" {
  interface SnapConfig {
    isProduction: boolean;
    serverKey?: string;
    clientKey?: string;
  }

  interface TransactionParameter {
    transaction_details: {
      order_id: string;
      gross_amount: number;
    };
    item_details?: Array<{
      id: string;
      price: number;
      quantity: number;
      name: string;
    }>;
    customer_details?: {
      first_name?: string;
      last_name?: string;
      email?: string;
      phone?: string;
      billing_address?: {
        address?: string;
        city?: string;
      };
    };
  }

  interface TransactionResult {
    token: string;
    redirect_url: string;
  }

  class Snap {
    constructor(config: SnapConfig);
    createTransaction(parameter: TransactionParameter): Promise<TransactionResult>;
  }

  class CoreApi {
    constructor(config: SnapConfig);
  }

  const midtransClient: {
    Snap: typeof Snap;
    CoreApi: typeof CoreApi;
  };

  export default midtransClient;
}
