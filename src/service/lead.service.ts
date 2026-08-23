import { CurrentUser } from "../types/auth";
import { prisma } from "../lib/prisma";
import { LeadVisibilityFilter } from "./lead-visibility.service";
import { LeadQuery } from "../validator/leadQuery";

export const getLeads = async (currentUser: CurrentUser, query: LeadQuery) => {

  const visibilityFilter = LeadVisibilityFilter(currentUser);
  const { page, limit, sortBy, sortDirection } = query;

  const leads = await prisma.lead.findMany({

        where: visibilityFilter,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
            [sortBy]: sortDirection,
        },
    });

  return leads;
};