import { Prisma, UserRole } from "../generated/prisma/client";
import { CurrentUser } from "../types/auth";

export const LeadVisibilityFilter = (currentUser: CurrentUser):Prisma.LeadWhereInput => {
    const { tenantId, userId, role } = currentUser;
    
    if( role === UserRole.owner ||
        role === UserRole.admin ||
        role === UserRole.manager
    ) {
        return {
            tenantId
        };
    }
    if (role === UserRole.agent) {
        return {
            tenantId,
            assignedTo: userId,
        };
    }


    return {
        tenantId,
        id: "00000000-0000-0000-0000-000000000000",
    };
};