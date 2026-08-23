import { Request, Response } from "express";
import { getLeads } from "../service/lead.service";

export const getLeadsController = async (req: Request, res: Response) => {
    try {
        const currentUser = req.currentUser;

        if(!currentUser) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const leadQuery = res.locals.leadQuery;
        const leads = await getLeads(currentUser, leadQuery);

        return res.status(200).json({ 
            message: "Leads fetched successfully", 
            data: leads 
        });
    }
    catch(err) {
        console.error(err);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}