import { Prisma } from "../generated/prisma/client";
import { LeadFilter } from "../types/lead";

export const buildSystemFilter = ( filter: LeadFilter ): Prisma.LeadWhereInput => {
  const { fieldId, condition, value } = filter;

  switch (fieldId) {
    case "name":
      return buildStringFilter("name", condition, value);

    case "email":
      return buildStringFilter("email", condition, value);

    case "assignedTo":
      return buildAssignedToFilter(condition, value);

    case "followUpDate":
      return buildDateFilter("followUpDate", condition, value);

    default:
      return {};
  }
};

const buildStringFilter = (
  field: "name" | "email",
  condition: string,
  value?: string
): Prisma.LeadWhereInput => {

  switch (condition) {

    case "is":
      return {
        [field]: {
          equals: value,
          mode: "insensitive",
        },
      };

    case "is not":
      return {
        [field]: {
          not: value,
          mode: "insensitive",
        },
      };

    case "contain":
      return {
        [field]: {
          contains: value,
          mode: "insensitive",
        },
      };

    case "does not contain":
      return {
        [field]: {
          not: {
            contains: value,
            mode: "insensitive",
          },
        },
      };

    case "starts with":
      return {
        [field]: {
          startsWith: value,
          mode: "insensitive",
        },
      };

    case "ends with":
      return {
        [field]: {
          endsWith: value,
          mode: "insensitive",
        },
      };

    case "is empty":
      return {
        OR: [
          { [field]: null },
          { [field]: "" },
        ],
      };

    case "is not empty":
      return {
        AND: [
          { [field]: { not: null } },
          { [field]: { not: "" } },
        ],
      };

    default:
      throw new Error(
        `Unsupported condition "${condition}" for ${field}`
      );
  }
};

const buildAssignedToFilter = (
  condition: string,
  value?: string
): Prisma.LeadWhereInput => {

  const ids = value ?.split(",").map((id) => id.trim()).filter(Boolean);

  switch (condition) {

    case "is":
    case "contain":
      return {
        assignedTo: {
          in: ids,
        },
      };

    case "is not":
    case "does not contain":
      return {
        OR: [
          {
            assignedTo: {
              notIn: ids,
            },
          },
          {
            assignedTo: null,
          },
        ],
      };

    case "is empty":
      return {
        assignedTo: null,
      };

    case "is not empty":
      return {
        assignedTo: {
          not: null,
        },
      };

    default:
      throw new Error(
        `Unsupported condition "${condition}" for assignedTo`
      );
  }
};

const buildDateFilter = (
  field: "followUpDate",
  condition: string,
  value?: string
): Prisma.LeadWhereInput => {

  switch (condition) {

    case "before":
      return {
        [field]: {
          lt: new Date(value!),
        },
      };

    case "after":
      return {
        [field]: {
          gt: new Date(value!),
        },
      };

    case "is empty":
      return {
        [field]: null,
      };

    case "is not empty":
      return {
        [field]: {
          not: null,
        },
      };

    default:
      throw new Error(
        `Unsupported condition "${condition}" for ${field}`
      );
  }
};