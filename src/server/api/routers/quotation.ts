import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const quotationRouter = createTRPCRouter({
  // --- User Procedures ---

  createRequest: publicProcedure
    .input(z.object({
      name: z.string().min(1),
      email: z.string().email(),
      description: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.request.create({
        data: {
          name: input.name,
          email: input.email,
          description: input.description,
        },
      });
    }),

  getRequests: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.request.findMany({
      orderBy: { createdAt: "desc" },
    });
  }),
  
  // For User view: get their own requests (mocked as getting all for now, or filter by logic if auth existed)
  // In this simple app, we just re-use getRequests or filter client side. 
  // But let's add a specific one for "My Quotations" if we want to filter by email later.
  // For now, sticking to getRequests as per original design.

  // --- Admin Procedures ---

  getQuotationByRequestId: publicProcedure
    .input(z.object({ requestId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.quotation.findUnique({
        where: { requestId: input.requestId },
        include: { items: true },
      });
    }),

  getRequestById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.request.findUnique({
        where: { id: input.id },
      });
    }),

  createQuotation: publicProcedure
    .input(z.object({
      requestId: z.string(),
      notes: z.string(),
      items: z.array(z.object({
        description: z.string(),
        quantity: z.number().min(1),
        unitPrice: z.number().min(0),
      })),
    }))
    .mutation(async ({ ctx, input }) => {
       const totalAmount = input.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
       
       // check if exists to update
       const existing = await ctx.db.quotation.findUnique({
           where: { requestId: input.requestId }
       });

       if (existing) {
           // Update
           return ctx.db.$transaction(async (tx) => {
               // Delete old items
               await tx.quotationItem.deleteMany({
                   where: { quotationId: existing.id }
               });
                              // Update quotation
               const updated = await tx.quotation.update({
                   where: { id: existing.id },
                   data: {
                       notes: input.notes,
                       totalAmount,
                       items: {
                           create: input.items.map(item => ({
                               description: item.description,
                               quantity: item.quantity,
                               unitPrice: item.unitPrice,
                               amount: item.quantity * item.unitPrice
                           }))
                       }
                   }
               });
               
               return updated;
           });
       } else {
           // Create
           return ctx.db.$transaction(async (tx) => {
              const quotation = await tx.quotation.create({
                  data: {
                      requestId: input.requestId,
                      adminId: "admin-1", // mock
                      notes: input.notes,
                      totalAmount,
                      items: {
                          create: input.items.map(item => ({
                               description: item.description,
                               quantity: item.quantity,
                               unitPrice: item.unitPrice,
                               amount: item.quantity * item.unitPrice
                           }))
                      }
                  }
              });

              // Update request status
              await tx.request.update({
                  where: { id: input.requestId },
                  data: { status: "Replied" }
              });

              return quotation;
           });
       }
    }),
});
