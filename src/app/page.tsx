import SpeechRecognitionWrapper from "./components/SpeechRecognitionWrapper";

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
