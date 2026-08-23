import { Request, Response } from "express";

export const getLeads = async (req: Request, res: Response) => {
    try {
        const currentUser = req.currentUser;
        if(!currentUser) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        return res.status(200).json({ message: "Leads fetched successfully" });
    }
    catch(err) {
        console.error(err);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}