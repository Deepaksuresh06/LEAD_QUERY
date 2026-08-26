import { Request, Response } from "express";
import { getLeads } from "../service/lead.service";

export const getLeadsController = async ( req: Request, res: Response ) => {
  try {
    const currentUser = req.currentUser!;

    const query = res.locals.leadQuery;
    const body = res.locals.queryBody;

    const { leads, totalCount, totalPages } = await getLeads( currentUser, query, body );

    return res.status(200).json({
      status: "success",
      message: "Leads fetched successfully",
      data: leads,
      meta: {
        page: res.locals.leadQuery.page,
        limit: res.locals.leadQuery.limit,
        totalCount,
        totalPages
      }
    });

  } 
  catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};