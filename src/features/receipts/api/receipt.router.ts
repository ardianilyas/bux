import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { extractExpenseFromText } from "../lib/extract-expense";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { eq } from "drizzle-orm";

export const receiptRouter = createTRPCRouter({
  parseReceipt: protectedProcedure
    .input(z.object({ ocrText: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Fetch all categories for auto-categorization
      const allCategories = await db.query.categories.findMany();

      const categoryNames = allCategories.map((c) => c.name);

      const parsed = await extractExpenseFromText(input.ocrText, categoryNames);
      return parsed;
    }),
});
