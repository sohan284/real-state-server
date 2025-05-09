import { Schema } from "mongoose";


export type TTenantPayment = {
    userId : Schema.Types.ObjectId;
    propertyId : Schema.Types.ObjectId;
    unitId : Schema.Types.ObjectId;
    ownerId : Schema.Types.ObjectId;
    status : 'Pending' | "Paid" | "Cash Pay" | "Processing " | "Failed";
    invoice : string;
    createdAt: Date;
    updatedAt: Date;
    PaymentPlaced: Date;
    lastDueDate: Date;
    paidAmount : number
    lateFee : number
  }
 

  export type TOwnerPayOut = {
    ownerId: Schema.Types.ObjectId;
    amount: number;
    accountId: string;
    email: string;
    status: 'Accepted' | 'On progress' | 'Failed' | 'Paid' | 'Paiddd' | 'Rejected' | 'Pending' ;  
    transactionId: string;
    Receipt: string
    payoutId:string
  };
  