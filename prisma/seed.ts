import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log("Starting seed...");

  // =========================
  // 1. TENANTS
  // =========================

  const tenantA = await prisma.tenant.create({
    data: {
      name: "Tenant A",
    },
  });

  const tenantB = await prisma.tenant.create({
    data: {
      name: "Tenant B",
    },
  });

  console.log("Tenants created");


  // =========================
  // 2. USERS
  // =========================

  const adminA = await prisma.user.create({
    data: {
      tenantId: tenantA.id,
      name: "Tenant A Admin",
      email: "admin@tenant-a.com",
      role: "admin",
    },
  });

  const agentA = await prisma.user.create({
    data: {
      tenantId: tenantA.id,
      name: "Tenant A Agent",
      email: "agent@tenant-a.com",
      role: "agent",
    },
  });

  const adminB = await prisma.user.create({
    data: {
      tenantId: tenantB.id,
      name: "Tenant B Admin",
      email: "admin@tenant-b.com",
      role: "admin",
    },
  });

  const agentB = await prisma.user.create({
    data: {
      tenantId: tenantB.id,
      name: "Tenant B Agent",
      email: "agent@tenant-b.com",
      role: "agent",
    },
  });

  console.log("Users created");


  // =========================
  // 3. LEADS
  // =========================

  const leadA1 = await prisma.lead.create({
    data: {
      tenantId: tenantA.id,
      userId: adminA.id,
      assignedTo: agentA.id,

      name: "Arun Kumar",
      phone: "9876543210",
      countryCode: "+91",
      e164: "+919876543210",
      email: "arun@example.com",
      followUpDate: new Date("2026-08-10"),
    },
  });

  const leadA2 = await prisma.lead.create({
    data: {
      tenantId: tenantA.id,
      userId: adminA.id,
      assignedTo: agentA.id,

      name: "Bala Kumar",
      phone: "9876543211",
      countryCode: "+91",
      e164: "+919876543211",
      email: "bala@example.com",
      followUpDate: new Date("2026-08-05"),
    },
  });

  const leadA3 = await prisma.lead.create({
    data: {
      tenantId: tenantA.id,
      userId: agentA.id,

      name: "Karthik Raj",
      phone: "9876543212",
      countryCode: "+91",
      e164: "+919876543212",
      email: "karthik@example.com",
      followUpDate: new Date("2026-08-20"),
    },
  });

  const leadB1 = await prisma.lead.create({
    data: {
      tenantId: tenantB.id,
      userId: adminB.id,
      assignedTo: agentB.id,

      name: "Rahul Sharma",
      phone: "9876543220",
      countryCode: "+91",
      e164: "+919876543220",
      email: "rahul@example.com",
      followUpDate: new Date("2026-08-01"),
    },
  });

  const leadB2 = await prisma.lead.create({
    data: {
      tenantId: tenantB.id,
      userId: adminB.id,
      assignedTo: agentB.id,

      name: "Vijay Kumar",
      phone: "9876543221",
      countryCode: "+91",
      e164: "+919876543221",
      email: "vijay@example.com",
      followUpDate: new Date("2026-08-15"),
    },
  });

  const leadB3 = await prisma.lead.create({
    data: {
      tenantId: tenantB.id,
      userId: agentB.id,

      name: "Suresh Raj",
      phone: "9876543222",
      countryCode: "+91",
      e164: "+919876543222",
      email: "suresh@example.com",
      followUpDate: null,
    },
  });

  console.log("Leads created");


  // =========================
  // 4. CUSTOM FIELD - CITY
  // =========================

  const cityFieldA = await prisma.customField.create({
    data: {
      tenantId: tenantA.id,
      label: "City",
      type: "string",
    },
  });

  const cityFieldB = await prisma.customField.create({
    data: {
      tenantId: tenantB.id,
      label: "City",
      type: "string",
    },
  });

  console.log("City custom fields created");

  const industryFieldA = await prisma.customField.create({
      data: {
          tenantId: tenantA.id,
          label: "Industry",
          type: "string",
      },
  });

  const industryFieldB = await prisma.customField.create({
      data: {
          tenantId: tenantB.id,
          label: "Industry",
          type: "string",
      },
  });

  // =========================
  // 5. EAV VALUES
  // =========================

  await prisma.leadCustomFieldValue.createMany({
    data: [
      {
        leadId: leadA1.id,
        fieldId: cityFieldA.id,
        value: "Chennai",
      },
      {
        leadId: leadA2.id,
        fieldId: cityFieldA.id,
        value: "Bangalore",
      },
      {
        leadId: leadA3.id,
        fieldId: cityFieldA.id,
        value: "Coimbatore",
      },

      {
        leadId: leadB1.id,
        fieldId: cityFieldB.id,
        value: "Madurai",
      },
      {
        leadId: leadB2.id,
        fieldId: cityFieldB.id,
        value: "Salem",
      },
      {
        leadId: leadB3.id,
        fieldId: cityFieldB.id,
        value: "Trichy",
      },
      {
          leadId: leadA1.id,
          fieldId: industryFieldA.id,
          value: "Finance",
      },
      {
          leadId: leadA2.id,
          fieldId: industryFieldA.id,
          value: "IT",
      },
      {
          leadId: leadA3.id,
          fieldId: industryFieldA.id,
          value: "Finance",
      },
      {
          leadId: leadB1.id,
          fieldId: industryFieldB.id,
          value: "Healthcare",
      },
      {
          leadId: leadB2.id,
          fieldId: industryFieldB.id,
          value: "Finance",
      },
      {
          leadId: leadB3.id,
          fieldId: industryFieldB.id,
          value: "IT",
      },
    ],
  });

  console.log("EAV values created");

  console.log("Seed completed successfully!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error("Seed failed:", error);

    await prisma.$disconnect();

    process.exit(1);
  });