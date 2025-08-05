'use client';
import { cn, configureAssistant, getSubjectColor } from "@/lib/utils"
import {vapi} from "@/lib/vapi.sdk";
import Image from "next/image";
import { use, useEffect, useRef, useState } from "react"
import Lottie, { LottieRefCurrentProps } from "lottie-react"; 
import soundwaves from '@/constants/soundwaves.json';
enum CallStatus {
    INACTIVE = "INACTIVE",
    CONNECTING = "CONNECTING",
    ACTIVE = "ACTIVE",
    FINISHED = "FINISHED",
}
const CompanionComponent = ({companionId, subject, topic, name, userName, userImage, style, voice}: CompanionComponentProps) => {

    // State to manage the call status
    const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
    // State to manage the speaking status
    const [isSpeaking, setIsSpeaking] = useState(false);
    // Reference to the Lottie animation
    const lottieRef = useRef<LottieRefCurrentProps>(null);
    // State to manage the microphone mute status
    const [isMuted, setIsMuted] = useState(false);
    // State to manage the messages
    const [messages, setMessages] = useState<SavedMessage[]>([]);

    // Effect to handle the Lottie animation based on speaking status
    useEffect(()=> {
        if (lottieRef) {
            if (isSpeaking) {
                lottieRef.current?.play();
            } else {
                lottieRef.current?.stop();  
            }
        }
    }, [isSpeaking, lottieRef])

    // Effect to handle the call status changes
    useEffect(()=> {
        const onCallStart = () => setCallStatus(CallStatus.ACTIVE);
        const onCallEnd = () => setCallStatus(CallStatus.FINISHED);
        const onMessage = (message: Message) => {
            if (message.type === 'transcript' && message.transcriptType === 'final'){   
                const newMessage = {
                    role: message.role,
                    content: message.transcript
                }
                setMessages((prev)=>[newMessage, ...prev]);
            }
        }
        const onSpeedStart = () => setIsSpeaking(true);
        const onSpeedEnd = () => setIsSpeaking(false);
        const onError = (error: Error) => console.log('Errpr', error);
        
        
        vapi.on('call-start', onCallStart);
        vapi.on('call-end', onCallEnd);
        vapi.on('message', onMessage);
        vapi.on('error', onError);
        vapi.on('speech-start', onSpeedStart);
        vapi.on('speech-end', onSpeedEnd);
        // Cleanup event listeners on component unmount
        return () => {
            vapi.off('call-start', onCallStart);
            vapi.off('call-end', onCallEnd);
            vapi.off('message', onMessage);
            vapi.off('error', onError);
            vapi.off('speed-start', onSpeedStart);
            vapi.off('speech-end', onSpeedEnd);
        }
    },[]);

    // Function to toggle the microphone
    const toggleMicrophone = () => {
        if (callStatus !== CallStatus.ACTIVE) return; // Prevent toggling if no active call
        const isMuted = vapi.isMuted();
        vapi.setMuted(!isMuted);
        setIsMuted(!isMuted);
    }
    // Function to handle the call start
    const handleCall = async () => {
        setCallStatus(CallStatus.CONNECTING)

        const assistantOverrides = {
            variableValues: { subject, topic, style },
            clientMessages: ["transcript"],
            serverMessages: [],
        }

        // @ts-expect-error
        vapi.start(configureAssistant(voice, style), assistantOverrides)
    }

    const handleDisconnect = () => {
        setCallStatus(CallStatus.FINISHED)
        vapi.stop()
    }
    return (
    <section className='flex flex-col h-[70vh]'>
        <section className="flex gap-8 max-sm:flex-col">
            <div className="companion-section">
                <div className="companion-avatar" style= {{ backgroundColor: getSubjectColor(subject)}}>
                    <div className={cn(
                        'absolute transition-opacity duration-1000',
                        callStatus === CallStatus.FINISHED || callStatus === CallStatus.INACTIVE ? 'opacity-1001' : 'opacity-0',
                        callStatus === CallStatus.CONNECTING && 'opacity-100 animate-ppulse'             
                        )
                    }>
                        <Image
                            src={`/icons/${subject}.svg`}
                            alt={subject}
                            width={150}
                            height={150}
                            className="max-sm:w-fit"
                        />
                    </div>
                    <div className={cn(...'absolute transition-opacity duration-1000', callStatus === CallStatus.ACTIVE ? 'opacity-100':'opacity-0')}>
                        <Lottie
                            lottieRef={lottieRef}
                            animationData={soundwaves}
                            autoplay={false}
                            className="companion-lottie"
                        />
                    </div>
                </div>
                <p className="font-bold text-2xl">{name}</p>
            </div>

            <div className="user-section">
                    <div className="user-avatar"> 
                        <Image
                            src={userImage} 
                            alt={userName}
                            width={130}
                            height={130}
                            className="rounded-lg"
                        />
                        <p className="font-bold text-2xl">
                            {userName}
                        </p>
                    </div>
                    <button className="btn-mic" onClick={toggleMicrophone}>
                        <Image
                            src={isMuted ? '/icons/mic-off.svg' : '/icons/mic-on.svg'}
                            alt='mic'
                            width={36}
                            height={36}
                        />
                        <p className="max-sm:hidden">
                            {isMuted ? 'Turn on mic' : 'Turn off mic'}
                        </p>
                    </button>
                    <button className={cn('rounded-lg py-2 cursor-pointer transition-colors w-full text-white', callStatus ===CallStatus.ACTIVE ? 'bg-red-700' : 'bg-primary', callStatus === CallStatus.CONNECTING && 'animate-pulse')} onClick={callStatus === CallStatus.ACTIVE ? handleDisconnect : handleCall}>
                        {callStatus === CallStatus.ACTIVE
                        ? "End Session"
                        : callStatus === CallStatus.CONNECTING
                            ? 'Connecting'
                        : 'Start Session'
                        }
                    </button>
            </div>
        </section>
        <section className="transcript">
                <div className="transcript-message no-scrollbar">
                    {messages.map((message, index) => {
                        if(message.role === 'assistant') {
                            return (
                                <p key={index} className="max-sm:text-sm">
                                    {
                                        name
                                            .split(' ')[0]
                                            .replace('/[.,]/g, ','')
                                    }: {message.content}
                                </p>
                            )
                        } else {
                           return <p key={index} className="text-primary max-sm:text-sm">
                                {userName}: {message.content}
                            </p>
                        }
                    })}
                </div>

                <div className="transcript-fade" />
            </section>

    </section>
  )
}

export default CompanionComponent
