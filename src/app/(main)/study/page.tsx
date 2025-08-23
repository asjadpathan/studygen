'use client';

import { DiscussionChannel } from '@/components/discussion-channel';

export default function StudyPage() {
  return (
     <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Study Zone</h1>
        <p className="text-muted-foreground">Engage with the community, ask questions, and share what you've learned.</p>
      </div>

      <div className="flex justify-center">
        <div className="w-full max-w-4xl">
            <DiscussionChannel channelId="general-chat" />
        </div>
      </div>
    </div>
  );
}
