export function canvas_arrow(
  context: CanvasRenderingContext2D,
  fromx: number,
  fromy: number,
  tox: number,
  toy: number,
  color: string
) {
  context.beginPath();
  var headlen = 10; // length of head in pixels
  var dx = tox - fromx;
  var dy = toy - fromy;
  var angle = Math.atan2(dy, dx);
  context.moveTo(fromx, fromy);
  context.lineTo(tox, toy);
  context.lineTo(
    tox - headlen * Math.cos(angle - Math.PI / 6),
    toy - headlen * Math.sin(angle - Math.PI / 6)
  );
  context.moveTo(tox, toy);
  context.lineTo(
    tox - headlen * Math.cos(angle + Math.PI / 6),
    toy - headlen * Math.sin(angle + Math.PI / 6)
  );
  context.strokeStyle = color;
  context.stroke();
}

export function canvas_line(
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  endx: number,
  endY: number,
  color: string
) {
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(endx, endY);
  ctx.strokeStyle = color;
  ctx.stroke();
}
