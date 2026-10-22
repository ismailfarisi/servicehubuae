import { config } from "@servicehubuae/config";
import { Queue, Worker } from "bullmq";

export const NOTIFICATION_EVENTS_QUEUE = "notification-events";

let notificationEventsQueue: Queue | null = null;

export function getNotificationEventsQueue(): Queue {
  if (!notificationEventsQueue) {
    notificationEventsQueue = new Queue(NOTIFICATION_EVENTS_QUEUE, {
      connection: { url: config.bullmq.redisUrl },
    });
  }
  return notificationEventsQueue;
}

export function createEventConsumerWorker(dispatchQueue: Queue): Worker {
  return new Worker(
    NOTIFICATION_EVENTS_QUEUE,
    async (job) => {
      const event = job.data;

      if (event.userId && event.notificationType) {
        // `eventId` (optional) is the producer's stable dedupe key for an
        // at-least-once event — booking-service's reminder scheduler stamps
        // one per (booking, offset, slot), same event_id contract the Slack
        // support relay uses. Passing it as the dispatch job's jobId makes a
        // replayed/retried source job a no-op here (BullMQ ignores an `add`
        // for an id it already holds) instead of a duplicate email/push.
        // Absent eventId keeps the previous auto-id behaviour.
        await dispatchQueue.add(
          "dispatch",
          {
            type: event.notificationType,
            userId: event.userId,
            variables: event.variables || {},
            data: event.data || {},
          },
          event.eventId ? { jobId: `dispatch_${event.eventId}` } : undefined,
        );
      }
    },
    {
      connection: { url: config.bullmq.redisUrl },
      concurrency: 3,
    },
  );
}
