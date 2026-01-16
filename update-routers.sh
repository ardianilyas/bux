#!/bin/bash

# Update subscriptions router
echo "Updating subscriptions router..."
cat > src/features/subscriptions/api/subscription.router.tmp.ts << 'EOF'
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import {
  subscriptionListInputSchema,
  createSubscriptionSchema,
  updateSubscriptionSchema,
  getSubscriptionByIdSchema,
  deleteSubscriptionSchema,
} from "../schemas";
EOF

# Replace first few lines, keep the rest
tail -n +3 src/features/subscriptions/api/subscription.router.ts >> src/features/subscriptions/api/subscription.router.tmp.ts
mv src/features/subscriptions/api/subscription.router.tmp.ts src/features/subscriptions/api/subscription.router.ts

echo "Router updates complete!"
