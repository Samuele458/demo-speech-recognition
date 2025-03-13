import SpeechRecognitionWrapper from "./components/SpeechRecognitionWrapper";
import type { Metadata } from "next";

const url = "https://speech-demo-frame.netlify.app";

export const metadata: Metadata = {
  other: {
    "fc:frame": `{
      "version": "next",
      "imageUrl": "${url}/frame.png",
      "button": {
        "title": "Start",
        "action": {
          "type": "launch_frame",
          "name": "Speech Recognition Demo",
          "url": "${url}",
          "splashImageUrl": "${url}/icon.png",
          "splashBackgroundColor": "#FFFFFF"
        }
      }
    }`,
  },
};

export default function Home() {
  return (
    <div className="min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-8 items-center">
        <h1 className="text-3xl font-bold">Speech Recognition Demo</h1>
        <SpeechRecognitionWrapper />
      </main>
    </div>
  );
}
