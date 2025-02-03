import CanvasRoom from "../../draw/canvasRoom";

export default async function Canvas({
  params,
}: {
  params: {
    roomId: string;
  };
}) {
  const roomId = (await params).roomId || 3;

  return <CanvasRoom roomId={roomId}></CanvasRoom>;
}
