/* eslint-disable no-undef */
/* eslint-disable no-useless-catch */
/* eslint-disable @typescript-eslint/no-explicit-any */
// import { Query } from "mongoose";
import path from "path";
import  fs from 'fs';
import { Properties, ReviewFromOwner, Tenant, Unit } from "../owner/owner.module"
import { EmailCollection, User } from "../User/user.model";
import { OverviewData, TPlanDetails, TRealEstateAdvisor, TTransactionData } from "./admin.interface";
import { PlanDetails, RealEstateAdvisor, TransactionData } from "./admin.module";
import { AppError } from "../../errors/AppErrors";
import httpStatus from "http-status";
import { sendTransfarNotificationEmailAdminToOwner } from "../../utils/sendTransfarNotificationEmailAdminToOwner";
import QueryBuilder from "../../builder/QueryBuilder";

const getALlPropertiesFromDB = async (selectedDate : string) =>{    
    if (!selectedDate) {
        const result = await Properties.find().sort({createdAt : -1});
        return result
    }
    const [year, month] = selectedDate.split('-').map(Number);
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);
    
    const result = await Properties.find({createdAt: { $gte: startDate, $lte: endDate }}).sort({createdAt : -1});
    return result
}

const getSinglePropertiesAllUnitsFromDB = async(id : string ) =>{
    const property = await Properties.findById({_id : id}).populate("ownerId");
    const allUnits = await Unit.find({propertyId : id });
    const result = {
        property,
        allUnits
    }
    return result    
}

const getALlTenantsFormDB = async () =>{
    const result = await Tenant.find().populate([{path : "userId"}, {path : "propertyId"}, { path: "ownerId" }, {path : "unitId"}]);
    return result
}
  
const getSingleTenantDetailseFromDB = async (id : string ) =>{
    const result = await Tenant.findById({_id : id}).populate([{path : "userId"}, {path : "propertyId"}, {path : "unitId"}]);
    return result
}

const getSingleOwnerAllPropertiesWithOwnerInfoFromDB = async(id : string ) =>{
    const ownerData = await User.find({_id : id })
    const properties = await Properties.find({ownerId : id }).sort({createdAt : -1})
    return {
        ownerData,
        properties
    }
}

// const getAllDataOverviewByAdminFromDB = async (selectedDate : any): Promise<OverviewData> => {
//     console.log(selectedDate);
    
//     try {
//         const queries: { key: keyof Omit<OverviewData, 'monthlyProperties' | 'monthlyTenants'>; query: Query<number, any> }[] = [
//             { key: "propertyLength", query: Properties.countDocuments() },
//             { key: "tenantLength", query: Tenant.countDocuments() },
//             // { key: "unitsLength", query: Unit.countDocuments() },   // ==========================>>> if client need this data the we will show it
//             { key: "ownersLength", query: User.countDocuments({ role: "owner" }) }
//         ];
//         const results = await Promise.all(queries.map(item => item.query));

//         const monthlyProperties = await Properties.aggregate([
//             {
//                 $group: {
//                     _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
//                     count: { $sum: 1 }
//                 }
//             },
//             { $sort: { _id: 1 } }
//         ]);

//         const monthlyPropertiesData = monthlyProperties.map(item => ({
//             date: item._id, 
//             count: item.count
//         }));

//         const monthlyTenants = await Tenant.aggregate([
//             {
//                 $group: {
//                     _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
//                     count: { $sum: 1 }
//                 }
//             },
//             { $sort: { _id: 1 } }
//         ]);

//         const monthlyTenantsData = monthlyTenants.map(item => ({
//             date: item._id, 
//             count: item.count
//         }));

//         const overview = queries.reduce((acc, item, index) => {
//             acc[item.key] = results[index];
//             return acc;
//         }, {} as Omit<OverviewData, 'monthlyProperties' | 'monthlyTenants'>);

//         return { ...overview, monthlyProperties: monthlyPropertiesData, monthlyTenants: monthlyTenantsData };
//     } catch (error) {
//         console.error("Error fetching data overview:", error);
//         throw error;
//     }
// };


// ========================================================================================
// ========================================================================================


// const getAllDataOverviewByAdminFromDB = async (selectedDate: string): Promise<OverviewData> => {
//     try {
//         const [year, month] = selectedDate.split('-').map(Number);
//         const startDate = new Date(year, month - 1, 1);
//         const endDate = new Date(year, month, 0);

//         console.log(selectedDate);
        

//         const queries = [
//             {
//                 key: "propertyLength",
//                 query: Properties.countDocuments()
//             },
//             {
//                 key: "tenantLength",
//                 query: Tenant.countDocuments()
//             },
//             {
//                 key: "ownersLength",
//                 query: User.countDocuments({ role: "owner", subscriptionStatus : "active" })
//             },
//             {
//                 key: "unitsLength",
//                 query: Unit.countDocuments()
//             }
//         ];

//         const results = await Promise.all(queries.map(item => item.query));

//         const monthlyProperties = await Properties.aggregate([
//             {
//                 $match: {
//                     createdAt: { $gte: startDate, $lte: endDate }
//                 }
//             },
//             {
//                 $group: {
//                     _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
//                     count: { $sum: 1 }
//                 }
//             },
//             { $sort: { _id: 1 } }
//         ]);

//         const monthlyTenants = await Tenant.aggregate([
//             {
//                 $match: {
//                     createdAt: { $gte: startDate, $lte: endDate }
//                 }
//             },
//             {
//                 $group: {
//                     _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
//                     count: { $sum: 1 }
//                 }
//             },
//             { $sort: { _id: 1 } }
//         ]);

//         const monthlyPropertiesData = monthlyProperties.map(item => ({
//             date: item._id,
//             count: item.count
//         }));

//         const monthlyTenantsData = monthlyTenants.map(item => ({
//             date: item._id,
//             count: item.count
//         }));

//         // 🔥 Fixed TypeScript Error by Ensuring All Required Properties
//         const overview: OverviewData = {
//             propertyLength: results[0] || 0,
//             tenantLength: results[1] || 0,
//             ownersLength: results[2] || 0,
//             unitsLength: results[3] || 0,
//             monthlyProperties: monthlyPropertiesData,
//             monthlyTenants: monthlyTenantsData
//         };

//         console.log(overview);
        

//         return overview;
//     } catch (error) {
//         console.error("Error fetching data overview:", error);
//         throw error;
//     }
// };

const getAllDataOverviewByAdminFromDB = async (selectedDate: string): Promise<OverviewData> => {
    try {
        const [year, month] = selectedDate.split('-').map(Number);
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59, 999); 

        const queries = [
            {
                key: "propertyLength",
                query: Properties.countDocuments()
            },
            {
                key: "tenantLength",
                query: Tenant.countDocuments()
            },
            {
                key: "ownersLength",
                query: User.countDocuments({ role: "owner" })
            },
            {
                key: "unitsLength",
                query: Unit.countDocuments()
            }
        ];

        const results = await Promise.all(queries.map(item => item.query));

        const monthlyProperties = await Properties.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lt: endDate }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const monthlyTenants = await Tenant.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lt: endDate }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const monthlyPropertiesData = monthlyProperties.map(item => ({
            date: item._id,
            count: item.count
        }));

        const monthlyTenantsData = monthlyTenants.map(item => ({
            date: item._id,
            count: item.count
        }));

        // 🔥 Fixed TypeScript Error by Ensuring All Required Properties
        const overview: OverviewData = {
            propertyLength: results[0] || 0,
            tenantLength: results[1] || 0,
            ownersLength: results[2] || 0,
            unitsLength: results[3] || 0,
            monthlyProperties: monthlyPropertiesData,
            monthlyTenants: monthlyTenantsData
        };

        return overview;
    } catch (error) {
        console.error("Error fetching data overview:", error);
        throw error;
    }
};

const createPlanIntoDB = async (payload : TPlanDetails ) =>{
    await PlanDetails.deleteMany({}); 
    const result = await PlanDetails.create(payload)
    return result    
}

const getPlanFromDB = async ( ) =>{
    const result = await PlanDetails.find()
    return result    
}

const deleteNoSubscriberOwnerFormDB = async (id : string) =>{
    const result = await User.findByIdAndDelete({_id : id})
    return result
}
 
const RealEstateAdvisorIntoDB =  async (payload : TRealEstateAdvisor)=>{
    const result = await RealEstateAdvisor.create(payload)
    return result
}

const RealEstateAdvisordeleteIntoDB =  async (id : string)=>{
    const adviserData = await RealEstateAdvisor.findById({_id : id})  
    if(!adviserData){
        throw new AppError(httpStatus.NOT_FOUND, "data not found")
    }  
    if (adviserData?.image && adviserData.image.length > 0) {
        adviserData.image.forEach((image) => {    
          const filePath = path.resolve(__dirname, "..", "..", "..", "..", "uploads", path.basename(image));
          if (fs.existsSync(filePath)) {
            fs.unlink(filePath, (err: any) => {
              if (err) {
                console.error("Error deleting audio file:", err);
              }
            });
          } else {
            console.warn(61, filePath);
          }
        });        
      }
    const result = await RealEstateAdvisor.findByIdAndDelete({_id : id})
    return result
}
 
const getReviewFromDB = async () => {
    const result = await ReviewFromOwner.find().sort({ createdAt: -1 }).lean();
    return result;
};

const deleteReviewByAdminIntoDB = async (id : string) =>{
    const result = await ReviewFromOwner.findByIdAndDelete({_id : id})
    return result
}

const getAllEmailCollectionDataGetFromDB = async ()=>{
    const result = await EmailCollection.find()
    return result
}

const deleteEmailCollectionDataGetIntoDB = async (id : string)=>{
    const result = await EmailCollection.findByIdAndDelete({_id : id})
    return result
}

const addTransactionDataIntoDB = async (payload : TTransactionData )=>{
    const email = payload.email;    
    const isExists = await TransactionData.findOne({ownerId : payload.ownerId, status : "Send"})    
    if(isExists){
        throw new  AppError(409, "A transaction has already been initiated. Please wait for the owner to confirm the current transaction before creating a new one.")
    }
    const result = await TransactionData.create(payload);
    await sendTransfarNotificationEmailAdminToOwner(email, payload.amount , payload.name);
    return result
}


const getTransferDataFromDB = async (query : Record<string, unknown>)=>{
    const transactionDataQuery = new QueryBuilder(TransactionData.find(), query)
    .search(["name", "email", "status"])
    .sort()
    return await transactionDataQuery.modelQuery
}


export const AdminService = {
    getALlPropertiesFromDB,
    getSinglePropertiesAllUnitsFromDB,
    getALlTenantsFormDB,
    getSingleTenantDetailseFromDB,
    getSingleOwnerAllPropertiesWithOwnerInfoFromDB,
    getAllDataOverviewByAdminFromDB,
    createPlanIntoDB,
    getPlanFromDB,
    deleteNoSubscriberOwnerFormDB,
    RealEstateAdvisorIntoDB,
    RealEstateAdvisordeleteIntoDB,
    getReviewFromDB,
    deleteReviewByAdminIntoDB,
    getAllEmailCollectionDataGetFromDB,
    deleteEmailCollectionDataGetIntoDB,
    addTransactionDataIntoDB,
    getTransferDataFromDB
}