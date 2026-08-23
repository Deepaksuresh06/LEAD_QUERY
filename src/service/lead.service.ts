import { CurrentUser } from "../types/auth";
import { prisma } from "../lib/prisma";
import { LeadVisibilityFilter } from "./lead-visibility.service";

export const getLeads = async (currentUser: CurrentUser) => {
  const visibilityFilter = LeadVisibilityFilter(currentUser);

  return prisma.lead.findMany({
    where: visibilityFilter,
  });
};