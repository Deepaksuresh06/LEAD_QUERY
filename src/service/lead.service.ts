import { CurrentUser } from "../types/auth";
import { prisma } from "../lib/prisma";
import { LeadVisibilityFilter } from "./lead-visibility.service";
import { LeadQuery } from "../validator/leadQuery";
import { QueryLeadsBody } from "../validator/queryLeadsBody";
import { buildSystemFilter } from "./system-filter.service";
import { Prisma } from "../generated/prisma/client";

export const getLeads = async (
  currentUser: CurrentUser,
  query: LeadQuery,
  body: QueryLeadsBody
) => {
  console.log("QUERY:", query);
  console.log("BODY:", body);

  const visibilityFilter = LeadVisibilityFilter(currentUser);

  const { filters, logic } = body;
  const { page, limit, sortBy, sortDirection } = query;

  const systemFilters = filters
    .filter((filter) =>
      [
        "name",
        "email",
        "assignedTo",
        "followUpDate",
      ].includes(filter.fieldId)
    )
    .map(buildSystemFilter);

  const filterWhere: Prisma.LeadWhereInput = {};

  if (systemFilters.length > 0) {
    if (logic === "OR") {
      filterWhere.OR = systemFilters;
    } else {
      filterWhere.AND = systemFilters;
    }
  }

  const finalWhere: Prisma.LeadWhereInput = {
    ...visibilityFilter,
    ...filterWhere,
  };

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

