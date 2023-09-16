import 'react-calendar/dist/Calendar.css';
import { Chat, ChatWindow, Launcher, RuntimeAPIProvider, SessionStatus, SystemResponse, TurnType, UserResponse } from '@voiceflow/react-chat';
import { useContext, useRef, useState } from 'react';
import { match } from 'ts-pattern';
import { LiveAgentStatus } from './components/LiveAgentStatus.component';
import { StreamedMessage } from './components/StreamedMessage.component';
import { RuntimeContext } from './context';
import { CustomMessage } from './custom-message.enum';
import { CalendarMessage } from './messages/CalendarMessage.component';
import { VideoMessage } from './messages/VideoMessage.component';
import { DemoContainer } from './styled';
import { useLiveAgent } from './use-live-agent.hook';
import { Container } from '@mui/material';
import { ConsentDialog } from './ConsentDialog';

const IMAGE = 'https://wallpapers.com/images/featured/homer-simpson-pictures-kj3h1n6hzcpwg904.jpg';
const AVATAR = 'https://wallpapers.com/images/featured/homer-simpson-pictures-kj3h1n6hzcpwg904.jpg';
const AVATAR2 = 'https://cdn.costumewall.com/wp-content/uploads/2015/09/marge-simpson-tn.webp';

export const Demo: React.FC = () => {
  const [openLauncher, setOpenLauncher] = useState(false);
  const ids = useRef<string[]>([]);

  const { runtime } = useContext(RuntimeContext)!;
  const liveAgent = useLiveAgent();
  const [consented, setConsented] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const handleLaunch = async () => {
    setModalOpen(true);
  };

  const handleEnd = () => {
    runtime.setStatus(SessionStatus.ENDED);
    setOpenLauncher(false);
    setModalOpen(false);
  };

  const handleSend = (message: string) => {
    if (liveAgent.isEnabled) {
      liveAgent.sendUserReply(message);
    } else {
      runtime.reply(message);
    }
  };

  const handleStart = () => {
    if (!consented) {
      setModalOpen(true);
    }
  };

  if (!openLauncher) {
    return (
      <span
        style={{
          position: 'absolute',
          right: '2rem',
          bottom: '2rem',
        }}
      >
        <ConsentDialog
          open={modalOpen}
          onCancel={async () => handleEnd()}
          onConfirm={async () => {
            setModalOpen(false);
            setConsented(true);
            setOpenLauncher(true);
            await runtime.launch();
          }}
        />
        <Launcher onClick={handleLaunch} />
      </span>
    );
  }

  return (
    <Container>
      <DemoContainer>
        <ChatWindow.Container>
          <RuntimeAPIProvider {...runtime}>
            <Chat
              title="Carpet Muncher"
              description="I'll munch your carpet"
              image={IMAGE}
              avatar={AVATAR}
              withWatermark
              startTime={runtime.session.startTime}
              hasEnded={runtime.isStatus(SessionStatus.ENDED)}
              isLoading={!runtime.session.turns.length}
              onStart={handleStart}
              onEnd={handleEnd}
              onSend={handleSend}
              onMinimize={handleEnd}
            >
              {liveAgent.isEnabled && <LiveAgentStatus talkToRobot={liveAgent.talkToRobot} />}
              {runtime.session.turns.map((turn, turnIndex) => {
                // @ts-ignore
                const isIntercom = turn.type === 'intercom';
                if (isIntercom) {
                  // @ts-ignore
                  turn.type = 'system';
                  ids.current.push(turn.id);
                }

                return match(turn)
                  .with({ type: TurnType.USER }, ({ id, type: _, ...rest }) => <UserResponse {...rest} key={id} />)
                  .with({ type: TurnType.SYSTEM }, ({ id, type: _, ...rest }) => (
                    <SystemResponse
                      {...rest}
                      key={id}
                      Message={({ message, ...props }) =>
                        match(message)
                          .with({ type: CustomMessage.CALENDAR }, ({ payload: { today } }) => (
                            <CalendarMessage {...props} value={new Date(today)} runtime={runtime} />
                          ))
                          .with({ type: CustomMessage.VIDEO }, ({ payload: url }) => <VideoMessage url={url} />)
                          .with({ type: CustomMessage.STREAMED_RESPONSE }, ({ payload: { getSocket } }) => <StreamedMessage getSocket={getSocket} />)
                          .with({ type: CustomMessage.PLUGIN }, ({ payload: { Message } }) => <Message />)
                          .otherwise(() => <SystemResponse.SystemMessage {...props} message={message} />)
                      }
                      avatar={ids.current.includes(turn.id) ? AVATAR2 : AVATAR}
                      isLast={turnIndex === runtime.session.turns.length - 1}
                    />
                  ))
                  .exhaustive();
              })}

              {runtime.indicator && <SystemResponse.Indicator avatar={AVATAR} />}
            </Chat>
          </RuntimeAPIProvider>
        </ChatWindow.Container>
      </DemoContainer>
    </Container>
  );
};
