import { Prisma } from "../generated/prisma/client";
import { prisma } from "../lib/prisma";

type CustomFieldFilters = Record<string, string>;

export const extractCustomFieldFilters = ( query: Record<string, unknown>): CustomFieldFilters => {

    const filters: CustomFieldFilters = {};

    for (const [key, value] of Object.entries(query)) {
        if (key.startsWith("customField.") && typeof value === "string") {

            const fieldLabel = key.replace("customField.", "");
            filters[fieldLabel] = value;

            console.log(`Extracted custom field filter: ${fieldLabel} = ${value}`);
        }
    }
    
    return filters;
};

export const buildCustomFieldFilter = async (
    tenantId: string,
    filters: CustomFieldFilters
): Promise<Prisma.LeadWhereInput> => {

    const entries = Object.entries(filters);

    if (entries.length === 0) {
        return {};
    }

    const fieldLabels = entries.map(([label]) => label);

    const fields = await prisma.customField.findMany({
        where: {
            tenantId,
            label: {
                in: fieldLabels,
            },
            status: true,
        },
    });

    console.log("Custom fields:", fields);

    return {};
};

export const findCustomFields = async ( tenantId: string, filters: CustomFieldFilters ) => {
    const fieldLabels = Object.keys(filters);

    if (fieldLabels.length === 0) {
        return [];
    }

    const fields = await prisma.customField.findMany({
        where: {
            tenantId,
            label: {
                in: fieldLabels,
            },
            status: true,
        },
    });

    return fields;
};

export const findMatchingLeadIds = async (
    filters: CustomFieldFilters,
    fields: {
        id: string;
        label: string;
        type: string;
    }[]
): Promise<string[]> => {

    let matchingLeadIds: string[] | null = null;

    for (const [label, value] of Object.entries(filters)) {

        const field = fields.find(
            (field) => field.label === label
        );

        if (!field) {
            return [];
        }

        const values = await prisma.leadCustomFieldValue.findMany({
            where: {
                fieldId: field.id,
                value,
            },
            select: {
                leadId: true,
            },
        });

        const currentLeadIds = values.map(
            (item) => item.leadId
        );

        if (matchingLeadIds === null) {
            matchingLeadIds = currentLeadIds;
            continue;
        }

        matchingLeadIds = matchingLeadIds.filter(
            (leadId) => currentLeadIds.includes(leadId)
        );

        if (matchingLeadIds.length === 0) {
            return [];
        }
    }

    return matchingLeadIds ?? [];
};