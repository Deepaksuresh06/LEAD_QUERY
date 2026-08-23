import { UserRole } from "../generated/prisma/client";

export interface CurrentUser {
    tenantId: String;
    userId: String;
    role: UserRole;
}