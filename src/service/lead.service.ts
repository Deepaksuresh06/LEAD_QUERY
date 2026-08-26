import { CurrentUser } from "../types/auth";
import { prisma } from "../lib/prisma";
import { LeadVisibilityFilter } from "./lead-visibility.service";
import { LeadQuery } from "../validator/leadQuery";
import { QueryLeadsBody } from "../validator/queryLeadsBody";
import { buildSystemFilter } from "./system-filter.service";
import { Prisma } from "../generated/prisma/client";
import { buildCustomFilter } from "./custom-filter.service";

export const getLeads = async (
  currentUser: CurrentUser,
  query: LeadQuery,
  body: QueryLeadsBody
) => {
  console.log("QUERY:", query);
  console.log("BODY:", body);

  const visibilityFilter = LeadVisibilityFilter(currentUser);
  const { page, limit, sortBy, sortDirection } = query;
  const { q, filters, logic } = body;

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

  const customFilters = filters.filter(
    (filter) =>
      ![
        "name",
        "email",
        "assignedTo",
        "followUpDate",
      ].includes(filter.fieldId)
  );

  const customFilterConditions = await Promise.all(
    customFilters.map((filter) =>
      buildCustomFilter(currentUser.tenantId, filter)
    )
  );

  const conditions: Prisma.LeadWhereInput[] = [];

  if (logic === "OR") {
    const filterConditions = [
      ...systemFilters,
      ...customFilterConditions,
    ];

    if (filterConditions.length > 0) {
      conditions.push({
        OR: filterConditions,
      });
    }
  } 
  else {
    conditions.push(
      ...systemFilters,
      ...customFilterConditions
    );
  }

  const finalWhere: Prisma.LeadWhereInput = {
    ...visibilityFilter,
  };

  if (conditions.length > 0) {
    finalWhere.AND = conditions;
  }

  console.log("FINAL WHERE:", finalWhere);

  const [ leads, totalCount ] = await Promise.all([
    prisma.lead.findMany({
      where: finalWhere,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        [sortBy]: sortDirection,
      },
    }),

    prisma.lead.count({
      where: finalWhere,
    })
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  return {
    leads,
    totalCount,
    totalPages,
  };
};