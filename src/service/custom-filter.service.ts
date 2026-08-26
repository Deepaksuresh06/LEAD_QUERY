import { Prisma } from "../generated/prisma/client";
import { prisma } from "../lib/prisma";
import { LeadFilter } from "../validator/queryLeadsBody";

export const buildCustomFilter = async (
  tenantId: string,
  filter: LeadFilter
): Promise<Prisma.LeadWhereInput> => {

  const field = await prisma.customField.findFirst({
    where: {
      id: filter.fieldId,
      tenantId,
      status: true,
    },
  });

  if (!field) {
    throw new Error(`Custom field not found: ${filter.fieldId}`);
  }

  const condition = filter.condition;
  const value = filter.value;

  switch (condition) {

    case "is":
      return {
        customFieldValues: {
          some: {
            fieldId: field.id,
            value: {
              equals: value,
              mode: "insensitive",
            },
          },
        },
      };

    case "contain":
      return {
        customFieldValues: {
          some: {
            fieldId: field.id,
            value: {
              contains: value,
              mode: "insensitive",
            },
          },
        },
      };

    case "starts with":
      return {
        customFieldValues: {
          some: {
            fieldId: field.id,
            value: {
              startsWith: value,
              mode: "insensitive",
            },
          },
        },
      };

    case "ends with":
      return {
        customFieldValues: {
          some: {
            fieldId: field.id,
            value: {
              endsWith: value,
              mode: "insensitive",
            },
          },
        },
      };

    case "does not contain":
      return {
        customFieldValues: {
          none: {
            fieldId: field.id,
            value: {
              contains: value,
              mode: "insensitive",
            },
          },
        },
      };

    case "is empty":
      return {
        customFieldValues: {
          none: {
            fieldId: field.id,
          },
        },
      };

    case "is not empty":
      return {
        customFieldValues: {
          some: {
            fieldId: field.id,
          },
        },
      };

    default:
      throw new Error(
        `Unsupported custom field condition: ${condition}`
      );
  }
};