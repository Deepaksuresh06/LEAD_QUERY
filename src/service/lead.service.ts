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

  const conditions: Prisma.LeadWhereInput[] = [];

  if (systemFilters.length > 0) {
    if (logic === "OR") {
      conditions.push({
        OR: systemFilters,
      });
    } 
    else {
      conditions.push({
        AND: systemFilters,
      });
    }
  }

  if (q && q.length > 0) {
    conditions.push({
      OR: [
        {
          name: {
            contains: q,
            mode: "insensitive",
          },
        },
        {
          phone: {
            contains: q,
            mode: "insensitive",
          },
        },
        {
          email: {
            contains: q,
            mode: "insensitive",
          },
        },
        {
          e164: {
            contains: q,
            mode: "insensitive",
          },
        },
      ],
    });
  }

  const finalWhere: Prisma.LeadWhereInput = {
    ...visibilityFilter,
  };

  if (conditions.length > 0) {
    finalWhere.AND = conditions;
  }

  console.log("FINAL WHERE:", finalWhere);

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