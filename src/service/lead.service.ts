import { CurrentUser } from "../types/auth";
import { prisma } from "../lib/prisma";
import { LeadVisibilityFilter } from "./lead-visibility.service";
import { LeadQuery } from "../validator/leadQuery";
import { buildLeadFilters } from "./lead-filter.service";
import { extractCustomFieldFilters, findCustomFields, findMatchingLeadIds } from "./custom-field-filter.service";
import { Prisma } from "../generated/prisma/browser";


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

  const customFilters = extractCustomFieldFilters(query);
  console.log("QUERY:", query);
  console.log("Custom filters:", customFilters);

  const customFields = await findCustomFields( currentUser.tenantId, customFilters );
  console.log("Custom fields:", customFields);

  const matchingLeadIds = await findMatchingLeadIds(customFilters, customFields);
  console.log("Matching lead IDs:", matchingLeadIds);


  const finalWhere: Prisma.LeadWhereInput = {
      ...visibilityFilter,
      ...dynamicFilters,
  };

  if (Object.keys(customFilters).length > 0) {
      finalWhere.id = {
          in: matchingLeadIds,
      };
  }

  const leads = await prisma.lead.findMany({

        where: finalWhere,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
            [sortBy]: sortDirection,
        },
    });

  return leads;
};