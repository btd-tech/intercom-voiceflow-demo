import { useRuntime } from '@voiceflow/react-chat';
import { createNanoEvents } from 'nanoevents';
import { createContext, useMemo } from 'react';

import { LiveAgentPlatform } from '../shared/live-agent-platform.enum';
import { AccountInfoTrace } from './traces/account-info.trace';
import { CalendarTrace } from './traces/calendar.trace';
import { PluginTrace } from './traces/plugin.trace';
import { TalkToAgentTrace } from './traces/talk-to-agent.trace';
import { VideoTrace } from './traces/video.trace';

export interface RuntimeEvents {
  live_agent: (platform: LiveAgentPlatform) => void;
}

export interface RuntimeContextValue {
  runtime: ReturnType<typeof useRuntime>;
  subscribe: <K extends keyof RuntimeEvents>(event: K, callback: RuntimeEvents[K]) => void;
}

export const RuntimeContext = createContext<RuntimeContextValue | null>(null);

export const RuntimeProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const emitter = useMemo(() => createNanoEvents<RuntimeEvents>(), []);
  const authorization = import.meta.env.VF_DM_API_KEY;
  const runtime = useRuntime({
    verify: { authorization, projectID: '65058c5f76e8cb0006fd5d54' },
    versionID: 'development',
    session: { userID: `anonymous-${Math.random()}` },
    traces: [AccountInfoTrace, CalendarTrace, VideoTrace, PluginTrace, TalkToAgentTrace((platform) => emitter.emit('live_agent', platform))],
  });

  const subscribe = (event: keyof RuntimeEvents, callback: (data?: any) => void) => emitter.on(event, callback);

  return <RuntimeContext.Provider value={{ runtime, subscribe }}>{children}</RuntimeContext.Provider>;
};
