"use client";

import { motion } from "framer-motion";
import { AgentAvatar } from "@/components/agent/agent-avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { agentCards } from "@/lib/demo/scenario";
import type { AgentRole } from "@/lib/agents/types";

export function AgentCardGrid() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {agentCards.map((agent, index) => (
        <motion.div
          key={agent.role}
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ delay: index * 0.04 }}
        >
          <Card className="h-full p-4 transition duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-glow">
            <div className="flex items-center justify-between gap-3">
              <AgentAvatar role={agent.role as AgentRole} />
              <Badge>{agent.status}</Badge>
            </div>
            <h3 className="mt-4 font-semibold">{agent.title}</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{agent.description}</p>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
