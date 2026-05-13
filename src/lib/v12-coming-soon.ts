import { toast } from "@/hooks/use-toast";

/** Use for any v1.2 action that is not live yet (send, order, OAuth, payments, etc.). */
export function comingSoon(actionLabel?: string) {
  toast({
    title: "Coming soon",
    description: actionLabel
      ? `${actionLabel} will go live with Cynda v1.2. Explore this preview to see the full experience we’re building.`
      : "This will go live with Cynda v1.2. You can explore every screen and flow in this preview.",
  });
}
