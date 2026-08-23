import { Prisma } from "../generated/prisma/client";
import { LeadFilters } from "../types/lead";

export const buildLeadFilters = (filters: LeadFilters): Prisma.LeadWhereInput => {
    const where: Prisma.LeadWhereInput = {};

    if(filters.id) {
        where.id = filters.id;
    }

    if(filters.name) {
        where.name = {
            contains: filters.name,
            mode: "insensitive",
        };
    }

    if(filters.email) {
        where.email = {
            contains: filters.email,
            mode: "insensitive",
        };
    }  

    if(filters.phone) {
        where.phone = {
            contains: filters.phone,
            mode: "insensitive",
        };
    }

    return where;
}