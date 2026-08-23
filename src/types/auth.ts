import { UserRole } from "../generated/prisma/client";

export interface CurrentUser {
    tenantId: string;
    userId: string;
    role: UserRole;
}