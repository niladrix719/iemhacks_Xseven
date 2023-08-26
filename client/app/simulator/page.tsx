export default function Simulator() {
  return (
    <main className="w-screen h-screen">
      <canvas
        className="w-full h-full absolute top-0 left-0 bg-white"
        width={1366}
        height={605}
      ></canvas>
    </main>
  );
}
