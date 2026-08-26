import { Prisma } from "../generated/prisma/client";
import { LeadFilter } from "../types/lead";

export const buildLeadFilters = (filters: LeadFilter): Prisma.LeadWhereInput => {
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

    if (filters.createdAtFrom || filters.createdAtTo) {
        where.createdAt = {};

        if (filters.createdAtFrom) {
            where.createdAt.gte = new Date(
                filters.createdAtFrom
            );
        }

        if (filters.createdAtTo) {
            where.createdAt.lte = new Date(
                filters.createdAtTo
            );
        }
    }

    if (filters.updatedAtFrom || filters.updatedAtTo) {
        where.updatedAt = {};

        if (filters.updatedAtFrom) {
            where.updatedAt.gte = new Date(
                filters.updatedAtFrom
            );
        }

        if (filters.updatedAtTo) {
            where.updatedAt.lte = new Date(
                filters.updatedAtTo
            );
        }
    }

    return where;
}