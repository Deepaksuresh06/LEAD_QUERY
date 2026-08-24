import { CurrentUser } from "../types/auth";
import { prisma } from "../lib/prisma";
import { LeadVisibilityFilter } from "./lead-visibility.service";
import { LeadQuery } from "../validator/leadQuery";
import { buildLeadFilters } from "./lead-filter.service";

export const getLeads = async (currentUser: CurrentUser, query: LeadQuery) => {

  const visibilityFilter = LeadVisibilityFilter(currentUser);
  const { page, limit, sortBy, sortDirection, id,
        name,
        email,
        phone,
        createdAtFrom,
        createdAtTo,
        updatedAtFrom,
        updatedAtTo, } = query;

   const dynamicFilters = buildLeadFilters({
        id,
        name,
        email,
        phone,
        createdAtFrom,
        createdAtTo,
        updatedAtFrom,
        updatedAtTo,
    });

  const leads = await prisma.lead.findMany({

        where: {
          ...visibilityFilter,
          ...dynamicFilters,
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
            [sortBy]: sortDirection,
        },
    });

  return leads;
};